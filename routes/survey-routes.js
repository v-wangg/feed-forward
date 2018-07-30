const mongoose = require('mongoose');
const requireLogin = require('../middlewares/require-login');
const requireCredits = require('../middlewares/require-credits');
const Mailer = require('../services/mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const _ = require('lodash');
// This library parses route paths; i.e it takes certain information we want from it, such as a specific value in it; eg. it can take "surveys" from /api/surveys/xyz
const Path = require('path-parser').default;
// This is an integrated module inside node.js, we don't need to install it; this 'url' library has helper methods which parse URLs for us; these methods are inside the URL object we're destructuring from it
const { URL } = require('url');

// See passport.js for explanation of this; This is equivalent to require()-ing the survey model file
const Survey = mongoose.model('surveys');

module.exports = app => {
    // This route fetches ALL the surveys which a user has created, and gives it back to the front-end to display; this route requires login
    app.get('/api/surveys', requireLogin, async (req, res) => {
        // Find all the Surveys inside our surveys collection which match the id of the current user
        const surveys = await Survey.find({ _user: req.user.id })
            // .find() returns a Mongoose Query object, on which you can call other functions; since the survey we're finding could have a recipients subdoc collection of thousands of records, it's better to either whitelist the properties we want to pull out of the survey, or blacklist the properties we don't want; in our case, we can blacklist the recipients, since we don't need them really, like so
            .select({ recipients: false });

        res.send(surveys);
    });

    /**
     * This route creates a new survey to save into MongoDB AND sends it off to the specified recipients
     * requireLogin should be before requireCredits since a req.user must exist before we check if that           req.user has any credits
     * One problem we have with this route is testing whether or not it works, since it's a POST request route    and thus requires some sort of data injection - we can't just type the link into our browser, since that   makes GET requests
     * The other problem is that our route requires authentication and payment; this prevents us from using       REST clients such as Postman to make POST requests to a route and test it
     * The solution to this is to make axios available to us inside the BROWSER and make POST requests via        axios within the chrome console; see /client/src/index.js for more
        * To actually test this route, we have to provide the exact same data inside the post request as we       would when we actually make this request in the client, such that this route can reference it through   req.body
        * So for this route in particular, we need to make a new survey object containng title, subject, body,    and recipients properties
     */
    // Our actual route handler needs to be marked as async since it handles the mailer.send() function, which itself is async
    app.post('/api/surveys/new', requireLogin, requireCredits, async (req, res) => {
        const { title, subject, body, recipients } = req.body;

        // Creating a new survey instance to save eventualy save as a new record inside the surveys collection
        const survey = new Survey({
            title,
            subject,
            body,
            /**
             * Since we receive the recipients as a String of comma-separated emails, .split(',') will return     an array of emails, and map will, for each email in the array, return an object which contains     an email property; we .trim() it to remove any white spaces which were included in the original    string, such as with "sda@sd.com, ad@d.com", where there would be a whitespace in front of the     second email in the array
             * So at the end, we have returned an array of objects, and these objects have an email property;     the responded property is defaulted for us, so overall, we have satisfied the recipientSchema
             */
            recipients: recipients.split(',').map(email => ({ email: email.trim() })),
            _user: req.user.id,
            // Although setting the date stamp inside the creation of this object isn't exactly correct (it should be when the actual email is sent which is later), it's close enough to the send time
            dateSent: Date.now(), 
        });

        /**
         * Send emails of the survey which the user just created by to the specified recipients by creating a     new mailer object, adding the appropriate config to it, and letting Sendgrid handle email sending
         * The config data about the email we want to create is pretty well encapsulated inside the survey        model instance we just created, so lets use that
         * The mailer also needs an html template to create the email with, so we will pass it a surveyTemplate   function which is called with the survey object (obviously so that it can take the survey.body which   the user specified and add it to to the template it's gonna create)
         * This survey template is stored in the emailTemplates directory under services, since it's              essentially a service to our project, and doesn't fall under any other directory categories
         */
        const mailer = new Mailer(survey, surveyTemplate(survey));
        // Include a try-catch block to confirm that the email sent correctly; if it didn't, such as if we gave Sendgrid an email that doesn't comply with their specifications, then we send the user back an error message
        try {
            /**
             * This function sends the mailer to the Sendgrid API, defined by us; see mailer.js for more
             * We have to mark our actual route handler as async because of this function; mailer.send() is       asynchronous, so our route handler needs to pause before executing any code below until            mailer.send() finishes; mailer.send() ITSELF is asynchronous because it needs to call .API         (request), which is an asynchronous function
             * This is largely necessary because mailer.send() returns a promise itself, so we need to pause      our code to wait for the promise to resolve (and thus for our API request to be complete) before   moving on
             */
            await mailer.send();   
            // Save our survey model instance to MongoDB; this is asynchoronous too, so we mark it with await
            await survey.save();
            // Deduct the user's credits after saving their sent survey and save this info to MongoDB
            req.user.credits -= 1;
            const newUserInstance = await req.user.save();
            // Send back the updated user model which contains the user's new number of credits; we can use this model later to update the header to reflect the change in the user's credits
            res.send(newUserInstance);
        } catch (error) {
            // Since we don't know exactly what type of error could have happened, we can just give back an error code of 422, which means "Unprocessable Entity", i.e something is wrong with the data you sent us, it's you (the user)'s fault
            res.status(422).send(err);
        }
    });

    // This route is just a backend route which thanks the user after they have clicked on a link for submitting feedback within their email; since it's weird for them to just be redirected to the home of our app after giving feedback within their email, it's better to create a custom thank you screen for them; this route is referenced within surveyTemplate.js inside the response links' hrefs
    app.get("/api/surveys/:surveyID/:choice", (req, res) => {
        // It's definitely a bit weird that we're redirecting the email respondant to OUR url, since they should really be redirected to a feedback page of one of our USERS (the one who sent the email who is using our platform); we could include custom redirectURL properties inside the survey model for the user to customize this, and even include different pages for different answers, such as "Sorry you didn't like our stuff... etc." vs. "It's great that you like our stuff!"
        res.send("Thanks for voting!");
    })

    app.post('/api/surveys/webhooks', (req, res) => {
        /**
         * When we take a url path and extract the SurveyID and user's 'choice' (yes/no) from the url (see        surveyTemplate.js if confused), we can't just assume that this url is actually FOR a survey response,  or that it even exists at all - any webhook event coming from Sendgrid which ISN'T a survey response,  in our case, is considered 'dirty data' which we need to get rid of before we handle the webhook       response
         * There are 3 types of dirty data possible;
            * Since webhooks are only sent out once every 30 secs, if a user clicks on the link AGAIN in that     time window for whatever reason, a duplicate webhook event will be sent from Sendgrid to our        server; if we don't take care of this, we'll be incorrectly recording the no. of responses for a    particular survey and also will be flipping a recipient's 'responded' property multiple times
            * There could very well be a case later on where another developer needs to implement another         feature which makes use of a different webhook event from Sendgrid - 'bounce' for example - in      this case, there won't be any url property at all from the webhook event, since this type of        event does not require one
            * If another email contains a separate link simply linking the user to something else, for example    to confirm their email, this is still a webhook event with type 'click', but the url isn't          designed for survey responses and thus won't contain any Survey ID or 'choice'
        * To deal with dirty data, we're going to use the native 'url' node.js library and the path-parser        library
         */

        // Give path-parser a URL to look for; colons ":" indicate wildcards in the path which we WANT to look for; we create this object outside of .map() so we don't need to recreate it for every array
        const p = new Path('/api/surveys/:surveyID/:choice');

        // Chain a series of lodash fucntions onto the given argument of .chain(); each additional function chained on will be called on the RESULT of what the previous function returned; thus, there is no need to now pass in the first argument of each chained function, which is usually just the return value of the previous chained function (i.e the value we're specifying to lodash to execute our function on); if we wanna pass in other arguments such as with uniqBy, we can do so; see lodash docs for more
        _.chain(req.body)
            .map(({ email, url }) => {
                console.log(email + ': ' + url);
                // Exract the url path from the url in the webhook event; if the event DOES NOT contain a url (eg. if the event type isn't 'click'), then this will be undefined
                const pathname = new URL(url).pathname
                // Look into the given pathname with the Path object and return an object containing the wildcards found, as defined by the path we gave the object; eg. /api/surveys/123/yes will cause p.test() to return {surveyID: "123", choice: "yes"}; if the given pathname does not match our given criteria, return null
                const match = p.test(pathname);
                if (match) {
                    return { email, surveyID: match.surveyID, choice: match.choice};
                }
                // If we don't return anything when there's no match, that element will be undefined
            })
            // Any events NOT of type 'click' (and thus have no URL property) or any events with a URL which did not match the criteria given to the Path object will now be undefined inside the events array; if we call _.compat(events), lodash will remove all undefined elements in the array and give us a new array; at this point, however, records with DUPLICATE email AND surveyID still exist in our array, and must be taken care of
            .compact()
            // Get an array of ONLY unique events by filtering through the array BY email and surveyID: if there exists objects where BOTH properties are indentical, remove one of them
            .uniqBy('email', 'surveyID')
            .each(({ email, surveyID, choice }) => {
                /**
                 * We could theoretically do Survey.findOne(), find a survey based on its id, find the            recipient inside that survey with the correct email, and flip its responded to true IF it's    not already true; we would then also increment the survey's yes or no property to keep track   of its analytics, then save that new survey model instace to the database
                 * While this approach works, it's extremely inefficient because we'd be using the entire         Survey model instance, which contains an ENTIRE subdocument collection of recipients which     could be potentially hundreds of thousands of emails long; trying to move this object around   and change/save data in it could be extremely inefficient
                 * Instead, we will call Survey.updateOne(), which basically puts all the workload on Mongo's     side; all we're doing is making a query to Mongo's database and telling it to find a Survey    with the given ID, AND the recipient inside the subdocument collection of that survey who      BOTH has responded = false and a matching email; from here, we will want to increment that     survey's choice (yes/no) tracker, and also set that survey's recipient which we just found's   responded property to true
                 * This way, ALL the work is done by Mongo on its external servers, and inside OUR server, we     don't need to deal with any massive objects such as that Survey object; we're not pulling      anything INTO our server, we're just letting Mongo do everything
                 * Another thing to note is that this request is asynchronous, but we're not using any            async/await syntax; this is because there's NO NEED, because this route itself is just a       route for Sendgrid to forward some data onto us; Sendgrid really doesn't care what we          respond back to it with, nor does anyone else; so even if we the res.send() executes before    Survey.updateOne finishes, we don't actually care; as long as we save this stuff to our        database, nothing else really matters
                 */
                Survey.updateOne({
                    // Find a survey with this ID; use _id because record IDs are stored as _id in MongoDB (But when we use Mongoose methods or properties to reference IDs, Mongoose automatically removes the _ for us and just puts it as, eg. user.id)
                    _id: surveyID,
                    // Find the recipients subdocument collection
                    recipients: {
                        // Inside the subdocument collection, find the element (recipient model instance) whose email AND responded property matches that given in this object we defined
                        $elemMatch: { email, responded: false }
                    }
                }, {
                    // These are Mongo operators; they give commands of what we want MongoDB to do inside the database, so that we don't need to do it inside the server ourselves then re-save it to MongoDB
                    $inc: { [choice]: 1 },
                    // 'recipients.$.responded': recipients refers to the recipients property of the current survey, the .$ sign refers to the $elemMatch we just found inside the recipients subdoc collection (so it should be a user's email), and .responded is the responded property of that user
                    $set: { 'recipients.$.responded': true },
                    lastResponded: new Date()
                }).exec(); // calling .updateOne() only PUTS the query TOGETHER, but it doesn't execute it; calling .exec() will actually execute it
            })
            // This function MUST be called at the end of .chain(); this allows the array we've been calling functions on to be returned from .chain() such that we can assign it to a variable
            .value();

        res.send({});
    });
}   
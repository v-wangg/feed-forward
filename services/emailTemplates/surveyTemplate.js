const keys = require('../../config/keys');

module.exports = (survey) => {
    // Since we need to return an entire html snippet as an email template, and since that html snippet needs to be a string with many separate lines, we use template strings instead of quotes
    // Notice in the anchor tags which contain the callback url of the Sendgrid webhook that we add a custom survey ID inside the url, and that the yes button directs a user to a "yes" route and a no button directs a user to a "no" route; this allows us to indetify which survey an incoming user was clicking from in our express server and also which option they clicked
    // We need to do this because inside Sendgrid's webhook data that they send us, they only give us the email of the user which clicked it, the URL they clicked on (which is whatever URl we set here) and what type of event the webhook was (always a 'click' event for us); this isn't enough information for us to update our database for how many users have responded 'yes' or 'no' to which survey, and which recipient's 'responded' property to flip inside of which survey
    // Once we've defined the href here, we can pull the survey ID and 'yes' or 'no' option from the URL sent to us by Sendgrid; we will also need to add generalised routes to show thank you messages to users who visit api//surveys/xyz/yes or api/surveys/xyz/no
    // Note: The "HTTP POST URL" defined inside our Sendgrid dashboard is ONLY the POST route in which Sendgrid willsend the webhook data to; Sendgrid will still forward the USER who clicked on the link to the route defined in our actual anchor tag, shown below
    return `
        <html>
            <body>
                <div style="text-align: center;">
                    <h3> I'd like your input! </h3>
                    <p>Please answer the following question:</p>
                    <p>${survey.body}</p>
                    <div>
                        <a href="${keys.redirectDomain}/api/surveys/${survey.id}/yes"> Yes </a>
                    </div>
                    <div>
                        <a href="${keys.redirectDomain}/api/surveys/${survey.id}/no"> No </a>
                    </div>
                </div>
            </body>
        </html>
    `
}
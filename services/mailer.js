const sendgrid = require('sendgrid');
// A helper object which helps us create the mailer; we could call it { mail } = sengrid, but sendgrid docs use helper, so we will too
const helper = sendgrid.mail;

const keys = require('../config/keys');

/**
 * The helper.Mail class takes a lot of config, and spits out a Mailer object which represents the email to be    sent, and this Mailer object will then be sent to Sendgrid
 * We want to add some additional customization and functionality to this class, just as we do with React         extends Component class
 */
module.exports = class Mailer extends helper.Mail {
    /**
     * We want to generalize our Mailer object such that it can create emails for any purpose, rather than to     limit it to only creating emails for surveys
     * As such, we will just specify that the first argument must be an object which contains the subject and     recipients properties; what we're doing here is essentially destructuring whatever object is passed into   the constructor to only use the subject and recipients properties from there
     * We also define a contents argument which serves as the html body of the email
     */
    constructor({ subject, recipients }, content) {
        super();
        
        // Calling the actual sendgrid function with our API key returns an object which allows us to actually send this mailer object to the Sendgrid API; Sendgrid wants us to store that object in the sgAPI property
        this.sgAPI = sendgrid(keys.sendGridKey);
        // Setting up instance variables on the helper.Mail.Mailer class; these are the instance variables which Sendgrid requires us to set up, and we mostly set them up using objects defined as part of the helper object which properly formats the email and email body (content) into something display-able inside an actual email; 
        this.from_email = new helper.Email("no-reply@emaily.com");
        this.subject = subject;
        this.body = new helper.Content("text/html", content);
        this.recipients = this.formatAddresses(recipients);

        // addContent() is defined by helper.Mail, and takes a helper.Content object (which is this.body), and actually adds this content to the content of the email; simply storing the content inside an instance variable isn't enough for the Mailer object to work
        this.addContent(this.body);
        /**
         * addClickTracking() is a defined by US but makes use of Sendgrid helper objects and helper.Mail         methods to make it so that, whenever a user clicks a link, we can track which user clicked that link   and flip their 'responded' flag to true
         * Whenever we include a link inside any email, theoretically, there is no way in which we can know       which user clicked which link inside of each email; there is no way we can create custom links for     each email sent - this means we don't know whose 'responded' flag to set to true once we receive       feedback from a user
         * Sendgrid helps us with this since, by default, it manipulates any link included in an email to         direct the user to THEIR servers first in order to collect analytics info about the user, and, by      default, these manipulated links have tokens to identify unique users who are clicking each link;      after Sendgrid does their stuff, they usually then redirect the user to the link which WE specified
         * If we enable click tracking, we will be able to tell Sendgrid that, after they redirect the user to    the destination link, they need to send a message to our server telling us that someone clicked on     our link AND some information about the unique user who clicked on it - namely, their email address,   which finally enables us to identify unique users
         */
        this.addClickTracking();
        // addRecipients is a function defined by us (but required by Sendgrid) which formally adds the list of recipients to the Mailer object
        this.addRecipients();
    }

    // The recipients list which we're passing in from the survey model instance is an array of OBJECTS (with an email and responded property); we only want a list of emails, so we need to map over them, which creates a new list, and return a list of helper.Email emails
    formatAddresses(recipients) {
        return recipients.map(({ email }) => {
            // We MUST reformat any email we give to the Mailer object, so we use helper.Email
            return new helper.Email(email);
        });
    }

    // Here we just take an object which stores a clickTracking config object, give that object the clickTracking config object with the specified config (true, true indicating we do want click tracking), and then call helper.Mail.addTrackingSettings() with that config object so that Sendgrid knows we want to enable click tracking
    addClickTracking() {
        const trackingSettings = new helper.TrackingSettings();
        const clickTracking = new helper.ClickTracking(true, true);

        trackingSettings.setClickTracking(clickTracking);
        this.addTrackingSettings(trackingSettings);
    }

    // Here we're creating a helper.Personalization object named personalize, and adding to it each recipient (which in turn is a helper.Email object) inside our recipients list; we then call this.addPersonalization, which is a function defined by helper.Mail, which formally adds all these recipients, stored inside the personalize object, into the Mail object
    addRecipients() {
        const personalize = new helper.Personalization();

        this.recipients.forEach(recipient => {
            personalize.addTo(recipient)
        })
        this.addPersonalization(personalize);
    }

    /**
     * The send method is what actually sends a request containing this Mailer object off to the Sendgrid API     such that Sendgrid can send the emails for us
     * We use the sgAPI.emptyRequest() method to create a request object containing the details of the request    we want to make t othe Sendgrid API; this method takes a config object containing the HTTP request         method, the path of Sendgrid's API which we want to send it to (i.e Sendgrid.com/v3/mail/send), and the    body of the request, which is literally just this Mailer object; we want to send the request in JSON, so   we call .toJSON()
     * We then send this request off by calling .API(request), passing in the request object we just created as   an argument; this is an asynchronous action, so our function has the async tag, and returns the response   when it's resolved 
     */
    async send() {
        const request = this.sgAPI.emptyRequest({
            method: "POST",
            path: "/v3/mail/send",
            body: this.toJSON()
        });

        const response = await this.sgAPI.API(request);
        return response;
    }
}



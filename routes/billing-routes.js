const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/require-login');

// Note how the requireLogin middleware that we wrote is NOT invoked; app.post() will invoke it and pass the correct paramters when it needs to, rather than when this file is executed by node (i.e as soon as we do npm run dev)
module.exports = app => {
    app.post("/api/stripe-token", requireLogin, async (req, res) => {
        /**
         * Here we create a stripe charge object to take our token and ACTUALLY charge the user
         * The .create() function takes a config object;
            * The amount property CONFIRMS the amount of money we're going to charge - the amount property we     set up inside Stripe Checkout was just asking for authorization from the user (hey are we allowed   to charge you, in our backend, $5 or less? If so, this $5 or less authorization will be sent to     our backend); but we wouldn't be able to charge any more than that since Stripe can check this      info inside the token
            * The source property specifies which card source we're attempting to bill; this information is       stored inside our token as the token.id property (i.e the Stringified token itself)
         * This function call can be given a second parameter as a callback to handle the asynchronous request,   BUT it also returns a promise which can be resolved; since the async-await syntax is cleaner, we'll    use the promise instead
         */
        const charge = await stripe.charges.create({
            amount: 500,
            currency: "usd",
            description: "$5 charged for 5 credits",
            source: req.body.id
        });

        // Passport automatically attaches the CURRENT user's model instance to req.user inside every request given that a user is already auth'd, so we can just access the user model and modify their credits into it like so
        req.user.credits += 5;

        /**
         * Although we just modified the user's credits, this isn't actually SAVED into the database until we     call .save() on the user model (this makes sense since, in raw code, we literally just incremented     the req.user.credits property of this user model INSTANCE living inside a request - to update this     on MongoDB's side, we need to save it)
         * Since saving to MongoDB is asynchronous, we will handle the promise, which returns the updated user    model, so we can reference it like so
         * We are returning this new user model because that way, inside the action creator that made the POST    request to this route, that action creator can dispatch a new FETCH_USER action to update the header   with THIS new, updated user model with the correct credits (see /actions/index.js if confused)
         * WE SHOULD ALWAYS USE THIS NEW, UPDATED USER MODEL RATHER THAN THE STALE, UNUPDATED ONE WE HAVE         REFERENCE TO IN req.user; THEY ARE TWO COMPLETELY SEPARATE OBJECTS STORED IN MEMORY, EVEN THOUGH       THEY REPRESENT THE SAME USER
         */
         const newUserModel = await req.user.save();

         res.send(newUserModel);
    })
}
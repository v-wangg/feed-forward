const passport = require('passport');
const keys = require('../config/keys');

// We export a function because our routes are defined with the app object, but we have no reference to it inside this file; if we instead require()(app) this file, we can gain reference to app
module.exports = app => {
    // Route handler for the start of the OAuth login process

    // The "scope" property tells the user what info our app wants to access from their Google account when Google asks them for permission to give their data to us

    // See passport.js for explanation of what the given passport strategy does
    app.get(                               
        "/auth/google", 
        // By calling passport.authenticate, we are giving the passport middleware to THIS SINGLE ROUTE ONLY, whereas by calling app.use(passport.session()), etc., we are giving that middleware to ALL ROUTES 
        // Here we don't have an actual route handler, only the passport middleware, but that's okay because this middleware redirects us to /auth/google/callback
        passport.authenticate("google", {
            scope: ["profile", "email"]    
        })  
    );
    
    // This route matches the specified authorised callback URI in our Google Developer Console for AFTER the user allows our app to access their information - this stops any hacker from specifying a different callback URI and collecting a user's data which posing as someone else

    // See passport.js for explanation of what the given passport strategy does 
    app.get(
        "/auth/google/callback",            
        // Here we have defined a passport middleware, but also need a route handler to handle the request after the passport middleware is done with it, or else a "Cannot GET /auth/google/callback" error will be thrown
        passport.authenticate("google"),
        (req, res) => {
            /** The res object has a redirect() method which redirects the user to the given route so that our      route no longer has to deal with the incoming request
             *  We need to redirect the user to an absolute path because, within passport.js, we set our google    redirect URI during dev to be an absolute path with localhost 5000; if we gave it a relative       path, the browser would have executed the passport strategy above with localhost 3000 (see         create-react-app proxy notes in IMPORTANT-NOTES.txt for reason), and in turn if we just gave a     relative path of "/surveys", it would've been all good
             *  But since the browser is executing the passport strategy above on localhost 5000, we have to       redirect it to an absolute path of locahost 3000 in order for it to reach the correct route
             */
            res.redirect(`${keys.clientHomeURI}/surveys`);
        }
    )

    /** The route to visit whenever a user wants to logout; passport automatically attatches the logout()           function to the req object to help with authentication
     *  When logout() is called, passport takes the user's cookie and deletes the id/token inside of it
    */
    app.get("/auth/logout", (req, res) => {
        req.logout();
        /**
         * We need to give an absolute path of the clientHomeURI for the same reasons as the redirect upon        login (see above)
         */
        res.redirect(`${keys.clientHomeURI}`)
    });

    app.get("/api/current-user", (req, res) => {
        // See index.js for how req.user works
        res.send(req.user);
    });
}


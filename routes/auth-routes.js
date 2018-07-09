const passport = require('passport');

// We export a function because our routes are defined with the app object, but we have no reference to it inside this file; if we instead require()(app) this file, we can gain reference to app
module.exports = app => {
    // Route handler for the start of the OAuth login process

    // The "scope" property tells the user what info our app wants to access from their Google account when Google asks them for permission to give their data to us

    // See passport.js for explanation of what the given passport strategy does
    app.get(                               
        "/auth/google", 
        passport.authenticate("google", {
            scope: ["profile", "email"]    
        })  
    );
    
    // This route matches the specified authorised callback URI in our Google Developer Console for AFTER the user allows our app to access their information - this stops any hacker from specifying a different callback URI and collecting a user's data which posing as someone else

    // See passport.js for explanation of what the given passport strategy does 
    app.get(
        "/auth/google/callback",            
        passport.authenticate("google")
    )

    /** The route to visit whenever a user wants to logout; passport automatically attatches the logout()           function to the req object to help with authentication
     *  When logout() is called, passport takes the user's cookie and deletes the id/token inside of it
    */
    app.get("/auth/logout", (req, res) => {
        req.logout();
        // Send the current user back after logging out - we should be sending back undefined
        res.send(req.user);
    });

    app.get("/api/current-user", (req, res) => {
            res.send(req.user);
    });
}


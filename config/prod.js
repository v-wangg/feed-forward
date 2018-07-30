// The production keys are stored in Heroku environment variables (Heroku calls them  config vars) and ARE         committed to github so Heroku can use them; but nobody can see the actual keys themselves so they are safe

// We have set the environment variables up inside our heroku app by going into settings --> config vars

module.exports = {
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongoURI: process.env.MONGO_URI,
    cookieKey: process.env.COOKIE_KEY,
    // The googleRedirectURI and redirectDomain aren't anything secret, but it's just good practice to store them as Heroku env variables since we're doing it for everything else
    googleRedirectURI: process.env.GOOGLE_REDIRECT_URI,
    redirectDomain: process.env.REDIRECT_DOMAIN,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    sendGridKey: process.env.SEND_GRID_KEY
}
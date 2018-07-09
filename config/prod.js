// The production keys are stored in Heroku environment variables and ARE committed to github so Heroku can use    them; but nobody can see the actual keys themselves so they are safe

module.exports = {
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongoURI: process.env.MONGO_URI,
    cookieKey: process.env.COOKIE_KEY
}
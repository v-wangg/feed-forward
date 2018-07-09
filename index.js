const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys')
// We must require the user model file before the passport file because the user model file must be executed first; inside there, the userSchema must be created BEFORE passport can reference and make use of the user model
require('./models/user');
require('./services/passport');

// Connect mongoose to our MongoDB database hosted on mLab; this URI is stored in a .gitignore'd keys file         since it's secret information that shouldn't be leaked to the public
mongoose.connect(keys.mongoURI);

const app = express();

/** app.use() enables middleware to be used in express
 *  Express middleware is used to make small adjustments to incoming request objects before they reach our         defined route handlers; we can choose which middleware handlers which route handlers, allowing us to reuse     code we would otherwise have to write for all route handlers which need to execute a similar task at some      point
 *  The cookie-session middleware takes a config object which MUST have a maxAge parameter specifying the          maximum amount of time, in miliseconds, a cookie can last before it expires
    *  It also takes a keys property which should be an array; this is the encryption key used to encrypt the      user's id into the cookie so that nobody can pretend to be someone else by putting a fake user id into      their cookie - if we put multiple keys into the array, cookie-session will randomly pick one to use for     each encryption - so it just helps with security
 *  What cookie-session does is that it extracts the data inside the user's cookie whenever a request comes in,    and assigns it to the req.session property
    *   An important point about cookie-session is that it stores the actual encrypted user id into the cookie,     which means that a user's cookie IS their current session, since all the data about the session is          stored inside the actual cookie
    *   This is different to other cookie middleware like express-session, which only stores a REFERENCE to a       session, through a session ID, inside the cookie, and then takes that session ID and looks up all the       actual data about a user's session in an external database of session IDs
    *   In theory, express-session is much better because there is not limit to the amount of data we're            allowed to store about a user's session, since it's hosted on an external database - inside a cookie,       we can only store 4kB of data - but since the only data we need about a user's session is the user's ID,    there's no need for us to use express-session
    *   So at the end, this allows us to circumvent the need to set up an external database to store all of a       user's session data, which is very tedious - but in production, we'll probably needed
 */
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [keys.cookieKey]
    })
);

/** Add the passport middleware which tells passport to make use of cookies - this way, whenever serializeUser()    is called (in passport.js file), passport knows that it needs to add the user's token into a cookie
 *  With this middleware, whenever an authenticated user makes any request (GET, POST, etc.);
    *   Cookie-session extracts the encrypted data from our cookie and assigns that cookie data to the              req.session property 
    *   Passport then looks at req.session and pulls the user id out of the encrypted data and reassigns it to      req.session.passport.user, where req.session.passport represents the information in the current user's      session which is tracked by passport 
    *   Passport then calls deserializeUser() with the new id it has, and turns it into a user model instance,      and that user model instance is added to the req.user property
    *   The req object is then sent to a route handler which we define, allowing us to use that model instance
 */
app.use(passport.initialize());
app.use(passport.session());

// Set up application routes
require('./routes/auth-routes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT); 
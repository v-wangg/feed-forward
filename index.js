/**
 * This is the root file of our backend express server; this server dedicated to providing the backend data of    our application (JSON stuff, dealing with http req and res, etc.)
 * It does not deal with serving up any front end files (react.js files, etc.)
 * While we COULD configure it to do so, it's better to have a SEPARATE server to deal with this front-end        stuff because create-react-app does this automatically, and create-react-app offers too much optimisation      and functionality out of the box to NOT use it
 * So although this means we'll have to somehow link these two servers together and let them interact properly,   it's entirely worth it because create-react-app is so good
 
 * This also means that we will need to install the concurrently npm module to help us run both servers at the    same time with one script
    * So if you look inside the server directory's package.json file, you can see we have set a "client" script - this script basically runs npm run start with the flag "--prefix client", meaning that we want to run npm run start INSIDE the client directory, so we're actually running the client's server
    * Meanwhile, we have set an npm run dev to run concurrently both of our servers; the forwardslashes just      avoid the problem where whenver we have doublequotes ("") nested inside double quotes, the code doesn't     know where the string starts and ends, so the forwardslashes act as an indicator of that
 */

const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys')
// We must require the user model file before the passport file because the user model file must be executed first; inside there, the userSchema must be created BEFORE passport can reference and make use of the user model
require('./models/user');
require('./services/passport');

// Connect mongoose to our MongoDB database hosted on mLab; this URI is stored in a .gitignore'd keys file         since it's secret information that shouldn't be leaked to the public
mongoose.connect(keys.mongoURI);

const app = express();

/**
 * This middleware is needed because express DOES NOT parse the body of any incoming POST, PUT, etc. requests     (i.e any request that has a request body) for us; this middleware will do this and then assign the request     body to the req.body property for us
 */
app.use(bodyParser.json());

/** app.use() enables a particular middleware to be used FOR ALL ROUTES, whereas if we define a middleware          INSIDE an actual route (see auth-routes.js), that middleware is only executed for THAT route
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
require('./routes/billing-routes')(app);

/**
 * In production, there is no CRA server, only our express server; this means that whenever a user visits a       route NOT defined explicitly by our express server (through app.get()), such as herokuapp.com/surveys, then    whereas before our CRA server would give them the assets such as the bundle.js file or a css file or           something, now our express server has to handle this task
 * The logic flow for any incoming request to our (only) server during production will be like so;
    * First, check if the request is coming into an incoming route which we've defined (this is done by the       lines above where we require in our other route-handler files) 
    * Next, given that we're in production, check if there's any request for production assets such as a          bundle.js file or css file; if there is, send them back what they're looking for (see next bullet point     for WHEN this type of request is actually made)
    * Lastly, now that we've exhausted all of our options - they're not looking for a route we've defined, nor    a production asset file - they MUST be looking for a route defined on the client-side; in this case,        we can just give them back the index.html file
        * This index.html file will then be run, and inside it there will be a <script> tag which makes a         request AGAIN to our backend server for the bundle.js file or other production asset, since the         <script> tag defines this file as being required in order for our index.html file to run; THIS THE      CASE FOR WHEN A REQUEST FOR A PRODUCTION ASSET WILL BE MADE
    * IMPORTANT CONCEPT: When we manually change the URL in our browser, we're making a brand new HTTP request    to that route; by contrast, if we click a ReactRouter <Link> tag, there is no interaction with our          backend whatsoever
        * This means that once our express server initially gives back an index.html file when a user visits an   unrecognized route, the user theoretically should just be navigating around using react-router <Link>   tags, meaning the server doesn't have to re-send this index.html file every single time the route       changes; the only time this occurs is if an actual HTTP request is sent to the server somehow, which    mainly occurs when the user manually types in a route, which is very rare 
    * 
 */
if (process.env.NODE_ENV === "production") {
    /**
     * If there's a request to our express app and we DON'T KNOW what it's looking for based on the routes        we've defined, we will first look into the DIRECTORY of "/client/build" to see if there's any file that    matches what the request is looking for
     * If there is something that matches, such as a bundle.js file, then give it back to them
     */
    app.use(express.static("client/build"));

    /**
     * Now that we have confirmed that the request is not being made for any file or route we have on our         backend server, we can just send them back the root html file of our application
     * Eventually, another request will be made for the bundle.js file/other produciton assets, and, if a user    eg. visited /surveys, then react-router will handle that route and render the relevant component rather    than us
     */
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT); 
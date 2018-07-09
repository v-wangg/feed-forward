/**
 *  In order to separate our production and development environments, we have to set up 2 different google         developer consoles and MongoDB databases dedicated to production and development
 *  This helps keep our production database clean, prestine, and untouched, and also circumvents the problem       where if our laptop gets stolen, nobody can just access the keys.js file in our laptop and steal our entire    production database and google credentials
 *  So instead, we store our dev credentials in dev.js, and our prod credentials in prod.js
 *  If we are in production, keys.js will return our production credentials to use in our code, and if we are      in development, keys.js will return our development credentials to use in our code
    *   Our production credentials will be stored on Heroku in environment variables - we WILL commit our           prod.js file to github, since Heroku needs to use it to know where to get our credentials, BUT our          credentials will still be secure since the actual code inside prod.js doesn't include any raw keys
    *   Our development credentials will be stored raw inside our project files, and will NOT be committed to       github; this stops people from being able to see our keys online in github, but makes it okay for our       laptop to be stolen since those are just our development keys anyway - also we will never actually NEED     our keys to be on github during dev (unlike prod), since during dev everything will be on our local         machine anyway
 */

// When our code is being run by Heroku (in production), the NODE_ENV environment variable will be "production";   so if we check for this, we can know which set of credentials to return inside this file
if (process.env.NODE_ENV === 'production') {
    // Pull the development set of keys in, and export it for whoever needs to use these keys
    module.exports = require("./prod");
} else {
    module.exports = require("./dev");
}
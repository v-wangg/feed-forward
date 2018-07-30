/**
 * We installed materialize-css using npm, and are now importing the minified file within its node_modules        folder; since this is just a css file, there is no need to assign it a variable by doing 
   "import matieralizeCSS from 'materialize-css/dist/css...'", so we can just write an import statement like so
 * When webpack runs this import statement, it will recognise it as a CSS file rather than JS, and include it     into the bundled Javascript files in a different way than usual
 * This configuration can be done with a webpack loader, but is already done for us with create-react-app
 */
import 'materialize-css/dist/css/materialize.min.css';

// When importing a non-relative path, WEBPACK automatically assumes it is from node_modules and includes it
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';

/** When importing JS files, there is no need to include .js, WEBPACK adds it for us
    Similarly, when importing index.js (root) files, we only need to import the directory itself; eg. './components'
*/ 
import App from './components/App';
import rootReducer from './reducers';

// We assign axios to the global property such that we can reference axios within the chrome console by just typing "axios.post", etc; this allows us to test all of our backend routes which require auth or payments properly without going through any tedious configuration needed with REST clients such as Postman (see /server/routes/survey-routes for info on HOW this testing is actually done)
// These are only needed in development, so should be deleted when they're not needed and re-written when they are; but since there are notes here I'll leave them in, even in production
import axios from 'axios';
window.axios = axios;

// The second argument is the initial state of the app; this is mostly only used during server-side rendering
const store = createStore(rootReducer, {}, applyMiddleware(reduxThunk));

ReactDOM.render(
    <Provider store={store}> 
        <App /> 
    </Provider>, 
    document.getElementById('root')
);
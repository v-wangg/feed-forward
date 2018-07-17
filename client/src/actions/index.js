import axios from 'axios';
import { FETCH_USER } from './types';

/** SYNTAX EXPLANATION
     *  Here we use ES2015 syntax where, if a function contains ONLY a return statement and nothing else;
     *  const fetchUser = () => { return () => {...}}
     *  Then we can omit the return statement and the curly braces around it, leaving us with () => () => {},      which basically means "this function is returning a function"; we can also remove the parenthases          around dispatch since it's the only argument in the arrow function
     *  We then added async-await syntax to handle axios's promises; "await axios.get()" returns a "res" object    which is the payload; we could assign "const res = axios.get()", and then dispatch 
        "payload = res.data", but we can also just condense it down as we have done below
 *  "RES.DATA" EXPLANATION
     *  We have only set the payload of the current user as res.data since inside our auth-routes.js file in       the back-end we ONLY did res.send(req.user), meaning we sent back a very simple JSON object containing     user info; inside the res object axios gives us, the actual data we sent is located at res.data, so we     only need to put this into the payload
*/
export const fetchUser = () => async dispatch => {
    const res = await axios.get("/api/current-user");
    dispatch({
        type: FETCH_USER,
        payload: res.data 
    });
}

/**
 * This action creator takes the token Stripe Checkout gives us when a user enters their details and sends this   token to our backend API via a POST request
 * In order to update the content in our Header component displaying the no. of credits a user has, we need to    give our auth piece of state within the redux store an updated user model, since Header displays information   based on this user model and whether or not it exists (user's auth status)
 * So we can REUSE the FETCH_USER action and give it the same payload as what the auth-reducer.js expects,        which is an updated user model; once this happens, Header will automatically updated with the new number of    credits the user has
 * This means that we need to set up our backend API to authorize the payment with Stripe using our token,        update our user model for the new no. of credits this user has, and then res.send(user)
 * With this architecture, WHENEVER a payment occurs, handleStripeToken will ALWAYS be called, and in turn the    auth reducer will ALWAYS be updated, so Header will ALWAYS display the correct no. of credits of the user
 * 
 */
export const handleStripeToken = token => async dispatch => {
    // Note: The token contains LOTS of data about the payment, such as the user's cardID (created by stripe), email, card type, etc. (but not the actual card no.); one of the properties of the token is its id, which is what defines it
    const res = await axios.post("/api/stripe-token", token);
    dispatch({
        type: FETCH_USER,
        payload: res.data
    })
}
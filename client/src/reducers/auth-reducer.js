import { FETCH_USER } from '../actions/types';

/** We should never assume the user can ONLY be one of either auth'd or not auth'd, since the way we're             determining their auth status is through an ASYNC request to /api/current-user
 *  Instead, we should take into account the case where our request to fetch the current user is very slow and     still pending (maybe because the user's wifi is slow); in this case, if we were to just assume the user        isn't auth'd, the navbar will display "Log in with Google"; but if it turns out that the user is actually      logged in, then theyll see it randomly change, which is bad
 *  So instead, we'll split the user's auth state into 3 cases;
    *  If the request is still pending, return null (indicating we don't know yet)
    *  If the request is back AND the user IS auth'd, return the user's model object (with their google id,        mongo record id, etc.)
    *  If the request is back AND the user IS NOT auth'd, return false
 */
export default function(state = null, action) {
    switch (action.type) {
        case FETCH_USER: 
            /**
             * When the user IS NOT auth'd, inside auth-routes.js we will res.send(req.user), which will just     be an empty string as there was no info in the cookie 
             * Javascript interprets empty strings as a falsey value, meaning that it sees it as "there is no     action.payload, so I will return false"
             * If the user IS auth'd, an action.payload WILL exist, so the user's object model will be returned
             */
            return action.payload || false;
        default: 
            return state;
    }
}
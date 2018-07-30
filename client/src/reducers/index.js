import {combineReducers} from 'redux';
// Change reducer to reduxForm since reducer is pretty ambiguous
import { reducer as reduxForm } from 'redux-form';
import authReducer from './auth-reducer';
import surveysReducer from './surveys-reducer';

export default combineReducers({
    auth: authReducer,
    // We MUST name redux form's piece of state "form", because it will assume this is the name of it when it tries to make reference to it in other parts of our application; this can be changed though
    form: reduxForm,
    surveys: surveysReducer
})
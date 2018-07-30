// Shows the actual Survey Form for user to fill out
import React, { Component } from 'react';
// Use reduxForm; see docs for more info
import { reduxForm, Field } from 'redux-form';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import SurveyField from './SurveyField';

import validateEmails from '../../utils/validateEmails';

import formFields from './formFields';

class SurveyForm extends Component {
    renderFields() {
        return _.map(formFields, ({ label, name }) => {
            return (
                <Field 
                    // Since the name of each Field is unique, we can use that as the key
                    key={name} 
                    // A custom prop which we can freely define into Field
                    label={label} 
                    // The name of this input field; the values entered into this component will be stored under "surveyTitle" inside the reduxForm reducer
                    name={name} 
                    // See SurveyTitle for why we want to define our own component rather than passing a string to this prop
                    component={SurveyField} 
                    // The type of component Field will be
                    type="text" 
                />
            )
        })
    }

    render() {
        return (
            <div>
                <form onSubmit={this.props.handleSubmit(this.props.onSurveySubmit)}>
                    {this.renderFields()}
                    <Link to="/surveys" className="btn waves-effect waves-light left red">
                        Cancel
                    </Link>
                    <button type="submit" className="btn waves-effect waves-light right">
                        Next 
                        <i className="material-icons right">send</i>
                    </button>
                </form>
            </div>
        )
    }
}

// validate() gets called with a values object which contains all the values of each field; what the property name is called; eg. value.title or value.body is determined by the "name" property give to that <Field>
function validate(values) {
    // ReduxForm requires us to define an errors object and return it; if that object is empty, ReduxForm will not display any errors to the user; to display an error to a user, we set the error.property as the same name as the value.property passed into the validate function for us; this allows Redux Form to display the correct error for the correct <Field>
    const errors = {};

    /**
     * Assign whatever validateEmails() returns to errors.recipients; if there are no invalid emails, it will     be undefined, or else it'll be an error message
     * We want to put this above the noValueError check because if it's below that check, this will override      the noValueError on the error object and turn it into a validateEmails error; this means that when a       user FIRST clicks away from the recipients field, it'll say "These emails are invalid" rather than         "Please provide a value", which doesn't make sense
        * To fix this, we can let validateEmails() execute before the noValueError, meaning that the              noValueError will override it when this field is FIRST rendered and validate() is exeucted, but when    validate is later executed upon submittal, validate() will rerun and, if the user entered a list of     recipients for us and one was invalid, the validateEmails error will appear since there is now a        value in that field, causing noValueError NOT to override validateEmails
     * We call validateEmails with values.emails || '' because when this field is first rendered, values.emails   will be undefined, causing validateEmails to crash since it will try to call functions on emails; if we    give it an empty string, it will work
     */
    errors.recipients = validateEmails(values.recipients || '');

    // We COULD use 4 if statements checking if values.property exists and if so set errors.property to a custom error message, but it's just much cleaner to do it this way since we'd be writing lots of duplicate code
    _.each(formFields, ({ name, noValueError }) => {
        if (!values[name]) {
            errors[name] = noValueError;
        }
    });

    return errors;
}

// This helper is a HOC similar to connect() which lets reduxForm connect this component to the redux state, and ALSO be able to pass in certain props into our component to help us with form creation, such as ways to store and access the values in our <Fields>, etc.
export default reduxForm({
    // Passing in a validate function to this config object allows this validation function to be run when the form is first rendered AND when any subsequent submits occur, so that it can put the errors we define inside this function onto the meta.error properties of each respective <Field> component; if we put something on errors.title, it will put that error on the <Field> with name="title"
    validate,
    // Config property which determines what this particular form will be called inside the reduxForm reducer
    form: "surveyForm",
    destroyOnUnmount: false
})(SurveyForm);
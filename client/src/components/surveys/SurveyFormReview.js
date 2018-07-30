import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import * as actions from '../../actions';
import { withRouter } from 'react-router-dom';

import formFields from './formFields';

const SurveyFormReview = ({ onCancel, formValues, submitSurvey, history }) => {
    const reviewFields = _.map(formFields, ({ name, label }) => {
        return (
            <div key={name}>
                <label> {label} </label>
                <div>
                    {formValues[name]}
                </div>
            </div>
        )
    })

    return (
        <div>
            <h5>
                Please confirm your Entries
            </h5>
            {reviewFields}
            <button
                className="yellow btn"
                onClick={onCancel}
            >
                Back
            </button>
            <button 
                onClick={() => submitSurvey(formValues, history) /** Wrap submitSurvey with an arrow function so that the arrow function acts as the callback; this allows us to use call submitSurvey onclick with a formValues arg without directly invoking submitSurvey when this component first renders */} 
                className="btn right"
            >
                Send Survey
                <i className="material-icons right">done</i>
            </button>
        </div>
    )
}

function mapStateToProps(state) {
    return {
        // This is where redux form stores all the values for our SurveyForm component (the surveyForm property references the name we defined in the config object we passed into the reduxForm() HOC)
        formValues: state.form.surveyForm.values,
    };
}

// Wrapping SurveyFormReview with withRouter() gives this component reference to the react-router history object in its props; thus, it can call the submitSurvey() action creator with the history object, allowing redux-thunk to redirect the user when the submitSurvey() action creator is called
export default connect(mapStateToProps, actions)(withRouter(SurveyFormReview));
// Parent wrapper component which shows the SurveyForm and SurveyFormReview
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import SurveyForm from './SurveyForm';
import SurveyFormReview from './SurveyFormReview';

class SurveyNew extends Component {
    constructor(props) {
        super(props);
        this.renderContent = this.renderContent.bind(this);
    }
    /**
     * CRA has a babel plugin which enables us to define component-level state like this; this is equivalent to   writing the constructor, calling super(props), etc.
     * We chose to use component-level state to decide when to show the SurveyFormReview component; we could've   very easily created a new route pointing to SurveyFormReview and Linked the user to it when they click     next on the SurveyForm page
        * This, however, isn't as good because if the user randomly types that route into their browser for whatever reason, it would show a blank page; plus, it's a lot of extra code
     * We could've also stored the showFormReview state inside redux instead, but this is unnecessary since no    other component outside of SurveyNew will need to use this state and it's a lot of extra code to write     the new reducers, actions, etc.
     */
    state = { showFormReview: false }

    renderContent() {
        if (this.state.showFormReview) {
            return (
                <SurveyFormReview
                    onCancel={() => this.setState({ showFormReview: false })}
                />
            );
        }

        return (
            <SurveyForm 
                onSurveySubmit={() => {
                    this.setState({ showFormReview: true })
                }}
            />
        );
    }

    render() {
        return (
            <div>
                { this.renderContent() }
            </div>
        )
    }
}

/**
 * Making SurveyNew the SAME reduxForm HOC as SurveyNew and not setting any destroyOnUnmount makes it such that,  whenever a user clicks the next button in the form, SurveyNew doesn't unmount and so the values are not        destroyed, but whenever a user clicks the cancel button in the form, SurveyNew will dismount and in turn the   values will be cleared 
 */
export default reduxForm({
    form: "surveyForm"
})(SurveyNew)

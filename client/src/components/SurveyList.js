import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchSurveys } from '../actions';

class SurveyList extends Component {
    componentDidMount() {
        this.props.fetchSurveys();
    }

    renderSurveys() {
        // .reverse() reverses the order of the surveys array, since the array is given to us from oldest to newest, but we want it from newest ot oldest
        return this.props.surveys.map(survey => {
            return (
                <div class="card blue-grey darken-1" key={survey._id}>
                    <div class="card-content white-text">
                        <span class="card-title">{survey.title}</span>
                        <p>
                            {survey.body}
                        </p>
                        <p className="right">
                            Sent on: {
                                /** If we just use survey.dateSent, it will be a really computer-looking date since date objects aren't stringified well; doing this will make the date a nice, displayable date */
                                new Date(survey.dateSent).toLocaleDateString()
                            }
                        </p>
                    </div>
                    <div class="card-action">
                        <a>Yes: {survey.yes}</a>
                        <a>No: {survey.no}</a>
                    </div>
                </div>
            )
        })
    }

    render() {
        return (
            <div>
                {this.renderSurveys()}
            </div>
        );
    }
}

function mapStateToProps({ surveys }) {
    return {
        surveys 
    }
}

// Defining fetchSurveys as an object will allow connect() to automatically bind dispatch to it
export default connect(mapStateToProps, { fetchSurveys })(SurveyList);
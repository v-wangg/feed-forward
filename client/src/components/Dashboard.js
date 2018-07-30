import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SurveyList from './SurveyList';

export default class Dashboard extends Component {
    render() {
        return (
            <div>
                <SurveyList />
                <div className="fixed-action-btn">
                    <Link to="/surveys/new" className="btn-floating btn-large red">
                        {/** the <>i tag is used to place the icon; the text within the i tag determines which       icon is rendered (icons must be linked from google cdn); the <div> is what places       the icon in the corner; materialize asks us to use an <a> tag to render the button      itself, but since we're using react-router we will use a Link tag*/}
                        <i className="large material-icons">add</i>
                    </Link>
                </div>
            </div>
        )
    }
}


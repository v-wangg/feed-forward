import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Header from './Header';
import Landing from './Landing';
import Dashboard from './Dashboard';
import SurveyNew from './surveys/SurveyNew';

// This statement takes all the exported functions inside the index.js of /actions, and assigns them to the        "actions" object
import * as actions from '../actions';

class App extends Component {
    /**
     * We ALWAYS use componentDidMount() over componentWillMount() for any initial AJAX requests because React    calls componentWillMount() multiple times automatically, and the time difference between the 2 is          negligible
     * We are using this AJAX request to fetch the current user from "/api/current-user"; if this user exists,    we will set our redux state of auth to "true" and use this info to conditionally render certain things
     * We have chosen to do this auth state initialisation inside of app since we only want to do this once       when our entire app is rendered, so we use the root component; all other components may be re-rendered     for whatever reason, but App won't be since all components are inside App
     */
    componentDidMount() {
        this.props.fetchUser();
    }

    render() {
        return (
            // Materialize-css expects a root div with className="container" for its formatting
            <div className="container">
                <BrowserRouter>
                    <div>
                        <Header />
                        <Route exact path="/" component={Landing}/>
                        <Route exact path="/surveys" component={Dashboard} />
                        <Route path="/surveys/new" component={SurveyNew} />
                    </div>
                </BrowserRouter>
            </div>
        )
    }
}

// Since we imported "* as actions", the actions object contains key-value pairs of all our action creators; if    we pass an object full of action creators into connect instead of mapDispatchToProps, connect() will            automatically bind dispatch to them for us
export default connect(null, actions)(App);
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import CheckoutWrapper from './CheckoutWrapper';

class Header extends Component {
    renderNavItems() {
        switch (this.props.auth) {
            // If the user's auth status is unknown, return nothing so the user sees a blank tab on the navbar rather than to have heaps of components jump around the screen during the loading phase (undesired)
            case null:
                return;
            case false:
                // Since anchor tags were traditionally made to move a user to an entirely new html document, we can use it to make GET requests to completely different domains such as our backend API; 
                // BUTTT if we're just navigating to a different route which is RENDERED BY REACT ROUTER, it's best to use a <Link> tag intead
                return <li><a href="/auth/google">Login with Google</a></li>
            default: 
            /**
             *  For this logout link, we COULD have also used a button which, onClick, would call an action        creator that makes an AJAX request to the "/auth/logout" route to log us out, and then we          update our redux store to reflect this
             *  This method would be a lot faster and cleaner from the user's perspective since there are no       actual HTTP requests like with the method we're using (AJAX requests don't refresh the page,       etc.), but it would just be more tedious to implement compared to just straight up using an        anchor tag and making an HTTP request to the /auth/logout route in our backend
             *  In our case, the auth state in our reducer will be updated anyway since the root App component     will re-render and make a request to "/api/current-user" once the user is redirected by our        logout route (see auth-routes.js) back to the home URI
             *  Below we return an array of <li>'s; this can be done because whenever we return an array of JSX    React automatically assumes it's a list of something; since we're rendering everything inside a    <ul>, all is good
                *   We can give these <li>'s simple hardcoded keys because we know they will never really           change when a variable changes; this list either exists or it doesn't     
             */
                return [
                    <li key={1}> <CheckoutWrapper /> </li>,
                    <li key={2} style={{ margin: '0 10px' }}> 
                        Credits: {this.props.auth.credits} 
                    </li>,
                    <li key={3}><a href="/auth/logout">Sign out</a></li>
                ]
        }
    }
    render() {
        // Notice how a <Link> tag is used for the logo since we want the logo to redirect the user to a route which is RENDERED BY REACT ROUTER based on the user's auth status - there is no need for an <a> tag
        return (
            <nav>
                <div className="nav-wrapper">
                    <Link 
                        to={ this.props.auth ? "/surveys" : "/" /** This is a turnary expression */ } 
                        className="brand-logo"
                    >
                        FeedForward
                    </Link>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        {this.renderNavItems()}
                    </ul>
                </div>
            </nav>
        )
    }
}

const mapStateToProps = ({ auth }) => {
    return { auth };
};

// When we connect a component to the redux store, whenver the redux store updates, any conneted() component will automatically re-render it reflect this; this is why the header is able to automatically update whenever the user adds credits
export default connect(mapStateToProps)(Header);
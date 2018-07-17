import React, { Component } from 'react';
// We have to install a react version of stripe checkout because it doesn't natively support react very well; see react-stripe-checkout's npm site for documentation, and Stripe Checkout documentation for how this works
import StripeCheckout from 'react-stripe-checkout';
import { connect } from 'react-redux';
import * as actions from '../actions';

class CheckoutWrapper extends Component {
    render() {
        return (
            <StripeCheckout 
                name="FeedForward"
                description="Pay $5 for 5 survey credits"
                amount={500}
                token={
                     /** Whenever a payment occurs, give the token to our API, then update the user's credits */
                    token => this.props.handleStripeToken(token)
                }
                stripeKey={process.env.REACT_APP_STRIPE_KEY}
            >
                <button className="btn">
                    Add Credits
                </button>
            </StripeCheckout>
        )
    }
}

export default connect(null, actions)(CheckoutWrapper);


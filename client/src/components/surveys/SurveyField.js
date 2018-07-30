/**
 * In this component we will render a single text input and pass this component into the component prop of        Redux Form's <Field> tag
 * The point of this is to reuse this component and avoid adding duplicate logic such as re-creating multiple      <label> tags and validation logic; instead, we can just contain it all inside the Field tag if we define       this component
 */
import React from 'react';

/**
 * <Field> will pass us a bunch of props such as pre-written event handlers which will handle and update the       state and value of our input for us (these are inside the input property); all we need to do is give these     event handlers (which are within the input object, such as input.onChange, input.onBlur, etc.) to our          actual input, so that they will be called when needed
 * They also pass in any custom props which we gave <Field>, such as label
 * They also give us a meta property, which contains metadata about each particular <Field>; if we set up a       validate function within the reduxForm() HOC, it will automatically run the validate() function both when      the form is FIRST rendered and put all the errors we defined for each <Field> onto the meta.error property;    it's up to us to decide WHEN to display these errors; this is usually done once a field is touched  
 */
// 
export default ({ input, label, meta: { error, touched } }) => {
    return (
        <div>
            <label> {label} </label>
            <input {...input} style={{ marginBottom: '5px' }}/>
            <div className="red-text" style={{ marginBottom: '20px' }}>
                {touched && error /** If both touched AND error is true, RETURN error */}
            </div>
        </div>
    );
}
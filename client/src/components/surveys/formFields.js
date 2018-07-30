/**
* If, inside SurveyForm's renderFields() we were to have returned a hardcoded list of <Field> tags with key,      label, name, and component props, they would've all be the same, except for their individual label and name     properties
    * Since we'd be duplicating code, we can define this list of objects which contain the properties which are   DIFFERENT for each <Field>
    * In turn, we can map over this array (which will never change, hence the caps name), and for each object,    we'll pull off the label and name properties, and return a new array of <Field> components with             completely unique props as defined in this array; we'll need lodash to do this though, which is fine
 * The same logic applies to the labels and form values displayed inside SurveyFormReview; since there's a lot    of duplicate logic, this array helps us prevent that and make our code cleaner
*/

export default [
   { label: "Survey Title", name: "title", noValueError: "You must provide a title for your survey" },
   { label: "Subject Line", name: "subject", noValueError: "You must provide an email subject line" },
   { label: "Email Body", name: "body", noValueError: "You must provide an email body " },
   { label: "Recipient List", name: "recipients", noValueError: "You must provide a list of recipients" }
]
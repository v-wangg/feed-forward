const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// We want to define a separate file inside a utils directory for this function because this validateEmails function might be needed in other parts of the applicatoin
export default emails => {
    // .split() returns an array of strings which were separated by the specified argument, in this case a comma since we want the user to give us a comma separated list of emails
    // .map() will take an array, execute its callback arg on each of the elements in the array, then return a brand new array
    // .trim() trims off any white spaces on either side of a given string: " email@example.com  " will turn into just "email@example.com"
    // .filter() goes through each email and asks you write a callback which filters them; if an email is NOT valid, we will return true, causing the filter function to KEEP that invalid email inside the array; if an email IS valid, we will return false, causing the filter function to remove that email from the array; this way, we will have an array of invalid emails for the user, or an empty array indicating all emails are valid (remember we don't need a list of the valid emails, we're just validating the user here)
    // re.test(); re is a function of a regular expression from emailregex.com which allows us to test if an email is valid or not, by industry standards; if it's not valid, it will be false
    const invalidEmails = emails
                        .split(',')
                        .map(email => email.trim())
                        .filter(email => re.test(email) === false);

    // If invalid emails exist, return an error message
    if (invalidEmails.length) {
        // If we stringify an array, it's just a comma separated list of each element
        return `These emails are invalid: ${invalidEmails}`
    } 
    
    // If there are no invalid emails, return undefined; we can reference this inside errors.recipients inside our validate function, so that errors.recipients will just be underfined, i.e does not exist
    return;
}

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Creating a schema for recipients, except this schema defines a Subdocument Collection in our MongoDB rather    than an actual collection
 * A Subdocument Type is essentially a document (record) which is a child of another document, and whose data     is ONLY associated with and relevant to its parent and none of its parents siblings
 * So it makes sense to make a the recipients of EACH survey a subdocument collection of each individual survey   record
 * This means that we will just export the schema itself into the survey model class's schema, since there's no   need to create an entirely new model class and thus a new, separate collection for this - this is just         essentially a sub-collection
 */
const recipientSchema = new Schema({
    email: String,
    responded: { type: Boolean, default: false }
})

module.exports = recipientSchema;
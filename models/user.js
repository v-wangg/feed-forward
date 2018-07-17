// This file is named with a CAPS because it exports a CLASS of some kind, whereas others export a function or something
const mongoose = require('mongoose');
const {Schema} = mongoose;

// Create a schema for our users collection which specifies the properties every user record must contain
const userSchema = new Schema({
    googleID: String,
    // Whenever a new user model instance is created, it will always be given a googleID, but not necessarily be called with no. of credits, so to give it a default value, we set credits as an object like so
    credits: { type: Number, default: 0 } 
})

// Create model class, which references our MongoDB 'users' collection
mongoose.model('users', userSchema);
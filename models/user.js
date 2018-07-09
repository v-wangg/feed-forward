const mongoose = require('mongoose');
const {Schema} = mongoose;

// Create a schema for our users collection which specifies the properties every user record must contain
const userSchema = new Schema({
    googleID: String
})

// Create model class, which references our MongoDB 'users' collection
mongoose.model('users', userSchema);
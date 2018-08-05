var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    firstName: String,
    lastName: String,
    designation: String,
    organisation: String,
    phone: Number,
    addressLine1: String,
    addressLine2: String,
    landMark: String,
    city: String,
    state: String,
    country: String,
    pincode: Number,
    email: String,
    password: String,
    admin: Boolean,
    adminType: String
}));
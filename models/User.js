const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
//secure password hashing functions for Node.js applications, 
// generate salt and hash passwords to store securely in a database
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        maxlength: 50,
        minlength: 3,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
    ],
    unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
    },
})

// function generates a salt and uses it to hash the user's password, 
// is then stored in the database instead of the plaintext password
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

UserSchema.methods.createJWT = function () {
    return jwt.sign({userId:this._id,name:this.name},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_LIFETIME,
    })
}
// comparePassword() checks if a candidate password matches a stored hashed password 
// using bcrypt.compare(). It returns a boolean indicating the result of the comparison.
UserSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken"); 
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
    },
    gmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            
            if (!validator.isStrongPassword(value)) {
                throw new Error("Enter a strong password for: " + value);
            }
        }
    },
    likedMeals: {
        type: [String], 
        default: []
    }
}, {
    timestamps: true 
});

userSchema.methods.getJWT = async function(){
    const user = this;
    const token = jwt.sign({ _id: user._id}, "Batch13$9701",{ 
        expiresIn: "3h",
    });
    return token;
    };
userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const user = this;
    const hashedPassword = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, hashedPassword);
    return isPasswordValid;
    
};



module.exports = mongoose.model('User', userSchema);

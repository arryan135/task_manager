const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs")

// Mongoose wraps the second object argument in a schema by itself 
// We are doing this here explicitly
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error ("Email is invalid")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0){
                throw new Error("Age must be a positive number")
            }
        }
    },
    password: {
        type: String,
        minlength: 7,
        required: true,
        trim: true,
        validate(value){
            if (value.toLowerCase().includes("password")){
                throw new Error("password cannot contain \"password\"")
            }
        }
    }
});

// middleware is a function that runs before or after a mongoose fucntionality takes place.
// in our case we want to run our password hashing function before a new user is saved
// pre -> before an event; post -> after an event
// the second argument should use a normal function as we need `this` and the arrow fucntion doesn't bind `this`
userSchema.pre("save", async function(next){
    // the particular user being saved
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    // if next is not called mongoose thinks that we are still performing an opertion 
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;
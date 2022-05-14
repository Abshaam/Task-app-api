const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    name:{
        type: String,
        required: [true, " Please enter full name"],
    },

    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        lowercase: true,
        trim: true
    },

    password:{
        type: String,
        required:[true, "Please enter a password"],
        minlength: [4, "Please the password should be at least four"]
    },
    todos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Todo",
        },
    ],

    passwordHash: {
        type: String
    },

    resetToken: {
        type: String,
    }
})

// Before saving the password is hashed for security
// UserSchema.pre('save', async(next) =>{
//     const salt = await bcrypt.genSalt();
//     this.password = await bcrypt.hash(this.password, salt);
//     next()
// })

const User = mongoose.model("User", UserSchema);

module.exports = 
    User

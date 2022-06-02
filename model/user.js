const mongoose = require('mongoose');
const {Schema} = mongoose;
const Joi = require("joi");


const UserSchema = new Schema({
    name:{
        type: String,
        min: 3,
        max: 255,
        required: true 
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password:{
        type: String,
        required: true,
        minlength: 4, 
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
    },

    token: {
        type: String,
    },

    verified: {
        type: Boolean,
        default: false,
    },

    
})

// Before saving the password is hashed for security
// UserSchema.pre('save', async(next) =>{
//     const salt = await bcrypt.genSalt();
//     this.password = await bcrypt.hash(this.password, salt);
//     next()
// })

const User = mongoose.model("User", UserSchema);

const validate = (user) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(255).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(4).required(),
    });
    return schema.validate(user);
  };

const validateLogin = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
    });
    return schema.validate(user);
}

module.exports = {
      User,
      validate,
      validateLogin
 }

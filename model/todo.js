const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TodoSchema = new Schema({
  
    todo:{
        type: String
    },

    status: {
        type: String,
        default: "pending"
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, {timestamps: true})

const Todo = mongoose.model('Todo', TodoSchema)

module.exports = {
    Todo
}
const express = require('express');
const {addTodo, fetchATodo, fetchTodos, deleteTodo, updateTodo, todoByUser}= require('../controller/todo')
const router = express.Router();
const  authUser  = require('../middleware/auth');

// adding a todo
router.post('/:userId', addTodo)

// fetching all todos
router.get('/todos', fetchTodos)

// fetches a single todo
router.get('/:id',authUser, fetchATodo)

// deletes a todo
router.delete('/:id',authUser, deleteTodo)

// updates a todo
router.put('/:id',authUser, updateTodo)

// gets a todo associated with a particular user
router.get('/user-todo/:todoId', todoByUser);

module.exports= router
   
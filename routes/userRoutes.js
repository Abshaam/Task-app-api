const express = require('express');
const {signup, login, logout, allTodoByaUser, resetPassword,forgotPassword, resetForggotenPassword } = require('../controller/userController')
const router = express.Router();

// signing up a user
router.post('/signup', signup);

// logging in a user
router.post('/login', login);

// logging out a user
router.get('/logout', logout);

// getting all tasks associated with a particular user
router.get('/user-todos/:id', allTodoByaUser);

// enables users to reset their password
router.post('/reset-password', resetPassword);

router.put('/forgot-password/:email', forgotPassword);

router.put('/:resetToken/reset-password',resetForggotenPassword  )



module.exports= router
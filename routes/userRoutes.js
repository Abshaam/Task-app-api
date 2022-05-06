const express = require('express');
const {signup, login, logout, allTodoByaUser} = require('../controller/userController')
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/user-todos/:id', allTodoByaUser)



module.exports= router
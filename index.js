const express = require('express');
const morgan =require("morgan");
const helmet = require("helmet");
const cors = require ('cors');
const dotenv = require("dotenv").config();
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todoRoutes');
const userRoutes = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');


const PORT = process.env.PORT || 7000

const app = express()

// using middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'));
app.use(helmet());
app.use(cookieParser());
app.use (cors({
    origin: 'http://localhost:3000',
    methods: "PUT, POST, DELETE, GET",
    credentials: true
}));

app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);


mongoose.connect(process.env.MONGO_URi, {useNewUrlParser: true,
    useUnifiedTopology:true}).then(result => {
        console.log('mongodb connected')
    }).catch(err => {
        console.log(err)
    })

    
app.listen(PORT,() => {
    console.log(`server running on ${PORT}`)
});
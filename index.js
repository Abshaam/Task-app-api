const express = require('express');
const morgan =require("morgan");
const helmet = require("helmet");
const cors = require ('cors');
const dotenv = require("dotenv").config();
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todoRoutes');
const userRoutes = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');
// const nodemailer = require('nodemailer');


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
// app.post('/mailer', (req, res) => {
//     const { email } = req.body;

//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: 'ushamaabdulwahab@gmail.com',
//             pass: 'qreblnxjzvcfflow'
//         }
//     });

//     const mailOptions = {
//         from: 'ushamaabdulwahb@gmail.com',
//         to: `${email}`,
//         subject: 'Sending emails via Node js',
//         text: 'Testingn to see how nodemailer works',
//         html: `<div> this is html element </div>`
//     };

//     transporter.sendMail(mailOptions, function(error, info) {
//         if(error){
//             console.log(error);
//         } else {
//             console.log('Email sent: ' + info.response);
//         }
//     });

//     res.send('check your email for mail')
// })
    
app.listen(PORT,() => {
    console.log(`server running on ${PORT}`)
});
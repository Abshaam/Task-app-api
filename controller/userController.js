// requiring all modules
const User = require('../model/user')
const bcrypt = require('bcrypt')
const {handleErrors, generateToken} = require("../helper/userHelper");
// const res = require('express/lib/response');
const jwt = require('jsonwebtoken');
const { v4:uuidv4 } = require('uuid');
const nodemailer = require('nodemailer')

// signup
const signup = async (req, res) =>{
    // const{name, password, email} = req.body;
try {
     // new user details
     const newUser = new User(req.body)


    // hash the password entered by the user
    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(newUser.password, salt);
    
   
    // saves user details in the database
    const user = await newUser.save()
    res.status(201).json({ user });

    if(user){
        // generating a token
        const token = generateToken(user._id);
    

        // set cookies
        res.cookie('jwt', token, {
            maxAge: 3 * 24 * 60 * 60 * 1000,
             httpOnly:true,
            });

        // send our data
        res.status(201).json({user: user._id})
        
    } else {
        res.status(401).json("Authentication failed");
    }
} catch (error) {

    const errors = handleErrors(error);
    
    res.json({ errors });
    console.log(error)
}
}

// login
const login = async (req, res) => {
    const{ email, password} = req.body;

    try {
        // this is to check for the prescence of email in the database
        const user = await User.findOne({ email });

        console.log(user)

        // compare password of email present and hash the one the user entered and 
        // compare with the one in the database

        if(user){
            // run this if user is available
            const isSame = await bcrypt.compare(password, user.password);

            console.log(isSame)

            if(isSame) {
                // using the token, generate jwt token
                const token = generateToken(user._id);
                console.log({token: token});

                // set cookies for subsequent requests
                res.cookie('jwt', token, {
                    maxAge: 3 * 24 * 60 * 60 * 1000,
                     httpOnly: true,
                    });
                
                res.status(201).json({ user });
               
            } else {
                res.status(401).json ( "Password Incorrect");
            }

            // send our data
        }else{
            res.json({error: "Email not found, Signup"});
        }
    }catch (error) {
        console.log(error);
        res.json({ error });
    }
}

const logout = (req, res) =>{
    res.cookie("jwt", "", {maxAge: -1});
    res.sendStatus(200);
};

const resetPassword = async (req, res) =>{
    // old and new password entered into the input field
    const { password, newPassword } = req.body;

    const cookie = req.cookies.jwt;

    // checking for the prescence of cookie and jwt token or middleware
    if(cookie) {
        jwt.verify(cookie, process.env.privateKey, async (err, decoded)  => {
            try {
                if(err){
                    console.log(err);
                    return res.status(403).json(err);
                } else{
                    console.log(decoded);
                    const user = await User.findOne({ _id: decoded.id });

                    const identical = await bcrypt.compare(password, user.password);

                    if(!identical) {
                        return res.status(401).json({message: "Wrong credential"});
                    }

                    const hashed = await bcrypt.hash(newPassword, 12);

                    const checkPassword = await bcrypt.compare(newPassword, user.password);


                    // checking for the prescence of new password, hash and update
                    if (!newPassword) {
                        return res.sendStatus(400)
                    }

                   
                    if(checkPassword) {
                        console.log(checkPassword);
                        return res.status(401).json({ msg: "password reset failed"})
                    }

                    const updateUserPasssword = await User.findOneAndUpdate({ _id: decoded.id}, { password: hashed}, { new: 
                    true});

                    if(updateUserPasssword) {
                        res.cookie("jwt", "", { maxAge: -1});
                    }

                    res.status(200).json({ msg: "password succeffully changed"});
                }
            } catch (error) {
                console.log(error);
                return res.sendStatus(500);
            }
        })
    } else {

        return res.status(403).json({ msg: "token unavailable"})
    }
}

// Getting all the todos from a user
const allTodoByaUser = async (req, res) =>{
    const { id } = req.params;

    const user = await User.findById(id).populate('todos');

    res.send(user);
}


const forgotPassword = async (req, res) =>{
    try {
        const { email } = req.params;

        const resetToken = uuidv4();
    
        updateUserToken = await User.findOneAndUpdate({ email }, {resetToken: resetToken}, { new: true});
        console.log(updateUserToken);
    
        if(!updateUserToken) {
            res.status(401).json({ msg: 'email cannot be found'})
        }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: 'ushamaabdulwahab@gmail.com',
                    pass: 'qreblnxjzvcfflow'
                }
            });
        
            const mailOptions = {
                from: 'ushamaabdulwahb@gmail.com',
                to: `${email}`,
                subject: 'Password reset',
                text: `To reset your password, click this link: http://localhost:3000/reset-password/${resetToken}`,
                replyTo: 'dummy@gmail'
            };
        
            const request = await transporter.sendMail(mailOptions);
            console.log(request)
            // transporter.sendMail(mailOptions, function(error, info) {
            //     if(error){
            //         console.log(error);
            //     } else {
            //         console.log('Email sent: ' + info.response);
            //     }
            // });
        
            res.send('check your email for mail');
        

        } catch(error){
            console.log(error);
        }
}   

const resetForggotenPassword  =async (req, res) =>{
   try {
    const { resetToken } = req.params;
    const {newPassword} = req.body;

    const hash = await bcrypt.hash(newPassword, 12)

    updateUserToken = await User.findOneAndUpdate({ resetToken },
        {password: hash}, { new: true});

        // console.log(updateUserToken);

        res.sendStatus(200)

   } catch (error) {
       console.log(error);
   }
    
}
    

module.exports ={
    signup,
    login,
    logout,
    allTodoByaUser,
    resetPassword,
    forgotPassword,
    resetForggotenPassword 
}

// requiring all modules
const User = require('../model/user')
const bcrypt = require('bcrypt')
const {handleErrors, generateToken} = require("../helper/userHelper");

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
    res.redirect('/');
};

const allTodoByaUser = async (req, res) =>{
    const { id } = req.params;

    const user = await User.findById(id).populate('todos');

    res.send(user);
}

module.exports ={
    signup,
    login,
    logout,
    allTodoByaUser
}

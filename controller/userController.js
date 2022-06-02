// requiring all modules
const { User, validate, validateLogin } = require('../model/user');
const bcrypt = require('bcrypt');
const { generateToken, generateVerifyToken } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { v4:uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/sendEmail');

  
// signup
const signup = async (req, res) =>{
    
try {

    // the validate from the user model validates the user inputs before saving
    const { error } = validate(req.body);
    if (error) 
       return res.status(400).send({message: error.details[0].message});

    // this loop through the database to see if email entered already exist  
    let user = await User.findOne({ email: req.body.email });

    if (user)
      return res.status(409).send({message: "User with given email already exist! login"});

      //if the email doesn't exist, hash the password entered by the user
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    
    // and save user details in the database
    user = await User({
        ...req.body,
        password: hashPassword
    }).save()
    

    // generate token for the user after saving 
    const {id} = req.params;

    const token = generateVerifyToken(id)
    console.log(token);

    // after generating token save the token
    const userToken = await User.findOneAndUpdate({  id }, { token:token },
         { new: true });
    console.log(userToken);

    if(!userToken) {
        console.log("token not added to user");
    }
   
// The imported sendMail form utils is used to send an email
     const url = `Kindly click on this link to verify your email,${process.env.BASE_URL}users/${user.id}/verify/${token}`;
     await sendEmail(user.email, "Verify Email", url)

     res.status(201).send({message: "An email sent to your account please verify "})
     
// this catches error
} catch (error) {
    console.log(error);
}
}


// login
const login = async (req, res) => {

    // this grabs the email and passwords from the input fields
    const{ email, password} = req.body;

    try {

        // this authenticate the inputs from the user according to the joi schema
        const { error } = validateLogin(req.body);
        if (error) 
           return res.status(400).send({message: error.details[0].message});
    
        // this is to check for the prescence of email in the database
        let user = await User.findOne({ email });

        // if email does not exist in any user in the database run this 
        if (!user)
          return res.status(401).send("Authentication failed");
    
        console.log(user)

        // compare password of email present if found and hash the one the user entered and 
        // compare with the one in the database

        if(user){
            // run this if user is available
            const isSame = await bcrypt.compare(password, user.password);

            console.log(isSame)

            // if the password entered is not the same as the password in the database send this
            if(!isSame){
                res.status(401).send("Authentication failed");
            }

            // check and run this if the user is verified

            if(user.verified) {
                const id = req.params
                // using the token, generate jwt token
                const token = generateToken(id);
                console.log({token: token});

                // set a cookie
                res.cookie('jwt', token, {
                    maxAge: 3 * 24 * 60 * 60 * 1000,
                     httpOnly: true,
                    });
                   
                    res.status(201).json({ user })  // log user details out after setting a cookie
               
                    
            //   run this if user is not verified 
            } else {
                
                // generate a token 
                const {id} = req.params;

                const token = generateVerifyToken(id)
                    console.log({verifyToke: token});
                   
                    // add the token to the user
                const userToken = await User.findOneAndUpdate({  id }, { token:token },
                 { new: true });
                   console.log(userToken);
         
                 if(!userToken) {
                 console.log("token not added");
                 }

                //  send a verification email to the user
                const url = `${process.env.BASE_URL}users/${user.id}/verify/${token}`;
                     await sendEmail(user.email, "Verify Email", url)

                  
                    //  send this message if user is not verified
                res.status(400).json ( "Email not verified, Kindly check your mail to verify");
            }

            // send this message if user can't be found in the database
        }else{
            res.status(401).json ( "Authentication failed");
        }
    }catch (error) {
        console.log(error);
       
    }
}

// controller for logout, expires the cookie to logout
const logout = (req, res) =>{
    res.cookie("jwt", "", {maxAge: -1});
    res.sendStatus(200);
};

// change password
const resetPassword = async (req, res) => {

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

                    // run this if cookie is found, find the user in the database
                    console.log(decoded);
                    const user = await User.findOne({ id: decoded.id });

                    // compare the password entered by the user with the password in the database
                    const identical = await bcrypt.compare(password, user.password);

                    // send this if the password is unidentical
                    if(!identical) {
                        return res.status(401).json({message: "Wrong credential"});
                    }
                    
                    // hash the new password 
                    const hashed = await bcrypt.hash(newPassword, 12);

                    const checkPassword = await bcrypt.compare(newPassword, user.password);


                    // run this if password hasn't being hashed already
                    if (!newPassword) {
                        return res.sendStatus(400)
                    }

                //    send this if the new password is entered is the same as the one in the database
                    if(checkPassword) {
                        console.log(checkPassword);
                        return res.status(401).json({ msg: "password reset failed"})
                    }

                    // update the password field for the user with new user
                    const updateUserPasssword = await User.findOneAndUpdate({ id: decoded.id},
                         { password: hashed},
                          { new: true});


                     //expire cookie to log user out after updating   
                    if(updateUserPasssword) {
                        res.cookie("jwt", "", { maxAge: -1});
                    }

                    // and send this
                    res.status(200).json({ msg: "password succeffully changed"});
                }
            } catch (error) {
                console.log(error);
                return res.sendStatus(500);
            }
        })

        // send this if token or cookie can't be found
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


// handles sending an email to the user to reset password
const forgotPassword = async (req, res) =>{
    try {

        // this grabs the user email
        const { email } = req.params;

        // generate a token with uuidv4 to reset password
        const resetToken = uuidv4();

        // find user and add token to the user in the database
        updateUserToken = await User.findOneAndUpdate({ email }, {resetToken}, { new: true});
        console.log(updateUserToken);

        // if user with email can't be found and updated send this
        if(!updateUserToken) {
            res.status(401).json({ msg: 'email cannot be found'})
        }
        
        const url = `To reset your password, click this link: ${process.env.BASE_URL}reset-password/${resetToken}`;
                     await sendEmail(updateUserToken.email, "Password reset", url)

                     
            res.status(201).send({message: "An email sent to your account please verify "})


        } catch(error){
            console.log(error);
        }
}   

// this resets the password after and email has being sent
const resetForggotenPassword = async (req, res) => {

   try {
    
    // this grabs the reset token and the new password entered
    const { resetToken } = req.params;
    const {newPassword} = req.body;

    // this hashes the new password
    const hash = await bcrypt.hash(newPassword, 12)

    // finds the user and update the password field with the hashed password
    const updateUserToken = await User.findOneAndUpdate({ resetToken },
        {password: hash}, { new: true});

        console.log(updateUserToken);
        console.log(hash);

        res.sendStatus(200)

   } catch (error) {
       console.log(error);
   }
    
}





const verifyToken = async  (req, res) => {
    try {
    //   const { id } = req.params

      const logUser = await User.findOne({ _id: req.params.id });

      console.log(logUser);

      if (!logUser) {
    //    res.status(400).send({message: "Invalid link"})
       console.log("user not found");
    };
    //   const { token } = req.params
  
      const userToken = await User.findOne({
        token: req.params.token
      });
      console.log(userToken);
         if (!userToken){
          console.log("token not found");
        }
  
      await User.updateOne({ _id: logUser._id, verified: true });
      await User.updateOne({ _id: logUser._id, token: "verified" })
    //   await logUser.token.remove()

      res.status(200).send({message: "Email verified successfully"})
    //   res.send("email verified sucessfully");
    } catch (error) {
      res.status(500).send({message:"Internal Server Error"});
    }
  };


module.exports ={
    signup,
    login,
    logout,
    allTodoByaUser,
    resetPassword,
    forgotPassword,
    resetForggotenPassword,
    verifyToken,
}

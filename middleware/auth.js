const jwt = require('jsonwebtoken');

const authUser = (req, res, next) =>{
const token = req.cookies.jwt;

console.log('runnn', token)

if(token) {
    jwt.verify(token, process.env.privateKey, (err, decoded) =>{
        if(err){
            console.log(err)
            res.send(err.message)
        } else {
            console.log(decoded)
            // res.send(decoded)
            next()
        }
    } )
} else{
    // res.redirect('/login')
    res.json('token does not exist')
    console.log('token does not exist')
}}

module.exports = authUser
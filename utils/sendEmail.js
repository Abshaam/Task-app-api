const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");



module.exports.sendEmail = async (email, subject, text) =>{
    try {
        const transporter =  nodemailer.createTransport({

            host: process.env.HOST,
            service: process.env.SERVICE,
            post: process.env.EMAIL_PORT,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
             tls: {
                    rejectUnauthorized: false
                  }
        });

        
         await transporter.sendMail({
            from: process.env.USER,
            to: `${email}`,
            subject: subject,
            text: text,
            replyTo: 'dummy@gmail'
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.log("Email not sent");  
        console.log(error);    
    }
}



// generating token
module.exports.generateToken = (id) => {
    return jwt.sign({id}, process.env.privateKey, {
        expiresIn: 3 * 24 * 60 * 60 * 1000
    })
}

module.exports.generateVerifyToken = (id) => {
  return jwt.sign({id}, process.env.private, {
    expiresIn: 3 * 24 * 60 * 60 * 1000
  })
}
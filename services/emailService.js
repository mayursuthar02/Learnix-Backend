import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transport object with Gmail's SMTP settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    // port: 465,
    // secure: true,
    auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS,
    },
});

// Send email function
const sendEmail = async (to, subject, text) => {
    try {
        const receiver = {
            from: to, 
            to : process.env.GMAIL_USER, 
            subject, 
            text, 
        };

        transporter.sendMail(receiver, (error, emailResponse) => {
            if (error) {
                console.error("Error sending email:", error.message);
                return;
            }
            console.log("Email sent:", emailResponse.response);
        });
    } catch (error) {
        console.error("Error in sending email:", error.message);
    }
};

export default sendEmail;

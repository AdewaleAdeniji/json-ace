const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "phalconwise@gmail.com",
    pass: "uziawcwumdhqvbeq",
  },
});

const sendEmail = (title, text, to) => {
  const mailOptions = {
    from: "Votly  <votly@votly.com>",
    to: to,
    subject: title,
    text: text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
module.exports = sendEmail;
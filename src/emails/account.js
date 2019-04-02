const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_APT_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'baldosary@kku.edu.sa',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    }) 
}
const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'baldosary@kku.edu.sa',
        subject: 'Thanks for joining in!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon :(`
    }) 
}
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
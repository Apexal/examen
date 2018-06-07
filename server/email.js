const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  sendEmail: (to, subject, text, html) =>
    sendgrid.send({
      to,
      from: 'Regis Examen <examen@regis.org>',
      subject,
      text,
      html
    })
}
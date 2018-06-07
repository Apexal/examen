const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const pug = require('pug');

module.exports = {
  sendEmail: (to, subject, template, data) => {
    const html = pug.renderFile(path.join(__dirname, '/templates/', template + '.pug'), data);
    return sendgrid.send({
      to,
      from: 'Ignatian Examen <examen@placeholder.org>',
      subject,
      html,
      html
    })
  }
}
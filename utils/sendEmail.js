const mailgun = require('mailgun-js');

const sendEmail = (options) => {
  const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: process.env.MAILGUN_DOMAIN });
  const data = {
    from: `${options.from} ${process.env.MAILGUN_FROM}`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };
  mg.messages().send(data);
};

module.exports = sendEmail;

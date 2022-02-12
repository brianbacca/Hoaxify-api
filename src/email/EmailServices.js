const nodemailer = require('nodemailer');
// const nodemailerStub = require('nodemailer-stub');

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 8587,
  tls: {
    rejectUnauthorized: false,
  },
});

const sendAccountActivation = async (email, token) => {
  await transporter.sendMail({
    from: 'My App <info@my-app.com>',
    to: email,
    subjeect: 'Account Activation',
    html: `Token is ${token}`,
  });
};

module.exports = {
  sendAccountActivation,
};

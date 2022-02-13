const transporter = require('../config/emailTransporter');

const serndAccountActivation = async (email, token) => {
  await transporter.sendMail({
    from: 'My App <ingo@mt-ap.com>',
    to: email,
    subject: 'Account Activation',
    html: `Token is ${token}`,
  });
};

module.exports = { serndAccountActivation };

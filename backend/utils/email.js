const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 's4946.fra1.stableserver.net',
    port: 465,
    secure: true, // 465 = SSL/TLS
    auth: {
      user: 'data@m24o.co',
      pass: "12er56ui90MO@",   // put the real password in .env
    },
  });

  const mailOptions = {
    from: '"PRISM FLUX" <data@m24o.co>', // MUST match your domain
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('sendMail result:', info);
};

module.exports = sendEmail;
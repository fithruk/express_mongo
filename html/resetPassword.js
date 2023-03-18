const keys = require("../keys/index");

module.exports = function (email, token) {
  return {
    to: email,
    from: "sergeytrenerbelov@gmail.com",
    subject: "Retake Control",
    html: `
            <h1>This is mail for change your password</h1>
            <p>If you did not request for a possibility to change your password?Just skip this message</p>
            <p>Or click on link below</p>
            <a href="${keys.BASE_URL}/auth/password/${token}">Reset Password</a>
            <hr/>
            <a href="${keys.BASE_URL}/auth/login#login">Visit our service</a>
        `,
  };
};

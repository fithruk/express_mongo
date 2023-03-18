const keys = require("../keys/index");

module.exports = function (email) {
  return {
    to: email,
    from: "sergeytrenerbelov@gmail.com",
    subject: "Accaunt has been created",
    html: `
            <h1>Your registration was appruved!</h1>
            <p>Welcome to our system. Your accaunt email is ${email}</p>
            <hr/>
            <a href="${keys.BASE_URL}/auth/login#login">Visit our service</a>
        `,
  };
};

"use strict";
const Nodemailer = require("nodemailer");

const senderInfo = {
  sender: '"LISTE"' + process.env.EMAIL, // sender address
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.EMAIL_PW, // generated ethereal password
  },
};

// async..await is not allowed in global scope, must use a wrapper
module.exports = {
  registration: async (email, endpoint, fixedEndpoint) => {
    transporter.sendMail({
      from: senderInfo.sender, // sender address
      to: email, // list of receivers
      subject: "Registrierung mit LISTE", // Subject line
      text:
        "Bitte folge diesem Link um deine Registrierung abzuschließen: " +
        "\n" +
        process.env.HOST_URL +
        "/confirm/" +
        endpoint, // plain text body
      html:
        'Bitte folge diesem Link um deine Registrierung abzuschließen: <a href="' +
        process.env.HOST_URL +
        "/confirm/" +
        fixedEndpoint +
        '">Registrierung bestätigen</a>',
    });
  },
  passwordChange: async (email, endpoint) => {
    transporter.sendMail({
      from: senderInfo.sender, // sender address
      to: email, // list of receivers
      subject: "Passwort zurücksetzen", // Subject line
      text:
        "Bitte folge diesem Link um dein Passwort zurückzusetzen: " +
        "\n" +
        process.env.HOST_URL +
        "/password-reset/" +
        endpoint, // plain text body
    });
  },

  reportMissing: async (email, itemUrl) => {
    transporter.sendMail({
      from: senderInfo.sender, // sender address
      to: process.env.RECEIVER_EMAIL, // list of receivers
      subject: "Komponente fehlt", // Subject line
      text:
        "Der Benutzer " +
        email +
        " meldet das folgende Komponente fehlt: " +
        "\n" +
        itemUrl,
    });
  },

  reportDemaged: async (email, itemUrl, message) => {
    transporter.sendMail({
      from: senderInfo.sender, // sender address
      to: process.env.RECEIVER_EMAIL, // list of receivers
      subject: "Komponente beschädigt", // Subject line
      text:
        "Der Benutzer " +
        email +
        " meldet einen beschädigung an der Komponente: " +
        "\n" +
        itemUrl +
        "\n\n" +
        " Beschreibung durch den Benutzer: " +
        "\n" +
        message,
    });
  },
};

// create reusable transporter object using the default SMTP transport
let transporter = Nodemailer.createTransport({
  host: senderInfo.host,
  port: senderInfo.port,
  secure: senderInfo.secure, // true for 465, false for other ports
  auth: {
    user: senderInfo.auth.user, // generated ethereal user
    pass: senderInfo.auth.pass, // generated ethereal password
  },
});

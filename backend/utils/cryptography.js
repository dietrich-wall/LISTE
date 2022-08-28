/**
 *
 */

// general encryption
const crypto = require("crypto");
const algorithm = "aes-256-ctr";
const secretKey = process.env.CRYPTO_SECRET;
const iv = crypto.randomBytes(16);
// password encryption
const bcrypt = require("bcrypt");

module.exports = {
  encryptPassword: async function (password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 8, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  },

  comparePassword: async function (password, passwordHash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, passwordHash, (err, same) => {
        if (err) return reject(err);
        resolve(same);
      });
    });
  },

  encrypt: function (text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
      iv: iv.toString("hex"),
      content: encrypted.toString("hex"),
    };
  },

  decrypt: function (hash) {
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash.iv, "hex")
    );

    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, "hex")),
      decipher.final(),
    ]);

    return decrpyted.toString();
  },

  today: function () {
    let date = new Date();
    return (
      date.getDate() + "" + (date.getMonth() + 1) + "" + date.getFullYear()
    );
  },
};

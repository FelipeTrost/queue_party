const key = process.env.ENCRYPTION_KEY;

const encryptor = require("simple-encryptor")(key);

function encrypt(message) {
  return encryptor.encrypt(message);
}

function decrypt(message) {
  return encryptor.decrypt(message);
}

module.exports = { encrypt, decrypt };

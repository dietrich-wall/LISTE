const { execFileSync } = require("child_process");
const path = require("path");

module.exports = function qrCodeGen(route, id, text) {
  // create Link for the QR Code
  let link = process.env.HOST_URL + route + id;
  // create directory-path to executale File
  let pathToExe = path.join(__dirname, "QRcodeGen");
  // return stdout from executale File
  return execFileSync(pathToExe, [text, link]);
};

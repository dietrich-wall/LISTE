// Length of the alphanumeric ID
const alphNumIdLen = 7;
// Base of the number system used for alphanumeric IDs
const alphaNumIdbase = 62;

// Converts an integer into a base62 digit (in string format)
// 62#0-9 = 10#0-9 | 62#a-z = 10#10-35 | 62#A-Z = 10#36-61
function decIntToBase62Digit(decInt) {
  if (decInt < 10) {
    return decInt;
  }
  if (decInt < 36) {
    return String.fromCharCode(decInt + 87);
  }
  if (decInt < 62) {
    return String.fromCharCode(decInt + 29);
  }
  return 0;
}

// Converts a timestamp to an alphanumeric ID (in string format)
function timeToAlphNumId(time) {
  let outAlphNumId = "";

  for (
    let quotient = time, remainder = time % alphaNumIdbase, index = 1;
    quotient > 0, index <= alphNumIdLen;
    quotient = Math.floor(quotient / alphaNumIdbase),
      remainder = quotient % alphaNumIdbase,
      index++
  ) {
    outAlphNumId = decIntToBase62Digit(remainder) + outAlphNumId;
  }

  return outAlphNumId;
}

// Converts a base62 digit to an integer
// 62#0-9 = 10#0-9 | 62#a-z = 10#10-35 | 62#A-Z = 10#36-61
function base62DigitToDecInt(base62Digit) {
  let base62DigitASCII = base62Digit.charCodeAt(0);

  if (base62DigitASCII >= 48 && base62DigitASCII <= 57) {
    return base62DigitASCII - 48;
  }
  if (base62DigitASCII >= 97 && base62DigitASCII <= 122) {
    return base62DigitASCII - 97 + 10;
  }

  if (base62DigitASCII >= 65 && base62DigitASCII <= 90) {
    return base62DigitASCII - 65 + 36;
  }

  return 0;
}

// Converts an alphanumeric ID to a timestamp
function alphNumIdToTime(alphNumId) {
  let time = 0;
  let currCharValue = 0;

  for (
    let idIndex = alphNumIdLen - 1, timeIndex = 0;
    idIndex >= 0, timeIndex <= alphNumIdLen - 1;
    idIndex--, timeIndex++
  ) {
    currCharValue = base62DigitToDecInt(alphNumId.charAt(idIndex));
    time += currCharValue * alphaNumIdbase ** timeIndex;
  }

  return time;
}

module.exports = timeToAlphNumId;

// Demo code
/*
  let currTime = Date.now();
  let alphNumId = timeToAlphNumId(currTime);
  let vibeCheck = alphNumIdToTime(alphNumId);
  
  console.log(currTime);
  console.log(alphNumId);
  console.log(vibeCheck);
*/

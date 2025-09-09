import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const KEY = 'MyL33tPrivateKey';

function decrypt(token) {
  const derivedKey = crypto.createHash('sha256').update(KEY).digest();
  const data = Buffer.from(token, 'base64');
  const iv = data.subarray(0, 16);
  const ciphertext = data.subarray(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
  let decrypted = decipher.update(ciphertext);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

function deterministicHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// console.log(decrypt('bI88L6WJatrY91wGe0rfWxHOZ42SUJpxywUniFsqmN0='));

console.log(deterministicHash('12345678', 12));
console.log(deterministicHash('12345678', 12));

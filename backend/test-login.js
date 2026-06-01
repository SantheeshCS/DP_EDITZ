require('dotenv').config();
const bcrypt = require('bcryptjs');

const email = 'admin@example.com';
const password = 'admin123';

const envEmail = process.env.ADMIN_EMAIL;
const envHash = process.env.ADMIN_PASSWORD_HASH;

console.log('ENV Email:', envEmail);
console.log('ENV Hash:', envHash);

console.log('Email Match:', email.toLowerCase() === envEmail.toLowerCase());

bcrypt.compare(password, envHash).then(isMatch => {
  console.log('Password Match (bcrypt.compare):', isMatch);
});

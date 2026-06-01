const bcrypt = require('bcryptjs');
const password = 'dpadmin123';
const hash = bcrypt.hashSync(password, 10);
console.log('Verified hash for dpadmin123 is:', hash);

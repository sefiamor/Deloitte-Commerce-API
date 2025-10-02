const fs = require('fs');
const User = require('../lib/model/user');

// Load user documents for unit testing.
const load = async () => {
  const raw = fs.readFileSync('test/users.json');
  const data = JSON.parse(raw);

  let promises = [];

  data.forEach((element) => {
    const user = new User(element);
    promises.push(user.save());
  });

  await Promise.all(promises).then(() => {
    return;
  });
};

module.exports = { load };

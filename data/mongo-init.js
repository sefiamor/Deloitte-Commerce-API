deloitte_commerce = db.getSiblingDB('deloitte');

// create the API user
deloitte_commerce.createUser({
  user: 'deloitte-commerce-api',
  pwd: 'Deloitte-Pass',
  roles: [
    {
      role: 'readWrite',
      db: 'deloitte',
    },
  ],
});

// Provides functions for managing an in-memory mongodb for unit testing.

const mongoose = require('mongoose');
const dbserver = require('mongodb-memory-server').MongoMemoryServer;

mongoose.set('strictQuery', false);

let mongo = null;

// Setup an in-memory mongodb and connect to it.
const setUp = async () => {
  mongo = await dbserver.create();
  await mongoose.connect(mongo.getUri());
};

// Disconnect and cleanup the connected in-memory mongodb.
const dropDb = async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
};

// Drop all collections from the connected in-memory mongodb.
const dropCollections = async () => {
  if (mongo) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

module.exports = { setUp, dropDb, dropCollections };

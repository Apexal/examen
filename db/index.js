const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const dbURL = process.env.MONGODB_URI;

let models = {};

const connection = mongoose.connect(dbURL);

fs.readdirSync(__dirname + '/schemas').forEach(file => {
  console.log(file);
  var schema = require(path.join(__dirname + '/schemas/', file));
  models[schema.name] = mongoose.model(schema.name, schema.schema);
});
console.log('Loaded schemas...');

module.exports = {
  connection,
  models
};
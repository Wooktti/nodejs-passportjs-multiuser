const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('sessiondb.json', {defaultValue: []});
const sessiondb = low(adapter);

module.exports = sessiondb;
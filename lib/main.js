import addConstructorMethods from 'record/constructor-methods';
import addPrototypeMethods from 'record/prototype-methods';

var store = {};

function RecordBase (properties) {
  return _.extend(this, properties);
}

function update (properties) {
  return _.extend(this, properties);
}

function define (identifier, definition) {
  definition = definition || {};
  var collection = store[identifier] = [];

  function Record (properties) {
    RecordBase.call(this, properties);
  }

  collection._Model = Record;

  _.extend(Record, { 
    _collection: collection,
    _identifier: identifier,
    _primaryKey: definition.primaryKey || 'id'
  });
  addConstructorMethods(Record);

  Record.prototype = Object.create(RecordBase.prototype);

  _.extend(Record.prototype, {
    constructor: Record,
    _primaryKey: Record._primaryKey,
    _store: store
  });
  addPrototypeMethods(Record.prototype, definition);

  return Record;
}

_.extend(RecordBase, {
  define: define
});

_.extend(RecordBase.prototype, {
  update: update 
});

this.RecordBase = RecordBase;

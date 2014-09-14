import addConstructorMethods from 'record/constructor-methods';
import addPrototypeMethods from 'record/prototype-methods';
import store from 'store/main';

function define (identifier, definition) {
  definition = definition || {};
  var collection = store[identifier] = [];

  function Record (properties) {
    return _.extend(this, properties);
  }

  collection._Model = Record;

  _.extend(Record, { 
    _collection: collection,
    _identifier: identifier,
    _primaryKey: definition.primaryKey || 'id'
  });
  addConstructorMethods(Record);

  _.extend(Record.prototype, {
    _primaryKey: Record._primaryKey,
    _store: store
  });
  addPrototypeMethods(Record.prototype, definition);

  return Record;
}

export default define;

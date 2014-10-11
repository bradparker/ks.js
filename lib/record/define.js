import addConstructorMethods from 'record/constructor-methods';
import addPrototypeMethods from 'record/prototype-methods';
import privatize from 'utils/privatize';

function define (store, identifier, definition) {
  definition = definition || {};
  var collection = store[identifier] = [];

  function Record (properties) {
    return _.extend(this, properties);
  }

  collection._Model = Record;

  var privateProps = {
    store: store,
    collection: collection,
    identifier: identifier,
    primaryKey: definition.primaryKey || 'id',
    baseURL: definition.baseURL
  };

  privatize(Record, privateProps);
  privatize(Record.prototype, privateProps);

  addConstructorMethods(Record);
  addPrototypeMethods(Record.prototype, definition);

  return Record;
}

export default define;

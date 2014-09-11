var relMethods = {
  hasMany: hasMany
};

function hasMany (instance, relationship) {
  var collection = instance._store[relationship.collection];
  var query = {};
  query[relationship.foreignKey] = instance[instance._primaryKey];

  var relationshipCollection = _.where(collection, query);
  relationshipCollection._Model = collection._Model;

  return relationshipCollection;
}

function addRelations (proto, relationships) {
  if (!relationships) return proto;

  return Object.keys(relationships).reduce(function (proto, r) {
    var relationship = relationships[r];

    Object.defineProperty(proto, r, {
      get: function () {
        return relMethods[relationship.kind](this, relationship);
      }
    });

    return proto;
  }, proto);
}

function addPrototypeMethods (proto, definition) {
  addRelations(proto, definition.relationships);
}

export default addPrototypeMethods;

var relMethods = {
  hasMany: hasMany
};

function update (properties) {
  return _.extend(this, properties);
}

function hasMany (instance, relationship) {
  var collection = instance.get('store')[relationship.collection];
  var query = {};
  query[relationship.foreignKey] = instance[instance.get('primaryKey')];

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
  _.extend(proto, {
    update: update
  });
}

export default addPrototypeMethods;

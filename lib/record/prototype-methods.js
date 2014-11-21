import xhr from 'utils/xhr';

var relMethods = {
  hasMany: hasMany
};

function update (properties) {
  return _.extend(this, properties);
}

function deserialize (response) {
  var identifier  = this.get('identifier');
  var resource    = response[identifier];

  return this.update(resource);
}

function save () {
  var instance = this;
  var id  = instance[instance.get('primaryKey')];
  var url = instance.constructor.resourceURL(id);

  var promise = xhr({
    url: url,
    method: !!id ? 'PUT' : 'POST'
  });

  promise.then(function (response) {
    return instance.deserialize(response);
  });

  return promise;
}

function destroy () {
  var instance = this;
  var Model = instance.constructor;
  var id  = instance[instance.get('primaryKey')];
  var url = Model.resourceURL(id);

  Model.remove(instance);
  
  var promise = xhr({
    url: url,
    method: 'DELETE'
  });

  promise.catch(function () {
    Model.add(instance);
  });

  return promise;
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
    update: update,
    save: save,
    deserialize: deserialize,
    destroy: destroy
  });
}

export default addPrototypeMethods;

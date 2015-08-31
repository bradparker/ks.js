import xhr from '../utils/xhr';

function all () {
  return this.get('collection');
}

function add (record) {
  var collection = this.all();
  var index = collection.indexOf(record);

  if (index >= 0) {
    return record;
  }

  if (!(record instanceof this)) {
    record = new this(record);
    return record;
  }

  collection.push(record);
  return record;
}

function remove (record) {
  var collection = this.all();
  var index = collection.indexOf(record);

  return collection.splice(index, 1);
}

function resourceURL (id) {
  var base = this.get('baseURL') || this.get('store').get('baseURL') || '/';

  return base +
    this.get('identifier') +
    (_.isNumber(id) ? '/' + id : '');
}

function deserialize (response) {
  var Record     = this;
  var identifier = this.get('identifier');
  var collection = this.get('store')[identifier];
  var primaryKey = this.get('primaryKey');
  var resources  = response[identifier];

  return resources.reduce(function (collection, resource) {
    var existing = _.find(collection, function (record) {
      return resource[primaryKey] &&
        record[primaryKey] === resource[primaryKey];
    });

    if (existing) {
      existing.update(resource);
    } else {
      new Record(resource);
    }
    return collection;
  }, collection);
}

function fetch (id) {
  var url     = this.resourceURL(id);
  var Record  = this;

  var promise = xhr({
    url: url
  });

  promise.then(function () {
    return Record.deserialize.apply(Record, arguments);
  });

  return promise;
}

function addConstructorMethods (Constuctor) {
  _.extend(Constuctor, {
    resourceURL: resourceURL,
    deserialize: deserialize,
    fetch: fetch,
    all: all,
    add: add,
    remove: remove
  });
}

export default addConstructorMethods;

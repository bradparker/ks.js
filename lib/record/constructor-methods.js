import xhr from 'utils/xhr';

function all () {
  return this._collection;
}

function add (record) {
  var collection = this.all();
  var index = collection.indexOf(record);

  if (index >= 0) {
    return record;
  }

  if (!(record instanceof this)) {
    record = new this(record);
  }

  collection.push(record);
  return record;
}

function remove (record) {
  var collection = this.all();
  var index = collection.indexOf(record);

  return collection.splice(index, 1);
}

function fetchAll () {
  return xhr({
    url: '/foo'
  });
}

function addConstructorMethods (Constuctor) {
  _.extend(Constuctor, {
    fetchAll: fetchAll,
    all: all,
    add: add,
    remove: remove
  });
}

export default addConstructorMethods;

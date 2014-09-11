import xhr from 'utils/xhr';

function _all () {
  return this._collection;
}

function _add (record) {
  var collection = this.all();
  var index = collection.indexOf(record);

  if (index > 0) {
    return record;
  }

  if (!(record instanceof this)) {
    record = new this(record);
  }

  collection.push(record);
  return record;
}

function _remove (record) {
  var collection = this.all();
  var index = collection.indexOf(record);

  return collection.splice(index, 1);
}

function _fetchAll () {
  return xhr({
    url: '/foo'
  });
}

function addConstructorMethods (Constuctor) {
  _.extend(Constuctor, {
    fetchAll: _fetchAll,
    all: _all,
    add: _add,
    remove: _remove
  });
}

export default addConstructorMethods;

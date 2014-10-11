import xhr from 'utils/xhr';

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
  }

  collection.push(record);
  return record;
}

function remove (record) {
  var collection = this.all();
  var index = collection.indexOf(record);

  return collection.splice(index, 1);
}

function resourceURL () {
  var base = this.get('baseURL') || this.get('store').get('baseURL') || '/';
  
  return base + this.get('identifier');
}

function fetchAll () {
  var url = this.resourceURL();

  return xhr({
    url: url
  });
}

function addConstructorMethods (Constuctor) {
  _.extend(Constuctor, {
    resourceURL: resourceURL,
    fetchAll: fetchAll,
    all: all,
    add: add,
    remove: remove
  });
}

export default addConstructorMethods;

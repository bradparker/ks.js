(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _storeCreate = require('./store/create');

var _storeCreate2 = _interopRequireDefault(_storeCreate);

window.ks = {
  createStore: _storeCreate2['default']
};
},{"./store/create":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsXhr = require('../utils/xhr');

var _utilsXhr2 = _interopRequireDefault(_utilsXhr);

function all() {
  return this.get('collection');
}

function add(record) {
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

function remove(record) {
  var collection = this.all();
  var index = collection.indexOf(record);

  return collection.splice(index, 1);
}

function resourceURL(id) {
  var base = this.get('baseURL') || this.get('store').get('baseURL') || '/';

  return base + this.get('identifier') + (_.isNumber(id) ? '/' + id : '');
}

function deserialize(response) {
  var Record = this;
  var identifier = this.get('identifier');
  var collection = this.get('store')[identifier];
  var primaryKey = this.get('primaryKey');
  var resources = response[identifier];

  return resources.reduce(function (collection, resource) {
    var existing = _.find(collection, function (record) {
      return resource[primaryKey] && record[primaryKey] === resource[primaryKey];
    });

    if (existing) {
      existing.update(resource);
    } else {
      new Record(resource);
    }
    return collection;
  }, collection);
}

function fetch(id) {
  var url = this.resourceURL(id);
  var Record = this;

  var promise = (0, _utilsXhr2['default'])({
    url: url
  });

  promise.then(function () {
    return Record.deserialize.apply(Record, arguments);
  });

  return promise;
}

function addConstructorMethods(Constuctor) {
  _.extend(Constuctor, {
    resourceURL: resourceURL,
    deserialize: deserialize,
    fetch: fetch,
    all: all,
    add: add,
    remove: remove
  });
}

exports['default'] = addConstructorMethods;
module.exports = exports['default'];
},{"../utils/xhr":7}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _recordConstructorMethods = require('../record/constructor-methods');

var _recordConstructorMethods2 = _interopRequireDefault(_recordConstructorMethods);

var _recordPrototypeMethods = require('../record/prototype-methods');

var _recordPrototypeMethods2 = _interopRequireDefault(_recordPrototypeMethods);

var _utilsPrivatize = require('../utils/privatize');

var _utilsPrivatize2 = _interopRequireDefault(_utilsPrivatize);

function define(store, identifier, definition) {
  definition = definition || {};
  var collection = store[identifier] = [];

  function Record(properties) {
    var record = _.extend(this, properties);
    Record.add(record);
    return record;
  }

  collection._Model = Record;

  var privateProps = {
    store: store,
    collection: collection,
    identifier: identifier,
    primaryKey: definition.primaryKey || 'id',
    baseURL: definition.baseURL
  };

  (0, _utilsPrivatize2['default'])(Record, privateProps);
  (0, _utilsPrivatize2['default'])(Record.prototype, privateProps);

  (0, _recordConstructorMethods2['default'])(Record);
  (0, _recordPrototypeMethods2['default'])(Record.prototype, definition);

  return Record;
}

exports['default'] = define;
module.exports = exports['default'];
},{"../record/constructor-methods":2,"../record/prototype-methods":4,"../utils/privatize":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsXhr = require('../utils/xhr');

var _utilsXhr2 = _interopRequireDefault(_utilsXhr);

var relMethods = {
  hasMany: hasMany
};

function update(properties) {
  return _.extend(this, properties);
}

function deserialize(response) {
  var identifier = this.get('identifier');
  var resource = response[identifier];

  return this.update(resource);
}

function save() {
  var instance = this;
  var id = instance[instance.get('primaryKey')];
  var url = instance.constructor.resourceURL(id);

  var promise = (0, _utilsXhr2['default'])({
    url: url,
    method: !!id ? 'PUT' : 'POST'
  });

  promise.then(function (response) {
    return instance.deserialize(response);
  });

  return promise;
}

function destroy() {
  var instance = this;
  var Model = instance.constructor;
  var id = instance[instance.get('primaryKey')];
  var url = Model.resourceURL(id);

  Model.remove(instance);

  var promise = (0, _utilsXhr2['default'])({
    url: url,
    method: 'DELETE'
  });

  promise['catch'](function () {
    Model.add(instance);
  });

  return promise;
}

function hasMany(instance, relationship) {
  var collection = instance.get('store')[relationship.collection];
  var query = {};
  query[relationship.foreignKey] = instance[instance.get('primaryKey')];

  var relationshipCollection = _.where(collection, query);
  relationshipCollection._Model = collection._Model;

  return relationshipCollection;
}

function addRelations(proto, relationships) {
  if (!relationships) return proto;

  return Object.keys(relationships).reduce(function (proto, r) {
    var relationship = relationships[r];

    Object.defineProperty(proto, r, {
      get: function get() {
        return relMethods[relationship.kind](this, relationship);
      }
    });

    return proto;
  }, proto);
}

function addPrototypeMethods(proto, definition) {
  addRelations(proto, definition.relationships);
  _.extend(proto, {
    update: update,
    save: save,
    deserialize: deserialize,
    destroy: destroy
  });
}

exports['default'] = addPrototypeMethods;
module.exports = exports['default'];
},{"../utils/xhr":7}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _recordDefine = require('../record/define');

var _recordDefine2 = _interopRequireDefault(_recordDefine);

var _utilsPrivatize = require('../utils/privatize');

var _utilsPrivatize2 = _interopRequireDefault(_utilsPrivatize);

function defineResource(name, definition) {
  return (0, _recordDefine2['default'])(this, name, definition);
}

function create(config) {
  config = config || {};

  function Store() {}

  (0, _utilsPrivatize2['default'])(Store.prototype, config);

  Store.prototype.defineResource = defineResource;

  return new Store();
}

exports['default'] = create;
module.exports = exports['default'];
},{"../record/define":3,"../utils/privatize":6}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function privatize(obj, privates) {
  function get(prop) {
    return privates[prop];
  }

  obj.get = get;

  return obj;
}

exports["default"] = privatize;
module.exports = exports["default"];
},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function xhr(options) {
  var req = new XMLHttpRequest(),
      res;

  var resolve, reject;
  var promise = new Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  });

  req.open(options.method || 'GET', options.url, true);

  Object.keys(options.headers || {}).forEach(function (key) {
    req.setRequestHeader(key, options.headers[key]);
  });

  req.onreadystatechange = function () {
    if (req.readyState !== 4) {
      return;
    }

    if ([200, 304].indexOf(req.status) === -1) {
      reject(new Error('Server responded with a status of ' + req.status));
    } else {
      res = JSON.parse(req.responseText);
      resolve(res);
    }
  };

  req.send(options.data || void 0);

  return promise;
}

exports['default'] = xhr;
module.exports = exports['default'];
},{}]},{},[1]);

(function() {
    "use strict";
    function utils$xhr$$xhr(options) {
      var req = new XMLHttpRequest(),
          res;

      var resolve, reject;
      var promise = new Promise(function(res, rej) { 
        resolve = res; 
        reject  = rej;
      });
     
      req.open(options.method || 'GET', options.url, true);
     
      Object.keys(options.headers || {}).forEach(function (key) {
        req.setRequestHeader(key, options.headers[key]);
      });
     
      req.onreadystatechange = function() {
        if(req.readyState !== 4) {
          return;
        }
     
        if([200,304].indexOf(req.status) === -1) {
          reject(new Error('Server responded with a status of ' + req.status));
        } else {
          res = JSON.parse(req.responseText);
          resolve(res);
        }
      };
     
      req.send(options.data || void 0);
      
      return promise;
    }

    var utils$xhr$$default = utils$xhr$$xhr;

    function record$constructor$methods$$all () {
      return this._collection;
    }

    function record$constructor$methods$$add (record) {
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

    function record$constructor$methods$$remove (record) {
      var collection = this.all();
      var index = collection.indexOf(record);

      return collection.splice(index, 1);
    }

    function record$constructor$methods$$fetchAll () {
      return utils$xhr$$default({
        url: '/foo'
      });
    }

    function record$constructor$methods$$addConstructorMethods (Constuctor) {
      _.extend(Constuctor, {
        fetchAll: record$constructor$methods$$fetchAll,
        all: record$constructor$methods$$all,
        add: record$constructor$methods$$add,
        remove: record$constructor$methods$$remove
      });
    }

    var record$constructor$methods$$default = record$constructor$methods$$addConstructorMethods;
    var record$prototype$methods$$relMethods = {
      hasMany: record$prototype$methods$$hasMany
    };

    function record$prototype$methods$$update (properties) {
      return _.extend(this, properties);
    }

    function record$prototype$methods$$hasMany (instance, relationship) {
      var collection = instance._store[relationship.collection];
      var query = {};
      query[relationship.foreignKey] = instance[instance._primaryKey];

      var relationshipCollection = _.where(collection, query);
      relationshipCollection._Model = collection._Model;

      return relationshipCollection;
    }

    function record$prototype$methods$$addRelations (proto, relationships) {
      if (!relationships) return proto;

      return Object.keys(relationships).reduce(function (proto, r) {
        var relationship = relationships[r];

        Object.defineProperty(proto, r, {
          get: function () {
            return record$prototype$methods$$relMethods[relationship.kind](this, relationship);
          }
        });

        return proto;
      }, proto);
    }

    function record$prototype$methods$$addPrototypeMethods (proto, definition) {
      record$prototype$methods$$addRelations(proto, definition.relationships);
      _.extend(proto, {
        update: record$prototype$methods$$update
      });
    }

    var record$prototype$methods$$default = record$prototype$methods$$addPrototypeMethods;
    var store$main$$store = {};

    var store$main$$default = store$main$$store;

    function record$define$$define (identifier, definition) {
      definition = definition || {};
      var collection = store$main$$default[identifier] = [];

      function Record (properties) {
        return _.extend(this, properties);
      }

      collection._Model = Record;

      _.extend(Record, { 
        _collection: collection,
        _identifier: identifier,
        _primaryKey: definition.primaryKey || 'id'
      });
      record$constructor$methods$$default(Record);

      _.extend(Record.prototype, {
        _primaryKey: Record._primaryKey,
        _store: store$main$$default
      });
      record$prototype$methods$$default(Record.prototype, definition);

      return Record;
    }

    var record$define$$default = record$define$$define;

    var main$$ks = {};
    main$$ks.defineResource = record$define$$default;

    this.ks = main$$ks;
}).call(this);

//# sourceMappingURL=ks.js.map
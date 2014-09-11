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

    function record$constructor$methods$$_all () {
      return this._collection;
    }

    function record$constructor$methods$$_add (record) {
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

    function record$constructor$methods$$_remove (record) {
      var collection = this.all();
      var index = collection.indexOf(record);

      return collection.splice(index, 1);
    }

    function record$constructor$methods$$_fetchAll () {
      return utils$xhr$$default({
        url: '/foo'
      });
    }

    function record$constructor$methods$$addConstructorMethods (Constuctor) {
      _.extend(Constuctor, {
        fetchAll: record$constructor$methods$$_fetchAll,
        all: record$constructor$methods$$_all,
        add: record$constructor$methods$$_add,
        remove: record$constructor$methods$$_remove
      });
    }

    var record$constructor$methods$$default = record$constructor$methods$$addConstructorMethods;
    var record$prototype$methods$$relMethods = {
      hasMany: record$prototype$methods$$hasMany
    };

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
    }

    var record$prototype$methods$$default = record$prototype$methods$$addPrototypeMethods;

    var main$$store = {};

    function main$$RecordBase (properties) {
      return _.extend(this, properties);
    }

    function main$$update (properties) {
      return _.extend(this, properties);
    }

    function main$$define (identifier, definition) {
      definition = definition || {};
      var collection = main$$store[identifier] = [];

      function Record (properties) {
        main$$RecordBase.call(this, properties);
      }

      collection._Model = Record;

      _.extend(Record, { 
        _collection: collection,
        _identifier: identifier,
        _primaryKey: definition.primaryKey || 'id'
      });
      record$constructor$methods$$default(Record);

      Record.prototype = Object.create(main$$RecordBase.prototype);

      _.extend(Record.prototype, {
        constructor: Record,
        _primaryKey: Record._primaryKey,
        _store: main$$store
      });
      record$prototype$methods$$default(Record.prototype, definition);

      return Record;
    }

    _.extend(main$$RecordBase, {
      define: main$$define
    });

    _.extend(main$$RecordBase.prototype, {
      update: main$$update 
    });

    this.RecordBase = main$$RecordBase;
}).call(this);

//# sourceMappingURL=ks.js.map
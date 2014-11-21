(function () {
  'use strict';

  var xhr = sinon.useFakeXMLHttpRequest();
  var contentType = { 
    "Content-Type": "application/json" 
  };
  var requests = [];

  xhr.onCreate = function (xhr) {
    requests.push(xhr);
  };

  describe('Record', function () {
    afterEach(function () {
      requests = [];
    });

    it('should be unique', function () {
      var store = ks.createStore();
      var Cat = store.defineResource('cats');
      var Dog = store.defineResource('dogs');

      expect(Cat).to.not.equal(Dog);
    });

    it('should have an identifier', function () {
      var store = ks.createStore();
      var Cat = store.defineResource('cats');

      expect(Cat.get('identifier')).to.equal('cats');
    });

    it('should have a collection array', function () {
      var store = ks.createStore();
      var Cat = store.defineResource('cats');

      expect(Cat.get('collection')).to.be.an.instanceof(Array);
    });

    describe('calling the constructor', function () {
      it('should return an instance', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats'); 
        var steve = new Cat({ name: 'Steve' });
        expect(steve instanceof Cat).to.equal(true);
      });

      it('should add it\'s instance to the store', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats'); 
        var steve = new Cat({ name: 'Steve' });
        expect(store.cats.length).to.equal(1);
      });
    });

    describe('#fetch', function () {
      it('should make a GET request', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        Cat.fetch();

        expect(requests.length).to.equal(1);
        expect(requests[0].method).to.equal('GET');
      });

      it('should return a promise', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        Cat.fetch();

        expect(Cat.fetch().then).to.be.an.instanceof(Function);
        expect(Cat.fetch().catch).to.be.an.instanceof(Function);
      });

      describe('the promise', function () {
        describe('#then', function () {
          it('should resolve with a response', function (done) {
            var store = ks.createStore();
            var Cat = store.defineResource('cats');

            Cat.fetch().then(function (res) {
              expect(res.cats[0].name).to.equal("Felix");
              requests = [];
              done();
            }).catch(done);

            requests[0].respond(200, contentType, '{ "cats": [{ "name": "Felix" }] }');
          });
        });
      });

      describe('when passed no params', function () {
        it('should make a make a request to a resource\'s collection url', function () {
          var store = ks.createStore();
          var Cat = store.defineResource('cats');
          Cat.fetch();

          expect(requests[0].url).to.equal('/cats');
        });

        it('should add items to the store', function (done) {
          var store = ks.createStore();
          var Cat = store.defineResource('cats');
          expect(Cat.all().length).to.equal(0);

          Cat.fetch().then(function () {
            expect(Cat.all().length).to.equal(2);
            done();
          }).catch(done);

          requests[0].respond(200, contentType, '{ "cats": [{ "name": "Felix" }, { "name": "Steve" }] }');
        });

        it('should update existing items in the store', function (done) {
          var store = ks.createStore();
          var Cat = store.defineResource('cats');
          var steve = new Cat({ id: 1, name: 'Steve' });
          var felix = new Cat({ id: 2, name: 'Felix' });
          expect(Cat.all().length).to.equal(2);

          Cat.fetch().then(function () {
            expect(Cat.all().length).to.equal(2);
            expect(felix.name).to.equal('Felix \'n Stuff');
            expect(steve.name).to.equal('Steve Catsons');
            done();
          }).catch(done);

          requests[0].respond(200, contentType, '{ "cats": [{ "id": 1, "name": "Steve Catsons" }, { "id": 2, "name": "Felix \'n Stuff" }] }');
        });
      });

      describe('when passed one integer param', function () {
        it('should make a make a request to a resource\'s collection url appending the int', function () {
          var store = ks.createStore();
          var Cat = store.defineResource('cats');
          Cat.fetch(1);

          expect(requests[0].url).to.equal('/cats/1');
        });
      });

      describe('the collection URL', function () {
        it('should contain the resource\'s identifier', function () {
          var store = ks.createStore();
          var Cat = store.defineResource('cats');
          Cat.fetch();

          var index = requests[0].url.indexOf('cats');
          expect(index).to.equal(1);
        });

        it('should be configurable via the baseURL property of the store', function () {
          var store = ks.createStore({ baseURL: '/api/v1/'});
          var Cat = store.defineResource('cats');
          Cat.fetch();

          expect(requests[0].url).to.equal('/api/v1/cats');
        });

        it('should be configurable via the baseURL property of the resource', function () {
          var store = ks.createStore();
          var Cat = store.defineResource('cats', { baseURL: '/api/v1/' });
          Cat.fetch();

          expect(requests[0].url).to.equal('/api/v1/cats');
        });
      });
    });

    describe('.save', function () {
      it('should make a request', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        var cat = new Cat({ name: 'Steve' });
        cat.save();
        expect(requests.length).to.equal(1);
      });

      it('should update the item in the store', function (done) {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        var cat = new Cat({ name: 'Steve' });

        expect(cat.id).to.equal(undefined);
        expect(cat.name).to.equal('Steve');

        cat.save().then(function (res) {
          expect(cat.id).to.equal(1);
          expect(cat.name).to.equal("Steve");
          done();
        }).catch(done);

        requests[0].respond(200, contentType, '{ "cats": { "id": 1, "name": "Steve" } }');
      });

      describe('when record doesn\'t have a primary key', function () {
        it('should make a POST request', function () {
          var store = ks.createStore();
          var Cat = store.defineResource('cats');
          var cat = new Cat({ name: 'Steve' });
          cat.save();
          expect(requests[0].method).to.equal('POST');
        });
      });

      describe('when record has a primary key', function () {
        it('should make a PUT request', function () {
          var store = ks.createStore();
          var Cat = store.defineResource('cats');
          var cat = new Cat({ name: 'Steve', id: 1 });
          cat.save();
          expect(requests[0].method).to.equal('PUT');
        });
      });
    });

    describe('.destroy', function () {
      it('should make a request', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        var cat = new Cat({ id: 1, name: 'Steve' });

        cat.destroy();

        expect(requests.length).to.equal(1);
      });

      it('should remove the item from the store', function (done) {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        var cat = new Cat({ id: 1, name: 'Stevey Boy' });
        expect(Cat.all().length).to.equal(1);
        cat.destroy().then(function () {
          expect(Cat.all().length).to.equal(0);
          done();
        }).catch(done);

        requests[0].respond(200, contentType, '{ "cats": 1 }');
      });
    });

    describe('#all', function () {
      it('should return the Record\'s collection array', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');

        expect(Cat.get('collection')).to.equal(Cat.all());
      });
    });

    describe('#add', function () {
      it('should add a record instance to the Record\'s collection array', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        Cat.add({ name: 'Cat Stevens' });

        expect(Cat.all()[0]).to.be.an.instanceof(Cat);
      });

      it('should not add duplicates', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        var cat = Cat.add({ name: 'Cat Stevens' });
        var cat2 = Cat.add(cat);

        expect(cat).to.equal(cat2);
        expect(Cat.all().length).to.equal(1);
      });
    });

    describe('#remove', function () {
      it('should remove a record instance from the Record\'s collection array', function () {
        var store = ks.createStore();
        var Cat = store.defineResource('cats');
        var cat = Cat.add({ name: 'Cat Stevens' });

        expect(Cat.all().length).to.equal(1);

        Cat.remove(cat);

        expect(Cat.all().length).to.equal(0);
      });
    });

    describe('relationships', function () {
      describe('#hasMany', function () {
        it('should return an array', function () {
          var store = ks.createStore();
          var Dog = store.defineResource('dogs');
          var Cat = store.defineResource('cats', {
            relationships: {
              dogs: {
                collection: 'dogs',
                foreignKey: 'cat_id',
                kind: 'hasMany'
              }
            }
          });
          var cat = new Cat({ name: 'Felix' });

          expect(cat.dogs).to.be.an.instanceof(Array);
        });

        it('should return an array containing Records', function () {
          var store = ks.createStore();

          var Cat = store.defineResource('cats', {
            relationships: {
              dogs: {
                collection: 'dogs',
                foreignKey: 'cat_id',
                kind: 'hasMany'
              }
            }
          });
          var cat = new Cat({ id: 1, name: 'Felix' });
          Cat.add(cat);

          var Dog = store.defineResource('dogs');
          var dog = new Dog({ name: 'Fido', cat_id: 1 });
          Dog.add(dog);

          expect(cat.dogs[0]).to.equal(dog);
        });

        describe('the returned array', function () {
          it('should have the correct _Model attribute', function () {
            var store = ks.createStore();
            var Cat = store.defineResource('cats', {
              relationships: {
                dogs: {
                  collection: 'dogs',
                  foreignKey: 'cat_id',
                  kind: 'hasMany'
                }
              }
            });
            var cat = new Cat({ id: 1, name: 'Felix' });
            Cat.add(cat);

            var Dog = store.defineResource('dogs');
            var dog = new Dog({ name: 'Fido', cat_id: 1 });
            Dog.add(dog);

            expect(cat.dogs._Model).to.equal(Dog);
          });
        });
      });
    });
  });
})();


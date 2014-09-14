(function () {
  'use strict';

  var xhr = sinon.useFakeXMLHttpRequest();
  var requests = [];

  xhr.onCreate = function (xhr) {
    requests.push(xhr);
  };

  describe('Record', function () {
    it('should be unique', function () {
      var Cat = ks.defineResource('cats');
      var Dog = ks.defineResource('dogs');

      expect(Cat).to.not.equal(Dog);
    });

    it('should have an identifier', function () {
      var Cat = ks.defineResource('cats');

      expect(Cat._identifier).to.equal('cats');
    });

    it('should have a collection array', function () {
      var Cat = ks.defineResource('cats');

      expect(Cat._collection).to.be.an.instanceof(Array);
    });

    describe('#fetchAll', function () {
      it('should make a request', function () {
        var Cat = ks.defineResource('cats');
        Cat.fetchAll();

        expect(requests.length).to.equal(1);

        requests = [];
      });

      it('should return a promise', function () {
        var Cat = ks.defineResource('cats');
        Cat.fetchAll();

        expect(Cat.fetchAll().then).to.be.an.instanceof(Function);
        expect(Cat.fetchAll().catch).to.be.an.instanceof(Function);

        requests = [];
      });

      it('should resolve to a server response', function (done) {
        var Cat = ks.defineResource('cats');

        Cat.fetchAll().then(function (res) {
          expect(res.cats[0].name).to.equal("Felix");
          requests = [];
          done();
        }).catch(done);

        requests[0].respond(
          200, 
          { "Content-Type": "application/json" },
          '{ "cats": [{ "name": "Felix" }] }'
          );
      });
    });

    describe('#all', function () {
      it('should return the Record\'s collection array', function () {
        var Cat = ks.defineResource('cats');

        expect(Cat._collection).to.equal(Cat.all());
      });
    });

    describe('#add', function () {
      it('should add a record instance to the Record\'s collection array', function () {
        var Cat = ks.defineResource('cats');
        Cat.add({ name: 'Cat Stevens' });

        expect(Cat.all()[0]).to.be.an.instanceof(Cat);
      });

      it('should not add duplicates', function () {
        var Cat = ks.defineResource('cats');
        var cat = Cat.add({ name: 'Cat Stevens' });
        var cat2 = Cat.add(cat);

        expect(cat).to.equal(cat2);
        expect(Cat.all().length).to.equal(1);
      });
    });

    describe('#remove', function () {
      it('should remove a record instance from the Record\'s collection array', function () {
        var Cat = ks.defineResource('cats');
        var cat = Cat.add({ name: 'Cat Stevens' });

        expect(Cat.all().length).to.equal(1);

        Cat.remove(cat);

        expect(Cat.all().length).to.equal(0);
      });
    });

    describe('relationships', function () {
      describe('#hasMany', function () {
        it('should return an array', function () {
          var Cat = ks.defineResource('cats', {
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
          var Cat = ks.defineResource('cats', {
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

          var Dog = ks.defineResource('dogs');
          var dog = new Dog({ name: 'Fido', cat_id: 1 });
          Dog.add(dog);

          expect(cat.dogs[0]).to.equal(dog);
        });

        describe('the returned array', function () {
          it('should have the correct _Model attribute', function () {
            var Cat = ks.defineResource('cats', {
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

            var Dog = ks.defineResource('dogs');
            var dog = new Dog({ name: 'Fido', cat_id: 1 });
            Dog.add(dog);

            expect(cat.dogs._Model).to.equal(Dog);
          });
        });
      });
    });
  });
})();


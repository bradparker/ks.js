(function () {
  'use strict';

  describe('ks', function () {
    describe('#createStore', function () {
      it('should return a Store instance', function () {
        
      });
    });

    describe('store', function () {
      it('should have a defineResource method', function () {
        var store = ks.createStore();
        expect(store.defineResource).to.be.an.instanceof(Function);
      });

      describe('#defineResource', function () {
        it('should return a Record constructor', function () {
          var store = ks.createStore();
          var Cat = store.defineResource('cats');
          var cat = new Cat({ name: 'Cat Stevens' });

          expect(Cat).to.be.an.instanceof(Function);
          expect(Cat.name).to.equal('Record');
          expect(cat).to.be.an.instanceof(Cat);
          expect(cat.constructor).to.equal(Cat);
          expect(cat.constructor.name).to.equal('Record');
        });
      });
    });
  });
})();

(function () {
  'use strict';

  describe('ks', function () {
    describe('#defineResource', function () {
      it('should return a Record constructor', function () {
        var Cat = ks.defineResource('cats');
        var cat = new Cat({ name: 'Cat Stevens' });

        expect(Cat).to.be.an.instanceof(Function);
        expect(Cat.name).to.equal('Record');
        expect(cat).to.be.an.instanceof(Cat);
        expect(cat.constructor).to.equal(Cat);
        expect(cat.constructor.name).to.equal('Record');
      });
    });
  });
})();

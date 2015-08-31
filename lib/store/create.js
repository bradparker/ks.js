import define from '../record/define';
import privatize from '../utils/privatize';

function defineResource (name, definition) {
  return define(this, name, definition);
}

function create (config) {
  config = config || {};

  function Store () {}

  privatize(Store.prototype, config);

  Store.prototype.defineResource = defineResource;

  return new Store();
}

export default create;

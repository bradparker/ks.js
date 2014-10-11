function privatize (obj, privates) {
  function get (prop) {
    return privates[prop];
  }

  obj.get = get;

  return obj;
}

export default privatize;

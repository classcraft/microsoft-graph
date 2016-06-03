var wrap = Meteor.wrapAsync || Meteor._wrapAsync;

wrapAsync = function(fn) {
  return function(/* arguments */) {
    var args = _.toArray(arguments);
    if (_.isFunction(args[args.length - 1])) {
      return fn.apply(this, args);
    } else {
      if (Meteor.isClient) {
        return Q.nfapply(_.bind(fn, this), args);
      } else {
        return wrap(fn).apply(this, args);
      }
    }
  }
}

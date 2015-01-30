module.exports = (function () {

  var _ = require('lodash');
  //subscription & query manager

  // {
  //   'query',
  //   'items',
  //   'clients'
  // }
  var Queries = {
    'category': []
  };

  var addSub = function (coll, query, client, items) {
    var qcoll = Queries[coll];
    var entry = _.find(qcoll, function (e) { return _.isEqual(e.query, query); });
    if(entry){
      entry.clients.push(client);
    }
    else {
      qcoll.push({
        'query': query,
        'items': _.map( items, '_id' ),
        'clients': [ client ]
      });
    }
    console.log(Queries.category);
  };

  var rmSub = function (coll, query, client) {
    var qcoll = Queries[coll];
    var entry = _.find(qcoll, function (e) { return _.isEqual(e.query, query); });
    if(entry){
      _.remove( entry.clients, function (e) { return _.isEqual(e.id, client.id); });
      if(entry.clients.length === 0){
        _.remove( qcoll, function (e) { return _.isEqual(e.query, query); });
      }
    }
  };

  var rmAllSubs = function (client) {
    _.forOwn(Queries, function (Query, id) {
      _.forEach(Query, function (entry) {
        _.remove(entry.clients, function (c) { return _.isEqual(c.id, client.id); });
        if(entry.clients.length === 0){
          _.remove(Query, function (e) { return _.isEqual(e.query, entry.query); });
        }
      });
    });
    console.log(Queries.category);
  };

  return {
    'addSub': addSub,
    'rmSub': rmSub,
    'rmAllSubs': rmAllSubs
  }
});

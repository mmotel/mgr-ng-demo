module.exports = (function () {

  var _ = require('lodash');
  var QueryManager = require('./queryManager.js')();
  //subscription & query manager

  // {
  //   'query',
  //   'items',
  //   'clients'
  // }
  var Queries = {
    'category': []
  };

  var addSub = function (coll, name, query, client, items) {
    var qcoll = Queries[coll];
    var entry = _.find(qcoll, function (e) { return _.isEqual(e.query, query); });
    if(entry){
      entry.clients.push({'client': client, 'name': name});
    }
    else {
      qcoll.push({
        'query': query,
        'items': _.map( items, function (e) { return e._id.toString() } ),
        'clients': [ {'client': client, 'name': name} ]
      });
    }
  };

  var rmSub = function (coll, query, client) {
    var qcoll = Queries[coll];
    var entry = _.find(qcoll, function (e) { return _.isEqual(e.query, query); });
    if(entry){
      _.remove(entry.clients, function (e) {
         return _.isEqual(e.client.id, client.id); });
      if(entry.clients.length === 0){
        _.remove(qcoll, function (e) { return _.isEqual(e.query, query); });
      }
    }
  };

  var rmAllSubs = function (client) {
    _.forOwn(Queries, function (Query, id) {
      _.forEach(Query, function (entry) {
        _.remove(entry.clients, function (c) { return _.isEqual(c.client.id, client.id); });
        if(entry.clients.length === 0){
          _.remove(Query, function (e) { return _.isEqual(e.query, entry.query); });
        }
      });
    });
  };

  var handleInsert = function (coll, item) {
    var qcoll = Queries[coll];
    _.forEach(qcoll, function (entry) {
      if( QueryManager.condition(entry.query, item) ){
        entry.items.push(item._id);
        _.forEach(entry.clients, function (c) {
          c.client.emit('inserted', {
            'coll': c.name,
            'item': item
          });
        });
      }
    });
  };

  var handleUpdate = function (coll, item, query) {
    var qcoll = Queries[coll];
    _.forEach(qcoll, function (entry) {
      if( _.find(entry.items, function (e) { return _.isEqual(e, item._id.toString()); }) ){
        _.forEach(entry.clients, function (c) {
          c.client.emit('updated', {
            'coll': c.name,
            'item': item,
            'query': query
          });
        });
      }
    });
  };

  var handleRemove = function (coll, item) {
    var qcoll = Queries[coll];
    _.forEach(qcoll, function (entry) {
      if( _.remove(entry.items, function (e) { return _.isEqual(e, item._id.toString()); }).length > 0 ){
        _.forEach(entry.clients, function (c) {
          c.client.emit('removed', {
            'coll': c.name,
            'item': item
          });
        });
      }
    });
  };

  return {
    'addSub': addSub,
    'rmSub': rmSub,
    'rmAllSubs': rmAllSubs,
    'handleInsert': handleInsert,
    'handleUpdate': handleUpdate,
    'handleRemove': handleRemove
  }
});

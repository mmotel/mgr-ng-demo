module.exports = (function () {

  var _ = require('lodash');
  var Query = require('./query.js')();
  //subscription & query manager

  // {
  //   'query',
  //   'items',
  //   'clients': {
  //      'client': { 'id' }
  //      'name'
  //    }
  // }
  var Queries = {
    'category': []
  };

  var Clients = {};

  var addSub = function (coll, name, query, client, items) {
    var id = client.id.toString();
    if(! Clients[id]){
      Clients[id] = client;
    }
    var qcoll = Queries[coll];
    var entry = _.find(qcoll, function (e) { return _.isEqual(e.query, query); });
    if(entry){
      entry.clients.push({'client': {'id': id}, 'name': name});
    }
    else {
      qcoll.push({
        'query': query,
        'items': _.map( items, function (e) { return e._id.toString() } ),
        'clients': [ {'client': {'id': id}, 'name': name} ]
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
    _.forOwn(Queries, function (query, id) {
      _.forEach(query, function (entry) {
        _.remove(entry.clients, function (c) { return _.isEqual(c.client.id, client.id); });
        if(entry.clients.length === 0){
          _.remove(query, function (e) { return _.isEqual(e.query, entry.query); });
        }
      });
    });
    delete Clients[client.id.toString()];
  };

  var handleInsert = function (coll, item) {
    var qcoll = Queries[coll];
    _.forEach(qcoll, function (entry) {
      if( Query.check(entry.query, item) ){
        entry.items.push(item._id);
        _.forEach(entry.clients, function (c) {
          Clients[c.client.id].emit('inserted', {
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
          Clients[c.client.id].emit('updated', {
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
          Clients[c.client.id].emit('removed', {
            'coll': c.name,
            'item': item
          });
        });
      }
    });
  };

  return {
    'add': addSub,
    'remove': rmSub,
    'removeAll': rmAllSubs,
    'handleInsert': handleInsert,
    'handleUpdate': handleUpdate,
    'handleRemove': handleRemove
  }
});

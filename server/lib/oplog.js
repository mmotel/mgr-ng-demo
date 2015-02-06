module.exports = function (io, MongoUrl, MongoOplogUrl) {

  var _ = require('lodash');
  //start oplogger
  var Oplogger = require('./oplogger/main.js');
  var DB = require('./data.js')(MongoUrl);
  var SubsManager = require('./oplogger/subsManager.js')();

  var Oplog = Oplogger.tail(MongoUrl, MongoOplogUrl,
              {'db': 'testdb', 'colls': [ 'category' ]});

  //oplogger callbacks
  Oplog.onInsert(function (item) {
    console.log(item);
    var res = {
      'coll': item.coll,
      'item': item.doc
    };
    SubsManager.handleInsert(res.coll, res.item);
  });

  Oplog.onUpdate(function (item) {
    console.log(item);
    var res = {
      'coll': item.coll,
      'query': item.modifier,
      'item': {
        '_id': item._id
      }
    };
    SubsManager.handleUpdate(res.coll, res.item, res.query);
  });

  Oplog.onRemove(function (item) {
    console.log(item);
    var res = {
      'coll': item.coll,
      'item': {
        '_id': item._id
      }
    };
    SubsManager.handleRemove(res.coll, res.item);
  });
  //--- /oplogger

  io.sockets.on('connection', function (client) {
    //oplog tailing: add subscription
    client.on('sub', function (args) {
      DB.find(args.coll, args.query, function (err, data) {
        if(err) { return console.log(err); }

        SubsManager.addSub(args.coll, args.name, args.query, client, data);

        var res = {
          'id': args.id,
          'coll': args.coll,
          'name': args.name,
          'query': args.query,
          'data': data
        };
        client.emit('sub', res);
      });
    });
    //oplog tailing: remove subscription
    client.on('rmSub', function (args) {
      SubsManager.rmSub(args.coll, args.query, client);
    });
    //oplog tailing: alter subscription
    client.on('alterSub', function (args) {
      SubsManager.rmSub(args.coll, args.oldQuery, client);

      DB.find(args.coll, args.newQuery, function (err, data) {
        if(err) { return console.log(err); }

        SubsManager.addSub(args.coll, args.name, args.newQuery, client, data);

        var res = {
          'id': args.id,
          'coll': args.coll,
          'name': args.name,
          'query': args.newQuery,
          'data': data
        };
        client.emit('sub', res);
      });
    });
    //oplog tailing: remove all subscriptions on disconnect
    client.on('disconnect', function () {
      SubsManager.rmAllSubs( client );
    });
  });

};

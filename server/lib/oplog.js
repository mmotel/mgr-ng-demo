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
    io.sockets.emit('inserted', res);
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
    io.sockets.emit('edited', res);
  });

  Oplog.onRemove(function (item) {
    console.log(item);
    var res = {
      'coll': item.coll,
      'item': {
        '_id': item._id
      }
    };
    io.sockets.emit('removed', res);
  });
  //--- /oplogger

  io.sockets.on('connection', function (client) {
    //oplog tailing: subscription
    client.on('sub', function (args) {
      DB.find(args.coll, args.query, function (err, data) {
        if(err) { return console.log(err); }

        SubsManager.addSub(args.coll, args.query, client, data);

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
    //--- /subscription
    client.on('disconnect', function () {
      SubsManager.rmAllSubs( client );
    });
  });

};

var socketio = require('socket.io');

exports.listen = function( server, Manager, MongoUrl, MongoOplogUrl ) {
  'use strict';
  var io = socketio.listen( server );

  //start oplog and connect via socket.io
  require('./lib/oplog.js')(io, MongoUrl, MongoOplogUrl);

  io.sockets.on('connection', function ( client ) {
    console.log('socket.io connected');
    console.log( client.id );
  });


};

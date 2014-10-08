'use strict';

/* Services */

var appServices = angular.module('appOplogServices', []);

appServices.
factory('OplogClient',
  [ '$rootScope', 'socket', 'OplogManager',
  function( $rootScope, socket, OplogManager ) {

    var queries = {};

    socket.on('sub', function ( args ) {
      if( !queries[ args.coll ] ) {
        queries[ args.coll ] = [];
      }
      queries[ args.coll ].push( args.query );
      console.log( queries[ args.coll ] );

      $rootScope[ args.coll ] = args.data;
      console.log( $rootScope[ args.coll ] );

    });

    socket.on('inserted', function ( args ) {
      console.log( args );
      OplogManager.insert( $rootScope[ args.coll ], args.item );
    });

    socket.on('edited', function ( args ) {
      console.log( args );
      OplogManager.update( $rootScope[ args.coll ], args.query, args.item );
    });

    socket.on('removed', function ( args ) {
      console.log( args );
      OplogManager.remove( $rootScope[ args.coll ], args.item );
    });

    return {
      'sub': function ( coll, query ) {
        $rootScope[ coll ] = [];
        socket.emit('sub', {
          'coll': coll,
          'query': query
        });
      }
    };
}]).
factory('OplogManager',
  [
  function () {

  var Insert = function ( coll, item ) {
    coll.push(item);
  };

  var Update = function ( coll, query, item ) {
    //query:
    // $set - DONE
    // $inc
    // $addToSet
    // $removeFromSet (?)
    // few most used $METHODs
    for(var i = 0; i < coll.length; i++){
      if( coll[i]._id === item._id ) {
        // coll[i] = item;

        for( var prop in query ) {
          if( query.hasOwnProperty(prop) ) {
            if( prop === "$set" ) {
              for( var field in query.$set ) {
                if( query.$set.hasOwnProperty(field) ) {
                  coll[i][field] = query.$set[field];
                }
              }
            }
          }
        }

        return true;
      }
    }
    return false;
  };

  var Remove =  function ( coll, item ) {
    for(var i = 0; i < coll.length; i++){
      if( coll[i]._id === item._id ) {
        coll.splice(i, 1);
        return true;
      }
    }
    return false;
  };
  var Find = function ( coll, query ) {
    var cond = function ( item ) {
      var cond = true;
      for( var prop in query ) {
        if( query.hasOwnProperty(prop) ) {
          if ( query[ prop ].$ne ){
            if( item[ prop ] === query[ prop ].$ne ) {
              cond = false;
            }
          }
          else if ( item[ prop ] !== query[ prop ] ) {
            cond = false;
          }
        }
      }
      return cond;
    }
    var res = [];
    for(var i = 0; i < coll.length; i++){
      if( cond( coll[i] ) ) {
        res.push(coll[i]);
      }
    }
    return res;
  };

  return {
    'insert': Insert,
    'update': Update,
    'remove': Remove,
    'find': Find
    };
}]);

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
      queries[ args.coll ].push( {'name': args.name, 'query': args.query} );
      console.log( queries[ args.coll ] );

      $rootScope[ args.name ] = args.data;
      console.log( $rootScope[ args.name ] );


    });

    var cond = function ( item, query ) {
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

    var ckeckQueryInsert = function ( args, callback ){
      for(var i=0; i < queries[ args.coll ].length; i++){
        var query = queries[ args.coll ][i];
        console.log(query);
        if( cond(args.item, query.query) ){
          callback( query.name );
        }
      }
    }

    var checkQuery = function ( args, callback ) {
      for(var i=0; i < queries[ args.coll ].length; i++){
        var query = queries[ args.coll ][i];
        console.log(query);
        var cond = false;
        console.log($rootScope[ query.name ]);
        for(var j=0; j < $rootScope[ query.name ].length; j++){
          var item = $rootScope[ query.name ][j];
          console.log(item);
          console.log(item._id.toString());
          console.log(args.item._id.toString());
          console.log((item._id.toString() === args.item._id.toString()));
          if(item._id.toString() === args.item._id.toString()){
            cond = true;
            break;
          }
        }
        if(cond){
          callback( query.name );
        }
      }
    }

    socket.on('inserted', function ( args ) {
      console.log( args );
      ckeckQueryInsert( args, function ( coll ) {
        OplogManager.insert( $rootScope[ coll ], args.item );
      });
    });

    socket.on('edited', function ( args ) {
      console.log( args );
      checkQuery( args, function ( coll ) {
        OplogManager.update( $rootScope[ coll ], args.query, args.item );
      });
    });

    socket.on('removed', function ( args ) {
      console.log( args );
      checkQuery( args, function ( coll ) {
        OplogManager.remove( $rootScope[ coll ], args.item );
      });
    });

    return {
      'sub': function ( coll, query, name ) {
        if(name){
          $rootScope[ name ] = [];
        }
        else{
          $rootScope[ coll ] = [];
        }

        socket.emit('sub', {
          'coll': coll,
          'query': query,
          'name': name || coll
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

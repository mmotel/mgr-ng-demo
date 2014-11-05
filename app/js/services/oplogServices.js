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

    //check if inserted object is valid for any query registered for collection
    //if it does call callback
    //callback parameter: collection name
    var ckeckQueryInsert = function ( args, callback ){
      for(var i=0; i < queries[ args.coll ].length; i++){
        var query = queries[ args.coll ][i];
        // console.log(query);
        if( OplogManager.condition(query.query, args.item) ){
          callback( query.name );
        }
      }
    }
    //check if item exists in collection
    //if it does call callback
    //callback parameters:
    //(1) collection name
    //(2) item index in collection (for optimalization)
    var checkQuery = function ( args, callback ) {
      for(var i=0; i < queries[ args.coll ].length; i++){
        var query = queries[ args.coll ][i];
        // console.log(query);
        var cond = false;
        var index;
        console.log($rootScope[ query.name ]);
        for(var j=0; j < $rootScope[ query.name ].length; j++){
          var item = $rootScope[ query.name ][j];
          if(item._id.toString() === args.item._id.toString()){
            cond = true;
            index  = j;
            break;
          }
        }
        if(cond){
          callback( query.name, index );
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
      checkQuery( args, function ( coll, index ) {
        OplogManager.update( $rootScope[ coll ], args.query, args.item, index );
      });
    });

    socket.on('removed', function ( args ) {
      console.log( args );
      checkQuery( args, function ( coll, index ) {
        OplogManager.remove( $rootScope[ coll ], args.item, index );
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

  //query:
  // $set - DONE
  // $inc
  // $addToSet
  // $removeFromSet (?)
  // few most used $METHODs
  var Modificator = function ( query, item ) {
    for( var prop in query ) {
      if( query.hasOwnProperty(prop) ) {
        //$SET
        if( prop === "$set" ) {
          for( var field in query.$set ) {
            if( query.$set.hasOwnProperty(field) ) {
              item[field] = query.$set[field];
            }
          }
        }
        //$INC
        else if( prop === "$inc" ) {
          for( var field in query.$inc ) {
            if( query.$inc.hasOwnProperty(field) ) {
              item[field] += query.$inc[field];
            }
          }
        }
      }
    }
  };

  var Update = function ( coll, query, item, index ) {
    if(!index){
      for(var i = 0; i < coll.length; i++){
        if( coll[i]._id === item._id ) {
          Modificator(query, coll[i]);
          return true;
        }
      }
      return false;
    }
    else {
      Modificator(query, coll[index]);
      return true;
    }
  };

  var Remove =  function ( coll, item, index ) {
    if(!index){
      for(var i = 0; i < coll.length; i++){
        if( coll[i]._id === item._id ) {
          coll.splice(i, 1);
          return true;
        }
      }
      return false;
    }
    else {
      coll.splice(index, 1);
      return true;
    }
  };

  var Condition = function ( query, item ) {
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
  };

  var Find = function ( coll, query ) {
    var res = [];
    for(var i = 0; i < coll.length; i++){
      if( Condition(query, coll[i]) ) {
        res.push(coll[i]);
      }
    }
    return res;
  };

  return {
    'insert': Insert,
    'update': Update,
    'remove': Remove,
    'find': Find,
    // 'modificator': Modificator,
    'condition': Condition
    };
}]);

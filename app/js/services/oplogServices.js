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

    socket.on('inserted', function ( args ) {
      console.log( args );
      OplogManager.insert( $rootScope[ args.coll ], args.item );
    });

    socket.on('updated', function ( args ) {
      console.log( args );
      OplogManager.update( $rootScope[ args.coll ], args.query, args.item );
    });

    socket.on('removed', function ( args ) {
      console.log( args );
      OplogManager.remove( $rootScope[ args.coll ], args.item );
    });

    return {
      'sub': function (coll, query, name) {
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
      },
      'rmSub': function (coll, name) {
        var query = undefined;
        var Name = name || coll;
        if(! queries[coll]){ return; }
        for(var i = 0; i < queries[coll].length; i++){
          if(queries[coll][i].name === name){
            query = queries[coll][i].query;
            delete queries[coll][i];
            break;
          }
        }

        delete $rootScope[ Name ];

        socket.emit('rmSub', {
          'coll': coll,
          'name': Name,
          'query': query
        });
      },
      'alterSub': function (coll, name, query) {
        var oldQuery = undefined;
        var Name = name || coll;
        if(! queries[coll]){ return; }
        for(var i = 0; i < queries[coll].length; i++){
          console.log(queries[coll][i]);
          if(queries[coll][i].name === name){
            oldQuery = queries[coll][i].query;
            queries[coll].splice(i,1);
            break;
          }
        }

        delete $rootScope[ Name ];

        socket.emit('alterSub', {
          'coll': coll,
          'name': Name,
          'oldQuery': oldQuery,
          'newQuery': query
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
  // $set - CHECK
  // $inc - CHECK
  // $addToSet - CHECK
  // $pull - CHECK
  // $unset - TO BE CHECKED
  var Modificator = function ( query, item ) {
    var fields;
    for( var prop in query ) {
      if( query.hasOwnProperty(prop) ) {
        //$SET
        if( prop === "$set" ) {
          for( var field in query.$set ) {
            if( query.$set.hasOwnProperty(field) ) {
              if( item.hasOwnProperty(field) ){
                item[field] = query.$set[field];
              }
              else if( /\w\.\d+/.test(field) ){
                fields = field.split(".");
                item[fields[0]][fields[1]] = query.$set[field];
              }
            }
          }
        }
        else if( prop === "$unset" ) {
          delete item[field];
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

  //MongoDB $Operators
  //Comparasion:
  //  equal, $ne, $in, $nin - CHECK
  //Logical:
  //  $and, $or - CHECK
  //  $not ?
  //Array:
  //  $all, $elemMatch - CHECK
  var $Operators = {
    //: - equal
    "$equal": function (itemField, queryField) {
      var cond = true;
      if(itemField !== queryField){
        cond = false;
      }
      return cond;
    },
    //$ne - not equal
    "$ne": function (itemField, queryField) {
      var cond = true;
      if( $Operators.equal(itemField, queryField) ){
        cond = false;
      }
      return cond;
    },
    //$in
    "$in": function (itemField, queryField) {
      var cond = false, i;
      for(i = 0; i < queryField.length; i++){
        if(itemField === queryField[i]){
          cond = true;
          break;
        }
      }
      return cond;
    },
    //$nin - not in
    "$nin": function (itemField, queryField) {
      var cond = true;
      if( $Operators.in(itemField, queryField) ){
        cond = false;
      }
      return cond;
    },
    //$and
    "$and": function (item, queryField) {
      var cond = true, i;
      for(i = 0; i < queryField.length; i++){
        if( !Condition( queryField[i], item ) ){
          cond = false;
          break;
        }
      }
      return cond;
    },
    //$or
    "$or": function (item, queryField) {
      var cond = false, i;
      for(i = 0; i < queryField.length; i++){
        if( Condition( queryField[i], item ) ){
          cond = true;
          break;
        }
      }
      return cond;
    },
    //$not ?
    //$all
    "$all": function (itemField, queryField) {
      var cond = true, i,j;
      for(i = 0; i < queryField.length; i++){
        j = itemField.indexOf(queryField[i]);
        if(j === -1){
          cond = false;
          break;
        }
      }
      return cond;
    },
    //$elemMatch
    "$elemMatch": function (itemField, queryField) {
      var cond = false, i;
      for(i = 0; i < itemField.length; i++){
        if( Condition( {'prop': queryField }, {'prop': itemField[i] } ) ){
          cond = true;
          break;
        }
      }
      return cond;
    }
  };

  //QUERY checking
  //Checks query for $Operators
  var Condition = function ( query, item ) {
    var cond = true, i, underCond;
    for( var prop in query ) {
      if( query.hasOwnProperty(prop) ) {
        //$ne
        if ( query[ prop ].$ne ){
          cond = $Operators.$ne(item[ prop ], query[ prop ].$ne );
        }
        //$in
        else if( query[ prop ].$in ) {
          cond = $Operators.$in(item[ prop ], query[ prop ].$in );
        }
        //$nin
        else if( query[ prop ].$nin ) {
          cond = $Operators.$nin(item[ prop ], query[ prop ].$nin );
        }
        //$and
        else if( prop === "$and" ) {
          cond = $Operators.$and(item, query[ prop ]);
        }
        //$or
        else if( prop === "$or" ) {
          cond = $Operators.$or(item, query[ prop ]);
        }
        //$all
        else if( query[ prop ].$all ) {
          cond = $Operators.$all(item[ prop ], query[ prop ].$all );
        }
        //$elemMatch
        else if( query[ prop ].$elemMatch ) {
          cond = $Operators.$elemMatch(item[ prop ], query[ prop ].$elemMatch );
        }
        //equal
        else {
          cond = $Operators.$equal(item[ prop ], query[ prop ] );
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

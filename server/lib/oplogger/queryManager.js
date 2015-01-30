module.exports = (function () {

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

  return {
    'condition': Condition
  }

});

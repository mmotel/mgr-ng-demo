module.exports = function ( mongourl ) {

  var DB = require( './lib/data.js' )( mongourl );

  var FindOneUser = function (query, callback) {
    DB.findOne( 'user', query, callback );
  }

  return {
    'findOneUser': FindOneUser 
  };

};

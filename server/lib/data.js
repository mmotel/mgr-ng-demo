module.exports = function ( mongourl ) {

  var mongo = require('mongodb');

  // var mongourl = 'mongodb://localhost:27017/testdb';

  //internal functions
  var InsertData = function (collName, data, callback){
    mongo.MongoClient.connect(mongourl, function(err,dbc) {
      if(err){
        // console.log("MongoDB disconnected with err!");
        // console.log(err);
        callback(err, undefined);
      }
      else{
        // console.log("MongoDB connected!");
        dbc.collection(collName, function(err, coll){
          if(err){
            // console.log("MongoDB disconnected with err!");
            // console.log(err);
            callback(err, undefined);
          }
          else{
            data.created_on = new Date();
            coll.insert(data, function(err, item){
              if(err){
                // console.log("MongoDB disconnected with err!");
                // console.log(err);
                callback(err, undefined);
              }
              else{
                // console.log("MongoDB disconnected!");
                callback(undefined, item[0]);
              }
            });
          }
        });
      }
    });
  };

  var RemoveData = function (collName, query, callback){
    mongo.MongoClient.connect(mongourl, function(err,dbc) {
      if(err){
        // console.log("MongoDB disconnected with err!");
        // console.log(err);
        callback(err, undefined);
      }
      else{
        // console.log("MongoDB connected!");
        dbc.collection(collName, function(err, coll){
          if(err){
            // console.log("MongoDB disconnected with err!");
            // console.log(err);
            callback(err, undefined);
          }
          else{
            coll.remove(query, function(err, result){
              if(err){
                // console.log("MongoDB disconnected with err!");
                // console.log(err);
                callback(err, undefined);
              }
              else{
                // console.log("MongoDB disconnected!");
                callback(undefined, result);
              }
            });
          }
        });
      }
    });
  };

  var UpdateData = function (collName, query, setter, callback){
    mongo.MongoClient.connect(mongourl, function(err,dbc) {
      if(err){
        // console.log("MongoDB disconnected with err!");
        console.log(err);
        callback(err, undefined);
      }
      else{
        console.log("MongoDB connected!");
        dbc.collection(collName, function(err, coll){
          if(err){
            // console.log("MongoDB disconnected with err!");
            // console.log(err);
            callback(err, undefined);
          }
          else{
            coll.update(query, setter /*{$set: data}*/, function(err, item){
              if(err){
                // console.log("MongoDB disconnected with err!");
                // console.log(err);
                callback(err, undefined);
              }
              else{
                callback(undefined, item);
                // console.log("MongoDB disconnected!");
              }
            });
          }
        });
      }
    });
  };

  var FindOneData = function (collName, query, callback){
    mongo.MongoClient.connect(mongourl, function(err,dbc) {
      if(err){
        // console.log("MongoDB disconnected with err!");
        // console.log(err);
        callback(err, undefined);
      }
      else{
        // console.log("MongoDB connected!");
        dbc.collection(collName, function(err, coll){
          if(err){
          // console.log("MongoDB disconnected with err!");
          // console.log(err);
          callback(err, undefined);
          }
          else{
            coll.findOne(query, function(err, item){
              if(err){
                // console.log("MongoDB disconnected with err!");
                // console.log(err);
                callback(err, undefined);
              }
              else{
                // console.log("MongoDB disconnected!");
                callback(undefined, item);
              }
            });
          }
        });
      }
    });
  };

  var FindData = function (collName, query, callback){
    mongo.MongoClient.connect(mongourl, function(err,dbc) {
      if(err){
        // console.log("MongoDB disconnected with err!");
        console.log(err);
        callback(err, undefined);
      }
      else{
        // console.log("MongoDB connected!");
        dbc.collection(collName, function(err, coll){
          if(err){
            // console.log("MongoDB disconnected with err!");
            // console.log(err);
            callback(err, undefined);
          }
          else{
            coll.find(query).toArray(function(err, item){
              if(err){
                // console.log("MongoDB disconnected with err!");
                // console.log(err);
                callback(err, undefined);
              }
              else{
                callback(undefined, item);
                // console.log("MongoDB disconnected!");
              }
            });
          }
        });
      }
    });
  };

  return{
    insert: InsertData,
    remove: RemoveData,
    update: UpdateData,
    findOne: FindOneData,
    find: FindData
  }

};

module.exports = function ( app, passport, Manager ) {
  //authentication API
  app.post('/api/login', passport.authenticate('local'),
    function(req, res) {
      res.send( req.user );
    });

  app.get('/api/verify',
    function (req, res) {
      if( req.isAuthenticated() ){
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf8' });
        res.end( JSON.stringify(
          { 'auth': true, 'login': req.user.login, 'id': req.user.id } ) );
      }
      else {
        console.log('isNotAuth');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf8' });
        res.end( JSON.stringify( { 'auth': false } ) );
      }
    });

  app.get('/api/logout',
    function(req, res) {
      req.logout();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf8' });
      res.end( JSON.stringify( { 'auth': false } ) );
    });
};

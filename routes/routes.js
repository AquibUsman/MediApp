// app/routes.js
var mysql = require('mysql')
require('rootpath')();
var dbconfig= require('.config/database')
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
          //  successRedirect : '/shop', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }),
        function(req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            if(req.body.username=='admin')
            res.redirect('/admin');
        else
            res.redirect('/shop');
        });
    
    //admin
    app.get('/admin',isLoggedIn, function(req, res) {
        res.render('admin.ejs',{ message: req.flash('signupMessage') }); // load the index.ejs file
    });
    
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    /*app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('index.ejs', { message: req.flash('signupMessage') });
    });*/

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/admin', // redirect to the secure profile section
        failureRedirect : '/admin', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });



    //addData
  /*  app.get('/add',isLoggedIn, function (req, res, next) {
        res.render('add', {
            title: "Add Item",
            user: req.user.username
        });
    });*/
    app.get('/additem',isLoggedIn, function(req, res, next) {
        res.render('add',{
            title: "Add Item",
            user: req.user.username
        });
    });

    app.post('/additem', function(req,res,next){
        var table=req.user.username;
        connection.connect(function (err) {
            if(err){
                console.log('err connecting');
                return;
            }
            else
                console.log('connection successful');

        });
        var name=req.body.name;
        var cat=req.body.category;
        var qry="insert into "+table+" values ('"+name+"','"+cat+"')";
        connection.query(qry,function(err){
            if(err){
                res.render("error");
            }
            else
            {console.log('insertion successful');
                res.render('additem');}
        });
    });


    //SEARCH
    app.get('/shop',isLoggedIn, function(req, res, next) {
        var table=req.user.username;
        var qry = "select * from "+table;
        connection.connect(function (err) {
            if(err){
                console.log('erro connecting');
                return;
            }
            else
                console.log('connection successful');

        });
        connection.query(qry,function(error,rows,fields){
            var row=[],i=0;
            for (var i=0; i < rows.length; i++) {
                var newElement = {};
                newElement['name'] = rows[i].name;
                newElement['category'] = rows[i].category;
                row.push(newElement);
            }
            res.render('shop',{data:row,user: req.user.username});

        });

    });


    app.post('/shop', function(req,res,next){
        var table=req.user.username;
        connection.connect(function (err) {
            if(err){
                console.log('err connecting');
                return;
            }
            else
                console.log('connection successful');

        });
        var name=req.body.name;
        var cat=req.body.category;
        if(req.body.f==1)
        {

            var qry="update "+table+" set name='"+name+"', category='"+cat+"' where name like '"+name+"' or category like '"+cat+"'";
            console.log(qry);
            connection.query(qry, function (err) {
                if (err) {
                    res.render("error");
                }
                else {
                    console.log('updation successful');
                    res.render('additem');
                }
            });
        }
        else {
            var qry = "delete from "+table+" where name like '" + name + "'";
            console.log(qry);
            connection.query(qry, function (err) {
                if (err) {
                    res.render("error");
                }
                else {
                    console.log('deletion successful');
                    res.render('additem');
                }
            });
        }
    });
    connection.close;

};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
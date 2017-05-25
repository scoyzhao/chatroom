"use strict";

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
// const flash = require('connect-flash');
// const session = require('express-session');

const app = express();
const server = require('http').Server(app);

// socket.io for chatroom
const chatroom = require('./model/chat.js');
chatroom.listen(server);

// set up handlebars view engine
const exphbs = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            // console.log(this._sections[name]);
            return null;
        }
    }
});

app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(flash());

// app.use(session({
//     secret: 'chatroom',
//     resave: true,
//     saveUninitialized: true,
//     cookie: { maxAge: 60000 }
// }));

// // set flash
// app.use((req, res, next) => {
//     res.locals.error = req.flash('error');
//     next();
// });

// routes
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/chatroom', (req, res) => {
    res.render('chatroom');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status,
        error: err.stack,
    });
});

server.listen(app.get('port'), () => {
    console.log(`\nExpress started on http://localhost:${app.get('port')}; press Ctrl-C to terminate.\n`);
});

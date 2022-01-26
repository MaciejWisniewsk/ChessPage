const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const https = require('https');
const fs = require('fs');
const client = require('./mqtt/connection')
require('dotenv').config();
require('./mqtt/subscriptions');
require('./mqtt/onMessage');

const userRoutes = require('./routes/users');
const roomsRoutes = require('./routes/rooms');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');

const dbConnDataMongo = {
    host: process.env.MONGO_HOST || '127.0.0.1',
    port: process.env.MONGO_PORT || 27017,
    database: process.env.MONGO_DATABASE || 'chess'
};

mongoose
    .connect(`mongodb://${dbConnDataMongo.host}:${dbConnDataMongo.port}/${dbConnDataMongo.database}`)
    .then(response => {
        console.log(`Connected to MongoDB. Database name: "${response.connections[0].name}"`)
    })
    .catch(error => console.error('Error connecting to MongoDB', error));

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'temporarysecretToBeUpdated!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning')
    next();
})


app.use('/', userRoutes);
app.use('/rooms', roomsRoutes);
app.use('/posts', postsRoutes);
app.use('/posts/:id/comments', commentsRoutes);

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { err.message = 'Oh No, Something Went Wrong!' }
    res.status(statusCode).render('error', { err })
})

const options = {
    key: fs.readFileSync(process.env.KEY_PATH),
    cert: fs.readFileSync(process.env.CERTIFICATE_PATH)
};

https.createServer(options, app).listen(3000, () => {
    console.log('Serving on port 3000')
})

client.on('connect', () => {
    console.log('Connnected to MQTT broker!')
});
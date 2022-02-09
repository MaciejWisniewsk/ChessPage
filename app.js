if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

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
const mongoSanitize = require('express-mongo-sanitize');
const User = require('./models/user');
const https = require('https');
const fs = require('fs');
const client = require('./mqtt/connection');
const helmet = require('helmet');
require('./mqtt/subscriptions');
require('./mqtt/onMessage');

const userRoutes = require('./routes/users');
const roomsRoutes = require('./routes/rooms');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');

const db_url = process.env.DB_URL;

const MongoDBStore = require('connect-mongo');
mongoose
    .connect(db_url)
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
app.use(mongoSanitize())

const store =  MongoDBStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 3600,
    crypto:{
        secret: process.env.SECRET
    }
})

store.on('error',e => {
    console.log('Session store error!',e)
})
const sessionConfig = {
    store,
    name: 'session',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net",
    'https://unpkg.com/mqtt/dist/mqtt.min.js',
    'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/',
    'https://unpkg.com/chess.js@0.12.0/'
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/'
];
const connectSrcUrls = [
    'ws:'
];
const fontSrcUrls = [
    "https://fonts.gstatic.com"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:"
            ],
            fontSrc: ["'self'",'data:', ...fontSrcUrls],
        },
    })
);
app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));

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
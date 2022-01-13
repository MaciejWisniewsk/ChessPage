const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { isLoggedIn } = require('../middleware')

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Chess Page!');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
})

router.patch('/changePassword', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    user.changePassword(oldPassword, newPassword, err => {
        if (err) {
            if (err.name === 'IncorrectPasswordError') {
                req.flash('error', 'Incorrect password!'); // Return error
            } else {
                req.flash('Something went wrong!')
            }
            return res.redirect('profile')
        }
        req.flash('success', 'Password changed successfully');
        res.redirect('profile')
    })
}))

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('users/profile')
})

router.get('/changePassword', isLoggedIn, (req, res) => {
    res.render('users/passwordChangeForm')
})

router.delete('/deleteAccount', isLoggedIn, catchAsync(async (req, res) => {
    await User.remove({ _id: req.user._id });
    req.flash('success', 'Account Deleted');
    req.logout();
    res.redirect('/')
}))
module.exports = router;
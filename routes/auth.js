const express = require('express');
const router = express.Router();
const template = require('../lib/template.js');
const shortid = require('shortid');
const db = require('../lib/db');
const bcrypt = require('bcrypt');

module.exports = function(passport) {
  router.get('/login', (request, response) => {
    var fmsg = request.flash();
    var feedback = '';
    if(fmsg.error) {
      feedback = fmsg.error[0];
    }
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <div style="color: red;">${feedback}</div>
      <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p>
          <input type="submit" value="login">
        </p>
      </form>
    `, '');
    response.send(html);
  });
  
  router.post('/login_process', passport.authenticate('local', 
  {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
    successFlash: true,
  }
  ));

  router.get('/register', (request, response) => {
    var fmsg = request.flash();
    var feedback = '';
    if(fmsg.error) {
      feedback = fmsg.error[0];
    }
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <div style="color: red;">${feedback}</div>
      <form action="/auth/register_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="password" name="pwd2" placeholder="password"></p>
        <p><input type="text" name="displayName" placeholder="display name"></p>
        <p>
          <input type="submit" value="register">
        </p>
      </form>
    `, '');
    response.send(html);
  });

  router.post('/register_process', (request, response) => {
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
    if(db.get('users').find({email: email}).value()) {
      request.flash('error', 'Your email is already registered! Please check your email.');
      response.redirect('/auth/register');
    } else {
      if(pwd != pwd2) {
        request.flash('error', 'Password must same!');
        response.redirect('/auth/register');
      } else {
        if(db.get('users').find({displayName: displayName}).value()) {
          request.flash('error', 'This nickname is already in use. Try another nickname.')
          response.redirect('/auth/register');
        } else {
          bcrypt.hash(pwd, 10, function(err, hash) {
            var user = {
              id: shortid.generate(),
              email: email,
              password: hash,
              displayName: displayName 
            };
            db.get('users').push(user).write();
            request.login(user, function(err) {
              return response.redirect('/');
            });
          });
        }
      }
    }
  });
  
  router.get('/logout', (request, response) => {
    request.logout();
    request.session.save(function() {
      response.redirect('/');
    })
  });
  return router;
}




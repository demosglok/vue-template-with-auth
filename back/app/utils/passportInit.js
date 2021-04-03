const configAuth = require('../config/auth');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GithubStrategy = require('passport-github').Strategy;
const LinkedinStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/userModel');



function createUserFromProfile(profile) {
  const user = new User();
  user.created_at = Date.now();
  const email = profile.email ? profile.email : ((profile.emails && profile.emails.length > 0) ? profile.emails[0] : null);
  user.email = (email instanceof Object && email.value) ? email.value : email.toString();
  user.display_name = profile.displayName || (user.email ? user.email.split('@')[0] : '');
  if(profile.name instanceof Object && profile.name.givenName) {
      user.name = `${profile.name.givenName} ${profile.name.familyName}`;
  }
  else if(profile.name instanceof String) {
      user.name = profile.name;
  } else if(profile.first_name || profile.last_name) {
      user.name = `${profile.first_name} ${profile.last_name}`;
  } else {
      user.name = user.display_name;
  }

  return user;
}

async function tryFindUser(req, profile) {
    let user = null;
    if (req.user && req.user.id) {
        user = await User.findById(req.user.id);
    }
    if(!user && profile.email) {
        user = await User.findOne({email: profile.email});
    }
    if (!user && profile.emails && profile.emails.length > 0) {
        user = await User.findOne({ email: profile.emails[0].value });
    }
    return user;
}
module.exports = () => {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  async function loginFBUser(req, token, refreshToken, profile, done) {
    try {
      let user = await User.findOne({ 'facebook.id': profile.id });
      if (user) return done(null, user);
      user = await tryFindUser(req, profile);
      if (user) return done(null, user);

      user = createUserFromProfile(profile);

      user.facebook = {id: profile.id, token, name: `${profile.name.givenName} ${profile.name.familyName}`};
      await user.save();
      done(null, user);
    } catch (e) {
      console.log('error storing fb user profile', e.message);
      done(new Error(e.message));
    }
    return null;
  }

  passport.use(new FacebookStrategy(
    {
      clientID: configAuth.facebookAuth.clientId,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL,
      profileFields: configAuth.facebookAuth.profileFields,
      passReqToCallback: true,
      enableProof: true
    },
    async (req, token, refreshToken, profile, done) => {
      await loginFBUser(req, token, refreshToken, profile, done)
        .catch((e) => {
        console.log('Facebook strategy error', e.message); // eslint-disable-line no-console
        });
    }
  ));

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientId,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback: true
  },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ 'google.id': profile.id });
        if (user) return done(null, user);
        user = await tryFindUser(req, profile);
        if (user) return done(null, user);

        user = createUserFromProfile(profile);

        user.google = {id: profile.id, token: accessToken, name: profile.name};

        await user.save();
        done(null, user);
      } catch (e) {
        console.log('error storing google user profile', e.message);
        done(new Error(e.message));
      }
      return null;
    }
  ));

  passport.use(new GithubStrategy({
    clientID: configAuth.googleAuth.clientId,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback: true
  },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ 'google.id': profile.id });
        if (user) return done(null, user);
        user = await tryFindUser(req, profile);
        if (user) return done(null, user);

        user = createUserFromProfile(profile);

        user.google = {id: profile.id, token: accessToken, name: profile.name};

        await user.save();
        done(null, user);
      } catch (e) {
        console.log('error storing google user profile', e.message);
        done(new Error(e.message));
      }
      return null;
    }
  ));

  passport.use(new LinkedinStrategy({
    clientID: configAuth.googleAuth.clientId,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback: true
  },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ 'google.id': profile.id });
        if (user) return done(null, user);
        user = await tryFindUser(req, profile);
        if (user) return done(null, user);

        user = createUserFromProfile(profile);

        user.google = {id: profile.id, token: accessToken, name: profile.name};

        await user.save();
        done(null, user);
      } catch (e) {
        console.log('error storing google user profile', e.message);
        done(new Error(e.message));
      }
      return null;
    }
  ));
};

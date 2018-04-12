/*
  Defining the github login strat
*/

import GitHubStrategy from 'passport-github';

export default new GitHubStrategy({
  clientID: '898aad25b1a94d30e872',
  clientSecret: 'fb3a42c147d61f0b5afbfe61dd14b5a00a6d871f',
  callbackURL: "https://3d5cbd5f.ngrok.io/auth/github/callback"
}, function (accessToken, refreshToken, profile, cb) {
  console.log(profile);
  cb(null, {});
  // User.findOrCreate({   facebookId: profile.id }, (err, user) => cb(err,
  // user));
})
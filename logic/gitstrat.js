/*
  Defining the github login strat
  Moved the client id and secret to new environment variables
*/

import GitHubStrategy from 'passport-github';
import models from '../models';
import githubAuth from '../models/githubAuth';

// setting up dotenv and pointing to the global variables
require('dotenv').config({path: 'variables.env'});

export default new GitHubStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: `${process.env.URL}/auth/github/callback`
}, async(accessToken, refreshToken, profile, cb) => {
  const {id, username, displayName} = profile; // get the id, username and displayname from the profile that we get when we run the github strategy
  const githubUsers = await models // checking if user with that id already exists in db
    .GitHubAuth
    .findAll({
      limit: 1,
      where: {
        github_id: id
      }
    })
  console.log(githubUsers);
  console.log(profile);

  if (!githubUsers.length) { // if user doesn't exist, we can just go ahead and create the user and add the user
    const user = await models
      .User
      .create({username});
    await models // we also add this user to the github_auth db
      .GitHubAuth
      .create({github_id: id, display_name: displayName, user_name: username, user_Id: user.id});
  }
  cb(null, {});
})
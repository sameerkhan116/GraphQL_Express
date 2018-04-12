import jwt from 'jsonwebtoken'; // for verify authentication header

import {refreshTokens} from '../logic/auth'; // logic for authentication

import models from '../models'; // the sequelize models that we have defined
import {SECRET} from '../index'; // secret that is required to decode the token

/* 
  This function first checks if there are any authentication headers (which are added when a user logs in).
  If there aren't, we just pass to the next middleware. Otherwise, we verify the x-token with the user. If
  success, we get the user, which is subsequently passed as context in index.js.
  If the authentication headers don't work, then we check the refresh-token in header, which is also added 
  when user logs in.
  Once we get the new tokens, we set them in the headers and return this newUser.
*/
const addUser = async(req, res, next) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      const {user} = jwt.verify(token, SECRET);
      req.user = user;
    } catch (err) {
      const refreshToken = req.headers['x-refresh-token'];
      const newTokens = await refreshTokens(token, refreshToken, models, SECRET);
      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token', 'x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  next();
}

export default addUser;
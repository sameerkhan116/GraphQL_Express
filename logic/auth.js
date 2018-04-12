import jwt from 'jsonwebtoken'; // for verification and signing of tokens
import _ from 'lodash'; // for some helper functions
import bcrypt from 'bcrypt';

/* 
  In this function, we create 2 tokens, a general x-token using user id and isAdmin status, and a refresh token
  using just the id.
  The token is updated every 20 minutes and the refresh token is updated every 7 days.
  These two values are then returned by the function.
*/
const createTokens = async(user, secret) => {
  const createToken = jwt.sign({
    user: _.pick(user, ['id', 'isAdmin'])
  }, secret, {expiresIn: '20m'});

  const createRefreshToken = jwt.sign({
    user: _.pick(user, 'id')
  }, secret, {expiresIn: '7d'});

  return Promise.all([createToken, createRefreshToken]);
};

/* 
  This function refreshes the token. We get the user id from the refresh token that is provided. If it is not 
  present that means no user was ever logged in and so we can just return null, otherwise, we find the user in 
  the database with the id as provided in the refresh token and then createTokens for this user.
*/
export const refreshTokens = async (token, refreshToken, models, SECRET) => {
  let userId = -1;
  try {
    const { user } = jwt.verify(refreshToken, SECRET);
    userId = user.id;
  } catch (err) { 
    return {}
  };

  const user = await models.User.findOne({ where: { id: userId }, raw: true });

  const [newToken, newRefreshToken] = await createTokens(user, SECRET);

  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user
  };
}

/* 
  Trylogin function is required in the mutation in resolver. Here, we first check if a user with the email provided
  exists. If he doesn't, we can just return an error saying this user doesn't exist. Else, we compare the password 
  to the password in the db. If it doesn't work, return invalid error, else return the token and refreshToken after
  running the createToken function.
*/
export const tryLogin = async(email, password, models, SECRET) => {
  const user = await models.User.findOne({
    where: {
      email
    }, raw: true});

  if (!user) 
    throw new Error('Invalid login');
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) 
    throw new Error('Invalid login');

  const [token, refreshToken] = await createTokens(user, SECRET);

  return { token, refreshToken };

}
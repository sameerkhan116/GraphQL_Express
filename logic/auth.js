import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcrypt';

const createTokens = async(user, secret) => {
  const createToken = jwt.sign({
    user: _.pick(user, ['id', 'isAdmin'])
  }, secret, {expiresIn: '20m'});

  const createRefreshToken = jwt.sign({
    user: _.pick(user, 'id')
  }, secret, {expiresIn: '7d'});

  return Promise.all([createToken, createRefreshToken]);
};

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
/*
  Here we define ways to resolve the queries as provided in schema.js
  All mutations, queries, subscriptions etc will always have obj, args, context and info provided to them.
*/

/* 
  bcrypt - required to hash passwords
  jwt - required to sign and verify tokens
  lodash required for some utitlity functions
  Pubsub - simple publisher subscriber implementation.
*/
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {PubSub} from 'graphql-subscriptions';

// Helper functions to check certain actions such as creating board which requires authentication
import {requiresAuth, requiresAdmin} from '../logic/permissions';
// This if for trying login and refreshing tokens if previous ones are out of date.
import {tryLogin, refreshTokens} from '../logic/auth';

// create a new instance of pubsub
export const pubsub = new PubSub();
const USER_ADDED = 'user_added';

export default {
  User : {
    /* 
      For resolving the boards parameter of the type User.
      we find the board in the Board table of the models passed in context where the board owner is the 
        id from the parent.
    */
    boards: ({id}, args, {models}, info) => 
      models.Board.findAll({
        where: {
          owner: id
        }
      }),

    /* 
      For resolving the suggestions parameter of the type User.
      we find the suggestion in the suggestion table of the models passed in context where the board 
        creator is the id from the parent.
    */
    suggestions: ({id}, args, {models}, info) => 
      models.Suggestion.findAll({
        where: {
          creatorId: id
        }
      })
  },

  Board : {
    /* 
      For finding all the suggestions for a given board. Here we use the suggestionLoader that we passed in
      context in server.js to cache the result. We get the id from the parent (board)
    */
    suggestions: ({id}, args, {suggestionLoader}, info) => 
      suggestionLoader.load(id)
  },

  Suggestion : {
    /* 
      For finding the creator of the suggestion. We find the id which corresponds to creator Id in suggestions.
    */
    creator: ({creatorId}, args, {models}, info) => 
      models.User.findOne({
        where: {
          id: creatorId
        }
      })
  },

  Query : {
    /* 
      to find all users in model.user
    */
    allUsers: (obj, args, {models}, info) => 
      models.User.findAll(),

    /* 
      to find current user. this check if id is same as user.id where user is passed in the context.
      The user passed in context is not null only when addUser works correctly.
    */
    me: (obj, args, {models, user}, info) => {
      return user ? models.User.findOne({
        where: {
          id: user.id
        }
      })
      : null;
    },

    /* 
      get the user where username matches the username in the db
    */
    getUser: (obj, {username}, {models}, info) => 
      models.User.findOne({
        where: {
          username
        }}),

    /* 
      Similar to above
    */
    userBoards: (obj, {owner}, {models}, info) => 
      models.Board.findAll({
        where: {
          owner
        }}),

    /*
      Same as above
    */
    userSuggestions: (obj, {creatorId}, {models}, info) => 
      models.Suggestion.findAll({
        where: {
          creatorId
        }})
  },

  Mutation : {
    /* 
      Deprecated: create user mutation
      We publish this user when they are created using pubsub so anyone subcsribed to this channel can get
      realtime updates.
    */
    createUser: async(obj, args, {models}, info) => {
      const user = args;
      user.password = 'idk'
      const userAdded = await(models.User.create(user));
      pubsub.publish(USER_ADDED, {
        userAdded
      });
      return userAdded;
    },

    /* 
      We get the username, password, isAdmin and email values from the arguments and create a hash for the password
      using bcrypt and pass to models.User.create to create a new user.
    */
    register: async(obj, args, {models}, info) => {
      const user = _.pick(args, ['username', 'isAdmin']);
      const localAuth = _.pick(args, ['email', 'password']);
      const passwordPromise = bcrypt.hash(localAuth.password, 12);
      const createUserPromise = models.User.create(user);
      const [password, createdUser] = await Promise.all([passwordPromise, createUserPromise]);
      localAuth.password = password;
      return models.LocalAuth.create({
        ...localAuth,
        user_id: createdUser.id
      })
    },

    /* 
      Check ~/logic/auth.js
    */
    login: async(obj, {email, password}, {models, SECRET}, info) => 
      tryLogin(email, password, models, SECRET),

    /* 
      Check ~/logic/auth.js
    */
    refreshTokens: (obj, { token, refreshToken }, { models, SECRET }, info) => 
      refreshTokens(token, refreshToken, models, SECRET),

    /* 
      Update username with new username, both of which are passed in args
    */
    updateUser: (obj, {username, newUsername}, {models}, info) => 
      models.User.update({
        username: newUsername
      }, {
        where: {
          username
        }}),

    /* 
      delete the user for which the args match the values in the database
    */
    deleteUser: (obj, args, {models}, info) => 
      models.User.destroy({where: args}),

    /* 
      Check if the current user is admin using helper function in ~/logic/permissions.js
    */
    createBoard: requiresAdmin.createResolver((obj, args, {models}, info) => 
      models.Board.create(args)),

    /* 
      Create a suggestion in the Suggestion db using the args passed
    */
    createSuggestion: (obj, args, {models}, info) => 
      models.Suggestion.create(args)
  },
  
  Subscription: {
    /* 
      use pubsub.asyncIterator to map the changes and give it the channel name where others can listen
    */
    userAdded: {
      subscribe: () => pubsub.asyncIterator(USER_ADDED)
    }
  }
}
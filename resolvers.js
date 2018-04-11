/*
  Here we define ways to resolve the queries as provided in schema.js
  All mutations, queries, subscriptions etc will always have obj, args, context and info provided to them.

  For query:
    • allUsers - from the models passed as context in index.js, findAll
    • getUser - from the models passed as context, findOne where username is the username provided in args.

    For Mutations:
      Similar approach. CRUD Methods can be found in sequelize documentation.
*/

import bcrypt from 'bcrypt';
import { createAsyncIterator } from 'iterall';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {PubSub} from 'graphql-subscriptions';
import {requiresAuth, requiresAdmin} from './permissions';

export const pubsub = new PubSub();

export default {
  User : {
    boards: ({id}, args, {models}, info) => 
      models.Board.findAll({
        where: {
          owner: id
        }
      }),

    suggestions: ({id}, args, {models}, info) => 
      models.Suggestion.findAll({
        where: {
          creatorId: id
        }
      })
  },

  Board : {
    suggestions: ({id}, args, {models}, info) => 
      models.Suggestion.findAll({
        where: {
          boardId: id
        }
      })
  },

  Suggestion : {
    creator: ({creatorId}, args, {models}, info) => 
      models.User.findOne({
        where: {
          id: creatorId
        }
      })
  },

  Query : {
    allUsers: (obj, args, {models}, info) => models.User.findAll(),

    me: (obj, args, {models, user}, info) => {
      return user ? models.User.findOne({
        where: {
          id: user.id
        }
      })
      : null;
    },

    getUser: (obj, {username}, {models}, info) => 
      models.User.findOne({
        where: {
          username
        }}),

    userBoards: (obj, {owner}, {models}, info) => 
      models.Board.findAll({
        where: {
          owner
        }}),

    userSuggestions: (obj, {creatorId}, {models}, info) => 
      models.Suggestion.findAll({
        where: {
          creatorId
        }})
  },

  Mutation : {
    createUser: async(obj, args, {models}, info) => {
      const user = args;
      user.password = 'idk'
      const userAdded = await(models.User.create(user));
      pubsub.publish(USER_ADDED, {
        userAdded
      })
      return userAdded;
    },

    register: async(obj, args, {models}, info) => {
      const user = args;
      user.password = await(bcrypt.hash(user.password, 12));
      return models.User.create(user);
    },

    login: async(obj, {email, password}, {models, SECRET}, info) => {
      const user = await models.User.findOne({
        where: {
          email
        }})

      if (!user) 
        throw new Error('No user with that email.');

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) 
        throw new Error('Incorrect password');

      const token = jwt.sign({
        user: _.pick(user, ['id', 'username', 'isAdmin'])
      }, 
        SECRET, 
      {
        expiresIn: '1y'
      })

      return token;
    },

    updateUser: (obj, {username, newUsername}, {models}, info) => 
      models.User.update({
        username: newUsername
      }, {
        where: {
          username
        }}),

    deleteUser: (obj, args, {models}, info) => 
      models.User.destroy({where: args}),

    createBoard: requiresAdmin.createResolver((obj, args, {models}, info) => 
      models.Board.create(args)),

    createSuggestion: (obj, args, {models}, info) => 
      models.Suggestion.create(args)
  },
  
  Subscription: {
    userAdded: {
      subscribe: () => pubsub.asyncIterator(USER_ADDED)
    }
  }
}
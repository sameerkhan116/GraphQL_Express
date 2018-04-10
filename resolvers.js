/*
  Here we define ways to resolve the queries as provided in schema.js
  All mutations, queries, subscriptions etc will always have obj, args, context and info provided to them.

  For query:
    • allUsers - from the models passed as context in index.js, findAll
    • getUser - from the models passed as context, findOne where username is the username provided in args.

    For Mutations:
      Similar approach. CRUD Methods can be found in sequelize documentation.
*/

export default {
  User : {
    boards: ({
      id
    }, args, {
      models
    }, info) => models
      .Board
      .findAll({
        where: {
          owner: id
        }
      }),
    suggestions: ({
      id
    }, args, {
      models
    }, info) => models
      .Suggestion
      .findAll({
        where: {
          creatorId: id
        }
      })
  },
  Board : {
    suggestions: ({
      id
    }, args, {
      models
    }, info) => models
      .Suggestion
      .findAll({
        where: {
          boardId: id
        }
      })
  },
  Suggestion : {
    creator: ({
      creatorId
    }, args, {
      models
    }, info) => models
      .User
      .findOne({
        where: {
          id: creatorId
        }
      })
  },
  Query : {
    allUsers: (obj, args, {
      models
    }, info) => models
      .User
      .findAll(),
    getUser: (obj, {
      username
    }, {
      models
    }, info) => models
      .User
      .findOne({where: {
          username
        }}),
    userBoards: (obj, {
      owner
    }, {
      models
    }, info) => models
      .Board
      .findAll({where: {
          owner
        }}),
    userSuggestions: (obj, {
      creatorId
    }, {
      models
    }, info) => models
      .Suggestion
      .findAll({where: {
          creatorId
        }})
  },

  Mutation : {
    createUser: (obj, args, {
      models
    }, info) => models
      .User
      .create(args),
    updateUser: (obj, {
      username,
      newUsername
    }, {
      models
    }, info) => models
      .User
      .update({
        username: newUsername
      }, {where: {
          username
        }}),
    deleteUser: (obj, args, {
      models
    }, info) => models
      .User
      .destroy({where: args}),
    createBoard: (obj, args, {
      models
    }, info) => models
      .Board
      .create(args),
    createSuggestion: (obj, args, {
      models
    }, info) => models
      .Suggestion
      .create(args)
  }
}
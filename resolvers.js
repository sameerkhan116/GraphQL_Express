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
      .destroy({where: args})
  }
}
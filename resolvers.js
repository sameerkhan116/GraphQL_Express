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
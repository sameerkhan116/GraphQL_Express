/*
  This is the User model defined using sequelize.define.
  To make  associations we use User.associate and provide it the type of association.
  Here we make 2 association both one to many, with board and suggestions.
*/

export default(sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    password: DataTypes.STRING
  });

  User.associate = models => {
    // 1 to many with board
    User.hasMany(models.Board, {foreignKey: 'owner'});
    // 1 to many with suggestions
    User.hasMany(models.Suggestion, {foreignKey: 'creatorId'});
  };

  return User;
};
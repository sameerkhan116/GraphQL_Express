/*
  This is the first type of user on our webpage. Since he is a local login, they only have an
  input email and password. We can then associate this user with our User model using a foreignKey user_Id.
*/

export default(sequelize, DataTypes) => {
  const LocalAuth = sequelize.define('local_auth', {
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING
  });

  LocalAuth.associate = models => {
    LocalAuth.belongsTo(models.User, {foreignKey: 'user_Id'});
  };

  return LocalAuth;
};
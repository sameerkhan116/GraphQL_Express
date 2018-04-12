/*
  This is for the second type of user on our webpage. This gets a github id, a display name and username
  from the profile when we use the passport gitstrat adn adds associates this user to the user model using
  the user_Id foreign key.
*/

export default(sequelize, DataTypes) => {
  const GitHubAuth = sequelize.define('github_auth', {
    github_id: {
      type: DataTypes.STRING,
      unique: true
    },
    display_name: DataTypes.STRING,
    user_name: {
      type: DataTypes.STRING,
      unique: true
    }
  });

  GitHubAuth.associate = models => {
    GitHubAuth.belongsTo(models.User, {foreignKey: 'user_Id'});
  };

  return GitHubAuth;
};
export default(sequelize, DataTypes) => {
  const Suggestion = sequelize.define('suggestions', {text: DataTypes.STRING});
  return Suggestion;
};
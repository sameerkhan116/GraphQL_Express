import Sequelize from 'sequelize';

// setting up the postgresql association for sequelize. We pass the db name,
// username the password as well as the host and dialect.
const sequelize = new Sequelize('test_graphql_db', 'root', 'abc123', {
  host: 'localhost',
  dialect: 'postgres'
});

// import the models as needed and add them to db.
const db = {
  User: sequelize.import ('./user'),
  Board: sequelize.import ('./board'),
  Suggestion: sequelize.import ('./suggestion')

}

// go over each key in the db as defined above and for each model defined, if it
// has an associate function, we associate this model with the db
Object
  .keys(db)
  .forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

// make the sequelize function available on db.sequelize which we need to sync
// the app when starting the server
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
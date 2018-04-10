# GraphQL Node.js

Creating a nodejs GraphQL server entirely from scratch using postgresql and sequelize for DB.
The server is setup using express and we create the GraphQL schema and resolvers from scratch.

### Steps for setting up a GraphQL server:

> index.js (server)

1.  Get express, bodyparser packages and { graphQLExpress, graphiqlExpress} from apollo as well as makeExecutableSchema from graphql tools.
2.  Make Schema which is a makeExecutable schema using ({typedefs and resolvers}). Typedefs is the schema that we define and resolvers are the methods for resolving queries/mutations in schema.
3.  Set up /graphql enpoint with bodyParser.json() and graphqlExpress({schema that we made in the last step and context is the models that we create using sequelize}).
4.  Set up the /graphiql enpoint with graphiqlExpress({ endpoint as /graphql })
5.  Models.sequelize.sync with force true(to automically drop tables if the same name exists) and this return a promise.
6.  When the promise resolves, start the server (app.listen)

> index.js (model)

1.  Creata variable which is a new Sequelize object. Pass it the name of the db, username, password and options. The options require the properties host and dialect (in this case localhost and postgres respectively). We also need to create a table with name and user with this username in PSQL who has all the priveleges on this table.
2.  In the db, pass the models that we create(import from ./{name}).
3.  For each key in the db, check if there are any associations and associate them if needed.
4.  Export this db.

#### Model is defined as follows:

1.  The model function takes 2 arguments - sequelize and datatypes.
2.  The model name is sequelize.define('table name' and username with its type (in this case STRING)).
3.  If any associations are needed, modelname.associate = models => type of association with this model(other model name and the foreign key).

/*
  Using the .babelrc and babel-preset-env packages, we are using ES7+.
  We also need to add a script: "babel-node index.js" to package.json to enable babel parsing
*/

/*
  express...
  bodyParser to parse req.body
  graphqlExpress and graphiql to setup the graphql server, available in apollo-server-express
  maxExecutableSchema from graphql tools for the schema.
  logger for logging http requests
  colors to add color to the console.
*/
import express from 'express';
import bodyParser from 'body-parser';
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express';
import {makeExecutableSchema} from 'graphql-tools';
import logger from 'morgan';
import colors from 'colors';
import jwt from 'jsonwebtoken';
import {createServer} from 'http';
import {execute, subscribe} from 'graphql';
import {SubscriptionServer} from 'subscriptions-transport-ws';

/*
  Typedefs defined in the schema which is required for makeexecutable schema
  Resolvers to resolve the schema as defined in ./schema. basically these are
  functions that give the output of the query we are running as defined in schema.
*/
import typeDefs from './schema';
import resolvers from './resolvers';

import models from './models'; // the sequelize models that we have defined

const app = express();
const PORT = 4000;
const schema = makeExecutableSchema({typeDefs, resolvers}); // pass the required typeDefs and resolvers to make executable schema
const SECRET = 'sameerkhan';

const addUser = async(req) => {
  const token = req.headers.authorization;
  try {
    const {user} = await jwt.verify(token, SECRET);
    req.user = user;
  } catch (err) {
    console.log(err);
  }
  req.next();
}

app.use(addUser);
// to log HTTP requests
app.use(logger('dev'));
// create the /graphql endpoint with bodyparser middleware and also
// graphQlExpress which requires the schema we created earlier and the models
// are passed as context
app.use('/graphql', bodyParser.json(), graphqlExpress(req => ({
  schema,
  context: {
    models,
    SECRET,
    user: req.user
  }
})));
// set up the graphiql endpoint for running graphiql
app.get('/graphiql', graphiqlExpress({endpointURL: '/graphql'})); // if you want GraphiQL enabled

const server = createServer(app);

/*
  Sync the db models with sequelize (force: true) means drop db if it exists
  This returns a promise. Once the promise value is returned, we start the server.
*/
models
  .sequelize
  .sync({})
  .then(() => server.listen(PORT, () => {
    new SubscriptionServer({
      execute,
      subscribe,
      schema
    }, {server, path: '/subscriptions'})
  }, (err) => err
    ? console.log(err)
    : console.log(`Running on http://localhost:${PORT}`.yellow.underline)));
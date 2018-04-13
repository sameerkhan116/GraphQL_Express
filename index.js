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
  createServer to create a server that listens on other ports (for subscriptions/socket.io)
  execute and subscribe are required for creating the new subscription server.
  SubscriptionServer for listening to graphql subscriptions - it takes first parameter with
    options execute, subscribe and schema and second attribute with options server and path
    to endpoint.
  Dataloader is required for caching data load requests.
  passport required for github login
  dotenv for setting up environment variables
*/
import express from 'express';
import bodyParser from 'body-parser';
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express';
import logger from 'morgan';
import {makeExecutableSchema} from 'graphql-tools';
import colors from 'colors';
import {createServer} from 'http';
import {execute, subscribe} from 'graphql';
import {SubscriptionServer} from 'subscriptions-transport-ws';
import DataLoader from 'dataloader';
import passport from 'passport';
import dotenv from 'dotenv';

/*
  Typedefs defined in the schema which is required for makeexecutable schema
  Resolvers to resolve the schema as defined in ./schema. basically these are
    functions that give the output of the query we are running as defined in schema.
*/
import typeDefs from './gql/schema';
import resolvers from './gql/resolvers';

import batchSuggestion from './logic/suggestionLoader'; // logic for caching queries
import addUser from './logic/addUser'; // authentication logic for checking if user is logged in
import gitstrat from './logic/gitstrat';

import models from './models'; // the sequelize models that we have defined

/*
  Using dotenv to set up environment variables by specifying the environment variables path
  We require the express function for running the server, the PORT on which the server will listen
  and a secret key which will be used for authentication, which are all defined here.
    We also need the schema setup which is created using makeexecutableschema that takes options
    typeDefs (the schema we defined with different types) and the resolvers on how to resolve the
    type and mutations etc in the schema
*/
dotenv.config({path: 'variables.env'});
const app = express();
const PORT = process.env.PORT;
const schema = makeExecutableSchema({typeDefs, resolvers}); // pass the required typeDefs and resolvers to make executable schema

export const SECRET = process.env.SECRET;

app.use(addUser); // addUser middleware that we defined which check proper authentication
app.use(logger('dev')); // to log HTTP requests

/*
create the /graphql endpoint with bodyparser middleware and also
graphQlExpress which requires the schema we created earlier.
In the context we pass the user which we add to req.user in the addUser middleware.
We also pass the models we defined using sequelize as well as the secret key that will be
required in the login mutations.
Finally we pass the suggestionLoader to cache queries for Suggestion DB.
*/
app.use('/graphql', bodyParser.json(), graphqlExpress(req => ({
  schema,
  context: {
    models,
    SECRET,
    user: req.user,
    suggestionLoader: new DataLoader(keys => batchSuggestion(keys, models))
  }
})));
// set up the graphiql endpoint for running graphiql
app.get('/graphiql', graphiqlExpress({endpointURL: '/graphql', subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`})); // if you want GraphiQL enabled

/*
  Setting up github authentication. First setup passport tp use gitstrat that we defined in another file.
  initialize passport and pass that as middleware to app
  specify the authentication urls and passport.authenticate('github') to authenticate user.
*/
passport.use(gitstrat);
app.use(passport.initialize());
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', {session: false}), (req, res) => {
  res.send('Authenticated');
})

const server = createServer(app); // creating an HTTP server

/*
  Before runnign the server, we sync the models that we created. This returns a promise.
  Then, we start the server with a new SubcriptionServer that takes execute, subscribe and the schema
  as params and also the server we crated above and the endpoint for subscriptions.
*/
models
  .sequelize
  .sync({})
  .then(() => server.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`.yellow.underline)
    new SubscriptionServer({
      execute,
      subscribe,
      schema
    }, {server, path: '/subscriptions'})
  }));
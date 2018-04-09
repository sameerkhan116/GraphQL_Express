import express from 'express';
import bodyParser from 'body-parser';
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express';
import {makeExecutableSchema} from 'graphql-tools';
import colors from 'colors';

import typeDefs from './schema';
import resolvers from './resolvers';
import models from './models';

const app = express();

const schema = makeExecutableSchema({typeDefs, resolvers})

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({schema, context: {
    models
  }}));
app.get('/graphiql', graphiqlExpress({endpointURL: '/graphql'})); // if you want GraphiQL enabled

models
  .sequelize
  .sync({force: true})
  .then(() => app.listen(4000, err => {
    if (err) 
      console.log(err);
    console.log('Running on http://localhost:4000'.yellow.underline)
  }));
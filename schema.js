/*
  Setting up the graphql schema.
  Define a type user which is same as the what we defined for the model.

  type Query for querying GraphQL db.
    • the allUsers query should return an array of users
    • the get user query should return the user with username provided as argument

  type Mutation for making changes in the db.
*/

export default `
  type User {
    id: ID!
    username: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    allUsers: [User]
    getUser(username: String!): User
  }

  type Mutation {
    createUser(username: String!): User
    updateUser(username: String!, newUsername: String!): [Int!]!
    deleteUser(username: String!): Int!
  }
`
/*
  Setting up the graphql schema.
  Define a type user which is same as the what we defined for the model.

  type Query for querying GraphQL db.
    • the allUsers query should return an array of users
    • the get user query should return the user with username provided as argument

  type Mutation for making changes in the db.
*/

export default `
  type Suggestion {
    id: ID!
    text: String!
    creator: User!
  }

  type Board {
    id : ID !
    name: String!
    suggestions: [Suggestion!]!
    owner: ID!
  }

  type User {
    id: ID!
    username: String!
    createdAt: String!
    updatedAt: String!
    boards: [Board!]!
    suggestions: [Suggestion!]!
  }

  type Query {
    allUsers: [User!]!
    getUser(username: String!): User
    userBoards(owner: String!): [Board!]!
    userSuggestions(creatorId: String!): [Suggestion!]!
  }

  type Mutation {
    createUser(username: String!): User
    updateUser(username: String!, newUsername: String!): [Int!]!
    deleteUser(username: String!): Int!
    createBoard(owner: ID!, name: String!): Board!
    createSuggestion(creatorId: ID!, text: String!, boardId: Int!): Suggestion!
  }
`
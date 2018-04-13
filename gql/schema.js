/*
  Setting up the graphql schema.
  Define a type user which is same as the what we defined for the model.

  type Query for querying GraphQL db.
    • the allUsers query should return an array of users
    • the get user query should return the user with username provided as argument

  type Mutation for making changes in the db.

  type Subscriptions for getting real time updates
*/

/* 
  Schema explanation:
  
  • AuthPayload: has a token which is a string and refresh token which is a string. Returned when user logs in or when tokens are refreshed.
  • Suggestion: based on the suggestion table we have in the DB. Returns an id, a text (suggestion) and the creator of type User.
  • Board: based on the board table in the db. Return the id, name, owner id and list of suggestions on the board.
  • User: has an id, username, email, value of when it was created and updated (as in dp), boards and suggestions

  • Query: 
    - allUsers which returns set of all users, 
    - me which return current user, 
    - getUser which gets a user based on the username provided in the args.
    - userBoards: which return the boards for the userid provided in args
    - userSuggestions: which return the suggestions for the creatorId provided in args
  
  • Mutation:
    - createUser with a username provided as args
    - updateUser with newUsername and currentusername provided in args
    - deleteUser for the user provded in args
    - createBoard for the owner id in args and the board the name.
    - createSuggestion for the creatorid provided in args with a boardId and the text for the suggestion.
    - register - takes values username, password, email and isAdmin and returns the User created
    - login - takes and email and password as input and return tokens set as headers.
    - refreshTokens take a token and refresh token and return another authPayload.

  • Subscription:
    - In progress

*/
export default `
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
  }

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
    email: String!
    createdAt: String!
    updatedAt: String!
    boards: [Board!]!
    suggestions: [Suggestion!]!
  }

  type Query {
    allUsers: [User!]!
    me: User
    getUser(username: String!): User
    userBoards(owner: Int!): [Board!]!
    userSuggestions(creatorId: Int!): [Suggestion!]!
  }

  type Mutation {
    createUser(username: String!): User!
    updateUser(username: String!, newUsername: String!): [Int!]!
    deleteUser(username: String!): Int!
    createBoard(owner: ID!, name: String!): Board!
    createSuggestion(creatorId: ID!, text: String!, boardId: Int!): Suggestion!
    register(username: String!, email: String!, password: String!, isAdmin: Boolean!): User!
    login(email: String!, password: String!): AuthPayload!
    refreshTokens(token: String!, refreshToken: String!): AuthPayload!
  }

  type Subscription {
    userAdded: User
    boardAdded: Board!
    suggestionAdded: Suggestion!
  }
`
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

const { getSubscribersData } = require("./contactsAdapter.js");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Subscriber {
    email: String
  }

  type Query {
    subscribers: [Subscriber]
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    subscribers: async () => {
      return await getSubscribersData();
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

app.use("/health", require("express-healthcheck")());

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);

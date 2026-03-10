import express from "express";
import cors from "cors";
import axios from "axios";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

async function startServer() {
  const app = express();

  app.use(cors());

  // 🔥 IMPORTANT: JSON parser BEFORE GraphQL middleware
  app.use(express.json());

  const typeDefs = `
  type User {
    id: Int
    name: String
    username: String
    email: String
  }

  type Todo {
    userId: Int
    id: Int
    title: String
    completed: Boolean
    user: User
  }

  type Query {
  todos: [Todo]
  todo(id: Int!): Todo
  todosByRange(min: Int!, max: Int!): [Todo]
}
`;
const resolvers = {
  Query: {
    // Get all todos
    todos: async () => {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/todos"
      );
      return response.data;
    },

    // Get single todo
    todo: async (_, args) => {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/todos/${args.id}`
      );
      return response.data;
    },

    // ✅ FIXED — now inside Query
    todosByRange: async (_, args) => {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/todos"
      );

      return response.data.filter(
        (todo) => todo.id >= args.min && todo.id <= args.max
      );
    },
  },

  // Nested resolver
  Todo: {
    user: async (parent) => {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/users/${parent.userId}`
      );
      return response.data;
    },
  },
};

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  app.listen(4000, () => {
    console.log("🚀 Server running at http://localhost:4000/graphql");
  });
}

startServer();

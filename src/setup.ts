import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { resolvers, typeDefs } from "./schema";
import { createConnection } from "./data-source";

export let app: ApolloServer;
async function setupServer() {
  const port = 4000;

  app = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      token: req.headers.authorization,
    }),
  });
  await app.listen(port);
  console.info(`Server executing on port ${port}`);
}

async function setupConnection() {
  console.log("Starting conect DB!");
  await createConnection();
  console.log("Conected...!");
}

export async function setup() {
  await setupConnection();
  await setupServer();
}

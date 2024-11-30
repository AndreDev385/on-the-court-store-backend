/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
import dotenv from 'dotenv';
dotenv.config({ path: './src/variables.env' });
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import app from './app';
import schema from './graphql/schema';

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string;
    }
  }
}

(async function main() {
  global.__rootdir__ = process.cwd() || __dirname;

  mongoose
    .connect(String(process.env.DATABASE), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      // dbName: 'test',
    })
    .then(() => {
      console.log(`🤩🍃 MongoDB is Running`);
    })
    .catch((err) => {
      console.log(`❌🤬 ${err}`);
      process.exit();
    });

  mongoose.connection.on('error', (err) => `❌🤬❌🤬 ${err}`);

  const PORT = Number(process.env.PORT);

  const server: ApolloServer = new ApolloServer({
    schema,
    introspection: true,
    context: ({ req, res }) => {
      if ((req?.body?.operationName ?? '') !== 'IntrospectionQuery') {
        console.log(
          `GraphQL: ${req?.body?.operationName ?? '-'} ${
            req.headers['content-length']
          }`
        );
      }
      return {
        req,
        res,
      };
    },
  });

  await server.start();

  server.applyMiddleware({
    app,
    cors: {
      credentials: true,
      origin: [
        '*',
        process.env.CLIENT_URL,
        process.env.DASHBOARD_URL,
        process.env.CLIENT_URL_WWW,
        process.env.DASHBOARD_URL_WWW,
      ],
    },
  });

  app.listen({ port: PORT }, () =>
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    )
  );
})();

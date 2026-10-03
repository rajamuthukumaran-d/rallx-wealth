import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const mongoUri = process.env.MONGODB_URI;
const mongoClient = mongoUri ? new MongoClient(mongoUri) : undefined;

app.use(express.json());
app.get("/health", (_request, response) => {
  response.json({ status: "ok", database: mongoClient ? "connected" : "not_configured" });
});

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "127.0.0.1";

if (mongoClient) {
  await mongoClient.connect();
  await mongoClient.db().command({ ping: 1 });
}

const server = app.listen(port, host, () => {
  console.log(`Rallx API listening at http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(async () => {
      try {
        await mongoClient?.close();
      } finally {
        process.exit(0);
      }
    });
  });
}

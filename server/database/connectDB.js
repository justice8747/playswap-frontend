import pkg from "pg";
import { createUserTable } from "./userTables.js";
import { createAccessTokenTable } from "./AccesTokenTable.js";
import { createTransferHistoryTable } from "./TransferTableHostory.js";
import { createSongMappingTable } from "./songMappingTable.js";
import { transferSessionsTable } from "./transferSessionsTable.js";
import { transferItemsTable } from "./transferItemsTable.js";
import { transferJobTable } from "./transferJobTable.js";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

const client = new Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_DATABASE || "playswap",
  password: process.env.DB_PASSWORD || "jussy8747",
  port: process.env.DB_PORT || 5432,
});

client.on("connect", async () => {
  console.log("Connected to the database, creating tables...");
  try {
    await client.query("SET client_encoding = 'UTF8'");
    createUserTable();
    createAccessTokenTable();
    createTransferHistoryTable();
    createSongMappingTable();
    transferSessionsTable();
    transferJobTable();
    transferItemsTable();
  } catch (err) {
    console.error("Failed to set client encoding:", err);
  }
});

export default client;

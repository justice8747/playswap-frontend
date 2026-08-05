import client from "./connectDB.js";

export const createTransferHistoryTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS TransferHistory (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      source_platform VARCHAR(50),
      target_platform VARCHAR(50),
      playlist_id TEXT,
      status VARCHAR(50)
    );
  `;

  try {
    await client.query(query);
  } catch (error) {
    console.error("Error creating Transfer table:", error);
  }
};

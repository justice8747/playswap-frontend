import client from "./connectDB.js";

export const transferSessionsTable = async () => {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS transfer_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        source_platform VARCHAR(50) NOT NULL,
        target_platform VARCHAR(50) NOT NULL,
        total_playlists INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'analyzing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

  try {
    await client.query(createTableQuery);
  } catch (error) {
    console.error("Error creating TransferSessions table:", error);
  }
};

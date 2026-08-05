import client from "./connectDB.js";

export const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users(
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        spotify_id TEXT UNIQUE,
        youtube_id TEXT UNIQUE,

        email VARCHAR(100) UNIQUE,
        password TEXT,

        is_google_user BOOLEAN DEFAULT FALSE,
        is_guest BOOLEAN DEFAULT TRUE
    );
  `;

  try {
    await client.query(query);
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

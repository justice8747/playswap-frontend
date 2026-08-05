import client from "./connectDB.js";

export const createAccessTokenTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS access_tokens (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        provider VARCHAR(50),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
    );
  `;

  try {
    await client.query(query);

  } catch (error) {
    console.error("Error creating access token table:", error);
  }
};

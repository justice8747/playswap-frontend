import client from "./connectDB.js";

export const transferJobTable = async () => {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS transfer_jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES transfer_sessions(id) ON DELETE CASCADE,
        
        source_playlist_id VARCHAR(255) NOT NULL, 
        source_playlist_name VARCHAR(255),       
        
        target_playlist_id VARCHAR(255),        
        
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  const createIndexQuery = `CREATE INDEX IF NOT EXISTS idx_jobs_session ON transfer_jobs(session_id);`;

  try {
    await client.query(createTableQuery);
    await client.query(createIndexQuery);
  } catch (error) {
    console.error("Error creating transfer_items table:", error);
  }
};

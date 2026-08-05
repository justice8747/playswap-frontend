import client from "./connectDB.js";

export const transferItemsTable = async () => {
  const createTableQuery = `
   CREATE TABLE IF NOT EXISTS transfer_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id UUID REFERENCES transfer_jobs(id) ON DELETE CASCADE,
        
        source_track_id VARCHAR(255) NOT NULL,
        source_metadata JSONB,
        
        target_track_id VARCHAR(255),
        target_metadata JSONB,
        
        status VARCHAR(50) DEFAULT 'pending',
        confidence_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
  `;

  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_transfer_items_session
    ON transfer_items(job_id);
  `;

  try {
    await client.query(createTableQuery);
    await client.query(createIndexQuery);
  } catch (error) {
    console.error("Error creating transfer_items table:", error);
  }
};

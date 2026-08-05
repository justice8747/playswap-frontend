import client from "./connectDB.js";

export const createSongMappingTable = async () => {
  // 1. Create the Table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS song_mappings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
   
      source_platform VARCHAR(50) NOT NULL,
      source_track_id VARCHAR(255) NOT NULL,

    
      destination_platform VARCHAR(50) NOT NULL,
      destination_track_id VARCHAR(255) NOT NULL,
      
     
      title VARCHAR(255),
      artist VARCHAR(255),
      
      
      confidence_score INTEGER DEFAULT 0,
     
      
     
      last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

     
      CONSTRAINT unique_mapping_pair UNIQUE (source_platform, source_track_id, destination_platform)
    );
  `;

  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_song_mappings_lookup 
    ON song_mappings(source_platform, source_track_id, destination_platform);
  `;

  try {
    await client.query(createTableQuery);
    await client.query(createIndexQuery);
  } catch (error) {
    console.error("Error creating SongMapping table:", error);
  }
};

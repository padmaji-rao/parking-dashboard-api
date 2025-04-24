const { MongoClient } = require('mongodb');

// Connection string for MongoDB - Using environment variable
const connection_string = process.env.MONGODB_URI || "mongodb+srv://padmajiraokandulapati:5lhgB6JPWNOzxvPB@cluster0.5edlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Cache connection for better performance in serverless environment
let cachedClient = null;

const connectToDatabase = async () => {
  // Reuse cached connection if available
  if (cachedClient) {
    return cachedClient;
  }

  try {
    console.log('Connecting to MongoDB...');
    
    const client = new MongoClient(connection_string, {
      tls: true, 
      tlsAllowInvalidCertificates: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
    });
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Cache the client for reuse
    cachedClient = client;
    
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectToDatabase };
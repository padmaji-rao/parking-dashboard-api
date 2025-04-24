const { MongoClient } = require('mongodb');

// Connection string for MongoDB - Using environment variable
const connection_string = process.env.MONGODB_URI || "mongodb+srv://padmajiraokandulapati:5lhgB6JPWNOzxvPB@cluster0.5edlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Cache connection for better performance in serverless environment
let cachedClient = null;

const connectToDatabase = async () => {
  // Reuse cached connection if available
  if (cachedClient) {
    console.log('Using cached database connection');
    return cachedClient;
  }

  try {
    console.log('Connecting to MongoDB...');
    
    // Validate that we have a connection string
    if (!connection_string) {
      throw new Error('MongoDB connection string is missing');
    }
    
    const client = new MongoClient(connection_string, {
      tls: true, 
      tlsAllowInvalidCertificates: true,
      connectTimeoutMS: 10000, // Reduce timeout to avoid function timeout
      socketTimeoutMS: 15000,   
      serverSelectionTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // Test connection
    const adminDb = client.db().admin();
    await adminDb.ping();
    console.log('MongoDB server is responsive');
    
    // Cache the client for reuse
    cachedClient = client;
    
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Log sanitized connection string for debugging
    const sanitizedConnectionString = connection_string 
      ? connection_string.replace(/(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1****$4')
      : 'Missing connection string';
    
    console.error(`Connection attempt failed with: ${sanitizedConnectionString}`);
    
    // Rethrow to be handled by the API route
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

module.exports = { connectToDatabase };

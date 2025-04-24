const { connectToDatabase } = require('./db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('API request received: /api/parking');
    
    // Return sample data for initial testing
    // This will help determine if the issue is with the MongoDB connection
    const sampleData = [
      { vehicleNumber: 'NA13NRU', entryTime: '09:30 AM', exitTime: '--', duration: '2h 30m', fee: 'Rs. 12.50', status: 'Active' },
      { vehicleNumber: 'MI15VSU', entryTime: '10:15 AM', exitTime: '11:45 AM', duration: '1h 30m', fee: 'Rs. 7.50', status: 'Completed' },
      { vehicleNumber: 'AP05AB1234', entryTime: '08:45 AM', exitTime: '--', duration: '3h 15m', fee: 'Rs. 15.00', status: 'Active' },
    ];
    
    return res.status(200).json({ data: sampleData, source: 'sample' });
    
    /* Temporarily comment out database logic for testing
    // Try to connect to the database
    const client = await connectToDatabase();
    const db = client.db("license_db");
    const collection = db.collection("detections");
    
    const parkingData = await collection.find({}).limit(10).toArray();
    console.log(`Found ${parkingData.length} parking records`);
    
    // Return the actual data
    return res.status(200).json({ 
      data: parkingData,
      count: parkingData.length,
      source: 'database'
    });
    */
  } catch (error) {
    console.error('Error in parking API:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

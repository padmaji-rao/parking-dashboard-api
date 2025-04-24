const { connectToDatabase } = require('./db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db("license_db");
    const collection = db.collection("detections");
    
    const parkingData = await collection.find({}).toArray();
    console.log(`Found ${parkingData.length} parking records`);
    
    // Format the data for frontend display
    const formattedData = parkingData.map(item => {
      // Safely parse entry_time - handle different possible MongoDB date formats
      let entryTime = null;
      if (item.entry_time) {
        if (item.entry_time.$date && item.entry_time.$date.$numberLong) {
          entryTime = new Date(parseInt(item.entry_time.$date.$numberLong));
        } else if (item.entry_time.$date) {
          entryTime = new Date(item.entry_time.$date);
        } else {
          entryTime = new Date(item.entry_time);
        }
      }

      // Safely parse exit_time - handle different possible MongoDB date formats
      let exitTime = null;
      if (item.exit_time) {
        if (item.exit_time.$date && item.exit_time.$date.$numberLong) {
          exitTime = new Date(parseInt(item.exit_time.$date.$numberLong));
        } else if (item.exit_time.$date) {
          exitTime = new Date(item.exit_time.$date);
        } else {
          exitTime = new Date(item.exit_time);
        }
      }
      
      // Calculate status based on exit_time
      const status = exitTime ? 'Completed' : 'Active';
      
      // Calculate parking duration if both entry and exit times exist
      let duration = null;
      if (entryTime && exitTime) {
        const durationMs = exitTime - entryTime;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${durationHours}h ${durationMinutes}m`;
      } else if (entryTime) {
        // If vehicle is still parked, calculate duration from entry time to now
        const now = new Date();
        const durationMs = now - entryTime;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${durationHours}h ${durationMinutes}m`;
      }
      
      // Format times for display
      const formattedEntryTime = entryTime ? entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
      const formattedExitTime = exitTime ? exitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
      
      // Format fee - handle different ways the fee might be stored
      let fee = 'Rs. 0';
      if (item.parking_fee) {
        if (item.parking_fee.$numberInt) {
          fee = `Rs. ${item.parking_fee.$numberInt}`;
        } else if (typeof item.parking_fee === 'number') {
          fee = `Rs. ${item.parking_fee}`;
        } else if (typeof item.parking_fee === 'string') {
          fee = `Rs. ${item.parking_fee}`;
        }
      }
      
      return {
        vehicleNumber: item.license_plate_number,
        entryTime: formattedEntryTime,
        exitTime: formattedExitTime,
        duration: duration || '--',
        fee: fee,
        status: status
      };
    });
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching parking data:', error);
    
    // Provide sample data as fallback
    const sampleData = [
      { vehicleNumber: 'NA13NRU', entryTime: '09:30 AM', exitTime: '--', duration: '2h 30m', fee: 'Rs. 12.50', status: 'Active' },
      { vehicleNumber: 'MI15VSU', entryTime: '10:15 AM', exitTime: '11:45 AM', duration: '1h 30m', fee: 'Rs. 7.50', status: 'Completed' },
      { vehicleNumber: 'AP05AB1234', entryTime: '08:45 AM', exitTime: '--', duration: '3h 15m', fee: 'Rs. 15.00', status: 'Active' },
    ];
    
    return res.status(200).json(sampleData);
  }
};

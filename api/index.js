module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    res.status(200).json({
      message: 'Parking Dashboard API',
      endpoints: [
        {
          path: '/api/parking',
          description: 'Get all parking data'
        },
        {
          path: '/api/stats',
          description: 'Get dashboard statistics'
        }
      ]
    });
  };

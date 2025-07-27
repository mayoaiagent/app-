const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic route
app.get('/', (req, res) => {
  res.send('🚀 Hello from your deployed Node.js app on Render!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
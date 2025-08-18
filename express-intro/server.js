import express from 'express';

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic GET route
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Basic POST route
app.post('/greet', (req, res) => {
  const { name } = req.body;
  res.send(`Hello, ${name || 'stranger'}!`);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

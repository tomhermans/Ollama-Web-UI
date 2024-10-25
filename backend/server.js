const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Set up streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3.2",
        stream: true,  // Enable streaming from Ollama
        messages: [{
          role: "user",
          content: message
        }]
      }),
    });

    // Stream the response
    for await (const chunk of response.body) {
      const text = new TextDecoder().decode(chunk);
      try {
        const json = JSON.parse(text);
        if (json.message?.content) {
          res.write(`data: ${JSON.stringify({ content: json.message.content })}\n\n`);
        }
      } catch (e) {
        console.error('Error parsing chunk:', e);
      }
    }
    
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to communicate with Ollama' });
  }
});

// Add a test endpoint that the frontend checks
app.get('/api/test', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

const PORT = 3001;  // Changed to 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test if Ollama is reachable...`);
  
  fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama3.2",
      messages: [{
        role: "user",
        content: "test"
      }]
    }),
  })
  .then(response => {
    if (response.ok) {
      console.log('Successfully connected to Ollama');
    } else {
      console.error('Could not connect to Ollama:', response.status);
    }
  })
  .catch(error => {
    console.error('Error connecting to Ollama:', error.message);
  });
});
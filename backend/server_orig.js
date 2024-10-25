const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received message:', message);
    
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3.2",
        stream: false,
        messages: [{
          role: "user",
          content: message
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      throw new Error(`Ollama API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Ollama response:', data);

    if (!data.message) {
      throw new Error('Unexpected response format from Ollama');
    }

    res.json({ response: data.message.content });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with Ollama',
      details: error.message 
    });
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
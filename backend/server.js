const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body; // Now accepting history
    console.log('Received message:', message);
    
    // Format the conversation history for Ollama
    const messages = [
      // Convert previous messages to Ollama format
      ...(history || []).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      // Add the new message
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3.2",
        stream: true,
        messages: messages // Send full conversation history
      }),
    });

    // Rest of your streaming code remains the same
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with Ollama',
      details: error.message 
    });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
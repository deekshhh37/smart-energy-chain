import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.post('/functions/v1/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Simple mock response for energy assistant
    const lastMessage = messages[messages.length - 1];
    let response = '';

    if (lastMessage.content.toLowerCase().includes('bill')) {
      response = 'To reduce your energy bill, try using energy-efficient appliances, unplugging devices when not in use, and taking advantage of off-peak hours for high-energy activities.';
    } else if (lastMessage.content.toLowerCase().includes('peak')) {
      response = 'Your peak usage is typically between 6-8 PM. Consider shifting high-energy activities like laundry or cooking to off-peak hours (10 AM - 6 PM) to save on costs.';
    } else if (lastMessage.content.toLowerCase().includes('co2') || lastMessage.content.toLowerCase().includes('saving')) {
      response = 'You\'re currently saving about 17.2 kg of CO₂ per day through solar energy. That\'s equivalent to planting 2 trees per month!';
    } else {
      response = 'I\'m your Energy Assistant! I can help you understand your energy consumption patterns, provide tips to save energy, and explain your solar/grid usage. What would you like to know?';
    }

    // Simulate streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send the response in chunks to simulate streaming
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = words.slice(0, i + 1).join(' ');
      const data = JSON.stringify({
        choices: [{ delta: { content: i === 0 ? chunk : ' ' + words[i] } }]
      });
      res.write(`data: ${data}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 54321;
app.listen(PORT, () => {
  console.log(`Mock chat server running on http://localhost:${PORT}`);
  console.log('Chat endpoint: http://localhost:54321/functions/v1/chat');
});
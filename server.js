const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

class WorkfromServer {
  constructor() {
    this.app = express();
    this.initialPort = process.env.PORT || 3001;
    this.maxPortRetries = 10;
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.post('/api/analyze-workspaces', async (req, res) => {
      try {
        const { places } = req.body;
        
        if (!Array.isArray(places) || places.length === 0) {
          return res.status(400).json({ 
            message: 'Please provide places to analyze'
          });
        }

        const prompt = `Hey there! I'm a local remote worker who knows these spots inside and out. 
        Let me help you find the perfect workspace that'll feel like your second home office.

        I've checked out these places recently:
        ${places.map((place, index) => `
        ${place.name}:
        - ${place.distance} miles away
        - Internet: ${place.wifi}
        - Noise level: ${place.noise}
        - Power outlets: ${place.power}
        - Type: ${place.type}
        - Overall score: ${place.workabilityScore}/100
        - The extras: ${Object.entries(place.amenities)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(', ')}
        `).join('\n')}

        Please provide your response in JSON format. The response should be a valid JSON object with the following structure:
        {
          "recommendation": {
            "name": "The spot you'd recommend to a friend",
            "personalNote": "Share what it's really like working here - the vibe, the regulars, the hidden perks (2-3 conversational sentences)",
            "standoutFeatures": [
              {
                "category": "wifi/power/quiet/amenities",
                "title": "What makes this feature special",
                "description": "The real deal about this feature, like you're telling a friend"
              }
            ],
            "finalNote": "A friendly wrap-up that helps them feel confident about trying this place"
          }
        }

        Keep your content conversational - like you're chatting with a fellow remote worker over coffee, but make sure to maintain valid JSON formatting. Share those little details that only regulars would know, and focus on what actually matters when you're trying to get work done. If you notice any unique patterns or special features from the data (like unusually fast wifi or super quiet spots), definitely point those out!`;

        const completion = await this.openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          messages: [
            {
              role: "system",
              content: "You're a friendly local remote worker who's spent countless hours working from these spaces. Your task is to provide recommendations in JSON format. Your response must be a valid JSON object that matches the specified structure. Keep the content authentic and personal while maintaining proper JSON syntax."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        res.json({
          insights: analysis
        });

      } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
          message: 'Failed to analyze workspaces',
          detail: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
      }
    });

    this.app.get('/api/health', (_, res) => {
      res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        openaiKeyConfigured: !!process.env.OPENAI_API_KEY,
        port: this.currentPort
      });
    });
  }

  async findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
      const server = require('http').createServer();
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          server.close();
          resolve(this.findAvailablePort(startPort + 1));
        } else {
          reject(err);
        }
      });

      server.on('listening', () => {
        const port = server.address().port;
        server.close();
        resolve(port);
      });

      server.listen(startPort);
    });
  }

  async start() {
    try {
      let currentPort = this.initialPort;
      let attempts = 0;

      while (attempts < this.maxPortRetries) {
        try {
          const availablePort = await this.findAvailablePort(currentPort);
          this.currentPort = availablePort;
          
          this.app.listen(this.currentPort, () => {
            console.log(`Server running on port ${this.currentPort}`);
            if (this.currentPort !== this.initialPort) {
              console.log(`Note: Original port ${this.initialPort} was in use, switched to ${this.currentPort}`);
            }
          });
          
          return;
        } catch (err) {
          attempts++;
          currentPort++;
        }
      }
      
      throw new Error(`Unable to find an available port after ${this.maxPortRetries} attempts`);
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start the server
const server = new WorkfromServer();
server.start();
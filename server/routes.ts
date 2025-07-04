import type { Express } from "express";
import { createServer, type Server } from "http";
import { aiServices } from "./ai-services";
import express from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // POST /analyze - Analyze founder update text and suggest content type
  app.post("/api/analyze", async (req, res) => {
    try {
      const { update_text } = req.body;
      
      if (!update_text || typeof update_text !== 'string') {
        return res.status(400).json({ 
          error: "Missing or invalid update_text field" 
        });
      }

      const suggestion = await aiServices.analyzeUpdateText(update_text);
      
      res.json(suggestion);
    } catch (error) {
      console.error('Error in /analyze:', error);
      res.status(500).json({ 
        error: "Failed to analyze update text" 
      });
    }
  });

  // POST /generate - Generate content based on user choice
  app.post("/api/generate", async (req, res) => {
    try {
      const { update_text, content_choice, selected_model } = req.body;
      
      if (!update_text || typeof update_text !== 'string') {
        return res.status(400).json({ 
          error: "Missing or invalid update_text field" 
        });
      }

      if (!content_choice || !['image', 'video'].includes(content_choice)) {
        return res.status(400).json({ 
          error: "content_choice must be 'image' or 'video'" 
        });
      }

      const content = await aiServices.generateContent(update_text, content_choice, selected_model);
      
      res.json(content);
    } catch (error) {
      console.error('Error in /generate:', error);
      res.status(500).json({ 
        error: "Failed to generate content" 
      });
    }
  });

  // GET /models - Get available models and recommendations
  app.get("/api/models", async (req, res) => {
    try {
      const { modelSelector } = await import("./model-selector");
      const availableModels = modelSelector.getAvailableModels();
      
      res.json({
        available_models: availableModels,
        providers: {
          xai: !!process.env.XAI_API_KEY,
          gemini: !!process.env.GEMINI_API_KEY,
          openai: !!process.env.OPENAI_API_KEY,
          anthropic: !!process.env.ANTHROPIC_API_KEY,
          runway: !!process.env.RUNWAY_API_KEY,
          tavus: !!process.env.TAVUS_API_KEY,
          creatomate: !!process.env.CREATOMATE_API_KEY
        }
      });
    } catch (error) {
      console.error('Error getting models:', error);
      res.status(500).json({ error: "Failed to get available models" });
    }
  });

  // POST /recommend - Get model recommendations for a task
  app.post("/api/recommend", async (req, res) => {
    try {
      const { task_description } = req.body;
      
      if (!task_description || typeof task_description !== 'string') {
        return res.status(400).json({ 
          error: "Missing or invalid task_description field" 
        });
      }

      const { modelSelector } = await import("./model-selector");
      const task = await modelSelector.analyzeTask(task_description);
      const recommendations = await modelSelector.getMultipleOptions(task, 3);
      
      res.json({
        task_analysis: task,
        recommendations: recommendations
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ 
        error: "Failed to get model recommendations" 
      });
    }
  });

  // GET /health - Simple health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      services: {
        gemini: !!process.env.GEMINI_API_KEY,
        xai: !!process.env.XAI_API_KEY
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

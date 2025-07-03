import { GoogleGenAI, Modality } from "@google/genai";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

// Initialize AI clients
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || "" 
});

export interface ContentSuggestion {
  suggestion: 'image' | 'video';
  reasoning: string;
}

export interface GeneratedContent {
  blog_text: string;
  linkedin_text: string;
  image_url?: string;
  video_url?: string;
}

export class AIServices {
  
  async analyzeUpdateText(updateText: string): Promise<ContentSuggestion> {
    try {
      const response = await xai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: `You are an expert content strategist. Analyze founder update text and suggest whether an image or video would best represent the content.

Consider:
- If the update contains data, metrics, or comparisons → suggest 'image' for infographics
- If the update describes processes, workflows, or storytelling → suggest 'video' for explainers
- If the update is about milestones, achievements, or announcements → suggest 'image' for visual impact

Respond with JSON in this format:
{
  "suggestion": "image" or "video",
  "reasoning": "Brief explanation of why this format works best"
}`
          },
          {
            role: "user",
            content: updateText
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        suggestion: result.suggestion,
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error('Error analyzing update text:', error);
      throw new Error('Failed to analyze update text');
    }
  }

  async generateBlogText(updateText: string): Promise<string> {
    try {
      const response = await xai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: `You are a skilled content writer. Transform founder updates into engaging blog posts.

Guidelines:
- Professional yet conversational tone
- Include relevant context and background
- Structure with clear sections
- 300-500 words
- Focus on insights and implications
- End with a forward-looking statement`
          },
          {
            role: "user",
            content: `Transform this founder update into a blog post: ${updateText}`
          }
        ]
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating blog text:', error);
      throw new Error('Failed to generate blog text');
    }
  }

  async generateLinkedInText(updateText: string): Promise<string> {
    try {
      const response = await xai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: `You are a social media expert. Transform founder updates into engaging LinkedIn posts.

Guidelines:
- Casual, authentic tone
- 150-250 words maximum
- Include relevant hashtags
- Start with a hook
- Include a call-to-action or question
- Use emojis sparingly but effectively`
          },
          {
            role: "user",
            content: `Transform this founder update into a LinkedIn post: ${updateText}`
          }
        ]
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating LinkedIn text:', error);
      throw new Error('Failed to generate LinkedIn text');
    }
  }

  async generateInfographicImage(updateText: string): Promise<string> {
    try {
      const prompt = `Create a clean, professional infographic-style image based on this founder update: ${updateText}

Style requirements:
- Modern, minimalist design
- Professional color palette (blues, whites, grays)
- Clear typography and visual hierarchy
- Include key metrics, data points, or concepts
- Suitable for business/startup context
- High contrast for readability`;

      const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No image generated');
      }

      const content = candidates[0].content;
      if (!content || !content.parts) {
        throw new Error('No content parts found');
      }

      for (const part of content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          // Generate unique filename
          const filename = `infographic_${Date.now()}.png`;
          const filepath = path.join(uploadsDir, filename);
          
          // Save image
          const imageData = Buffer.from(part.inlineData.data, "base64");
          fs.writeFileSync(filepath, imageData);
          
          // Return URL path
          return `/uploads/${filename}`;
        }
      }

      throw new Error('No image data found in response');
    } catch (error) {
      console.error('Error generating infographic:', error);
      throw new Error('Failed to generate infographic image');
    }
  }

  async generateExplainerVideo(updateText: string): Promise<string> {
    // Note: Runway ML API integration would go here
    // For MVP, we'll return a placeholder since Runway ML API is not yet publicly available
    try {
      console.log('Generating explainer video for:', updateText);
      
      // Placeholder implementation
      // In a real implementation, this would call Runway ML API
      // For now, return a placeholder URL
      return '/placeholder-video.mp4';
    } catch (error) {
      console.error('Error generating explainer video:', error);
      throw new Error('Failed to generate explainer video');
    }
  }

  async generateContent(updateText: string, contentChoice: 'image' | 'video'): Promise<GeneratedContent> {
    try {
      // Generate text content in parallel
      const [blogText, linkedinText] = await Promise.all([
        this.generateBlogText(updateText),
        this.generateLinkedInText(updateText)
      ]);

      const result: GeneratedContent = {
        blog_text: blogText,
        linkedin_text: linkedinText
      };

      // Generate visual content based on choice
      if (contentChoice === 'image') {
        result.image_url = await this.generateInfographicImage(updateText);
      } else if (contentChoice === 'video') {
        result.video_url = await this.generateExplainerVideo(updateText);
      }

      return result;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }
}

export const aiServices = new AIServices();
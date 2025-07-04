import { GoogleGenAI, Modality } from "@google/genai";
import OpenAI from "openai";
import RunwayML from '@runwayml/sdk';
import * as fs from "fs";
import * as path from "path";
import { modelSelector, type ModelRecommendation } from "./model-selector";

// Initialize AI clients
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || "" 
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
const runway = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY });

// Check if video generation APIs are available
const isRunwayAvailable = () => {
  return !!process.env.RUNWAY_API_KEY;
};

const isHeyGenAvailable = () => {
  return !!process.env.HEYGEN_API_KEY;
};

export interface ContentSuggestion {
  suggestion: 'image' | 'video';
  reasoning: string;
}

export interface GeneratedContent {
  blog_text: string;
  linkedin_text: string;
  image_url?: string;
  video_url?: string;
  model_selections?: {
    blog_model: string;
    linkedin_model: string;
    image_model?: string;
    video_model?: string;
  };
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

  async generateBlogText(updateText: string): Promise<{ text: string, model_used: string }> {
    try {
      // Analyze task to select best model
      const task = await modelSelector.analyzeTask(
        `Generate a professional blog post from this founder update: ${updateText}`,
        { content_type: 'blog', style: 'professional' }
      );
      
      const recommendation = await modelSelector.selectBestModel(task);
      console.log(`Blog generation: Using ${recommendation.primary_model.model} - ${recommendation.reasoning}`);

      // Use recommended model or fallback to xAI
      const modelToUse = recommendation.primary_model.model;
      
      let response;
      if (recommendation.primary_model.provider === 'xai') {
        response = await xai.chat.completions.create({
          model: modelToUse,
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
      } else {
        // Fallback to xAI if other models not available
        response = await xai.chat.completions.create({
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
      }

      return {
        text: response.choices[0].message.content || '',
        model_used: modelToUse
      };
    } catch (error) {
      console.error('Error generating blog text:', error);
      throw new Error('Failed to generate blog text');
    }
  }

  async generateLinkedInText(updateText: string): Promise<{ text: string, model_used: string }> {
    try {
      // Analyze task for LinkedIn content
      const task = await modelSelector.analyzeTask(
        `Generate a casual LinkedIn post from this founder update: ${updateText}`,
        { content_type: 'social_media', style: 'casual', platform: 'linkedin' }
      );
      
      const recommendation = await modelSelector.selectBestModel(task);
      console.log(`LinkedIn generation: Using ${recommendation.primary_model.model} - ${recommendation.reasoning}`);

      const modelToUse = recommendation.primary_model.model;
      
      let response;
      if (recommendation.primary_model.provider === 'xai') {
        response = await xai.chat.completions.create({
          model: modelToUse,
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
      } else {
        // Fallback to xAI
        response = await xai.chat.completions.create({
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
      }

      return {
        text: response.choices[0].message.content || '',
        model_used: modelToUse
      };
    } catch (error) {
      console.error('Error generating LinkedIn text:', error);
      throw new Error('Failed to generate LinkedIn text');
    }
  }

  async generateInfographicImage(updateText: string): Promise<{ url: string, model_used: string }> {
    try {
      // Analyze task for image generation
      const task = await modelSelector.analyzeTask(
        `Generate a professional infographic from this founder update: ${updateText}`,
        { content_type: 'infographic', style: 'professional' }
      );
      
      const recommendation = await modelSelector.selectBestModel(task);
      console.log(`Image generation: Using ${recommendation.primary_model.model} - ${recommendation.reasoning}`);

      const modelToUse = recommendation.primary_model.model;
      
      const prompt = `Create a clean, professional infographic-style image based on this founder update: ${updateText}

Style requirements:
- Modern, minimalist design
- Professional color palette (blues, whites, grays)
- Clear typography and visual hierarchy
- Include key metrics, data points, or concepts
- Suitable for business/startup context
- High contrast for readability`;

      if (recommendation.primary_model.provider === 'gemini') {
        const response = await gemini.models.generateContent({
          model: modelToUse,
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
            
            return {
              url: `/uploads/${filename}`,
              model_used: modelToUse
            };
          }
        }
      } else {
        // Fallback to Gemini
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
            
            return {
              url: `/uploads/${filename}`,
              model_used: "gemini-2.0-flash-preview-image-generation"
            };
          }
        }
      }

      throw new Error('No image data found in response');
    } catch (error) {
      console.error('Error generating infographic:', error);
      throw new Error('Failed to generate infographic image');
    }
  }

  async generateExplainerVideo(updateText: string): Promise<{ url: string, model_used: string }> {
    try {
      // Analyze task for video generation
      const task = await modelSelector.analyzeTask(
        `Generate an explainer video from this founder update: ${updateText}`,
        { content_type: 'video', style: 'professional' }
      );
      
      const recommendation = await modelSelector.selectBestModel(task);
      console.log(`Video generation: Using ${recommendation.primary_model.model} - ${recommendation.reasoning}`);

      console.log('Generating explainer video for:', updateText);
      
      // Check if Runway API is available
      if (!isRunwayAvailable()) {
        console.log('Runway API key not available, using placeholder');
        return {
          url: '/placeholder-video.mp4',
          model_used: 'runway-gen-3 (placeholder - API key needed)'
        };
      }

      // Try HeyGen first if available
      if (isHeyGenAvailable()) {
        try {
          const heygenResult = await this.generateHeyGenVideo(updateText);
          return {
            url: heygenResult.url,
            model_used: 'heygen-v2'
          };
        } catch (heygenError) {
          console.error('HeyGen API error:', heygenError);
          // Continue to try Runway if HeyGen fails
        }
      }

      // Use Runway ML API for video generation
      if (recommendation.primary_model.provider === 'runway' && isRunwayAvailable()) {
        const prompt = `Create a professional explainer video based on this founder update: ${updateText}

Video style requirements:
- Professional, clean aesthetic
- Modern business presentation style
- Clear visual storytelling
- Engaging transitions and motion
- Suitable for startup/business context
- Duration: 5-10 seconds`;

        try {
          // Use the correct Runway ML API method
          const response = await fetch('https://api.runwayml.com/v1/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gen3a_turbo',
              prompt: prompt,
              duration: 5,
              ratio: '16:9'
            })
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result.output && result.output.length > 0) {
              // Save video to uploads directory
              const uploadsDir = path.join(process.cwd(), 'uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              const filename = `explainer_${Date.now()}.mp4`;
              const filepath = path.join(uploadsDir, filename);
              
              // Download and save video
              const videoResponse = await fetch(result.output[0]);
              const buffer = await videoResponse.arrayBuffer();
              fs.writeFileSync(filepath, Buffer.from(buffer));
              
              return {
                url: `/uploads/${filename}`,
                model_used: 'runway-gen3a-turbo'
              };
            }
          }
        } catch (runwayError) {
          console.error('Runway API error:', runwayError);
          // Continue to placeholder
        }
      }
      
      // Fallback to placeholder for non-Runway models
      return {
        url: '/placeholder-video.mp4',
        model_used: recommendation.primary_model.model + ' (placeholder)'
      };
    } catch (error) {
      console.error('Error generating explainer video:', error);
      throw new Error('Failed to generate explainer video');
    }
  }

  async generateHeyGenVideo(updateText: string): Promise<{ url: string }> {
    try {
      // HeyGen API integration for text-to-video
      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.HEYGEN_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_inputs: [{
            character: {
              type: "avatar",
              avatar_id: "default_avatar_business"
            },
            voice: {
              type: "text",
              input_text: `Here's an update from our founder: ${updateText}`,
              voice_id: "professional_male_en"
            }
          }],
          dimension: {
            width: 1280,
            height: 720
          },
          aspect_ratio: "16:9"
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.data && result.data.video_id) {
          // Poll for video completion
          const videoId = result.data.video_id;
          let attempts = 0;
          const maxAttempts = 30; // 5 minutes max wait
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            
            const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
              headers: {
                'X-API-Key': process.env.HEYGEN_API_KEY || ''
              }
            });
            
            if (statusResponse.ok) {
              const statusResult = await statusResponse.json();
              
              if (statusResult.data && statusResult.data.status === 'completed') {
                return {
                  url: statusResult.data.video_url
                };
              } else if (statusResult.data && statusResult.data.status === 'failed') {
                throw new Error('HeyGen video generation failed');
              }
            }
            
            attempts++;
          }
          
          throw new Error('HeyGen video generation timeout');
        }
      }
      
      throw new Error('HeyGen API request failed');
    } catch (error) {
      console.error('HeyGen video generation error:', error);
      throw error;
    }
  }

  async generateContent(updateText: string, contentChoice: 'image' | 'video'): Promise<GeneratedContent> {
    try {
      // Generate text content in parallel
      const [blogResult, linkedinResult] = await Promise.all([
        this.generateBlogText(updateText),
        this.generateLinkedInText(updateText)
      ]);

      const result: GeneratedContent = {
        blog_text: blogResult.text,
        linkedin_text: linkedinResult.text,
        model_selections: {
          blog_model: blogResult.model_used,
          linkedin_model: linkedinResult.model_used
        }
      };

      // Generate visual content based on choice
      if (contentChoice === 'image') {
        const imageResult = await this.generateInfographicImage(updateText);
        result.image_url = imageResult.url;
        if (result.model_selections) {
          result.model_selections.image_model = imageResult.model_used;
        }
      } else if (contentChoice === 'video') {
        const videoResult = await this.generateExplainerVideo(updateText);
        result.video_url = videoResult.url;
        if (result.model_selections) {
          result.model_selections.video_model = videoResult.model_used;
        }
      }

      return result;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }
}

export const aiServices = new AIServices();
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
    blog_model?: string;
    linkedin_model?: string;
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
        `Generate an image exactly as described in this text: ${updateText}`,
        { content_type: 'image', style: 'creative' }
      );
      
      const recommendation = await modelSelector.selectBestModel(task);
      console.log(`Image generation: Using ${recommendation.primary_model.model} - ${recommendation.reasoning}`);

      const modelToUse = recommendation.primary_model.model;
      
      // Generate exactly what the user describes, not just infographics
      const prompt = `Create an image exactly as described in this text: ${updateText}

Generate the image following the user's description precisely. If no specific visual description is provided, create a relevant visual representation of the content mentioned.

Requirements:
- High quality and professional appearance
- Follow the user's description exactly
- If it's a business update, make it visually appealing for business context
- If it's a specific scene or object, create that exactly`;

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

      // Try HeyGen first if available - but start it asynchronously for better UX
      if (isHeyGenAvailable()) {
        console.log('Starting HeyGen video generation in background...');
        
        // For demo purposes, start async generation and return processing status
        setTimeout(() => {
          this.generateHeyGenVideo(updateText).then(result => {
            console.log('HeyGen video completed:', result.url);
          }).catch(error => {
            console.error('HeyGen video generation failed:', error);
          });
        }, 100);
        
        // Return immediate response for better UX
        return {
          url: '/placeholder-video-processing.mp4',
          model_used: 'heygen-v2 (processing in background)'
        };
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

  async generateTavusVideo(updateText: string): Promise<{ url: string }> {
    try {
      const response = await fetch('https://api.tavus.io/v2/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TAVUS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          script: updateText,
          replica_id: 'default', // You can customize this later
          background_url: null,
          video_name: `Founder Update - ${new Date().toISOString()}`
        })
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      return { url: data.video_url || '/placeholder-tavus-processing.mp4' };
    } catch (error) {
      console.error('Tavus video generation failed:', error);
      throw error;
    }
  }

  async generateCreatomateVideo(updateText: string): Promise<{ url: string }> {
    try {
      const url = 'https://api.creatomate.com/v1/renders';
      const apiKey = process.env.CREATOMATE_API_KEY;

      const data = {
        "template_id": "230d30ab-7e5e-4d2c-871e-aaf8a4af8f90",
        "modifications": {
          "Video.source": "https://creatomate.com/files/assets/7347c3b7-e1a8-4439-96f1-f3dfc95c3d28",
          "Text-1.text": updateText,
          "Text-2.text": "Founder Update\n[size 150%]Announcement[/size]"
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Creatomate API error: ${response.status}`);
      }

      const result = await response.json();
      return { url: result[0]?.url || '/placeholder-creatomate-processing.mp4' };
    } catch (error) {
      console.error('Creatomate video generation failed:', error);
      throw error;
    }
  }

  async generateHeyGenVideo(updateText: string): Promise<{ url: string }> {
    try {
      console.log('Starting HeyGen V2 video generation...');
      
      // Generate a professional founder update script
      const script = `Hi everyone! I wanted to share some exciting news with you. ${updateText} This is just the beginning of our journey, and I'm incredibly grateful for your continued support. Stay tuned for more updates as we continue to grow and innovate together!`;

      // HeyGen V2 API integration for avatar video
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
              avatar_id: "Daisy-inskirt-20220818", // Professional female avatar
              scale: 1.0,
              avatar_style: "normal",
              offset: { x: 0.0, y: 0.0 }
            },
            voice: {
              type: "text",
              input_text: script,
              voice_id: "1bd001e7e50f421d891986aad5158bc8", // Professional female voice
              speed: 1.0,
              emotion: "Friendly"
            },
            background: {
              type: "color",
              value: "#f0f0f0" // Light gray professional background
            }
          }],
          dimension: {
            width: 1280,
            height: 720
          },
          title: "Founder Update Video",
          caption: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HeyGen API Error Response:', errorText);
        throw new Error(`HeyGen API request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('HeyGen API Response:', result);
      
      if (result.data && result.data.video_id) {
        const videoId = result.data.video_id;
        console.log(`Video generation started. Video ID: ${videoId}`);
        
        // Poll for video completion with proper status checking
        let attempts = 0;
        const maxAttempts = 60; // 10 minutes max wait (10 seconds * 60)
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
          
          const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
            headers: {
              'X-API-Key': process.env.HEYGEN_API_KEY || ''
            }
          });
          
          if (statusResponse.ok) {
            const statusResult = await statusResponse.json();
            console.log(`Video status check ${attempts + 1}:`, statusResult.data?.status);
            
            if (statusResult.data) {
              const status = statusResult.data.status;
              
              if (status === 'completed') {
                console.log('Video generation completed successfully!');
                return {
                  url: statusResult.data.video_url
                };
              } else if (status === 'failed') {
                throw new Error(`HeyGen video generation failed: ${statusResult.data.error || 'Unknown error'}`);
              } else if (status === 'processing' || status === 'pending') {
                console.log(`Video still ${status}, waiting...`);
              }
            }
          } else {
            console.error('Status check failed:', await statusResponse.text());
          }
          
          attempts++;
        }
        
        throw new Error('HeyGen video generation timeout after 10 minutes');
      } else {
        throw new Error('No video ID returned from HeyGen API');
      }
    } catch (error) {
      console.error('HeyGen video generation error:', error);
      throw error;
    }
  }

  async generateContent(updateText: string, contentChoice: 'image' | 'video' | 'blog' | 'linkedin', selectedModel?: string): Promise<GeneratedContent> {
    try {
      // If user selected a specific model, add it to the context
      if (selectedModel && selectedModel !== 'best') {
        console.log(`User selected model: ${selectedModel}`);
      }
      
      // Initialize result with empty content
      const result: GeneratedContent = {
        blog_text: '',
        linkedin_text: '',
        model_selections: {}
      };

      // Generate content based on choice
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
      } else if (contentChoice === 'blog') {
        const blogResult = await this.generateBlogText(updateText);
        result.blog_text = blogResult.text;
        if (result.model_selections) {
          result.model_selections.blog_model = blogResult.model_used;
        }
      } else if (contentChoice === 'linkedin') {
        const linkedinResult = await this.generateLinkedInText(updateText);
        result.linkedin_text = linkedinResult.text;
        if (result.model_selections) {
          result.model_selections.linkedin_model = linkedinResult.model_used;
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
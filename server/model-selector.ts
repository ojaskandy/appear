import OpenAI from "openai";

// Initialize xAI client for model selection intelligence
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || "" 
});

export interface ModelCapability {
  model: string;
  provider: 'xai' | 'gemini' | 'openai' | 'anthropic' | 'runway' | 'stability' | 'midjourney';
  strengths: string[];
  use_cases: string[];
  quality_score: number; // 1-10
}

export interface TaskAnalysis {
  task_type: 'text_generation' | 'image_generation' | 'video_generation' | 'analysis' | 'coding';
  content_style: 'professional' | 'creative' | 'technical' | 'casual' | 'cinematic' | 'infographic';
  complexity: 'low' | 'medium' | 'high';
  specific_requirements: string[];
}

export interface ModelRecommendation {
  primary_model: ModelCapability;
  alternative_model?: ModelCapability;
  reasoning: string;
  confidence: number; // 0-1
}

// Model database - comprehensive list of available models and their strengths
const MODEL_DATABASE: ModelCapability[] = [
  // Text Generation Models
  {
    model: "grok-2-1212",
    provider: "xai",
    strengths: ["reasoning", "analysis", "real-time_data", "conversational", "startup_context"],
    use_cases: ["founder_updates", "business_analysis", "strategic_content", "market_insights"],
    quality_score: 9
  },
  {
    model: "claude-3-5-sonnet",
    provider: "anthropic",
    strengths: ["writing_quality", "structured_content", "professional_tone", "editing"],
    use_cases: ["blog_posts", "documentation", "formal_content", "technical_writing"],
    quality_score: 9
  },
  {
    model: "gpt-4o",
    provider: "openai",
    strengths: ["versatility", "creativity", "social_media", "marketing_copy"],
    use_cases: ["linkedin_posts", "creative_content", "marketing", "general_writing"],
    quality_score: 8
  },

  // Image Generation Models
  {
    model: "gemini-2.0-flash-preview-image-generation",
    provider: "gemini",
    strengths: ["infographics", "data_visualization", "professional_design", "business_graphics"],
    use_cases: ["business_infographics", "data_charts", "professional_visuals", "presentations"],
    quality_score: 8
  },
  {
    model: "dall-e-3",
    provider: "openai",
    strengths: ["artistic_quality", "detailed_prompts", "creative_concepts", "photorealism"],
    use_cases: ["creative_visuals", "artistic_content", "detailed_scenes", "marketing_images"],
    quality_score: 9
  },
  {
    model: "midjourney-v6",
    provider: "midjourney",
    strengths: ["cinematic", "artistic", "aesthetic_quality", "style_consistency"],
    use_cases: ["cinematic_shots", "artistic_visuals", "brand_imagery", "high_end_design"],
    quality_score: 10
  },
  {
    model: "stable-diffusion-xl",
    provider: "stability",
    strengths: ["customization", "technical_control", "batch_generation", "cost_effective"],
    use_cases: ["bulk_generation", "custom_training", "technical_imagery", "variations"],
    quality_score: 7
  },

  // Video Generation Models
  {
    model: "runway-gen-3",
    provider: "runway",
    strengths: ["cinematic_video", "realistic_motion", "text_overlays", "professional_quality"],
    use_cases: ["explainer_videos", "product_demos", "cinematic_content", "marketing_videos"],
    quality_score: 9
  }
];

export class ModelSelector {
  
  async analyzeTask(request: string, context?: any): Promise<TaskAnalysis> {
    try {
      const response = await xai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: `You are an AI model selection expert. Analyze the user request and determine:
1. Task type (text_generation, image_generation, video_generation, analysis, coding)
2. Content style (professional, creative, technical, casual, cinematic, infographic)
3. Complexity level (low, medium, high)
4. Specific requirements or preferences

Respond with JSON in this format:
{
  "task_type": "string",
  "content_style": "string", 
  "complexity": "string",
  "specific_requirements": ["array", "of", "strings"]
}`
          },
          {
            role: "user",
            content: `Analyze this request: "${request}"`
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis as TaskAnalysis;
    } catch (error) {
      console.error('Error analyzing task:', error);
      // Fallback analysis
      return {
        task_type: 'text_generation',
        content_style: 'professional',
        complexity: 'medium',
        specific_requirements: []
      };
    }
  }

  async selectBestModel(task: TaskAnalysis): Promise<ModelRecommendation> {
    try {
      const response = await xai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: `You are an expert at selecting the best AI model for each task. Given a task analysis and available models, recommend the best model.

Available models:
${JSON.stringify(MODEL_DATABASE, null, 2)}

Consider:
- Model strengths vs task requirements
- Quality scores for the task type
- Specific use cases
- Content style preferences

Respond with JSON:
{
  "primary_model": "model_name",
  "alternative_model": "model_name_or_null",
  "reasoning": "detailed explanation",
  "confidence": 0.95
}`
          },
          {
            role: "user",
            content: `Select best model for: ${JSON.stringify(task)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Find model objects
      const primaryModel = MODEL_DATABASE.find(m => m.model === result.primary_model);
      const alternativeModel = result.alternative_model 
        ? MODEL_DATABASE.find(m => m.model === result.alternative_model)
        : undefined;

      if (!primaryModel) {
        throw new Error('Primary model not found in database');
      }

      return {
        primary_model: primaryModel,
        alternative_model: alternativeModel,
        reasoning: result.reasoning,
        confidence: result.confidence || 0.8
      };
    } catch (error) {
      console.error('Error selecting model:', error);
      // Fallback to default models
      const fallbackModel = MODEL_DATABASE.find(m => 
        m.model === "grok-2-1212" && task.task_type === 'text_generation'
      ) || MODEL_DATABASE[0];

      return {
        primary_model: fallbackModel,
        reasoning: "Using fallback model due to selection error",
        confidence: 0.5
      };
    }
  }

  async getMultipleOptions(task: TaskAnalysis, count: number = 2): Promise<ModelRecommendation[]> {
    const recommendations: ModelRecommendation[] = [];
    
    // Filter models by task type
    const relevantModels = MODEL_DATABASE.filter(model => {
      if (task.task_type === 'text_generation') {
        return ['xai', 'openai', 'anthropic'].includes(model.provider);
      } else if (task.task_type === 'image_generation') {
        return ['gemini', 'openai', 'midjourney', 'stability'].includes(model.provider);
      } else if (task.task_type === 'video_generation') {
        return model.provider === 'runway';
      }
      return true;
    });

    // Sort by quality score and style match
    const sortedModels = relevantModels.sort((a, b) => {
      const aStyleMatch = a.use_cases.some(uc => 
        uc.includes(task.content_style) || 
        a.strengths.includes(task.content_style)
      ) ? 1 : 0;
      
      const bStyleMatch = b.use_cases.some(uc => 
        uc.includes(task.content_style) || 
        b.strengths.includes(task.content_style)
      ) ? 1 : 0;

      return (b.quality_score + bStyleMatch * 2) - (a.quality_score + aStyleMatch * 2);
    });

    // Create recommendations for top models
    for (let i = 0; i < Math.min(count, sortedModels.length); i++) {
      const model = sortedModels[i];
      recommendations.push({
        primary_model: model,
        reasoning: `${model.model} selected for ${task.content_style} ${task.task_type}. Strengths: ${model.strengths.join(', ')}`,
        confidence: Math.max(0.6, (sortedModels.length - i) / sortedModels.length)
      });
    }

    return recommendations;
  }

  // Helper method to get available models by provider
  getAvailableModels(provider?: string): ModelCapability[] {
    if (provider) {
      return MODEL_DATABASE.filter(m => m.provider === provider);
    }
    return MODEL_DATABASE;
  }

  // Helper method to check if a model is available (has API key)
  isModelAvailable(modelName: string): boolean {
    const model = MODEL_DATABASE.find(m => m.model === modelName);
    if (!model) return false;

    switch (model.provider) {
      case 'xai':
        return !!process.env.XAI_API_KEY;
      case 'gemini':
        return !!process.env.GEMINI_API_KEY;
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'runway':
        return !!process.env.RUNWAY_API_KEY;
      case 'stability':
        return !!process.env.STABILITY_API_KEY;
      case 'midjourney':
        return !!process.env.MIDJOURNEY_API_KEY;
      default:
        return false;
    }
  }
}

export const modelSelector = new ModelSelector();
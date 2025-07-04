import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Video, Image, CheckCircle, Sparkles, FileText, Share2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentSuggestion {
  suggestion: 'image' | 'video';
  reasoning: string;
}

interface GeneratedContent {
  blog_text: string;
  linkedin_text: string;
  image_url?: string;
  video_url?: string;
}

// Model options matching Perplexity's aesthetic
const MODEL_OPTIONS = [
  { value: 'best', label: 'Best', description: 'Selects the best model for each task' },
  { value: 'grok-2-1212', label: 'Grok 2', description: 'xAI\'s advanced reasoning model' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Anthropic\'s advanced model' },
  { value: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI\'s advanced model' },
  { value: 'gemini-2.0-flash-preview-image-generation', label: 'Gemini 2.0 Flash', description: 'Google\'s latest model' },
  { value: 'runway-gen-3', label: 'Runway Gen-3', description: 'Advanced video generation' },
  { value: 'heygen-v2', label: 'HeyGen V2', description: 'Professional avatar videos' },
];

export default function Home() {
  const [updateText, setUpdateText] = useState('');
  const [suggestion, setSuggestion] = useState<ContentSuggestion | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'image' | 'video' | null>(null);
  const [selectedModel, setSelectedModel] = useState('best');
  
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!updateText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your founder update text",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ update_text: updateText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      setSuggestion(data);
      setSelectedChoice(data.suggestion);
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Error",
        description: "Failed to analyze your update text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async (choice?: 'image' | 'video') => {
    const contentChoice = choice || selectedChoice;
    
    if (!contentChoice) {
      toast({
        title: "Error",
        description: "Please select a content type",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const requestBody: any = { 
        update_text: updateText, 
        content_choice: contentChoice 
      };
      
      // If user selected a specific model, include it in the request
      if (selectedModel !== 'best') {
        requestBody.selected_model = selectedModel;
      }
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data);
      toast({
        title: "Success",
        description: "Content generated successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectGenerate = async () => {
    if (!updateText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your founder update text",
        variant: "destructive"
      });
      return;
    }

    // If user selected a specific model, skip suggestion and generate directly
    if (selectedModel !== 'best') {
      // Determine content type based on selected model
      const isVideoModel = ['runway-gen-3', 'heygen-v2'].includes(selectedModel);
      const contentChoice = isVideoModel ? 'video' : 'image';
      await handleGenerate(contentChoice);
    } else {
      // Use the existing analyze flow
      await handleAnalyze();
    }
  };

  const handleReset = () => {
    setUpdateText('');
    setSuggestion(null);
    setGeneratedContent(null);
    setSelectedChoice(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-16 bg-[#1a1a1a] border-r border-gray-800 flex flex-col items-center py-4">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-6">
          <span className="text-black font-bold text-sm">A</span>
        </div>
        <div className="flex flex-col space-y-4 text-gray-400">
          <div className="p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
            <Search className="w-5 h-5" />
          </div>
          <div className="p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
            <FileText className="w-5 h-5" />
          </div>
          <div className="p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
            <Share2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-16 flex flex-col flex-1">
        {!generatedContent ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            {/* Logo */}
            <div className="mb-12">
              <h1 className="text-4xl font-light text-white">appear</h1>
            </div>

            {/* Input Section */}
            <div className="w-full max-w-3xl">
              {/* Model Selection Dropdown */}
              <div className="mb-4 flex justify-start">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-auto min-w-[200px] bg-[#2a2a2a] border border-gray-700 text-white rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a2a] border border-gray-700 text-white rounded-lg">
                    {MODEL_OPTIONS.map((model) => (
                      <SelectItem
                        key={model.value}
                        value={model.value}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                      >
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl overflow-hidden">
                  <Textarea
                    placeholder="Share your founder update or company milestone..."
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    className="min-h-[60px] bg-transparent border-0 text-white placeholder-gray-400 resize-none focus:ring-0 p-4 pr-16"
                    disabled={isAnalyzing || isGenerating}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                    <Button
                      onClick={handleDirectGenerate}
                      disabled={isAnalyzing || isGenerating || !updateText.trim()}
                      size="sm"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg w-8 h-8 p-0"
                    >
                      {isAnalyzing || isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center mt-6 space-x-2">
                <Button variant="outline" size="sm" className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800">
                  <Image className="w-4 h-4 mr-2" />
                  Create Visual
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800">
                  <Video className="w-4 h-4 mr-2" />
                  Make Video
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800">
                  <FileText className="w-4 h-4 mr-2" />
                  Blog Post
                </Button>
              </div>
            </div>

            {/* Suggestion Section */}
            {suggestion && (
              <div className="w-full max-w-3xl mt-8">
                <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white font-medium">
                      Recommended: {suggestion.suggestion === 'image' ? 'Infographic' : 'Video'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button
                      variant={selectedChoice === 'image' ? 'default' : 'outline'}
                      onClick={() => setSelectedChoice('image')}
                      disabled={isGenerating}
                      className={`h-10 ${
                        selectedChoice === 'image' 
                          ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                          : 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Generate Infographic
                    </Button>
                    <Button
                      variant={selectedChoice === 'video' ? 'default' : 'outline'}
                      onClick={() => setSelectedChoice('video')}
                      disabled={isGenerating}
                      className={`h-10 ${
                        selectedChoice === 'video' 
                          ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                          : 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Create Video
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || !selectedChoice}
                    className="w-full h-10 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {selectedChoice === 'video' ? 'Generating (videos take 2-5 minutes)...' : 'Generating All Content'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate All Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Generated Content Display */
          <div className="flex-1 px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-light text-white">Generated Content</h2>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800"
                >
                  New Update
                </Button>
              </div>

              <div className="grid gap-6">
                {/* Blog Post */}
                <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Blog Post</h3>
                      <p className="text-gray-400 text-sm">Generated with xAI Grok</p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6">
                    <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">{generatedContent.blog_text}</p>
                  </div>
                </div>

                {/* LinkedIn Post */}
                <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">LinkedIn Post</h3>
                      <p className="text-gray-400 text-sm">Generated with xAI Grok</p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6">
                    <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">{generatedContent.linkedin_text}</p>
                  </div>
                </div>

                {/* Generated Image */}
                {generatedContent.image_url && (
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Image className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Generated Infographic</h3>
                        <p className="text-gray-400 text-sm">Created with Gemini AI</p>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                      <img 
                        src={generatedContent.image_url} 
                        alt="Generated infographic"
                        className="w-full max-w-lg mx-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Generated Video */}
                {generatedContent.video_url && (
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Generated Video</h3>
                        <p className="text-gray-400 text-sm">Ready for Runway ML</p>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-8 text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">
                        Video placeholder - Runway ML integration ready
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        URL: {generatedContent.video_url}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

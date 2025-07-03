import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Video, Image, CheckCircle, Sparkles, FileText, Share2 } from "lucide-react";
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

export default function Home() {
  const [updateText, setUpdateText] = useState('');
  const [suggestion, setSuggestion] = useState<ContentSuggestion | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'image' | 'video' | null>(null);
  
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

  const handleGenerate = async () => {
    if (!selectedChoice) {
      toast({
        title: "Error",
        description: "Please select a content type",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          update_text: updateText, 
          content_choice: selectedChoice 
        }),
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

  const handleReset = () => {
    setUpdateText('');
    setSuggestion(null);
    setGeneratedContent(null);
    setSelectedChoice(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-2xl font-semibold">appear</h1>
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              pro
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!generatedContent ? (
          <div className="max-w-2xl mx-auto">
            {/* Input Section */}
            <div className="mb-8">
              <div className="relative">
                <Textarea
                  placeholder="Share your founder update or company milestone..."
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  className="min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none focus:border-cyan-500 focus:ring-cyan-500"
                  disabled={isAnalyzing || isGenerating}
                />
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || isGenerating || !updateText.trim()}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Suggestion Section */}
            {suggestion && (
              <div className="mb-8">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-cyan-500" />
                    <span className="text-cyan-500 font-medium">AI Analysis Complete</span>
                  </div>
                  
                  <div className="mb-4">
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 mb-2">
                      Recommended: {suggestion.suggestion === 'image' ? 'Infographic' : 'Explainer Video'}
                    </Badge>
                    <p className="text-gray-300 text-sm">{suggestion.reasoning}</p>
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <Button
                      variant={selectedChoice === 'image' ? 'default' : 'outline'}
                      onClick={() => setSelectedChoice('image')}
                      disabled={isGenerating}
                      className={`flex-1 ${
                        selectedChoice === 'image' 
                          ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Infographic
                    </Button>
                    <Button
                      variant={selectedChoice === 'video' ? 'default' : 'outline'}
                      onClick={() => setSelectedChoice('video')}
                      disabled={isGenerating}
                      className={`flex-1 ${
                        selectedChoice === 'video' 
                          ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedChoice}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Content...
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

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <FileText className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Generate blog posts</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <Share2 className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Create social content</p>
              </div>
            </div>
          </div>
        ) : (
          /* Generated Content Display */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generated Content</h2>
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                New Update
              </Button>
            </div>

            {/* Blog Post */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-medium">Blog Post</h3>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <p className="whitespace-pre-wrap text-sm text-gray-300">{generatedContent.blog_text}</p>
              </div>
            </div>

            {/* LinkedIn Post */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-medium">LinkedIn Post</h3>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <p className="whitespace-pre-wrap text-sm text-gray-300">{generatedContent.linkedin_text}</p>
              </div>
            </div>

            {/* Generated Image */}
            {generatedContent.image_url && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-medium">Generated Infographic</h3>
                </div>
                <img 
                  src={generatedContent.image_url} 
                  alt="Generated infographic"
                  className="w-full max-w-md mx-auto rounded-lg border border-gray-700"
                />
              </div>
            )}

            {/* Generated Video */}
            {generatedContent.video_url && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-medium">Generated Video</h3>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
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
        )}
      </div>
    </div>
  );
}

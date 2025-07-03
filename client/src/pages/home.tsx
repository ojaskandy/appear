import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Video, Image, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Founder Update Content Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your founder updates into engaging blog posts, LinkedIn content, and visual assets using AI
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Step 1: Enter Your Founder Update
              </CardTitle>
              <CardDescription>
                Share your latest company update, milestone, or announcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., We just hit $1M ARR! Our team has grown from 5 to 15 people this quarter, and we've launched 3 new features that our customers love..."
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                className="min-h-[120px]"
                disabled={isAnalyzing || isGenerating}
              />
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isGenerating || !updateText.trim()}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze & Get Suggestion'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={isAnalyzing || isGenerating}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Suggestion */}
          {suggestion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Step 2: Content Type Suggestion
                </CardTitle>
                <CardDescription>
                  AI analysis suggests the best format for your update
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      Suggested: {suggestion.suggestion === 'image' ? 'Infographic' : 'Explainer Video'}
                    </Badge>
                    {suggestion.suggestion === 'image' ? (
                      <Image className="w-4 h-4" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-gray-600">{suggestion.reasoning}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={selectedChoice === 'image' ? 'default' : 'outline'}
                      onClick={() => setSelectedChoice('image')}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Generate Infographic
                    </Button>
                    <Button
                      variant={selectedChoice === 'video' ? 'default' : 'outline'}
                      onClick={() => setSelectedChoice('video')}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Generate Video
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedChoice}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      'Generate All Content'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Generated Content */}
          {generatedContent && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Blog Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{generatedContent.blog_text}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated LinkedIn Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{generatedContent.linkedin_text}</p>
                  </div>
                </CardContent>
              </Card>

              {generatedContent.image_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Infographic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={generatedContent.image_url} 
                      alt="Generated infographic"
                      className="w-full max-w-md mx-auto rounded-lg shadow-md"
                    />
                  </CardContent>
                </Card>
              )}

              {generatedContent.video_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 p-8 rounded-lg text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">
                        Video placeholder - Runway ML integration ready
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        URL: {generatedContent.video_url}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

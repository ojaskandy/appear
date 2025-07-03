import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Image as ImageIcon, Video, FileText, Share2, CheckCircle2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentSuggestion {
  suggestion: 'image' | 'video';
  reasoning: string;
}

interface GeneratedContent {
  blog_text?: string;
  linkedin_text?: string;
  image_url?: string;
  video_url?: string;
  model_selections?: {
    blog_model?: string;
    linkedin_model?: string;
    image_model?: string;
    video_model?: string;
  };
}

export default function Home() {
  const [updateText, setUpdateText] = useState('');
  const [suggestion, setSuggestion] = useState<ContentSuggestion | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!updateText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your founder update text.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update_text: updateText }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data: ContentSuggestion = await response.json();
      setSuggestion(data);
      setGeneratedContent(null);
      setShowModal(true);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (selectedContentTypes.length === 0) {
      toast({
        title: "Select Content Type",
        description: "Please select at least one content type to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result: GeneratedContent = {};
      
      // Generate selected content types
      for (const type of selectedContentTypes) {
        if (type === 'blog') {
          const response = await fetch('/api/generate-blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update_text: updateText }),
          });
          if (response.ok) {
            const data = await response.json();
            result.blog_text = data.text;
            if (!result.model_selections) result.model_selections = {};
            result.model_selections.blog_model = data.model_used;
          }
        } else if (type === 'linkedin') {
          const response = await fetch('/api/generate-linkedin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update_text: updateText }),
          });
          if (response.ok) {
            const data = await response.json();
            result.linkedin_text = data.text;
            if (!result.model_selections) result.model_selections = {};
            result.model_selections.linkedin_model = data.model_used;
          }
        } else if (type === 'image') {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update_text: updateText, content_choice: 'image' }),
          });
          if (response.ok) {
            const data = await response.json();
            result.image_url = data.image_url;
            if (!result.model_selections) result.model_selections = {};
            result.model_selections.image_model = data.model_selections?.image_model;
          }
        } else if (type === 'video') {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update_text: updateText, content_choice: 'video' }),
          });
          if (response.ok) {
            const data = await response.json();
            result.video_url = data.video_url;
            if (!result.model_selections) result.model_selections = {};
            result.model_selections.video_model = data.model_selections?.video_model;
          }
        }
      }

      setGeneratedContent(result);
      setShowModal(false);
      toast({
        title: "Content Generated!",
        description: "Your founder update has been transformed into engaging content.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleContentType = (type: string) => {
    setSelectedContentTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleReset = () => {
    setUpdateText('');
    setSuggestion(null);
    setGeneratedContent(null);
    setSelectedContentTypes([]);
  };

  const contentTypeOptions = [
    { id: 'image', label: 'Infographic', icon: ImageIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'video', label: 'Video', icon: Video, color: 'from-purple-500 to-pink-500' },
    { id: 'blog', label: 'Blog Post', icon: FileText, color: 'from-green-500 to-blue-500' },
    { id: 'linkedin', label: 'LinkedIn Post', icon: Share2, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800/30 bg-gray-900/20 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                appear
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Main Input Section */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Transform Your Update
            </h2>
            <p className="text-gray-400 text-lg">
              Turn startup news into engaging content with AI
            </p>
          </div>

          <div className="bg-gray-800/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-3">
                <Textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Share your latest milestone, product launch, funding news..."
                  className="min-h-[120px] bg-gray-700/20 border-gray-600/30 text-white placeholder-gray-400 focus:border-blue-400 backdrop-blur-sm resize-none rounded-xl"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !updateText.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze & Create
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Generated Content Display */}
          {generatedContent && (
            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Generated Content</h2>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-gray-600/50 text-gray-300 hover:bg-gray-700/30 backdrop-blur-sm rounded-xl"
                >
                  Start Over
                </Button>
              </div>

              <div className="space-y-4">
                {/* Blog Post */}
                {generatedContent.blog_text && (
                  <Card className="bg-gray-800/20 border-gray-700/30 backdrop-blur-2xl rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-blue-400">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Blog Post
                        </div>
                        {generatedContent.model_selections?.blog_model && (
                          <Badge variant="outline" className="text-xs bg-gray-700/30 border-gray-600/50">
                            {generatedContent.model_selections.blog_model}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {generatedContent.blog_text}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* LinkedIn Post */}
                {generatedContent.linkedin_text && (
                  <Card className="bg-gray-800/20 border-gray-700/30 backdrop-blur-2xl rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-blue-400">
                        <div className="flex items-center">
                          <Share2 className="mr-2 h-5 w-5" />
                          LinkedIn Post
                        </div>
                        {generatedContent.model_selections?.linkedin_model && (
                          <Badge variant="outline" className="text-xs bg-gray-700/30 border-gray-600/50">
                            {generatedContent.model_selections.linkedin_model}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {generatedContent.linkedin_text}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Visual Content */}
                {generatedContent.image_url && (
                  <Card className="bg-gray-800/20 border-gray-700/30 backdrop-blur-2xl rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-purple-400">
                        <div className="flex items-center">
                          <ImageIcon className="mr-2 h-5 w-5" />
                          Generated Infographic
                        </div>
                        {generatedContent.model_selections?.image_model && (
                          <Badge variant="outline" className="text-xs bg-gray-700/30 border-gray-600/50">
                            {generatedContent.model_selections.image_model}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <img
                          src={generatedContent.image_url}
                          alt="Generated infographic"
                          className="w-full h-auto rounded-xl shadow-lg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {generatedContent.video_url && (
                  <Card className="bg-gray-800/20 border-gray-700/30 backdrop-blur-2xl rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-purple-400">
                        <div className="flex items-center">
                          <Video className="mr-2 h-5 w-5" />
                          Generated Video
                        </div>
                        {generatedContent.model_selections?.video_model && (
                          <Badge variant="outline" className="text-xs bg-gray-700/30 border-gray-600/50">
                            {generatedContent.model_selections.video_model}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <div className="aspect-video bg-gray-700/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center">
                            <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-400">Video placeholder - Runway ML integration ready</p>
                            <p className="text-sm text-gray-500 mt-2">URL: {generatedContent.video_url}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Liquid Glass Content Selection Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900/80 backdrop-blur-3xl border-gray-700/30 max-w-md rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-white mb-2">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              AI Analysis Complete
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {suggestion && (
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 backdrop-blur-xl">
                <div className="flex items-center mb-2">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/50">
                    Recommended: {suggestion.suggestion === 'image' ? 'Infographic' : 'Video'}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm">
                  {suggestion.reasoning}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Select content to generate:</h3>
              <div className="grid grid-cols-2 gap-3">
                {contentTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedContentTypes.includes(option.id);
                  const isRecommended = suggestion?.suggestion === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleContentType(option.id)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 backdrop-blur-xl
                        ${isSelected 
                          ? `bg-gradient-to-r ${option.color} border-transparent text-white shadow-lg` 
                          : 'bg-gray-800/20 border-gray-600/30 text-gray-300 hover:border-gray-500/50'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </div>
                      {isRecommended && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                          AI Pick
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 border-gray-600/50 text-gray-300 hover:bg-gray-700/30 rounded-xl backdrop-blur-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedContentTypes.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
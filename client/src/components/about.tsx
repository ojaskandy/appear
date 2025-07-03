import { CheckCircle, Zap, Code } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About This Project</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Appear is designed as a comprehensive starting point for modern web development projects, featuring clean architecture and best practices.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Semantic HTML5</h3>
                <p className="text-gray-600">Built with proper semantic structure for accessibility and SEO optimization.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern Styling</h3>
                <p className="text-gray-600">Clean, responsive design using Tailwind CSS for rapid development.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for JavaScript</h3>
                <p className="text-gray-600">Structured for easy integration of interactive features and modern frameworks.</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Modern development illustration using CSS */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-white bg-opacity-20 rounded w-3/4"></div>
                  <div className="h-4 bg-white bg-opacity-20 rounded w-1/2"></div>
                  <div className="h-4 bg-white bg-opacity-20 rounded w-5/6"></div>
                  <div className="h-4 bg-white bg-opacity-20 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

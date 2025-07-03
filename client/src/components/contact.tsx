import { ExternalLink, Github } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get Started</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to begin your next project? Start with Appear and build something amazing.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">1</div>
                <div>
                  <p className="text-gray-600">
                    Clone the repository: <code className="bg-gray-200 px-2 py-1 rounded text-sm">git clone https://github.com/ojaskandy/appear.git</code>
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">2</div>
                <div>
                  <p className="text-gray-600">Open the project in your favorite code editor</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">3</div>
                <div>
                  <p className="text-gray-600">Start customizing and building your application</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <a
              href="https://github.com/ojaskandy/appear"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

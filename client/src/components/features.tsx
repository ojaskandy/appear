import { Smartphone, Search, User, Shield, Zap, GitBranch } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Optimized for all devices and screen sizes with mobile-first approach."
    },
    {
      icon: Search,
      title: "SEO Optimized",
      description: "Built-in meta tags, structured data, and semantic markup for better search visibility."
    },
    {
      icon: User,
      title: "Developer Friendly",
      description: "Clean code structure with comments and documentation for easy customization."
    },
    {
      icon: Shield,
      title: "Accessibility First",
      description: "WCAG compliant with proper focus management and screen reader support."
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Optimized loading with minimal dependencies and efficient code structure."
    },
    {
      icon: GitBranch,
      title: "Git Ready",
      description: "Pre-configured for version control with proper file structure and documentation."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to start building modern web applications with confidence.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

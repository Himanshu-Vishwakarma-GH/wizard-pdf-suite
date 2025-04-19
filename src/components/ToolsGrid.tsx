import { Link } from 'react-router-dom';
import { FileText, Scissors, FileDown, RotateCw, Droplet, Lock, Unlock, Merge, File } from 'lucide-react';

type ToolCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
};

const ToolCard = ({ title, description, icon, path }: ToolCardProps) => {
  return (
    <Link 
      to={path} 
      className="glass-card p-6 flex flex-col items-center group cursor-pointer"
    >
      <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-4 
                    group-hover:bg-primary/20 transition-all duration-300">
        <div className="text-primary neon-pulse">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2 neon-text">{title}</h3>
      <p className="text-muted-foreground text-center mb-4 transition-colors duration-300 
                  group-hover:text-foreground">
        {description}
      </p>
      <div className="mt-auto neon-border px-4 py-2 rounded-lg opacity-0 transform translate-y-2 
                    transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        Open Tool
      </div>
    </Link>
  );
};

const ToolsGrid = () => {
  const tools = [
    {
      title: "Merge PDF",
      description: "Combine multiple PDFs into a single document.",
      icon: <Merge className="w-8 h-8 text-primary" />,
      path: "/tools/merge"
    },
    {
      title: "Split PDF",
      description: "Separate pages or extract specific ranges from a PDF.",
      icon: <Scissors className="w-8 h-8 text-primary" />,
      path: "/tools/split"
    },
    {
      title: "Compress PDF",
      description: "Reduce PDF file size while maintaining quality.",
      icon: <FileDown className="w-8 h-8 text-primary" />,
      path: "/tools/compress"
    },
    {
      title: "Convert to PDF",
      description: "Turn documents and images into PDF format.",
      icon: <FileText className="w-8 h-8 text-primary" />,
      path: "/tools/convert-to"
    },
    {
      title: "Convert from PDF",
      description: "Transform PDFs into other file formats.",
      icon: <File className="w-8 h-8 text-primary" />,
      path: "/tools/convert-from"
    },
    {
      title: "Rotate PDF",
      description: "Fix page orientation or rotate pages as needed.",
      icon: <RotateCw className="w-8 h-8 text-primary" />,
      path: "/tools/rotate"
    },
    {
      title: "Add Watermark",
      description: "Apply text or image watermarks to your PDFs.",
      icon: <Droplet className="w-8 h-8 text-primary" />,
      path: "/tools/watermark"
    },
    {
      title: "Protect PDF",
      description: "Secure your PDF with password encryption.",
      icon: <Lock className="w-8 h-8 text-primary" />,
      path: "/tools/protect"
    },
    {
      title: "Unlock PDF",
      description: "Remove password protection from PDF files.",
      icon: <Unlock className="w-8 h-8 text-primary" />,
      path: "/tools/unlock"
    },
  ];

  return (
    <section id="tools-section" className="py-16 bg-background/50 backdrop-blur-sm">
      <div className="container-custom">
        <h2 className="text-3xl font-bold text-center mb-12 neon-text">Our PDF Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard 
              key={tool.title}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              path={tool.path}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsGrid;

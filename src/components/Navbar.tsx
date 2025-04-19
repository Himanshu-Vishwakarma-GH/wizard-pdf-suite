
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// PDF tools data for the dropdown
const pdfTools = [
  { name: "Merge PDF", path: "/tools/merge" },
  { name: "Split PDF", path: "/tools/split" },
  { name: "Compress PDF", path: "/tools/compress" },
  { name: "Convert to PDF", path: "/tools/convert-to" },
  { name: "Convert from PDF", path: "/tools/convert-from" },
  { name: "Rotate PDF", path: "/tools/rotate" },
  { name: "Add Watermark", path: "/tools/watermark" },
  { name: "Protect / Unlock PDF", path: "/tools/protect" },
  { name: "Organize PDF", path: "/tools/organize" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary mr-1">PDF</span>
            <span className="text-2xl font-bold text-foreground">Wizard</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-foreground hover:text-primary transition-colors">
                Tools <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {pdfTools.map((tool) => (
                  <DropdownMenuItem key={tool.path} asChild>
                    <Link to={tool.path} className="w-full">
                      {tool.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            
            <Link to="/login" className="neu-button">
              Login
            </Link>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden focus:outline-none" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-foreground hover:text-primary transition-colors w-full justify-between py-2">
                Tools <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {pdfTools.map((tool) => (
                  <DropdownMenuItem key={tool.path} asChild>
                    <Link 
                      to={tool.path} 
                      className="w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {tool.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link 
              to="/about" 
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            <Link 
              to="/contact" 
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            <Link 
              to="/login" 
              className="block py-2 neu-button mt-2 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

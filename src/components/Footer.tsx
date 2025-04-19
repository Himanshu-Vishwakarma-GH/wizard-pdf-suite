
import { Link } from 'react-router-dom';
import { Mail, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary/5 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Tagline */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-xl font-bold text-primary mr-1">PDF</span>
              <span className="text-xl font-bold text-foreground">Wizard</span>
            </Link>
            <p className="text-muted-foreground">
              Fast, free, and secure online PDF solutions.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info and Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-[#0077B5]" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-[#333]" />
              </a>
              <a 
                href="mailto:contact@pdfwizard.com" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-primary" />
              </a>
            </div>
            <p className="text-muted-foreground">
              Email: contact@pdfwizard.com
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-10 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PDF Wizard. All rights reserved. Made with ❤️ by Himanshu
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

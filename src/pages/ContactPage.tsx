
import React from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import ToolLayout from "./ToolLayout";

const ContactPage = () => {
  return (
    <ToolLayout>
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help!
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl">
            <div className="flex items-center justify-center mb-8">
              <Mail className="w-12 h-12 text-primary" />
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Email Us</h2>
              <p className="text-muted-foreground mb-4">
                For support or general inquiries, reach out to us at:
              </p>
              <a 
                href="mailto:contact@pdfwizard.com"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                contact@pdfwizard.com
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default ContactPage;

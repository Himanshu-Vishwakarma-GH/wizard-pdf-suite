
import React from "react";
import { motion } from "framer-motion";
import { FileText, Shield, Zap } from "lucide-react";
import ToolLayout from "./ToolLayout";

const AboutPage = () => {
  return (
    <ToolLayout>
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-center">About PDF Wizard</h1>
          
          <p className="text-lg text-muted-foreground mb-12 text-center">
            We're dedicated to making PDF manipulation simple, secure, and accessible to everyone.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl glass-card"
            >
              <FileText className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-muted-foreground">
                Simple, intuitive interface for all your PDF needs.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl glass-card"
            >
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">100% Secure</h3>
              <p className="text-muted-foreground">
                Your files are processed locally and never stored on our servers.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl glass-card"
            >
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Quick processing for all your PDF operations.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default AboutPage;


import React from "react";
import { motion } from "framer-motion";
import ToolLayout from "./ToolLayout";

const TermsPage = () => {
  return (
    <ToolLayout>
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-lg max-w-none dark:prose-invert"
        >
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using PDF Wizard, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <p className="text-muted-foreground">
              PDF Wizard provides free online PDF manipulation tools. We offer services including but not limited to PDF merging, splitting, compression, conversion, and protection.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Obligations</h2>
            <p className="text-muted-foreground">
              Users agree to use the service responsibly and in compliance with all applicable laws. You agree not to upload malicious files or use the service for any illegal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Privacy & Data Security</h2>
            <p className="text-muted-foreground">
              We do not store your files permanently. All uploaded files are automatically deleted after processing. For more information, please review our Privacy Policy.
            </p>
          </section>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default TermsPage;

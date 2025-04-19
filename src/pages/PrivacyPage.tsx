
import React from "react";
import { motion } from "framer-motion";
import ToolLayout from "./ToolLayout";

const PrivacyPage = () => {
  return (
    <ToolLayout>
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-lg max-w-none dark:prose-invert"
        >
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
            <p className="text-muted-foreground">
              We do not collect personal information unless voluntarily provided. Files uploaded for processing are automatically deleted after completion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">File Security</h2>
            <p className="text-muted-foreground">
              All file processing is done in your browser. Files are not stored on our servers and are automatically deleted after processing is complete.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies & Analytics</h2>
            <p className="text-muted-foreground">
              We use essential cookies to ensure the basic functionality of our website. Analytics help us understand how users interact with our tools.
            </p>
          </section>
        </motion.div>
      </div>
    </ToolLayout>
  );
};

export default PrivacyPage;

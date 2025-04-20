
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { uploadPDF, supabase, ensurePdfsBucketExists } from '@/lib/supabase';

type Operation = 'merge' | 'split' | 'compress' | 'convert-to' | 'convert-from' | 'rotate' | 'watermark' | 'protect' | 'unlock';

export const usePdfOperations = (operation: Operation) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    resultUrl?: string;
    error?: string;
  } | null>(null);
  const { toast } = useToast();
  
  // Check/create bucket on component mount
  useEffect(() => {
    const checkBucket = async () => {
      console.log('Checking for pdfs storage bucket');
      const bucketReady = await ensurePdfsBucketExists();
      if (!bucketReady) {
        toast({
          title: "Storage Setup Issue",
          description: "Could not set up storage for PDF files. Some features may not work.",
          variant: "destructive"
        });
      } else {
        console.log('Storage bucket ready for operation:', operation);
      }
    };
    
    checkBucket();
  }, [toast, operation]);

  const processFiles = async (files: File[], options: any = {}) => {
    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    
    try {
      // Step 1: Upload files to Supabase storage
      setProgress(10);
      console.log('Starting uploads for operation:', operation);
      
      // Ensure bucket exists before upload attempt
      const bucketReady = await ensurePdfsBucketExists();
      if (!bucketReady) {
        throw new Error('PDF storage is not available. Please try again later.');
      }
      
      const uploadPromises = files.map(file => uploadPDF(file, operation));
      const uploadResults = await Promise.all(uploadPromises);
      
      console.log('Upload results:', uploadResults);
      
      const failedUploads = uploadResults.filter(r => !r.success);
      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload one or more files: ${failedUploads.map(f => f.error).join(', ')}`);
      }
      
      // Step 2: Call the appropriate edge function based on operation
      setProgress(30);
      
      const filePaths = uploadResults.map(r => r.filePath);
      console.log(`Calling ${operation} function with file paths:`, filePaths);
      
      // Call edge function
      const { data, error } = await supabase.functions.invoke(
        `pdf-${operation}`,
        {
          body: {
            filePaths,
            ...options
          }
        }
      );
      
      console.log(`${operation} function response:`, { data, error });
      
      if (error) throw error;
      
      setProgress(90);
      
      setResult({
        success: true,
        resultUrl: data.resultUrl
      });
      
      toast({
        title: "Operation completed successfully",
        description: `Your PDF has been ${getOperationPastTense(operation)}.`
      });
      
    } catch (error) {
      console.error(`Error during ${operation} operation:`, error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      
      toast({
        title: "Operation failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };
  
  const getOperationPastTense = (op: Operation): string => {
    switch(op) {
      case 'merge': return 'merged';
      case 'split': return 'split';
      case 'compress': return 'compressed';
      case 'convert-to': return 'converted';
      case 'convert-from': return 'converted';
      case 'rotate': return 'rotated';
      case 'watermark': return 'watermarked';
      case 'protect': return 'protected';
      case 'unlock': return 'unlocked';
    }
  };
  
  return {
    processFiles,
    isProcessing,
    progress,
    result,
    reset: () => setResult(null)
  };
};

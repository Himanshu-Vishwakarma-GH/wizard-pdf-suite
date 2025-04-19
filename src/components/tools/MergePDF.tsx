
import { useState, useRef, useCallback } from 'react';
import { FileText, X, Upload, FileUp, FileDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { usePdfOperations } from '@/hooks/usePdfOperations';
import { Progress } from "@/components/ui/progress";

type UploadedFile = {
  id: string;
  file: File;
};

const MergePDF = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { 
    processFiles, 
    isProcessing, 
    progress, 
    result, 
    reset: resetOperation 
  } = usePdfOperations('merge');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(selectedFiles).forEach((file) => {
      // Check if file is a PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a PDF file.`,
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 10MB for demo)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB size limit.`,
          variant: "destructive",
        });
        return;
      }
      
      newFiles.push({
        id: crypto.randomUUID(),
        file,
      });
    });
    
    if (newFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    
    const newFiles: UploadedFile[] = [];
    
    Array.from(droppedFiles).forEach((file) => {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a PDF file.`,
          variant: "destructive",
        });
        return;
      }
      
      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB size limit.`,
          variant: "destructive",
        });
        return;
      }
      
      newFiles.push({
        id: crypto.randomUUID(),
        file,
      });
    });
    
    if (newFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };
  
  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Not enough files",
        description: "Please upload at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }
    
    // Extract the actual File objects
    const fileObjects = files.map(f => f.file);
    
    // Process the files using our hook
    await processFiles(fileObjects);
  };
  
  const resetProcess = () => {
    setFiles([]);
    resetOperation();
  };
  
  // Helper function to reorder files (drag and drop)
  const moveFile = (fromIndex: number, toIndex: number) => {
    const updatedFiles = [...files];
    const [movedFile] = updatedFiles.splice(fromIndex, 1);
    updatedFiles.splice(toIndex, 0, movedFile);
    setFiles(updatedFiles);
  };
  
  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
  };
  
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const onDrop = (e: React.DragEvent, toIndex: number) => {
    const fromIndex = Number(e.dataTransfer.getData('index'));
    moveFile(fromIndex, toIndex);
  };

  const downloadMergedFile = () => {
    if (!result?.resultUrl) return;
    
    window.open(result.resultUrl, '_blank');
    
    toast({
      title: "Download started",
      description: "Your merged PDF is being downloaded.",
    });
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-foreground/90 tracking-tight">
          Merge PDF Files
        </h1>
        <p className="text-lg text-foreground/80 mb-8">
          Combine multiple PDF documents into a single file. Upload your PDFs, arrange them in your desired order, and merge.
        </p>
        
        {result?.success ? (
          <div className="glass-card p-8 text-center">
            <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-foreground/90">Your PDF is Ready!</h2>
            <p className="text-foreground/80 mb-6">
              Your PDF files have been successfully merged.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={downloadMergedFile}
              >
                <FileDown className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={resetProcess}
                className="border-2 border-primary/30 hover:border-primary/50"
              >
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          <>
            {files.length === 0 ? (
              <div 
                className="upload-area cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-all" />
                <h3 className="text-xl font-semibold mb-2">Upload PDF Files</h3>
                <p className="text-foreground/70 text-center mb-4">
                  Drag and drop PDF files here, or click to browse
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <FileUp className="mr-2 h-4 w-4" /> Select Files
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <FileUp className="mr-2 h-4 w-4" /> Add More Files
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetProcess}
                    className="border-2 border-primary/30 hover:border-primary/50"
                  >
                    Reset
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    multiple
                    accept=".pdf" 
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 text-foreground/90">
                    PDF Files ({files.length})
                  </h3>
                  
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div 
                        key={file.id}
                        className="flex items-center p-4 rounded-lg bg-background/60 border border-primary/20 hover:border-primary/40 transition-all"
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, index)}
                      >
                        <FileText className="h-6 w-6 text-primary mr-3" />
                        <div className="flex-1 truncate">
                          <p className="font-medium text-foreground/90">{file.file.name}</p>
                          <p className="text-sm text-foreground/70">
                            {(file.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 rounded-full hover:bg-background/80 transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="h-5 w-5 text-foreground/70 hover:text-foreground/90" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {isProcessing && (
                  <div className="my-4">
                    <p className="text-center mb-2">Processing...</p>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                
                <div className="text-center pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg"
                    disabled={files.length < 2 || isProcessing}
                    onClick={handleMerge}
                  >
                    {isProcessing ? "Processing..." : "Merge PDFs"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MergePDF;

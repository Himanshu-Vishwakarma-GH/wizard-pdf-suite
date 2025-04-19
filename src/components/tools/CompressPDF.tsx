import { useState, useRef } from 'react';
import { FileText, X, Upload, FileUp, FileDown, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { usePdfOperations } from '@/hooks/usePdfOperations';

type UploadedFile = {
  id: string;
  file: File;
  originalSize: number;
  compressedSize?: number;
};

type CompressionLevel = 'low' | 'medium' | 'high';

const CompressPDF = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { 
    processFiles, 
    isProcessing, 
    progress, 
    result, 
    reset: resetOperation 
  } = usePdfOperations('compress');

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
        originalSize: file.size,
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
        originalSize: file.size,
      });
    });
    
    if (newFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };
  
  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No files to compress",
        description: "Please upload at least one PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // Extract the actual File objects and create options object
    const fileObjects = files.map(f => f.file);
    const options = {
      compressionLevel
    };
    
    // Process the files using our hook
    await processFiles(fileObjects, options);
  };
  
  const downloadCompressedPDF = () => {
    if (!result?.resultUrl) return;
    
    window.open(result.resultUrl, '_blank');
    
    toast({
      title: "Download started",
      description: "Your compressed PDF is being downloaded.",
    });
  };
  
  const resetProcess = () => {
    setFiles([]);
    setCompressionLevel('medium');
    resetOperation();
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Compress PDF</h1>
        <p className="text-muted-foreground mb-8">
          Reduce the size of your PDF files while maintaining quality. Perfect for sharing, uploading, or storing.
        </p>
        
        {result?.success ? (
          <div className="text-center py-10 border-2 border-dashed border-primary/30 rounded-xl">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Compression Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Your PDF has been compressed and is ready to download
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary-hover" onClick={downloadCompressedPDF}>
                <FileDown className="mr-2 h-4 w-4" /> Download Compressed PDF
              </Button>
              <Button variant="outline" onClick={resetProcess}>
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          <>
            {files.length === 0 ? (
              <div 
                className="upload-area cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload PDF Files</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Drag and drop PDF files here, or click to browse
                </p>
                <Button className="bg-primary hover:bg-primary-hover">
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
                    className="bg-primary hover:bg-primary-hover"
                  >
                    <FileUp className="mr-2 h-4 w-4" /> Add More Files
                  </Button>
                  <Button variant="outline" onClick={resetProcess}>
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
                
                <div 
                  className="border rounded-xl p-4 bg-white shadow-sm"
                >
                  <h3 className="font-semibold mb-4">
                    PDF Files ({files.length})
                  </h3>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {files.map((file) => (
                      <div 
                        key={file.id}
                        className="flex items-center p-3 bg-secondary rounded-lg"
                      >
                        <FileText className="h-6 w-6 text-primary mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">{file.file.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{formatFileSize(file.originalSize)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <h3 className="font-semibold mb-4">Compression Settings</h3>
                  
                  <RadioGroup 
                    value={compressionLevel} 
                    onValueChange={(val) => setCompressionLevel(val as CompressionLevel)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-start space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value="low" id="low" className="mt-1" />
                      <div>
                        <Label htmlFor="low" className="font-medium block mb-1">Low Compression</Label>
                        <p className="text-sm text-muted-foreground">
                          Highest quality, minimal size reduction (~10%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 border rounded-lg p-4 bg-primary/5 border-primary">
                      <RadioGroupItem value="medium" id="medium" className="mt-1" />
                      <div>
                        <Label htmlFor="medium" className="font-medium block mb-1">Medium Compression</Label>
                        <p className="text-sm text-muted-foreground">
                          Balanced quality and size reduction (~30%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value="high" id="high" className="mt-1" />
                      <div>
                        <Label htmlFor="high" className="font-medium block mb-1">High Compression</Label>
                        <p className="text-sm text-muted-foreground">
                          Maximum size reduction, lower quality (~50%)
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                {isProcessing && (
                  <div className="my-4">
                    <p className="text-center mb-2">Compressing...</p>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                
                <div className="text-center pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary-hover px-8 py-6 text-lg"
                    disabled={isProcessing || files.length === 0}
                    onClick={handleCompress}
                  >
                    {isProcessing ? "Compressing..." : "Compress PDF"}
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

export default CompressPDF;

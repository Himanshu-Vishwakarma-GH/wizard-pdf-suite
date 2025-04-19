
import { useState, useRef } from 'react';
import { FileText, X, Upload, FileUp, FileDown, CheckCircle, RotateCw, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type UploadedFile = {
  id: string;
  file: File;
};

type PageRotation = {
  pageNumber: number;
  rotation: 0 | 90 | 180 | 270;
};

const RotatePDF = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([]);
  const [rotationComplete, setRotationComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check if file is a PDF
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (limit to 10MB for demo)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size exceeds the 10MB limit.",
        variant: "destructive",
      });
      return;
    }
    
    const newFile = {
      id: crypto.randomUUID(),
      file: selectedFile,
    };
    
    setFile(newFile);
    
    // Simulate getting page count from PDF
    const simulatedPageCount = Math.floor(Math.random() * 10) + 1;
    setPageCount(simulatedPageCount);
    
    // Initialize rotations for all pages
    const initialRotations: PageRotation[] = Array.from(
      { length: simulatedPageCount }, 
      (_, i) => ({ pageNumber: i + 1, rotation: 0 })
    );
    setPageRotations(initialRotations);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    // Check if file is a PDF
    if (droppedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size
    if (droppedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size exceeds the 10MB limit.",
        variant: "destructive",
      });
      return;
    }
    
    const newFile = {
      id: crypto.randomUUID(),
      file: droppedFile,
    };
    
    setFile(newFile);
    
    // Simulate getting page count from PDF
    const simulatedPageCount = Math.floor(Math.random() * 10) + 1;
    setPageCount(simulatedPageCount);
    
    // Initialize rotations for all pages
    const initialRotations: PageRotation[] = Array.from(
      { length: simulatedPageCount }, 
      (_, i) => ({ pageNumber: i + 1, rotation: 0 })
    );
    setPageRotations(initialRotations);
  };
  
  const rotatePageRight = (pageNumber: number) => {
    setPageRotations(prevRotations => 
      prevRotations.map(page => 
        page.pageNumber === pageNumber 
          ? { ...page, rotation: ((page.rotation + 90) % 360) as 0 | 90 | 180 | 270 } 
          : page
      )
    );
  };
  
  const rotatePageLeft = (pageNumber: number) => {
    setPageRotations(prevRotations => 
      prevRotations.map(page => {
        if (page.pageNumber === pageNumber) {
          const newRotation = page.rotation - 90;
          return { 
            ...page, 
            rotation: (newRotation < 0 ? 270 : newRotation) as 0 | 90 | 180 | 270 
          };
        }
        return page;
      })
    );
  };
  
  const rotateAllPages = (degrees: 90 | -90) => {
    setPageRotations(prevRotations => 
      prevRotations.map(page => {
        let newRotation = (page.rotation + degrees) % 360;
        if (newRotation < 0) newRotation += 360;
        return { 
          ...page, 
          rotation: newRotation as 0 | 90 | 180 | 270 
        };
      })
    );
  };
  
  const resetRotations = () => {
    setPageRotations(prevRotations => 
      prevRotations.map(page => ({ ...page, rotation: 0 }))
    );
  };
  
  const handleApplyRotation = () => {
    if (!file) {
      toast({
        title: "No file to rotate",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if any rotations have been applied
    const hasRotations = pageRotations.some(page => page.rotation !== 0);
    if (!hasRotations) {
      toast({
        title: "No rotations applied",
        description: "Please rotate at least one page before applying.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate rotation process
    setTimeout(() => {
      setIsProcessing(false);
      setRotationComplete(true);
      
      toast({
        title: "Rotation complete!",
        description: "Your PDF pages have been rotated successfully.",
      });
    }, 2000);
  };
  
  const downloadRotatedPDF = () => {
    // Create a blob to enable actual download
    const blob = new Blob(['Rotated PDF content would go here'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.file.name ? `rotated-${file.file.name}` : "rotated-document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your rotated PDF is being downloaded.",
    });
  };
  
  const resetProcess = () => {
    setFile(null);
    setPageCount(0);
    setPageRotations([]);
    setRotationComplete(false);
  };
  
  const getPageStyle = (rotation: number) => {
    return {
      transform: `rotate(${rotation}deg)`,
      transition: 'transform 0.3s ease',
    };
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Rotate PDF</h1>
        <p className="text-muted-foreground mb-8">
          Adjust the orientation of your PDF pages. Rotate individual pages or the entire document.
        </p>
        
        {rotationComplete ? (
          <div className="text-center py-10 border-2 border-dashed border-primary/30 rounded-xl">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Rotation Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Your PDF has been rotated according to your specifications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary-hover" onClick={downloadRotatedPDF}>
                <FileDown className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button variant="outline" onClick={resetProcess}>
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          <>
            {!file ? (
              <div 
                className="upload-area cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload PDF File</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Drag and drop a PDF file here, or click to browse
                </p>
                <Button className="bg-primary hover:bg-primary-hover">
                  <FileUp className="mr-2 h-4 w-4" /> Select File
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="font-medium">{file.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pageCount} pages • {(file.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={resetProcess}>
                    Reset
                  </Button>
                </div>
                
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Apply to all pages:</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => rotateAllPages(90)}
                        className="flex items-center gap-1"
                      >
                        <RotateCw className="h-4 w-4" /> Rotate Right
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => rotateAllPages(-90)}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="h-4 w-4" /> Rotate Left
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={resetRotations}
                      >
                        Reset All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {pageRotations.map((page) => (
                      <div key={page.pageNumber} className="border rounded-lg p-3 bg-gray-50">
                        <div className="aspect-w-8 aspect-h-11 mb-3 flex items-center justify-center">
                          <div style={getPageStyle(page.rotation)} className="bg-white border shadow-sm w-full h-full flex items-center justify-center">
                            <span className="text-lg font-semibold">
                              {page.pageNumber}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => rotatePageLeft(page.pageNumber)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium">
                            {page.rotation}°
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => rotatePageRight(page.pageNumber)}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary-hover px-8 py-6 text-lg"
                    disabled={isProcessing}
                    onClick={handleApplyRotation}
                  >
                    {isProcessing ? "Processing..." : "Apply Rotation"}
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

export default RotatePDF;

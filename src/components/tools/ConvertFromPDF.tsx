
import { useState, useRef } from 'react';
import { FileText, X, Upload, FileUp, FileDown, CheckCircle, Image, FileType } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type UploadedFile = {
  id: string;
  file: File;
};

type ConversionFormat = 'docx' | 'jpg' | 'pptx';

const ConvertFromPDF = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionFormat, setConversionFormat] = useState<ConversionFormat>('docx');
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [selectAllPages, setSelectAllPages] = useState(true);
  const [conversionComplete, setConversionComplete] = useState(false);
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
    const simulatedPageCount = Math.floor(Math.random() * 20) + 1;
    setPageCount(simulatedPageCount);
    
    // Select all pages by default
    setSelectedPages(Array.from({ length: simulatedPageCount }, (_, i) => i + 1));
    
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
    const simulatedPageCount = Math.floor(Math.random() * 20) + 1;
    setPageCount(simulatedPageCount);
    
    // Select all pages by default
    setSelectedPages(Array.from({ length: simulatedPageCount }, (_, i) => i + 1));
  };
  
  const toggleAllPages = (checked: boolean) => {
    setSelectAllPages(checked);
    if (checked) {
      setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
    } else {
      setSelectedPages([]);
    }
  };
  
  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages(prev => {
      const isSelected = prev.includes(pageNumber);
      const updatedPages = isSelected
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber].sort((a, b) => a - b);
      
      // Update "Select All" checkbox state
      setSelectAllPages(updatedPages.length === pageCount);
      
      return updatedPages;
    });
  };
  
  const handleConvert = () => {
    if (!file) {
      toast({
        title: "No file to convert",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    if (conversionFormat === 'jpg' && selectedPages.length === 0) {
      toast({
        title: "No pages selected",
        description: "Please select at least one page to convert.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate conversion process
    setTimeout(() => {
      setIsProcessing(false);
      setConversionComplete(true);
      
      toast({
        title: "Conversion complete!",
        description: `Your PDF has been converted to ${getFormatName(conversionFormat)}.`,
      });
    }, 2000);
  };
  
  const downloadConvertedFile = () => {
    // Create a blob to enable actual download
    const mimeType = {
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'application/zip',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }[conversionFormat];
    
    const blob = new Blob(['Converted file content would go here'], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = file?.file.name.replace('.pdf', '') || 'document';
    
    if (conversionFormat === 'jpg' && selectedPages.length > 1) {
      link.download = `${fileName}_images.zip`;
    } else {
      link.download = `${fileName}.${conversionFormat}`;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your converted file is being downloaded.",
    });
  };
  
  const resetProcess = () => {
    setFile(null);
    setPageCount(0);
    setSelectedPages([]);
    setSelectAllPages(true);
    setConversionComplete(false);
    setConversionFormat('docx');
  };
  
  const getFormatName = (format: ConversionFormat) => {
    switch(format) {
      case 'docx': return 'Word Document';
      case 'jpg': return 'JPG Images';
      case 'pptx': return 'PowerPoint Presentation';
    }
  };
  
  const getFormatIcon = (format: ConversionFormat) => {
    switch(format) {
      case 'docx': return <FileText className="h-6 w-6" />;
      case 'jpg': return <Image className="h-6 w-6" />;
      case 'pptx': return <FileType className="h-6 w-6" />;
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Convert from PDF</h1>
        <p className="text-muted-foreground mb-8">
          Transform your PDF into other file formats such as Word documents, images, or PowerPoint presentations.
        </p>
        
        {conversionComplete ? (
          <div className="text-center py-10 border-2 border-dashed border-primary/30 rounded-xl">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Conversion Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Your PDF has been successfully converted to {getFormatName(conversionFormat)}.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary-hover" onClick={downloadConvertedFile}>
                <FileDown className="mr-2 h-4 w-4" /> Download File
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
                  <h3 className="font-semibold mb-4">Convert to:</h3>
                  
                  <RadioGroup 
                    value={conversionFormat} 
                    onValueChange={(val) => setConversionFormat(val as ConversionFormat)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className={`flex items-center space-x-2 border rounded-lg p-4 ${conversionFormat === 'docx' ? 'bg-primary/5 border-primary' : ''}`}>
                      <RadioGroupItem value="docx" id="docx" />
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-primary mr-2" />
                        <Label htmlFor="docx" className="font-medium">Word (.docx)</Label>
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-2 border rounded-lg p-4 ${conversionFormat === 'jpg' ? 'bg-primary/5 border-primary' : ''}`}>
                      <RadioGroupItem value="jpg" id="jpg" />
                      <div className="flex items-center">
                        <Image className="h-6 w-6 text-primary mr-2" />
                        <Label htmlFor="jpg" className="font-medium">Images (.jpg)</Label>
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-2 border rounded-lg p-4 ${conversionFormat === 'pptx' ? 'bg-primary/5 border-primary' : ''}`}>
                      <RadioGroupItem value="pptx" id="pptx" />
                      <div className="flex items-center">
                        <FileType className="h-6 w-6 text-primary mr-2" />
                        <Label htmlFor="pptx" className="font-medium">PowerPoint (.pptx)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  {conversionFormat === 'jpg' && (
                    <div className="mt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox 
                          id="select-all-pages" 
                          checked={selectAllPages}
                          onCheckedChange={(checked) => toggleAllPages(checked as boolean)}
                        />
                        <Label htmlFor="select-all-pages">Select all pages</Label>
                      </div>
                      
                      <div className="grid grid-cols-8 gap-2">
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNum => (
                          <div 
                            key={pageNum}
                            className={`p-2 border rounded text-center cursor-pointer ${
                              selectedPages.includes(pageNum) 
                                ? 'bg-primary text-white' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => togglePageSelection(pageNum)}
                          >
                            {pageNum}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary-hover px-8 py-6 text-lg"
                    disabled={isProcessing}
                    onClick={handleConvert}
                  >
                    {isProcessing ? "Converting..." : `Convert to ${getFormatName(conversionFormat)}`}
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

export default ConvertFromPDF;

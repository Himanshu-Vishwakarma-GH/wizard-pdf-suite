
import { useState, useRef } from 'react';
import { FileText, X, Upload, FileUp, Scissors, FileDown, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

type UploadedFile = {
  id: string;
  file: File;
};

type SplitMode = 'range' | 'extract';
type RangeInfo = { start: number; end: number };

const SplitPDF = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState<RangeInfo[]>([{ start: 1, end: 1 }]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [extractImages, setExtractImages] = useState(false);
  const [splitComplete, setSplitComplete] = useState(false);
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
    
    // Reset ranges and selected pages
    setRanges([{ start: 1, end: simulatedPageCount }]);
    setSelectedPages([1]);
    
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
    
    // Reset ranges and selected pages
    setRanges([{ start: 1, end: simulatedPageCount }]);
    setSelectedPages([1]);
  };
  
  const handleRangeChange = (index: number, field: 'start' | 'end', value: string) => {
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue) || numValue < 1 || numValue > pageCount) return;
    
    const newRanges = [...ranges];
    newRanges[index][field] = numValue;
    
    // Ensure start is never greater than end
    if (field === 'start' && numValue > newRanges[index].end) {
      newRanges[index].end = numValue;
    }
    
    // Ensure end is never less than start
    if (field === 'end' && numValue < newRanges[index].start) {
      newRanges[index].start = numValue;
    }
    
    setRanges(newRanges);
  };
  
  const addRange = () => {
    setRanges([...ranges, { start: 1, end: pageCount }]);
  };
  
  const removeRange = (index: number) => {
    if (ranges.length === 1) return;
    setRanges(ranges.filter((_, i) => i !== index));
  };
  
  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNumber)
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };
  
  const handleSplit = () => {
    if (!file) {
      toast({
        title: "No file to split",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    if (splitMode === 'range' && ranges.length === 0) {
      toast({
        title: "No ranges defined",
        description: "Please define at least one page range.",
        variant: "destructive",
      });
      return;
    }
    
    if (splitMode === 'extract' && selectedPages.length === 0) {
      toast({
        title: "No pages selected",
        description: "Please select at least one page to extract.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate PDF splitting process
    setTimeout(() => {
      setIsProcessing(false);
      setSplitComplete(true);
      
      toast({
        title: "PDF Split Complete!",
        description: "Your PDF has been split successfully.",
      });
    }, 2000);
  };
  
  const downloadSplitPDF = () => {
    // Create a blob to enable actual download
    const blob = new Blob(['Split PDF content would go here'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = "split-document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your PDF is being downloaded.",
    });
  };
  
  const resetProcess = () => {
    setFile(null);
    setPageCount(0);
    setRanges([{ start: 1, end: 1 }]);
    setSelectedPages([]);
    setExtractImages(false);
    setSplitComplete(false);
    setSplitMode('range');
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Split PDF</h1>
        <p className="text-muted-foreground mb-8">
          Separate your PDF into multiple documents by page ranges or extract specific pages. Upload your PDF file to begin.
        </p>
        
        {splitComplete ? (
          <div className="text-center py-10 border-2 border-dashed border-primary/30 rounded-xl">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">PDF Split Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Your PDF has been split according to your specifications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary-hover" onClick={downloadSplitPDF}>
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
                
                <Tabs defaultValue="range" onValueChange={(value) => setSplitMode(value as SplitMode)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="range">Split by Range</TabsTrigger>
                    <TabsTrigger value="extract">Extract Pages</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="range" className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {ranges.map((range, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <Label className="w-12 text-center">From</Label>
                              <Input
                                type="number"
                                value={range.start}
                                onChange={(e) => handleRangeChange(index, 'start', e.target.value)}
                                min={1}
                                max={pageCount}
                                className="w-20"
                              />
                              <Label className="w-12 text-center">To</Label>
                              <Input
                                type="number"
                                value={range.end}
                                onChange={(e) => handleRangeChange(index, 'end', e.target.value)}
                                min={1}
                                max={pageCount}
                                className="w-20"
                              />
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => removeRange(index)}
                                disabled={ranges.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button variant="outline" onClick={addRange} className="w-full mt-2">
                            Add Range
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="extract" className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-5 gap-2">
                          {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNum => (
                            <div 
                              key={pageNum}
                              className={`p-3 border rounded text-center cursor-pointer ${
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
                        
                        <div className="mt-4 flex items-center space-x-2">
                          <Checkbox 
                            id="extract-images" 
                            checked={extractImages}
                            onCheckedChange={(checked) => setExtractImages(checked as boolean)}
                          />
                          <Label htmlFor="extract-images">Extract all images from PDF</Label>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <div className="text-center pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary-hover px-8 py-6 text-lg"
                    disabled={isProcessing}
                    onClick={handleSplit}
                  >
                    {isProcessing ? "Processing..." : "Split PDF"}
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

export default SplitPDF;

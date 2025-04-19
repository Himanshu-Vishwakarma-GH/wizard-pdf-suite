
import { useState, useRef } from 'react';
import { FileText, X, Upload, FileUp, FileDown, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

type UploadedFile = {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document';
};

type Orientation = 'portrait' | 'landscape';
type Margin = 'none' | 'normal' | 'wide';

const ConvertToPDF = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin] = useState<Margin>('normal');
  const [combineImages, setCombineImages] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(selectedFiles).forEach((file) => {
      // Check if file is a supported type
      const acceptedTypes = [
        'image/jpeg', 
        'image/png', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type. Please upload DOCX, PPTX, JPG, or PNG files.`,
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
      
      // Determine file type for preview handling - explicitly cast as UploadedFile type
      const fileType = file.type.startsWith('image/') ? 'image' as const : 'document' as const;
      
      const newFile: UploadedFile = {
        id: crypto.randomUUID(),
        file,
        type: fileType
      };
      
      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setFiles(prevFiles => 
              prevFiles.map(f => 
                f.id === newFile.id 
                  ? { ...f, preview: e.target?.result as string } 
                  : f
              )
            );
          }
        };
        reader.readAsDataURL(file);
      }
      
      newFiles.push(newFile);
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
      // Check if file is a supported type
      const acceptedTypes = [
        'image/jpeg', 
        'image/png', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type. Please upload DOCX, PPTX, JPG, or PNG files.`,
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
      
      // Determine file type for preview handling - explicitly cast as UploadedFile type
      const fileType = file.type.startsWith('image/') ? 'image' as const : 'document' as const;
      
      const newFile: UploadedFile = {
        id: crypto.randomUUID(),
        file,
        type: fileType
      };
      
      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setFiles(prevFiles => 
              prevFiles.map(f => 
                f.id === newFile.id 
                  ? { ...f, preview: e.target?.result as string } 
                  : f
              )
            );
          }
        };
        reader.readAsDataURL(file);
      }
      
      newFiles.push(newFile);
    });
    
    if (newFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };
  
  const handleConvert = () => {
    if (files.length === 0) {
      toast({
        title: "No files to convert",
        description: "Please upload at least one file to convert to PDF.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate PDF conversion process
    setTimeout(() => {
      setIsProcessing(false);
      setConvertedFileUrl("demo-converted-file.pdf"); // Mock URL
      
      toast({
        title: "Conversion complete!",
        description: "Your files have been converted to PDF format.",
      });
    }, 2000);
  };
  
  const resetProcess = () => {
    setFiles([]);
    setConvertedFileUrl(null);
    setOrientation('portrait');
    setMargin('normal');
    setCombineImages(true);
  };
  
  const getFileIcon = (file: UploadedFile) => {
    if (file.type === 'image') {
      return file.preview ? (
        <img 
          src={file.preview} 
          alt={file.file.name} 
          className="h-10 w-10 object-cover rounded" 
        />
      ) : (
        <FileText className="h-6 w-6 text-primary" />
      );
    }
    return <FileText className="h-6 w-6 text-primary" />;
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Convert to PDF</h1>
        <p className="text-muted-foreground mb-8">
          Transform your documents (DOCX, PPTX) and images (JPG, PNG) into professional PDF files. Upload your files, adjust settings, and convert.
        </p>
        
        {convertedFileUrl ? (
          <div className="text-center py-10 border-2 border-dashed border-primary/30 rounded-xl">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Conversion Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Your file(s) have been successfully converted to PDF format.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary-hover">
                <FileDown className="mr-2 h-4 w-4" /> Download PDF
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
                <h3 className="text-xl font-semibold mb-2">Upload Files</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Drag and drop DOCX, PPTX, JPG, or PNG files here, or click to browse
                </p>
                <Button className="bg-primary hover:bg-primary-hover">
                  <FileUp className="mr-2 h-4 w-4" /> Select Files
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple
                  accept=".docx,.pptx,.jpg,.jpeg,.png" 
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
                    accept=".docx,.pptx,.jpg,.jpeg,.png" 
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div 
                    className="border rounded-xl p-4 bg-white shadow-sm"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <h3 className="font-semibold mb-4">
                      Files to Convert ({files.length})
                    </h3>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {files.map((file) => (
                        <div 
                          key={file.id}
                          className="flex items-center p-3 bg-secondary rounded-lg"
                        >
                          {getFileIcon(file)}
                          <div className="flex-1 ml-3 truncate">
                            <p className="font-medium">{file.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.file.size / 1024).toFixed(1)} KB
                            </p>
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
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-4">Conversion Settings</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <Label className="mb-2 block">Page Orientation</Label>
                          <RadioGroup 
                            value={orientation} 
                            onValueChange={(value) => setOrientation(value as Orientation)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="portrait" id="portrait" />
                              <Label htmlFor="portrait">Portrait</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="landscape" id="landscape" />
                              <Label htmlFor="landscape">Landscape</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Margins</Label>
                          <RadioGroup 
                            value={margin} 
                            onValueChange={(value) => setMargin(value as Margin)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id="none" />
                              <Label htmlFor="none">None</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="normal" id="normal" />
                              <Label htmlFor="normal">Normal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wide" id="wide" />
                              <Label htmlFor="wide">Wide</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        {files.filter(f => f.type === 'image').length > 1 && (
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="combine-images" 
                              checked={combineImages}
                              onCheckedChange={(checked) => setCombineImages(checked as boolean)}
                            />
                            <Label htmlFor="combine-images">Combine all images into one PDF</Label>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary-hover px-8 py-6 text-lg"
                    disabled={files.length === 0 || isProcessing}
                    onClick={handleConvert}
                  >
                    {isProcessing ? "Converting..." : "Convert to PDF"}
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

export default ConvertToPDF;

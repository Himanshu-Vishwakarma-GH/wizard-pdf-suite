
import { useState, useRef, ChangeEvent } from 'react';
import { FileText, X, Upload, FileUp, FileDown, CheckCircle, Image, Type } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type UploadedFile = {
  id: string;
  file: File;
};

type WatermarkType = 'text' | 'image';
type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const WatermarkPDF = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState('#FF0000');
  const [watermarkOpacity, setWatermarkOpacity] = useState(30);
  const [watermarkSize, setWatermarkSize] = useState(50);
  const [watermarkAngle, setWatermarkAngle] = useState(45);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('center');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkComplete, setWatermarkComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
  };
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedImage = e.target.files?.[0];
    if (!selectedImage) return;
    
    // Check if file is an image
    if (!selectedImage.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.).",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (limit to 2MB for demo)
    if (selectedImage.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size exceeds the 2MB limit.",
        variant: "destructive",
      });
      return;
    }
    
    setWatermarkImage(selectedImage);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setWatermarkImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(selectedImage);
    
    // Reset the image input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  const handleApplyWatermark = () => {
    if (!file) {
      toast({
        title: "No PDF file",
        description: "Please upload a PDF file first.",
        variant: "destructive",
      });
      return;
    }
    
    if (watermarkType === 'text' && !watermarkText.trim()) {
      toast({
        title: "Empty watermark text",
        description: "Please enter some text for the watermark.",
        variant: "destructive",
      });
      return;
    }
    
    if (watermarkType === 'image' && !watermarkImage) {
      toast({
        title: "No watermark image",
        description: "Please upload an image for the watermark.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate watermarking process
    setTimeout(() => {
      setIsProcessing(false);
      setWatermarkComplete(true);
      
      toast({
        title: "Watermark applied!",
        description: "Your PDF has been watermarked successfully.",
      });
    }, 2000);
  };
  
  const downloadWatermarkedPDF = () => {
    // Create a blob to enable actual download
    const blob = new Blob(['Watermarked PDF content would go here'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.file.name ? `watermarked-${file.file.name}` : "watermarked-document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your watermarked PDF is being downloaded.",
    });
  };
  
  const resetProcess = () => {
    setFile(null);
    setWatermarkType('text');
    setWatermarkText('CONFIDENTIAL');
    setWatermarkColor('#FF0000');
    setWatermarkOpacity(30);
    setWatermarkSize(50);
    setWatermarkAngle(45);
    setWatermarkPosition('center');
    setWatermarkImage(null);
    setWatermarkImagePreview(null);
    setWatermarkComplete(false);
  };
  
  const getPositionName = (position: WatermarkPosition) => {
    switch (position) {
      case 'top-left': return 'Top Left';
      case 'top-center': return 'Top Center';
      case 'top-right': return 'Top Right';
      case 'center-left': return 'Center Left';
      case 'center': return 'Center';
      case 'center-right': return 'Center Right';
      case 'bottom-left': return 'Bottom Left';
      case 'bottom-center': return 'Bottom Center';
      case 'bottom-right': return 'Bottom Right';
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add Watermark to PDF</h1>
        <p className="text-muted-foreground mb-8">
          Apply text or image watermarks to your PDF documents. Customize position, opacity, size, and more.
        </p>
        
        {watermarkComplete ? (
          <div className="text-center py-10 border-2 border-dashed border-primary/30 rounded-xl">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Watermark Applied!</h2>
            <p className="text-muted-foreground mb-6">
              Your PDF has been successfully watermarked.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary-hover" onClick={downloadWatermarkedPDF}>
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
                        {(file.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={resetProcess}>
                    Reset
                  </Button>
                </div>
                
                <Tabs defaultValue="text" onValueChange={(value) => setWatermarkType(value as WatermarkType)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <Type className="h-4 w-4" /> Text Watermark
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-2">
                      <Image className="h-4 w-4" /> Image Watermark
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-6">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div>
                          <Label htmlFor="watermark-text" className="mb-2 block">Watermark Text</Label>
                          <Input 
                            id="watermark-text" 
                            value={watermarkText} 
                            onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="Enter watermark text"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="watermark-color" className="mb-2 block">Color</Label>
                          <div className="flex items-center gap-3">
                            <Input 
                              id="watermark-color" 
                              type="color" 
                              value={watermarkColor}
                              onChange={(e) => setWatermarkColor(e.target.value)}
                              className="w-10 h-10 p-1"
                            />
                            <Input 
                              type="text" 
                              value={watermarkColor}
                              onChange={(e) => setWatermarkColor(e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Opacity: {watermarkOpacity}%</Label>
                          <Slider 
                            value={[watermarkOpacity]} 
                            min={10} 
                            max={100} 
                            step={5}
                            onValueChange={(value) => setWatermarkOpacity(value[0])}
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Size: {watermarkSize}%</Label>
                          <Slider 
                            value={[watermarkSize]} 
                            min={10} 
                            max={100} 
                            step={5}
                            onValueChange={(value) => setWatermarkSize(value[0])}
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Rotation: {watermarkAngle}°</Label>
                          <Slider 
                            value={[watermarkAngle]} 
                            min={0} 
                            max={360} 
                            step={15}
                            onValueChange={(value) => setWatermarkAngle(value[0])}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="image" className="space-y-6">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex flex-col items-center gap-3">
                          {watermarkImagePreview ? (
                            <div className="relative">
                              <img 
                                src={watermarkImagePreview} 
                                alt="Watermark preview" 
                                className="h-32 object-contain border rounded p-2"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-0 right-0 rounded-full"
                                onClick={() => {
                                  setWatermarkImage(null);
                                  setWatermarkImagePreview(null);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => imageInputRef.current?.click()}
                              className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2"
                            >
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <span>Upload Logo or Image</span>
                            </Button>
                          )}
                          <input 
                            type="file" 
                            ref={imageInputRef}
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Opacity: {watermarkOpacity}%</Label>
                          <Slider 
                            value={[watermarkOpacity]} 
                            min={10} 
                            max={100} 
                            step={5}
                            onValueChange={(value) => setWatermarkOpacity(value[0])}
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Size: {watermarkSize}%</Label>
                          <Slider 
                            value={[watermarkSize]} 
                            min={10} 
                            max={100} 
                            step={5}
                            onValueChange={(value) => setWatermarkSize(value[0])}
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Rotation: {watermarkAngle}°</Label>
                          <Slider 
                            value={[watermarkAngle]} 
                            min={0} 
                            max={360} 
                            step={15}
                            onValueChange={(value) => setWatermarkAngle(value[0])}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <Card>
                  <CardContent className="pt-6">
                    <Label className="mb-3 block">Watermark Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['top-left', 'top-center', 'top-right', 
                        'center-left', 'center', 'center-right', 
                        'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                        <div 
                          key={pos}
                          className={`border rounded p-2 cursor-pointer text-center ${
                            watermarkPosition === pos ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setWatermarkPosition(pos as WatermarkPosition)}
                        >
                          {getPositionName(pos as WatermarkPosition)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-center pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary-hover px-8 py-6 text-lg"
                    disabled={isProcessing}
                    onClick={handleApplyWatermark}
                  >
                    {isProcessing ? "Processing..." : "Apply Watermark"}
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

export default WatermarkPDF;

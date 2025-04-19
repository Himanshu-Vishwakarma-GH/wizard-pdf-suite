
import { useState, useRef } from 'react';
import { FileText, X, Upload, FileUp, FileDown, CheckCircle, Unlock, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type UploadedFile = {
  id: string;
  file: File;
};

const UnlockPDF = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlockComplete, setUnlockComplete] = useState(false);
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
  
  const handleUnlock = () => {
    if (!file) {
      toast({
        title: "No file to unlock",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter the password to unlock your PDF.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate unlocking process (in a real app, this would verify the password)
    setTimeout(() => {
      // For demo purposes, always succeed after a delay
      setIsProcessing(false);
      setUnlockComplete(true);
      
      toast({
        title: "PDF Unlocked!",
        description: "Your PDF has been successfully unlocked.",
      });
    }, 2000);
  };
  
  const downloadUnlockedPDF = () => {
    // Create a blob to enable actual download
    const blob = new Blob(['Unlocked PDF content would go here'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.file.name ? `unlocked-${file.file.name}` : "unlocked-document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your unlocked PDF is being downloaded.",
    });
  };
  
  const resetProcess = () => {
    setFile(null);
    setPassword('');
    setShowPassword(false);
    setUnlockComplete(false);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Unlock PDF</h1>
        <p className="text-muted-foreground mb-8">
          Remove password protection from your PDF documents. Enter the correct password to unlock your file.
        </p>
        
        {unlockComplete ? (
          <div className="text-center py-10 border-2 border-dashed border-primary/30 rounded-xl">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">PDF Unlocked!</h2>
            <p className="text-muted-foreground mb-6">
              Your PDF has been successfully unlocked and is ready to download.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary-hover" onClick={downloadUnlockedPDF}>
                <FileDown className="mr-2 h-4 w-4" /> Download Unlocked PDF
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
                <h3 className="text-xl font-semibold mb-2">Upload Protected PDF</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Drag and drop a password-protected PDF file here, or click to browse
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
                
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <div>
                    <Label htmlFor="unlock-password" className="mb-2 block">PDF Password</Label>
                    <div className="relative">
                      <Input 
                        id="unlock-password" 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter PDF password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 px-3"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-6">
                  <Button 
                    className="bg-primary hover:bg-primary-hover px-8 py-6 text-lg"
                    disabled={isProcessing}
                    onClick={handleUnlock}
                  >
                    {isProcessing ? "Processing..." : "Unlock PDF"}
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

export default UnlockPDF;

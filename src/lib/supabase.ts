
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the supabase client for use in other files
export const supabase = supabaseClient;

// File upload helper
export const uploadPDF = async (file: File, folderName: string = 'uploads') => {
  try {
    console.log('Upload attempt started:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });
    
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${folderName}/${fileName}`;
    
    console.log('Attempting upload with path:', filePath);
    
    const { error, data } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file);
    
    console.log('Supabase upload response:', { error, data });
      
    if (error) {
      console.error('Supabase upload error details:', error);
      throw error;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);
    
    console.log('Public URL generated:', publicUrl);
      
    return { success: true, filePath, publicUrl };
  } catch (error) {
    console.error('Comprehensive upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown upload error' };
  }
};

// File deletion helper
export const deletePDF = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('pdfs')
      .remove([filePath]);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error };
  }
};

// Get file URL helper
export const getPdfUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

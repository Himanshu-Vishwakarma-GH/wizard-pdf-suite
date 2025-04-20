
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the supabase client for use in other files
export const supabase = supabaseClient;

// Check if the pdfs bucket exists, create it if it doesn't
export const ensurePdfsBucketExists = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking buckets:', listError);
      return false;
    }
    
    const pdfsBucketExists = buckets.some(bucket => bucket.name === 'pdfs');
    
    if (!pdfsBucketExists) {
      console.log('pdfs bucket does not exist, attempting to create it');
      const { error: createError } = await supabase.storage.createBucket('pdfs', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating pdfs bucket:', createError);
        return false;
      }
      
      console.log('pdfs bucket created successfully');
    } else {
      console.log('pdfs bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error checking/creating bucket:', error);
    return false;
  }
};

// File upload helper
export const uploadPDF = async (file: File, folderName: string = 'uploads') => {
  try {
    // First ensure the bucket exists
    const bucketReady = await ensurePdfsBucketExists();
    if (!bucketReady) {
      console.error('Could not ensure pdfs bucket exists');
      return { success: false, error: 'Storage bucket not available' };
    }
    
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
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
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

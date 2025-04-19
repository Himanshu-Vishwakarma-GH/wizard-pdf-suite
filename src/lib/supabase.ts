
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use default values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Supabase secrets.');
}

// Use Supabase public URLs as fallback when env vars are not set
// This will allow the app to build but functions might not work correctly
const url = supabaseUrl || 'https://placeholder-url.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key);

// File upload helper
export const uploadPDF = async (file: File, folderName: string = 'uploads') => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }
    
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${folderName}/${fileName}`;
    
    const { error, data } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file);
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);
      
    return { success: true, filePath, publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error };
  }
};

// File deletion helper
export const deletePDF = async (filePath: string) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }
    
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
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration is missing. Please check your environment variables.');
    return '';
  }
  
  const { data } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

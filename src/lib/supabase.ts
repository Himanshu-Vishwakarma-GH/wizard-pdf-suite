
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// File upload helper
export const uploadPDF = async (file: File, folderName: string = 'uploads') => {
  try {
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

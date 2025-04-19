
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { filePath, compressionLevel = 'medium' } = await req.json();

    // Download PDF file
    const { data: pdfFile, error: downloadError } = await supabase.storage
      .from('pdfs')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfFile);
    
    // Apply compression settings based on level
    let compressionOptions = {};
    switch (compressionLevel) {
      case 'high':
        compressionOptions = {
          useObjectStreams: true,
          addCompression: true,
          objectsPerStream: 50,
        };
        break;
      case 'medium':
        compressionOptions = {
          useObjectStreams: true,
          addCompression: true,
          objectsPerStream: 20,
        };
        break;
      case 'low':
        compressionOptions = {
          useObjectStreams: false,
          addCompression: true,
          objectsPerStream: 10,
        };
        break;
    }

    // Save with compression options
    const compressedPdfBytes = await pdfDoc.save(compressionOptions);
    const compressedPdfBuffer = new Uint8Array(compressedPdfBytes);
    
    // Upload the compressed PDF back to Supabase storage
    const timestamp = new Date().getTime();
    const compressedFilePath = `compressed/compressed_${timestamp}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(compressedFilePath, compressedPdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });
      
    if (uploadError) throw uploadError;
    
    // Get the public URL for the compressed PDF
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(compressedFilePath);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        resultUrl: publicUrl,
        originalSize: pdfFile.size,
        compressedSize: compressedPdfBuffer.length,
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('PDF Compress Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

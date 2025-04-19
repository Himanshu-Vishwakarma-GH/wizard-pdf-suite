
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

    const { filePaths } = await req.json();

    // Download PDF files
    const pdfFiles = await Promise.all(
      filePaths.map(async (path: string) => {
        const { data, error } = await supabase.storage
          .from('pdfs')
          .download(path);

        if (error) throw error;
        return data;
      })
    );

    // Implement PDF merging using pdf-lib
    const mergedPdf = await PDFDocument.create();
    
    for (const pdfFile of pdfFiles) {
      const pdfDoc = await PDFDocument.load(pdfFile);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }
    
    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBuffer = new Uint8Array(mergedPdfBytes);
    
    // Upload the merged PDF back to Supabase storage
    const timestamp = new Date().getTime();
    const mergedFilePath = `merged/merged_${timestamp}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload(mergedFilePath, mergedPdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });
      
    if (error) throw error;
    
    // Get the public URL for the merged PDF
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(mergedFilePath);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        resultUrl: publicUrl 
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('PDF Merge Error:', error);
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

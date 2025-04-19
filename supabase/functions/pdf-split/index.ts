
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

    const { filePath, pageRanges } = await req.json();

    // Download PDF file
    const { data: pdfFile, error: downloadError } = await supabase.storage
      .from('pdfs')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Load the source PDF
    const sourcePdf = await PDFDocument.load(pdfFile);
    const splitPdfs = [];

    // Process each page range
    for (const range of pageRanges) {
      const newPdf = await PDFDocument.create();
      const [start, end] = range;
      
      // Copy pages from the range
      const pages = await newPdf.copyPages(sourcePdf, Array.from(
        { length: end - start + 1 }, 
        (_, i) => start + i - 1
      ));
      
      pages.forEach(page => newPdf.addPage(page));
      
      // Save the new PDF
      const pdfBytes = await newPdf.save();
      splitPdfs.push(new Uint8Array(pdfBytes));
    }

    // Upload all split PDFs and get their URLs
    const timestamp = new Date().getTime();
    const uploadPromises = splitPdfs.map(async (pdf, index) => {
      const splitFilePath = `split/split_${timestamp}_${index + 1}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(splitFilePath, pdf, {
          contentType: 'application/pdf',
          cacheControl: '3600',
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('pdfs')
        .getPublicUrl(splitFilePath);
        
      return publicUrl;
    });

    const resultUrls = await Promise.all(uploadPromises);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        resultUrls,
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('PDF Split Error:', error);
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

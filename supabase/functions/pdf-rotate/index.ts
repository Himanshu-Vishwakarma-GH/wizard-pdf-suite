
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

    const { filePath, rotation, pages = 'all' } = await req.json();

    // Download PDF file
    const { data: pdfFile, error: downloadError } = await supabase.storage
      .from('pdfs')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfFile);
    const pdfPages = pdfDoc.getPages();
    
    // Determine which pages to rotate
    const pagesToRotate = pages === 'all' 
      ? Array.from({ length: pdfPages.length }, (_, i) => i)
      : Array.isArray(pages) 
        ? pages.map(p => p - 1)
        : [pages - 1];

    // Rotate specified pages
    for (const pageIndex of pagesToRotate) {
      if (pageIndex >= 0 && pageIndex < pdfPages.length) {
        const page = pdfPages[pageIndex];
        const currentRotation = page.getRotation().angle;
        page.setRotation(currentRotation + rotation);
      }
    }

    // Save the rotated PDF
    const rotatedPdfBytes = await pdfDoc.save();
    const rotatedPdfBuffer = new Uint8Array(rotatedPdfBytes);
    
    // Upload the rotated PDF
    const timestamp = new Date().getTime();
    const rotatedFilePath = `rotated/rotated_${timestamp}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(rotatedFilePath, rotatedPdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(rotatedFilePath);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        resultUrl: publicUrl,
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('PDF Rotate Error:', error);
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

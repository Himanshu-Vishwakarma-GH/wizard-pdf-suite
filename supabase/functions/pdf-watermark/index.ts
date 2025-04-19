
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1";
import { degrees } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

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

    const { filePath, watermarkText, options = {} } = await req.json();
    const { opacity = 0.5, rotation = -45, fontSize = 50 } = options;

    // Download PDF file
    const { data: pdfFile, error: downloadError } = await supabase.storage
      .from('pdfs')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfFile);
    const pages = pdfDoc.getPages();
    
    // Get the font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      page.drawText(watermarkText, {
        x: width / 2,
        y: height / 2,
        font: helveticaFont,
        size: fontSize,
        opacity: opacity,
        color: rgb(0.5, 0.5, 0.5),
        rotate: degrees(rotation),
        xSkew: degrees(0),
        ySkew: degrees(0),
      });
    }

    // Save the watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();
    const watermarkedPdfBuffer = new Uint8Array(watermarkedPdfBytes);
    
    // Upload the watermarked PDF
    const timestamp = new Date().getTime();
    const watermarkedFilePath = `watermarked/watermarked_${timestamp}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(watermarkedFilePath, watermarkedPdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(watermarkedFilePath);
    
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
    console.error('PDF Watermark Error:', error);
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

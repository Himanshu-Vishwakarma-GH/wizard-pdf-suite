
// Follow Deno deploy docs at: https://deno.com/deploy/docs

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePaths, password } = await req.json();
    
    console.log("PDF Protect function called with:", { 
      filePaths, 
      passwordProvided: !!password 
    });
    
    // Mock implementation - in real app, this would process the PDF with a library
    // For now, just return a dummy URL to demonstrate the flow
    const resultUrl = `https://protected-pdf-demo.example/protected_${Date.now()}.pdf`;
    
    return new Response(
      JSON.stringify({ success: true, resultUrl }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in pdf-protect function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Change this to your actual Python backend URL when it's deployed
const PYTHON_BACKEND_URL = "https://your-python-backend-url.com";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, filePaths, options } = await req.json();
    
    console.log(`Python PDF Bridge: Processing ${operation} operation with files:`, filePaths);
    
    // Forward the request to the Python backend
    const response = await fetch(`${PYTHON_BACKEND_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        filePaths,
        options,
        supabaseUrl: "https://hvxevtqyqyvhdzudltya.supabase.co",
        // This is a service role key - will be stored as a secret
        // For now using the anon key, but this should be replaced with a secure service role key
        supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eGV2dHF5cXl2aGR6dWRsdHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzEwMzcsImV4cCI6MjA2MDY0NzAzN30.v1hm5uMbMFqCogENXFBAHm01UzBD8MI7YIvBMHQm4ko"
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Python backend returned error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Python backend response:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in python-pdf-bridge function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error in PDF processing'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

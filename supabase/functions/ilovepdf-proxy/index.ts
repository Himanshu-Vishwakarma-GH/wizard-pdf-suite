import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ILOVEPDF_PUBLIC_KEY = Deno.env.get("ILOVEPDF_PUBLIC_KEY");
const ILOVEPDF_SECRET_KEY = Deno.env.get("ILOVEPDF_SECRET_KEY");

/**
 * Helper to create a new iLovePDF task
 */
async function createTask(operation: string) {
  const response = await fetch(`https://api.ilovepdf.com/v1/start/${operation}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_key: ILOVEPDF_PUBLIC_KEY }),
  });
  if (!response.ok) throw new Error("Failed to create iLovePDF task");
  return await response.json();
}

/**
 * Download a file from a public URL as ArrayBuffer (Deno Blob)
 */
async function fetchFileBuffer(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch file from storage");
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Upload a file to iLovePDF for the given task
 */
async function uploadFileToTask(taskServer: string, taskId: string, fileBuffer: Uint8Array, filename: string) {
  // iLovePDF upload requires multipart/form-data, which Deno does not natively support as the browser would,
  // so we have to build the body manually.
  const boundary = "----ilovepdfboundary" + Math.random().toString(36).slice(2);
  const line = `\r\n`;

  // Prepare fields
  const meta = 
    `--${boundary}${line}` +
    `Content-Disposition: form-data; name="task"\r\n\r\n${taskId}${line}` +
    `--${boundary}${line}` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: application/pdf\r\n\r\n`;

  const trailer = `${line}--${boundary}--${line}`;

  // Build the multipart body
  const metaUint = new TextEncoder().encode(meta);
  const trailerUint = new TextEncoder().encode(trailer);

  const body = new Uint8Array(metaUint.length + fileBuffer.length + trailerUint.length);
  body.set(metaUint, 0);
  body.set(fileBuffer, metaUint.length);
  body.set(trailerUint, metaUint.length + fileBuffer.length);

  const response = await fetch(`${taskServer}/v1/upload`, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
  if (!response.ok) throw new Error("Failed to upload file to iLovePDF task");
  return await response.json();
}

/**
 * Process the iLovePDF task (for example, "merge" will output merged PDF)
 */
async function processTask(taskServer: string, taskId: string, params: Record<string, unknown> = {}) {
  const response = await fetch(`${taskServer}/v1/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: taskId, ...params }),
  });
  if (!response.ok) throw new Error("Failed to process iLovePDF task");
  return await response.json();
}

/**
 * Download the result file - returns the direct download URL from iLovePDF
 */
async function getDownloadUrl(taskServer: string, taskId: string) {
  // iLovePDF returns the download URL in process response, but you can also check
  // the download endpoint for bigger tasks (here, just use taskServer/v1/download)
  const response = await fetch(`${taskServer}/v1/download`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    // parameters via query: ?task=...
  });
  if (!response.ok) throw new Error("Failed to download processed PDF from iLovePDF");
  // This is a ZIP for most tasks - you can just forward the link
  // To get a direct link, need to parse the response, but here we assume it's a file download
  // So instead, we return the download endpoint with ?task=...
  // Many clients simply keep the download url with ?task=...
  return `${taskServer}/v1/download?task=${taskId}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ILOVEPDF_PUBLIC_KEY || !ILOVEPDF_SECRET_KEY) {
      throw new Error('iLovePDF API credentials are not configured');
    }

    const { operation, files, options } = await req.json();
    if (!operation || !Array.isArray(files) || files.length === 0) {
      throw new Error('Missing operation or files');
    }

    // For now, only implement merge fully; other operations can be added similarly
    if (operation !== 'merge') {
      return new Response(JSON.stringify({
        success: false,
        error: `Operation '${operation}' not implemented in iLovePDF proxy yet. Only 'merge' is supported.`,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    // 1. Create the task
    const { server: taskServer, task } = await createTask("merge");

    // 2. Upload every file to the task
    for (let fileUrl of files) {
      // Retrieve file name from URL (Supabase file paths)
      const filename = fileUrl.split("/").pop() || "file.pdf";
      const fileBuffer = await fetchFileBuffer(fileUrl);
      await uploadFileToTask(taskServer, task, fileBuffer, filename);
    }

    // 3. Process the merge task
    await processTask(taskServer, task);

    // 4. Generate download URL for result
    const downloadUrl = await getDownloadUrl(taskServer, task);

    return new Response(
      JSON.stringify({
        success: true,
        resultUrl: downloadUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[iLovePDF Edge Function Error]:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error in iLovePDF proxy',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


-- Create storage bucket for PDF files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true) 
ON CONFLICT (id) DO NOTHING;

-- Set public access policy for the pdfs bucket
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Public Read Access',
  '(bucket_id = ''pdfs''::text)',
  'pdfs'
) ON CONFLICT (name, bucket_id) DO NOTHING;

-- Create policy for authenticated uploads
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Authenticated Users Upload',
  '(bucket_id = ''pdfs''::text) AND (auth.role() = ''authenticated''::text)',
  'pdfs'
) ON CONFLICT (name, bucket_id) DO NOTHING;

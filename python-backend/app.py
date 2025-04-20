
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import io
import json
import uuid
import logging
from werkzeug.utils import secure_filename
import tempfile

# PDF processing libraries
import PyPDF2
from reportlab.pdfgen import canvas
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('pdf-processor')

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "pdf-processor"})

@app.route('/process', methods=['POST'])
def process_pdf():
    try:
        data = request.json
        operation = data.get('operation')
        file_paths = data.get('filePaths', [])
        options = data.get('options', {})
        
        # Supabase credentials for storage access
        supabase_url = data.get('supabaseUrl')
        supabase_key = data.get('supabaseKey')
        
        logger.info(f"Processing operation: {operation} with {len(file_paths)} files")
        
        if not operation or not file_paths or not supabase_url or not supabase_key:
            logger.error("Missing required parameters")
            return jsonify({
                'success': False,
                'error': 'Missing required parameters'
            }), 400
        
        # Download files from Supabase storage
        temp_files = []
        for file_path in file_paths:
            logger.info(f"Downloading file: {file_path}")
            temp_file = download_from_supabase(supabase_url, supabase_key, file_path)
            if temp_file:
                temp_files.append(temp_file)
        
        if not temp_files:
            logger.error("Failed to download files from storage")
            return jsonify({
                'success': False,
                'error': 'Failed to download files from storage'
            }), 500
        
        # Process based on operation type
        result_file = None
        
        if operation == 'merge':
            result_file = merge_pdfs(temp_files)
        elif operation == 'split':
            result_file = split_pdf(temp_files[0], options.get('pages', []))
        elif operation == 'compress':
            result_file = compress_pdf(temp_files[0])
        elif operation == 'rotate':
            result_file = rotate_pdf(temp_files[0], options.get('angle', 90))
        elif operation == 'watermark':
            result_file = add_watermark(temp_files[0], options.get('watermarkText', 'Watermark'))
        elif operation == 'protect':
            result_file = protect_pdf(temp_files[0], options.get('password', ''))
        elif operation == 'unlock':
            result_file = unlock_pdf(temp_files[0], options.get('password', ''))
        elif operation == 'convert-to':
            result_file = convert_to_pdf(temp_files[0])
        elif operation == 'convert-from':
            result_file = convert_from_pdf(temp_files[0], options.get('format', 'jpg'))
        else:
            logger.error(f"Unknown operation: {operation}")
            return jsonify({
                'success': False,
                'error': f'Unknown operation: {operation}'
            }), 400
        
        if not result_file:
            logger.error("Failed to process PDF")
            return jsonify({
                'success': False,
                'error': 'Failed to process PDF'
            }), 500
        
        # Upload result to Supabase
        result_path = f"results/{operation}_{uuid.uuid4()}.pdf"
        logger.info(f"Uploading result to {result_path}")
        upload_result = upload_to_supabase(supabase_url, supabase_key, result_path, result_file)
        
        if not upload_result.get('success'):
            logger.error(f"Failed to upload result: {upload_result.get('error')}")
            return jsonify({
                'success': False,
                'error': upload_result.get('error', 'Failed to upload result')
            }), 500
        
        # Clean up temp files
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except Exception as e:
                logger.warning(f"Failed to clean up temp file {temp_file}: {str(e)}")
        
        try:
            os.unlink(result_file)
        except Exception as e:
            logger.warning(f"Failed to clean up result file {result_file}: {str(e)}")
        
        logger.info("Processing completed successfully")
        return jsonify({
            'success': True,
            'resultUrl': upload_result.get('publicUrl')
        })
        
    except Exception as e:
        logger.exception(f"Error processing PDF: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def download_from_supabase(supabase_url, supabase_key, file_path):
    try:
        url = f"{supabase_url}/storage/v1/object/public/pdfs/{file_path}"
        logger.info(f"Downloading from URL: {url}")
        
        response = requests.get(
            url,
            headers={
                "apikey": supabase_key
            }
        )
        
        if not response.ok:
            logger.error(f"Failed to download from Supabase: {response.status_code} - {response.text}")
            return None
        
        # Save to temp file
        fp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        fp.write(response.content)
        fp.close()
        logger.info(f"File downloaded to: {fp.name}")
        return fp.name
    except Exception as e:
        logger.exception(f"Error downloading from Supabase: {str(e)}")
        return None

def upload_to_supabase(supabase_url, supabase_key, file_path, local_file_path):
    try:
        with open(local_file_path, 'rb') as f:
            file_data = f.read()
        
        url = f"{supabase_url}/storage/v1/object/pdfs/{file_path}"
        logger.info(f"Uploading to URL: {url}")
        
        response = requests.post(
            url,
            headers={
                "apikey": supabase_key,
                "Content-Type": "application/pdf"
            },
            data=file_data
        )
        
        if not response.ok:
            logger.error(f"Failed to upload to Supabase: {response.status_code} - {response.text}")
            return {
                'success': False,
                'error': f"Upload failed: {response.text}"
            }
        
        public_url = f"{supabase_url}/storage/v1/object/public/pdfs/{file_path}"
        logger.info(f"File uploaded successfully. Public URL: {public_url}")
        return {
            'success': True,
            'publicUrl': public_url
        }
    except Exception as e:
        logger.exception(f"Error uploading to Supabase: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

# PDF Operations Implementation
def merge_pdfs(input_files):
    try:
        logger.info(f"Merging {len(input_files)} PDF files")
        merger = PyPDF2.PdfMerger()
        
        for file in input_files:
            merger.append(file)
        
        output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        merger.write(output)
        merger.close()
        output.close()
        
        return output.name
    except Exception as e:
        logger.exception(f"Error merging PDFs: {str(e)}")
        return None

def split_pdf(input_file, pages):
    try:
        logger.info(f"Splitting PDF, extracting pages: {pages}")
        reader = PyPDF2.PdfReader(input_file)
        writer = PyPDF2.PdfWriter()
        
        if not pages:
            # If no pages specified, extract first page by default
            writer.add_page(reader.pages[0])
        else:
            for page_num in pages:
                if 0 <= page_num < len(reader.pages):
                    writer.add_page(reader.pages[page_num])
        
        output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        writer.write(output)
        output.close()
        
        return output.name
    except Exception as e:
        logger.exception(f"Error splitting PDF: {str(e)}")
        return None

def compress_pdf(input_file):
    # Placeholder for actual compression logic
    # For real compression, you might need more specialized libraries
    logger.info("Compression operation requested (placeholder implementation)")
    return input_file

def rotate_pdf(input_file, angle):
    try:
        logger.info(f"Rotating PDF by {angle} degrees")
        reader = PyPDF2.PdfReader(input_file)
        writer = PyPDF2.PdfWriter()
        
        for page in reader.pages:
            page.rotate(angle)
            writer.add_page(page)
        
        output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        writer.write(output)
        output.close()
        
        return output.name
    except Exception as e:
        logger.exception(f"Error rotating PDF: {str(e)}")
        return None

def add_watermark(input_file, watermark_text):
    try:
        logger.info(f"Adding watermark text: {watermark_text}")
        # Create watermark
        watermark_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        c = canvas.Canvas(watermark_file.name)
        c.setFont("Helvetica", 50)
        c.setFillColorRGB(0.5, 0.5, 0.5, alpha=0.3)  # gray with 30% opacity
        c.saveState()
        c.translate(300, 400)
        c.rotate(45)
        c.drawCentredString(0, 0, watermark_text)
        c.restoreState()
        c.save()
        
        # Apply watermark
        reader = PyPDF2.PdfReader(input_file)
        watermark_reader = PyPDF2.PdfReader(watermark_file.name)
        watermark_page = watermark_reader.pages[0]
        
        writer = PyPDF2.PdfWriter()
        
        for page in reader.pages:
            page.merge_page(watermark_page)
            writer.add_page(page)
        
        output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        writer.write(output)
        output.close()
        
        # Clean up
        watermark_file.close()
        os.unlink(watermark_file.name)
        
        return output.name
    except Exception as e:
        logger.exception(f"Error adding watermark: {str(e)}")
        return None

def protect_pdf(input_file, password):
    try:
        logger.info("Protecting PDF with password")
        reader = PyPDF2.PdfReader(input_file)
        writer = PyPDF2.PdfWriter()
        
        for page in reader.pages:
            writer.add_page(page)
        
        writer.encrypt(password)
        
        output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        writer.write(output)
        output.close()
        
        return output.name
    except Exception as e:
        logger.exception(f"Error protecting PDF: {str(e)}")
        return None

def unlock_pdf(input_file, password):
    try:
        logger.info("Unlocking PDF")
        reader = PyPDF2.PdfReader(input_file)
        
        if reader.is_encrypted:
            reader.decrypt(password)
        
        writer = PyPDF2.PdfWriter()
        
        for page in reader.pages:
            writer.add_page(page)
        
        output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        writer.write(output)
        output.close()
        
        return output.name
    except Exception as e:
        logger.exception(f"Error unlocking PDF: {str(e)}")
        return None

def convert_to_pdf(input_file):
    # Placeholder for actual conversion logic
    # For real conversion, you would use libraries specific to the input format
    logger.info("Convert-to-PDF operation requested (placeholder implementation)")
    return input_file

def convert_from_pdf(input_file, format):
    # Placeholder for actual conversion logic
    # For real conversion, you might need specialized libraries like pdf2image
    logger.info(f"Convert-from-PDF to {format} requested (placeholder implementation)")
    return input_file

if __name__ == '__main__':
    logger.info("Starting PDF processing server on port 8000")
    app.run(host='0.0.0.0', port=8000)

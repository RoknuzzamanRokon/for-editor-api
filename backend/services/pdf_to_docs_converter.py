"""
PDF to Docs Converter Service for converting PDFs to Word documents
"""
import os
import threading
from pathlib import Path
from typing import Optional, Tuple
from pdf2docx import Converter
import pdfplumber
from docx import Document


class ConversionTimeoutError(Exception):
    """Exception raised when conversion takes too long"""
    pass


class TimeoutContext:
    """Context manager for timeout operations"""
    
    def __init__(self, seconds: int):
        self.seconds = seconds
        self.timer = None
        self.timed_out = False
    
    def _timeout_handler(self):
        """Handler called when timeout occurs"""
        self.timed_out = True
    
    def __enter__(self):
        """Start the timeout timer"""
        if self.seconds > 0:
            self.timer = threading.Timer(self.seconds, self._timeout_handler)
            self.timer.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Cancel the timeout timer"""
        if self.timer:
            self.timer.cancel()
        
        # If we timed out, raise the exception
        if self.timed_out:
            raise ConversionTimeoutError(f"Operation timed out after {self.seconds} seconds")
        
        return False


class PDFToDocsConverterService:
    """Service for converting PDF files to Word document format"""
    
    # Default timeout for conversion operations (in seconds)
    DEFAULT_TIMEOUT = 60
    
    def __init__(self, timeout: int = DEFAULT_TIMEOUT):
        """
        Initialize PDFToDocsConverterService
        
        Args:
            timeout: Maximum time in seconds for conversion operations
        """
        self.timeout = timeout
    
    def convert_pdf_to_docx(self, pdf_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
        """
        Convert PDF file to Word document format
        
        This method handles the conversion from PDF to .docx format, preserving
        text content, images, and basic formatting where possible. The pdf2docx
        library automatically handles:
        - Text content preservation (Requirement 2.2)
        - Basic formatting preservation (fonts, colors, alignment) (Requirement 2.3)
        - Image preservation from PDF (Requirement 2.4)
        
        Includes timeout mechanism and comprehensive error handling.
        
        Args:
            pdf_path: Path to input PDF file
            output_path: Path where .docx file should be saved
            
        Returns:
            Tuple of (success: bool, error_message: Optional[str])
            
        Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
        """
        try:
            # Validate input file exists
            if not os.path.exists(pdf_path):
                return False, f"PDF file not found: {pdf_path}"
            
            # Validate input is a file
            if not os.path.isfile(pdf_path):
                return False, f"Path is not a file: {pdf_path}"
            
            # Validate PDF content
            has_content, validation_error = self._validate_pdf_content(pdf_path)
            
            # If validation failed with an error (corrupted PDF), return error
            if validation_error:
                return False, validation_error
            
            # Ensure output directory exists
            output_dir = os.path.dirname(output_path)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
            
            # If PDF has no content, create a .docx with a message
            if not has_content:
                try:
                    doc = Document()
                    doc.add_paragraph("No extractable content was found in the PDF file.")
                    doc.save(output_path)
                    return True, None
                except Exception as e:
                    return False, f"Failed to create Word document: {str(e)}"
            
            # Perform conversion with timeout
            try:
                with TimeoutContext(self.timeout) as timeout_ctx:
                    # Create converter instance
                    cv = Converter(pdf_path)
                    
                    # Check for timeout before conversion
                    if timeout_ctx.timed_out:
                        cv.close()
                        return False, "Conversion timed out - PDF is too large or complex"
                    
                    # Convert PDF to DOCX with all content preservation options
                    # The pdf2docx library automatically preserves:
                    # - Text content (Requirement 2.2)
                    # - Images embedded in the PDF (Requirement 2.4)
                    # - Basic formatting like fonts, colors, alignment (Requirement 2.3)
                    cv.convert(output_path, start=0, end=None)
                    cv.close()
                    
            except ConversionTimeoutError:
                return False, "Conversion timed out - PDF is too large or complex"
            except PermissionError as e:
                return False, f"Permission denied: Cannot write to {output_path}"
            except Exception as e:
                # Handle corrupted or invalid PDFs
                error_msg = str(e).lower()
                if "pdf" in error_msg or "corrupt" in error_msg or "invalid" in error_msg:
                    return False, "PDF file is corrupted or invalid"
                return False, f"Conversion failed: {str(e)}"
            
            # Verify output file was created
            if not os.path.exists(output_path):
                return False, "Failed to create Word document"
            
            # Verify output file has content
            if os.path.getsize(output_path) == 0:
                return False, "Generated Word document is empty"
            
            return True, None
        
        except PermissionError as e:
            return False, f"Permission denied: {str(e)}"
        except Exception as e:
            # Catch any unexpected errors
            return False, f"Unexpected error during conversion: {str(e)}"
    
    def _validate_pdf_content(self, pdf_path: str) -> Tuple[bool, Optional[str]]:
        """
        Validate PDF has extractable content
        
        This method checks if the PDF file contains any extractable text or images.
        It helps identify empty PDFs or PDFs that may not convert meaningfully.
        
        Args:
            pdf_path: Path to the PDF file to validate
            
        Returns:
            Tuple of (has_content: bool, error_message: Optional[str])
            - has_content: True if PDF has extractable content, False if empty
            - error_message: None if validation succeeded, error string if PDF is corrupted
            
        Requirements: 2.5
        """
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Check if PDF has any pages
                if not pdf.pages or len(pdf.pages) == 0:
                    return False, None
                
                # Check each page for text or images
                for page in pdf.pages:
                    # Check for text content
                    text = page.extract_text()
                    if text and text.strip():
                        return True, None
                    
                    # Check for images
                    images = page.images
                    if images and len(images) > 0:
                        return True, None
                
                # No content found in any page
                return False, None
                
        except Exception as e:
            # Handle corrupted or invalid PDFs
            error_msg = str(e).lower()
            if "pdf" in error_msg or "corrupt" in error_msg or "invalid" in error_msg or "decrypt" in error_msg:
                return False, "PDF file is corrupted or invalid"
            # For other errors, treat as corrupted
            return False, f"Failed to validate PDF: {str(e)}"

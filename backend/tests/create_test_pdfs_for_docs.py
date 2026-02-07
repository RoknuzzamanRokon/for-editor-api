"""
Script to create test PDF files for PDF to Docs conversion testing
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from pathlib import Path
from PIL import Image as PILImage
import io


def create_simple_text_pdf():
    """Create a PDF with plain text content"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "simple_text.pdf"
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Add title
    elements.append(Paragraph("Simple Text Document", styles['Title']))
    elements.append(Spacer(1, 12))
    
    # Add some paragraphs
    elements.append(Paragraph("Introduction", styles['Heading1']))
    elements.append(Spacer(1, 6))
    
    text = """This is a simple text document created for testing PDF to Word conversion. 
    It contains multiple paragraphs of plain text without any special formatting, 
    images, or complex layouts."""
    elements.append(Paragraph(text, styles['Normal']))
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph("Body Content", styles['Heading1']))
    elements.append(Spacer(1, 6))
    
    text2 = """Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."""
    elements.append(Paragraph(text2, styles['Normal']))
    
    doc.build(elements)
    return pdf_path


def create_pdf_with_images():
    """Create a PDF with embedded images"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "with_images.pdf"
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Add title
    elements.append(Paragraph("Document with Images", styles['Title']))
    elements.append(Spacer(1, 12))
    
    # Add text
    elements.append(Paragraph("This document contains embedded images.", styles['Normal']))
    elements.append(Spacer(1, 12))
    
    # Create a simple test image (red square)
    img1 = PILImage.new('RGB', (200, 200), color='red')
    img1_buffer = io.BytesIO()
    img1.save(img1_buffer, format='PNG')
    img1_buffer.seek(0)
    
    # Add first image
    img1_reportlab = Image(img1_buffer, width=2*inch, height=2*inch)
    elements.append(img1_reportlab)
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph("Image 1: A red square", styles['Normal']))
    elements.append(Spacer(1, 24))
    
    # Create another test image (blue square)
    img2 = PILImage.new('RGB', (200, 200), color='blue')
    img2_buffer = io.BytesIO()
    img2.save(img2_buffer, format='PNG')
    img2_buffer.seek(0)
    
    # Add second image
    img2_reportlab = Image(img2_buffer, width=2*inch, height=2*inch)
    elements.append(img2_reportlab)
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph("Image 2: A blue square", styles['Normal']))
    
    doc.build(elements)
    return pdf_path


def create_multipage_doc_pdf():
    """Create a PDF with multiple pages"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "multipage_doc.pdf"
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Page 1
    elements.append(Paragraph("Multi-Page Document", styles['Title']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Page 1", styles['Heading1']))
    elements.append(Spacer(1, 12))
    
    text1 = """This is the first page of a multi-page document. 
    It demonstrates how the PDF to Word converter handles documents 
    that span multiple pages with different content on each page."""
    elements.append(Paragraph(text1, styles['Normal']))
    
    # Force page break
    elements.append(PageBreak())
    
    # Page 2
    elements.append(Paragraph("Page 2", styles['Heading1']))
    elements.append(Spacer(1, 12))
    
    text2 = """This is the second page. It contains different content 
    from the first page. The converter should preserve the page structure 
    and content organization."""
    elements.append(Paragraph(text2, styles['Normal']))
    
    # Force page break
    elements.append(PageBreak())
    
    # Page 3
    elements.append(Paragraph("Page 3", styles['Heading1']))
    elements.append(Spacer(1, 12))
    
    text3 = """This is the third and final page of the document. 
    All three pages should be converted and preserved in the output Word document."""
    elements.append(Paragraph(text3, styles['Normal']))
    
    doc.build(elements)
    return pdf_path


def create_formatted_doc_pdf():
    """Create a PDF with formatting (bold, italic, etc.)"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "formatted_doc.pdf"
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Create custom styles
    centered_style = ParagraphStyle(
        'Centered',
        parent=styles['Normal'],
        alignment=TA_CENTER
    )
    
    justified_style = ParagraphStyle(
        'Justified',
        parent=styles['Normal'],
        alignment=TA_JUSTIFY
    )
    
    # Add title
    elements.append(Paragraph("Formatted Document", styles['Title']))
    elements.append(Spacer(1, 12))
    
    # Bold text
    elements.append(Paragraph("<b>This text is bold</b>", styles['Normal']))
    elements.append(Spacer(1, 6))
    
    # Italic text
    elements.append(Paragraph("<i>This text is italic</i>", styles['Normal']))
    elements.append(Spacer(1, 6))
    
    # Bold and italic
    elements.append(Paragraph("<b><i>This text is bold and italic</i></b>", styles['Normal']))
    elements.append(Spacer(1, 12))
    
    # Different heading levels
    elements.append(Paragraph("Heading Level 1", styles['Heading1']))
    elements.append(Paragraph("Heading Level 2", styles['Heading2']))
    elements.append(Paragraph("Heading Level 3", styles['Heading3']))
    elements.append(Spacer(1, 12))
    
    # Centered text
    elements.append(Paragraph("This text is centered", centered_style))
    elements.append(Spacer(1, 12))
    
    # Justified text
    justified_text = """This is a longer paragraph with justified alignment. 
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
    nisi ut aliquip ex ea commodo consequat."""
    elements.append(Paragraph(justified_text, justified_style))
    elements.append(Spacer(1, 12))
    
    # Mixed formatting
    mixed_text = """This paragraph contains <b>bold</b>, <i>italic</i>, 
    and <b><i>bold italic</i></b> text all mixed together in a single paragraph."""
    elements.append(Paragraph(mixed_text, styles['Normal']))
    
    doc.build(elements)
    return pdf_path


def create_empty_doc_pdf():
    """Create a PDF with no extractable content"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "empty_doc.pdf"
    
    # Create a minimal PDF with just the document structure but no content
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    # Build with empty elements list - creates a valid PDF with no content
    doc.build(elements)
    return pdf_path


def create_corrupted_pdf():
    """Create an invalid/corrupted PDF file"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "corrupted.pdf"
    
    # Write invalid content that looks like a PDF but isn't valid
    with open(pdf_path, 'w') as f:
        f.write("%PDF-1.4\n")
        f.write("This is not a valid PDF file content.\n")
        f.write("It has the PDF header but corrupted body.\n")
        f.write("%%EOF\n")
    
    return pdf_path


if __name__ == "__main__":
    print("Creating test PDF files for docs conversion...")
    
    simple_text = create_simple_text_pdf()
    print(f"Created: {simple_text}")
    
    with_images = create_pdf_with_images()
    print(f"Created: {with_images}")
    
    multipage = create_multipage_doc_pdf()
    print(f"Created: {multipage}")
    
    formatted = create_formatted_doc_pdf()
    print(f"Created: {formatted}")
    
    empty = create_empty_doc_pdf()
    print(f"Created: {empty}")
    
    corrupted = create_corrupted_pdf()
    print(f"Created: {corrupted}")
    
    print("All test PDFs for docs conversion created successfully!")

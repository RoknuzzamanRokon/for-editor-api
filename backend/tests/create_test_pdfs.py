"""
Script to create test PDF files with tables for testing
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from pathlib import Path


def create_simple_table_pdf():
    """Create a PDF with a simple table"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "simple_table.pdf"
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    # Create a simple table
    data = [
        ['Name', 'Age', 'City'],
        ['John Doe', '30', 'New York'],
        ['Jane Smith', '25', 'Los Angeles'],
        ['Bob Johnson', '35', 'Chicago']
    ]
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    return pdf_path


def create_multiple_tables_pdf():
    """Create a PDF with multiple tables"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "multiple_tables.pdf"
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # First table
    elements.append(Paragraph("Table 1: Employee Data", styles['Heading2']))
    elements.append(Spacer(1, 12))
    
    data1 = [
        ['Name', 'Department'],
        ['Alice', 'Engineering'],
        ['Bob', 'Marketing']
    ]
    
    table1 = Table(data1)
    table1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table1)
    elements.append(Spacer(1, 24))
    
    # Second table
    elements.append(Paragraph("Table 2: Sales Data", styles['Heading2']))
    elements.append(Spacer(1, 12))
    
    data2 = [
        ['Product', 'Price', 'Quantity'],
        ['Widget A', '$10', '100'],
        ['Widget B', '$20', '50']
    ]
    
    table2 = Table(data2)
    table2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table2)
    doc.build(elements)
    
    return pdf_path


def create_multipage_pdf():
    """Create a PDF with tables on multiple pages"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "multipage_table.pdf"
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Page 1 table
    elements.append(Paragraph("Page 1: Q1 Data", styles['Heading1']))
    elements.append(Spacer(1, 12))
    
    data1 = [
        ['Month', 'Revenue'],
        ['January', '$1000'],
        ['February', '$1200'],
        ['March', '$1100']
    ]
    
    table1 = Table(data1)
    table1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table1)
    elements.append(Spacer(1, 400))  # Force page break
    
    # Page 2 table
    elements.append(Paragraph("Page 2: Q2 Data", styles['Heading1']))
    elements.append(Spacer(1, 12))
    
    data2 = [
        ['Month', 'Revenue'],
        ['April', '$1300'],
        ['May', '$1400'],
        ['June', '$1500']
    ]
    
    table2 = Table(data2)
    table2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table2)
    doc.build(elements)
    
    return pdf_path


def create_no_table_pdf():
    """Create a PDF without any tables"""
    test_data_dir = Path(__file__).parent / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    pdf_path = test_data_dir / "no_table.pdf"
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    elements.append(Paragraph("This is a PDF without any tables", styles['Title']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Just some regular text content.", styles['Normal']))
    
    doc.build(elements)
    
    return pdf_path


if __name__ == "__main__":
    print("Creating test PDF files...")
    
    simple_pdf = create_simple_table_pdf()
    print(f"Created: {simple_pdf}")
    
    multiple_pdf = create_multiple_tables_pdf()
    print(f"Created: {multiple_pdf}")
    
    multipage_pdf = create_multipage_pdf()
    print(f"Created: {multipage_pdf}")
    
    no_table_pdf = create_no_table_pdf()
    print(f"Created: {no_table_pdf}")
    
    print("All test PDFs created successfully!")

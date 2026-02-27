# How to Check User's Converted Files - Complete Guide

## Overview

Your application tracks all conversions in the `conversions` table and provides endpoints to view conversion history and download converted files.

## Quick Answer

### For Regular Users (Check Their Own Files)
```bash
GET /api/v3/conversions/history
Authorization: Bearer <user_token>
```

### For Super Users (Check Any User's Files)
```bash
GET /api/v3/conversions/history?user_id=5
Authorization: Bearer <super_user_token>
```

### Download a Converted File
```bash
GET /api/v3/conversions/{conversion_id}/download
Authorization: Bearer <user_token>
```

## API Endpoints

### 1. Get Conversion History

**Endpoint:** `GET /api/v3/conversions/history`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of results (1-200, default: 50)
- `user_id` (optional): Filter by user ID (super_user only)

**Behavior:**
- Regular users see only their own conversions
- Super users can see all conversions or filter by user_id

**Response:**
```json
{
  "items": [
    {
      "id": 123,
      "owner_user_id": 5,
      "action": "pdf_to_docs",
      "input_filename": "document.pdf",
      "status": "success",
      "points_charged": 3,
      "error_message": null,
      "created_at": "2026-02-27T10:30:00",
      "updated_at": "2026-02-27T10:30:05",
      "download_url": "/api/v3/conversions/123/download"
    },
    {
      "id": 122,
      "owner_user_id": 5,
      "action": "pdf_to_excel",
      "input_filename": "report.pdf",
      "status": "failed",
      "points_charged": 0,
      "error_message": "Invalid PDF format",
      "created_at": "2026-02-27T09:15:00",
      "updated_at": "2026-02-27T09:15:02",
      "download_url": null
    }
  ],
  "limit": 50
}
```

### 2. Download Converted File

**Endpoint:** `GET /api/v3/conversions/{conversion_id}/download`

**Authentication:** Required

**Behavior:**
- Users can only download their own conversions
- Super users can download any conversion
- Returns 404 if conversion failed or file doesn't exist

**Response:** File download (binary)

**Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="document.docx"
```

## Conversion Status Values

| Status | Description |
|--------|-------------|
| `processing` | Conversion is in progress |
| `success` | Conversion completed successfully |
| `failed` | Conversion failed (see error_message) |

## Conversion Actions

| Action | Description | Output Format |
|--------|-------------|---------------|
| `pdf_to_docs` | PDF to Word | .docx |
| `pdf_to_excel` | PDF to Excel | .xlsx |
| `docx_to_pdf` | Word to PDF | .pdf |
| `excel_to_pdf` | Excel to PDF | .pdf |
| `image_to_pdf` | Image to PDF | .pdf |
| `pdf_page_remove` | Remove PDF pages | .pdf |

## Usage Examples

### Example 1: User Checks Their Own History

```bash
curl -X GET "http://localhost:8000/api/v3/conversions/history?limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "items": [
    {
      "id": 45,
      "owner_user_id": 7,
      "action": "pdf_to_docs",
      "input_filename": "invoice.pdf",
      "status": "success",
      "points_charged": 3,
      "error_message": null,
      "created_at": "2026-02-27T14:20:00",
      "updated_at": "2026-02-27T14:20:03",
      "download_url": "/api/v3/conversions/45/download"
    }
  ],
  "limit": 10
}
```

### Example 2: Super User Checks Specific User's History

```bash
curl -X GET "http://localhost:8000/api/v3/conversions/history?user_id=7&limit=20" \
  -H "Authorization: Bearer <super_user_token>"
```

### Example 3: Download a Converted File

```bash
curl -X GET "http://localhost:8000/api/v3/conversions/45/download" \
  -H "Authorization: Bearer <user_token>" \
  -o downloaded_file.docx
```

### Example 4: Check All Conversions (Super User)

```bash
# Get all conversions across all users
curl -X GET "http://localhost:8000/api/v3/conversions/history?limit=100" \
  -H "Authorization: Bearer <super_user_token>"
```

## Python Script to Check User's Files

Create a script to easily check conversion history:

```python
#!/usr/bin/env python3
"""Check user's conversion history."""

import requests
import sys
from datetime import datetime

API_BASE = "http://localhost:8000"

def get_conversion_history(token: str, user_id: int = None, limit: int = 50):
    """Get conversion history."""
    url = f"{API_BASE}/api/v3/conversions/history"
    params = {"limit": limit}
    if user_id:
        params["user_id"] = user_id
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        return None
    
    return response.json()

def download_file(token: str, conversion_id: int, output_path: str):
    """Download a converted file."""
    url = f"{API_BASE}/api/v3/conversions/{conversion_id}/download"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers, stream=True)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        return False
    
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f"✓ Downloaded to {output_path}")
    return True

def display_history(data):
    """Display conversion history in a readable format."""
    if not data or not data.get("items"):
        print("No conversions found.")
        return
    
    print(f"\n{'='*100}")
    print(f"{'ID':<6} {'User':<6} {'Action':<18} {'File':<25} {'Status':<10} {'Points':<7} {'Date':<20}")
    print(f"{'='*100}")
    
    for item in data["items"]:
        created = datetime.fromisoformat(item["created_at"].replace("Z", "+00:00"))
        date_str = created.strftime("%Y-%m-%d %H:%M:%S")
        
        status_icon = "✓" if item["status"] == "success" else "✗" if item["status"] == "failed" else "⏳"
        status = f"{status_icon} {item['status']}"
        
        filename = item["input_filename"][:24]
        
        print(f"{item['id']:<6} {item['owner_user_id']:<6} {item['action']:<18} {filename:<25} {status:<10} {item['points_charged']:<7} {date_str:<20}")
        
        if item.get("error_message"):
            print(f"       Error: {item['error_message']}")
    
    print(f"{'='*100}\n")
    print(f"Total: {len(data['items'])} conversions")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python check_conversions.py <token> [user_id] [limit]")
        print("  python check_conversions.py <token> download <conversion_id> <output_file>")
        sys.exit(1)
    
    token = sys.argv[1]
    
    if len(sys.argv) > 2 and sys.argv[2] == "download":
        if len(sys.argv) < 5:
            print("Usage: python check_conversions.py <token> download <conversion_id> <output_file>")
            sys.exit(1)
        conversion_id = int(sys.argv[3])
        output_file = sys.argv[4]
        download_file(token, conversion_id, output_file)
    else:
        user_id = int(sys.argv[2]) if len(sys.argv) > 2 else None
        limit = int(sys.argv[3]) if len(sys.argv) > 3 else 50
        
        data = get_conversion_history(token, user_id, limit)
        if data:
            display_history(data)
```

**Usage:**
```bash
# Check your own history
python check_conversions.py "your_token_here"

# Super user checks specific user
python check_conversions.py "super_user_token" 5

# Download a file
python check_conversions.py "your_token_here" download 45 output.docx
```

## Database Query

You can also query the database directly:

```sql
-- Get all conversions for a user
SELECT 
    id,
    action,
    input_filename,
    status,
    points_charged,
    error_message,
    created_at,
    updated_at
FROM conversions
WHERE owner_user_id = 5
ORDER BY created_at DESC
LIMIT 50;

-- Get successful conversions only
SELECT * FROM conversions
WHERE owner_user_id = 5 AND status = 'success'
ORDER BY created_at DESC;

-- Get failed conversions with errors
SELECT 
    id,
    action,
    input_filename,
    error_message,
    created_at
FROM conversions
WHERE owner_user_id = 5 AND status = 'failed'
ORDER BY created_at DESC;

-- Get conversion statistics by action
SELECT 
    action,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
    SUM(points_charged) as total_points
FROM conversions
WHERE owner_user_id = 5
GROUP BY action;
```

## CLI Tool for Checking Conversions

Create `check_user_conversions.py`:

```python
#!/usr/bin/env python3
"""CLI tool to check user conversions from database."""

import sys
from sqlalchemy.orm import Session

from db.models import Conversion, User
from db.session import SessionLocal

def list_user_conversions(user_id: int, limit: int = 50):
    """List conversions for a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return
        
        conversions = (
            db.query(Conversion)
            .filter(Conversion.owner_user_id == user_id)
            .order_by(Conversion.created_at.desc())
            .limit(limit)
            .all()
        )
        
        print(f"\n{'='*100}")
        print(f"Conversions for {user.email} (ID: {user_id})")
        print(f"{'='*100}")
        print(f"{'ID':<6} {'Action':<18} {'File':<30} {'Status':<10} {'Points':<7} {'Date':<20}")
        print(f"{'-'*100}")
        
        for conv in conversions:
            status_icon = "✓" if conv.status == "success" else "✗" if conv.status == "failed" else "⏳"
            status = f"{status_icon} {conv.status}"
            date_str = conv.created_at.strftime("%Y-%m-%d %H:%M:%S")
            filename = conv.input_filename[:29]
            
            print(f"{conv.id:<6} {conv.action:<18} {filename:<30} {status:<10} {conv.points_charged:<7} {date_str:<20}")
            
            if conv.error_message:
                print(f"       Error: {conv.error_message}")
        
        print(f"{'='*100}")
        print(f"Total: {len(conversions)} conversions\n")
        
        # Statistics
        total = len(conversions)
        successful = sum(1 for c in conversions if c.status == "success")
        failed = sum(1 for c in conversions if c.status == "failed")
        total_points = sum(c.points_charged for c in conversions)
        
        print(f"Statistics:")
        print(f"  Successful: {successful}/{total}")
        print(f"  Failed: {failed}/{total}")
        print(f"  Total Points: {total_points}")
        print()
        
    finally:
        db.close()

def list_all_conversions(limit: int = 50):
    """List all conversions across all users."""
    db = SessionLocal()
    try:
        conversions = (
            db.query(Conversion)
            .order_by(Conversion.created_at.desc())
            .limit(limit)
            .all()
        )
        
        print(f"\n{'='*110}")
        print(f"All Conversions (Latest {limit})")
        print(f"{'='*110}")
        print(f"{'ID':<6} {'User':<6} {'Action':<18} {'File':<25} {'Status':<10} {'Points':<7} {'Date':<20}")
        print(f"{'-'*110}")
        
        for conv in conversions:
            status_icon = "✓" if conv.status == "success" else "✗" if conv.status == "failed" else "⏳"
            status = f"{status_icon} {conv.status}"
            date_str = conv.created_at.strftime("%Y-%m-%d %H:%M:%S")
            filename = conv.input_filename[:24]
            
            print(f"{conv.id:<6} {conv.owner_user_id:<6} {conv.action:<18} {filename:<25} {status:<10} {conv.points_charged:<7} {date_str:<20}")
        
        print(f"{'='*110}\n")
        
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python check_user_conversions.py <user_id> [limit]")
        print("  python check_user_conversions.py all [limit]")
        sys.exit(1)
    
    if sys.argv[1] == "all":
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
        list_all_conversions(limit)
    else:
        user_id = int(sys.argv[1])
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
        list_user_conversions(user_id, limit)
```

**Usage:**
```bash
# Check specific user's conversions
pipenv run python check_user_conversions.py 5

# Check with custom limit
pipenv run python check_user_conversions.py 5 100

# Check all users' conversions
pipenv run python check_user_conversions.py all 50
```

## File Storage

Converted files are stored in:
```
backend/static/
├── pdfToExcel/     # PDF to Excel conversions
├── pdfToDocs/      # PDF to Word conversions
├── docxToPdf/      # Word to PDF conversions
├── excelToPdf/     # Excel to PDF conversions
├── imageToPdf/     # Image to PDF conversions
└── pdfPageRemove/  # PDF page removal results
```

The `output_filename` column in the `conversions` table contains the full path to the converted file.

## Access Control

### Regular Users
- Can only see their own conversions
- Can only download their own files
- Cannot see other users' conversions

### Super Users
- Can see all conversions
- Can filter by user_id
- Can download any file
- Have full access to conversion history

## Common Scenarios

### Scenario 1: User Wants to Re-download a File

1. User calls `/api/v3/conversions/history`
2. Finds the conversion in the list
3. Uses the `download_url` from the response
4. Downloads the file via `/api/v3/conversions/{id}/download`

### Scenario 2: Admin Checks User's Conversion Activity

1. Admin (super_user) calls `/api/v3/conversions/history?user_id=5`
2. Reviews the user's conversion history
3. Can download any file if needed

### Scenario 3: User Checks Failed Conversions

1. User calls `/api/v3/conversions/history`
2. Filters results where `status === "failed"`
3. Reviews `error_message` to understand what went wrong

## Summary

✅ **Endpoint:** `GET /api/v3/conversions/history`
✅ **Download:** `GET /api/v3/conversions/{id}/download`
✅ **Access Control:** Users see only their own, super_users see all
✅ **Filtering:** Super users can filter by user_id
✅ **Status Tracking:** success, failed, processing
✅ **Error Messages:** Available for failed conversions
✅ **Download URLs:** Provided for successful conversions

All conversion history is automatically tracked and accessible through the API!

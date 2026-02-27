# Conversion History - Quick Reference

## TL;DR

Users can view their conversion history and download converted files through the API.

## API Endpoints

### Get History
```bash
# User's own history
GET /api/v3/conversions/history?limit=50

# Super user checks specific user
GET /api/v3/conversions/history?user_id=5&limit=50
```

### Download File
```bash
GET /api/v3/conversions/{conversion_id}/download
```

## CLI Tools

```bash
# Check user's conversions
pipenv run python check_user_conversions.py 5

# Check with custom limit
pipenv run python check_user_conversions.py 5 100

# Check all users
pipenv run python check_user_conversions.py all 50

# Show detailed statistics
pipenv run python check_user_conversions.py stats 5
```

## Response Format

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
    }
  ],
  "limit": 50
}
```

## Status Values

- `success` - Conversion completed, file ready for download
- `failed` - Conversion failed, check error_message
- `processing` - Conversion in progress

## Quick Examples

### cURL: Get History
```bash
curl -X GET "http://localhost:8000/api/v3/conversions/history" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### cURL: Download File
```bash
curl -X GET "http://localhost:8000/api/v3/conversions/123/download" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o output.docx
```

### Python: Get History
```python
import requests

response = requests.get(
    "http://localhost:8000/api/v3/conversions/history",
    headers={"Authorization": f"Bearer {token}"},
    params={"limit": 50}
)
data = response.json()

for item in data["items"]:
    print(f"{item['id']}: {item['action']} - {item['status']}")
```

### Python: Download File
```python
import requests

response = requests.get(
    f"http://localhost:8000/api/v3/conversions/{conversion_id}/download",
    headers={"Authorization": f"Bearer {token}"},
    stream=True
)

with open("output.docx", "wb") as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)
```

## Database Query

```sql
-- Get user's conversions
SELECT * FROM conversions 
WHERE owner_user_id = 5 
ORDER BY created_at DESC 
LIMIT 50;

-- Get successful conversions only
SELECT * FROM conversions 
WHERE owner_user_id = 5 AND status = 'success'
ORDER BY created_at DESC;

-- Get conversion stats
SELECT 
    action,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(points_charged) as total_points
FROM conversions
WHERE owner_user_id = 5
GROUP BY action;
```

## Access Control

| User Role | Can View | Can Download |
|-----------|----------|--------------|
| Regular User | Own conversions only | Own files only |
| Super User | All conversions | All files |

## File Locations

Converted files are stored in:
```
backend/static/
├── pdfToExcel/
├── pdfToDocs/
├── docxToPdf/
├── excelToPdf/
├── imageToPdf/
└── pdfPageRemove/
```

## Common Use Cases

### 1. User wants to re-download a file
```bash
# 1. Get history
GET /api/v3/conversions/history

# 2. Find the conversion ID

# 3. Download
GET /api/v3/conversions/{id}/download
```

### 2. Admin checks user activity
```bash
# Super user checks specific user
GET /api/v3/conversions/history?user_id=5
```

### 3. Check failed conversions
```bash
# Get history and filter by status === "failed"
# Check error_message field for details
```

## Need More Info?

See `CONVERSION_HISTORY_GUIDE.md` for complete documentation.

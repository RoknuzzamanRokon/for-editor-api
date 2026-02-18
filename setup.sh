#!/bin/bash
# Quick setup script for PDF Converter API

set -e

echo "=========================================="
echo "PDF Converter API - Quick Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run as root${NC}"
    exit 1
fi

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo -e "${GREEN}Step 1: Installing system dependencies...${NC}"
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx

echo -e "${GREEN}Step 2: Installing pipenv...${NC}"
pip3 install --user pipenv

echo -e "${GREEN}Step 3: Installing Python dependencies...${NC}"
cd "$BACKEND_DIR"
pipenv install

echo -e "${GREEN}Step 4: Creating directories...${NC}"
mkdir -p "$BACKEND_DIR/static/pdfToExcel"
mkdir -p "$BACKEND_DIR/static/pdfToDocs"
chmod 755 "$BACKEND_DIR/static"
chmod 755 "$BACKEND_DIR/static/pdfToExcel"
chmod 755 "$BACKEND_DIR/static/pdfToDocs"

echo -e "${GREEN}Step 5: Creating .env file...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cat > "$BACKEND_DIR/.env" << EOF
MAX_FILE_SIZE_MB=50
CONVERSION_TIMEOUT_SECONDS=300
STORAGE_DIR=static
EOF
    echo -e "${GREEN}.env file created${NC}"
else
    echo -e "${YELLOW}.env file already exists, skipping${NC}"
fi

echo -e "${GREEN}Step 6: Testing application...${NC}"
cd "$BACKEND_DIR"
echo "Starting test server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""
pipenv run uvicorn main:app --host 127.0.0.1 --port 8000 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test if server is running
if curl -s http://localhost:8000/ > /dev/null; then
    echo -e "${GREEN}✓ Server is running successfully!${NC}"
    echo ""
    echo "Visit http://localhost:8000 in your browser"
    echo ""
    echo "Press Enter to stop the test server and continue..."
    read
    kill $SERVER_PID
else
    echo -e "${RED}✗ Server failed to start${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "To run the application:"
echo "  cd $BACKEND_DIR"
echo "  pipenv run uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "For production deployment:"
echo "  1. Review DEPLOYMENT.md"
echo "  2. Configure nginx.conf"
echo "  3. Setup systemd service"
echo "  4. Configure SSL with Let's Encrypt"
echo ""
echo "API Documentation: API_DOCUMENTATION.md"
echo "Quick Reference: API_QUICK_REFERENCE.md"
echo ""

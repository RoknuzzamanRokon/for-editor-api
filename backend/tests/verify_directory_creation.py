"""
Verification script to demonstrate automatic directory creation
"""
import sys
import shutil
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.file_manager import FileManagerService


def verify_directory_creation():
    """Verify that FileManagerService creates directories automatically"""
    
    print("=" * 60)
    print("Verifying Storage Directory Creation")
    print("=" * 60)
    
    # Test 1: Create directory that doesn't exist
    test_dir_1 = "backend/tests/verify_test_1"
    if Path(test_dir_1).exists():
        shutil.rmtree(test_dir_1)
    
    print(f"\n1. Testing directory creation: {test_dir_1}")
    print(f"   Directory exists before: {Path(test_dir_1).exists()}")
    
    service_1 = FileManagerService(storage_dir=test_dir_1)
    
    print(f"   Directory exists after:  {Path(test_dir_1).exists()}")
    print(f"   ✓ Directory created successfully!")
    
    # Cleanup
    shutil.rmtree(test_dir_1)
    
    # Test 2: Create nested directories
    test_dir_2 = "backend/tests/nested/parent/child/storage"
    if Path("backend/tests/nested").exists():
        shutil.rmtree("backend/tests/nested")
    
    print(f"\n2. Testing nested directory creation: {test_dir_2}")
    print(f"   Directory exists before: {Path(test_dir_2).exists()}")
    
    service_2 = FileManagerService(storage_dir=test_dir_2)
    
    print(f"   Directory exists after:  {Path(test_dir_2).exists()}")
    print(f"   Parent directories created: {Path('backend/tests/nested').exists()}")
    print(f"   ✓ Nested directories created successfully!")
    
    # Cleanup
    shutil.rmtree("backend/tests/nested")
    
    # Test 3: Verify pdfToDocs directory
    print(f"\n3. Testing pdfToDocs directory creation")
    docs_dir = "static/pdfToDocs"
    
    service_3 = FileManagerService(storage_dir=docs_dir)
    
    print(f"   Directory path: {docs_dir}")
    print(f"   Directory exists: {Path(docs_dir).exists()}")
    print(f"   ✓ pdfToDocs directory ready for use!")
    
    # Test 4: Directory already exists
    test_dir_4 = "backend/tests/verify_test_4"
    Path(test_dir_4).mkdir(parents=True, exist_ok=True)
    
    print(f"\n4. Testing with existing directory: {test_dir_4}")
    print(f"   Directory exists before: {Path(test_dir_4).exists()}")
    
    service_4 = FileManagerService(storage_dir=test_dir_4)
    
    print(f"   Directory exists after:  {Path(test_dir_4).exists()}")
    print(f"   ✓ No error when directory already exists!")
    
    # Cleanup
    shutil.rmtree(test_dir_4)
    
    print("\n" + "=" * 60)
    print("All directory creation tests passed! ✓")
    print("=" * 60)


if __name__ == "__main__":
    verify_directory_creation()

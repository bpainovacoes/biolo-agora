#!/usr/bin/env python3

import os
import shutil
import re
from pathlib import Path

# Get the project root
root = Path("/vercel/share/v0-project")

def copy_and_update_file(src, dest):
    """Copy file from src to dest and update import paths."""
    # Create destination directory
    dest.parent.mkdir(parents=True, exist_ok=True)
    
    # Read source file
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update import paths
    content = re.sub(r"from ['\"]@/src/components", "from '@/components", content)
    content = re.sub(r"from ['\"]@/src/lib", "from '@/lib", content)
    content = re.sub(r"from ['\"]@/src/hooks", "from '@/hooks", content)
    content = re.sub(r"import\.meta\.env", "process.env", content)
    
    # Write to destination
    with open(dest, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Copied: {dest.relative_to(root)}")

def copy_directory(src, dest):
    """Recursively copy directory structure and update files."""
    if not src.exists():
        print(f"Source does not exist: {src}")
        return
    
    for item in src.rglob('*'):
        if item.is_file():
            rel_path = item.relative_to(src)
            dest_file = dest / rel_path
            copy_and_update_file(item, dest_file)

# Copy components
print("Migrating components...")
copy_directory(root / "src" / "components", root / "components")

# Copy hooks
print("Migrating hooks...")
copy_directory(root / "src" / "hooks", root / "hooks")

print("Migration complete!")

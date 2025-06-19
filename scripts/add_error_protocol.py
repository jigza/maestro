#!/usr/bin/env python3
# Script to add Error Management Protocol to all mode files
# Created by Troy Molander, May 7, 2025

import os
import re
import glob
from pathlib import Path

# Base directory
BASE_DIR = "/Users/troymolander/Development/Agentience/maestro"
TEMPLATE_PATH = os.path.join(BASE_DIR, "docs/templates/error-management-protocol-template.md")

# Modes we've already updated
UPDATED_MODES = [
    "ErrorManager-mode.md",  # Already has comprehensive error handling
    "Maestro-mode.md",       # Already has error management protocol
    "BackendForge-mode.md",  # Updated manually
    "ReactMaster-mode.md",   # Updated manually
    "NodeSmith-mode.md",     # Updated manually
    "FrontCrafter-mode.md",  # Updated manually
]

def read_template():
    """Read the error management protocol template"""
    try:
        with open(TEMPLATE_PATH, 'r') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: Template file not found at {TEMPLATE_PATH}")
        return None

def get_mode_files():
    """Get all mode files in the base directory"""
    return glob.glob(os.path.join(BASE_DIR, "*-mode.md"))

def update_mode_file(file_path, template_content):
    """Add error management protocol to a mode file"""
    filename = os.path.basename(file_path)
    
    # Skip already updated files
    if filename in UPDATED_MODES:
        print(f"Skipping {filename} (already updated)")
        return "skipped"
    
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check if file already has error management protocol
        if "### Error Management Protocol" in content:
            print(f"{filename} already contains error management protocol section")
            return "already_has"
        
        # Find the YOU MUST REMEMBER section
        match = re.search(r'YOU MUST REMEMBER', content)
        if match:
            # Get the position to insert
            pos = match.start()
            
            # Insert template before YOU MUST REMEMBER
            section_number = find_last_section_number(content)
            section_header = f"### {section_number + 1}. Error Management Protocol"
            template_with_header = template_content.replace("### Error Management Protocol", section_header)
            
            updated_content = content[:pos] + template_with_header + "\n\n" + content[pos:]
            
            # Write updated content
            with open(file_path, 'w') as f:
                f.write(updated_content)
            
            print(f"Successfully updated {filename}")
            return "updated"
        else:
            print(f"Could not find 'YOU MUST REMEMBER' in {filename}, cannot update")
            return "error"
    
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")
        return "error"

def find_last_section_number(content):
    """Find the last section number in the content"""
    matches = re.findall(r'### (\d+)\. ', content)
    if matches:
        return int(matches[-1])
    return 0

def run_update():
    """Main function to update all mode files"""
    # Read template
    template_content = read_template()
    if not template_content:
        return
    
    # Get all mode files
    mode_files = get_mode_files()
    
    # Counters
    stats = {
        "updated": 0,
        "skipped": 0,
        "already_has": 0,
        "error": 0
    }
    
    # Process each file
    for file_path in mode_files:
        result = update_mode_file(file_path, template_content)
        stats[result] += 1
    
    # Print summary
    print("\nUpdate Summary:")
    print(f"Successfully updated: {stats['updated']} files")
    print(f"Already had protocol: {stats['already_has']} files")
    print(f"Skipped: {stats['skipped']} files")
    print(f"Failed to update: {stats['error']} files")
    print(f"\nTotal processed: {sum(stats.values())} files")

if __name__ == "__main__":
    run_update()

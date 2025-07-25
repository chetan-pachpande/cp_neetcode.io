#!/usr/bin/env python3
"""
Structure Validation Script
Validates that HTML files follow the STRUCTURE_GUIDE.md requirements
"""

import os
import re
import sys
from pathlib import Path

def validate_html_structure(file_path):
    """Validate a single HTML file against structure requirements"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # Check for required CDN imports
    if 'cdn.tailwindcss.com' not in content:
        issues.append("❌ Missing TailwindCSS CDN import")
    
    # Check for gradient background
    if 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' not in content:
        issues.append("❌ Missing required gradient background")
    
    # Check for proper back to home button
    if 'Back to Home' not in content or '../../index.html' not in content:
        issues.append("❌ Missing or incorrect 'Back to Home' button")
    
    # Check for proper header structure
    if not re.search(r'<h1.*>.*</h1>.*<p.*>.*An Interactive Visual Explainer.*</p>', content, re.DOTALL):
        issues.append("❌ Missing proper header structure with subtitle")
    
    # Check for required sections
    required_sections = [
        'Problem Description',
        'Algorithm States',
        'Log of Step Execution'
    ]
    
    for section in required_sections:
        if section not in content:
            issues.append(f"❌ Missing required section: {section}")
    
    # Check for proper CSS classes
    if '.card' not in content:
        issues.append("❌ Missing .card CSS class")
    
    # Check for responsive design
    if 'grid' not in content and 'flex' not in content:
        issues.append("❌ Missing responsive grid/flex layout")
    
    # Check for interactive controls
    control_elements = ['play-pause-btn', 'step-forward-btn', 'step-backward-btn']
    for control in control_elements:
        if control not in content:
            issues.append(f"❌ Missing interactive control: {control}")
    
    # Check for proper script structure
    if 'DOMContentLoaded' not in content:
        issues.append("❌ Missing DOMContentLoaded event listener")
    
    return issues

def validate_all_files():
    """Validate all HTML files in the categories directories"""
    
    base_path = Path('/Users/chetanpachpande/neetcode/cp_neetcode.io/categories')
    
    if not base_path.exists():
        print("❌ Categories directory not found")
        return False
    
    all_valid = True
    
    for category_dir in base_path.iterdir():
        if not category_dir.is_dir():
            continue
            
        print(f"\n🔍 Validating {category_dir.name}:")
        
        html_files = list(category_dir.glob('*.html'))
        if not html_files:
            print("  ⚠️  No HTML files found")
            continue
        
        for html_file in html_files:
            print(f"\n  📄 {html_file.name}:")
            issues = validate_html_structure(html_file)
            
            if not issues:
                print("    ✅ All checks passed!")
            else:
                all_valid = False
                for issue in issues:
                    print(f"    {issue}")
    
    return all_valid

def main():
    """Main validation function"""
    
    print("🚀 Structure Validation Script")
    print("="*50)
    
    if len(sys.argv) > 1:
        # Validate specific file
        file_path = sys.argv[1]
        if os.path.exists(file_path):
            print(f"📄 Validating {file_path}:")
            issues = validate_html_structure(file_path)
            
            if not issues:
                print("✅ All checks passed!")
                return True
            else:
                for issue in issues:
                    print(issue)
                return False
        else:
            print(f"❌ File not found: {file_path}")
            return False
    else:
        # Validate all files
        return validate_all_files()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

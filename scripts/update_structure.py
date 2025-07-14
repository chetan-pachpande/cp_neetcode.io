#!/usr/bin/env python3
"""
Script to update all HTML files to follow the new structure standard:
- Gradient background instead of gray
- Consistent header styling
- Proper card spacing
"""

import os
import re
from pathlib import Path

def update_file_structure(file_path):
    """Update a single HTML file to follow the new structure."""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip files that already have the gradient background
        if 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' in content:
            print(f"✅ {file_path.name} - Already updated")
            return False
        
        # Skip empty files
        if len(content.strip()) == 0:
            print(f"⚠️  {file_path.name} - Empty file, skipping")
            return False
        
        # Skip files without proper HTML structure
        if not ('<!DOCTYPE html>' in content and '<html' in content):
            print(f"⚠️  {file_path.name} - Not a proper HTML file, skipping")
            return False
        
        original_content = content
        
        # 1. Update background from gray to gradient
        content = re.sub(
            r'background-color:\s*#f3f4f6;?',
            'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            min-height: 100vh;',
            content
        )
        
        # Also update other gray background variations
        content = re.sub(
            r'background-color:\s*#f5f5f5;?',
            'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            min-height: 100vh;',
            content
        )
        
        # 2. Update header structure if it uses old styling
        # Look for old header patterns and replace with new structure
        
        # Pattern 1: Headers with gradient backgrounds
        header_pattern1 = re.compile(
            r'<header class="bg-gradient-to-r[^"]*"[^>]*>\s*'
            r'<h1[^>]*>([^<]+)</h1>\s*'
            r'<p[^>]*>([^<]+)</p>\s*'
            r'<p[^>]*>([^<]+)</p>\s*'
            r'</header>',
            re.DOTALL
        )
        
        def replace_header1(match):
            title = match.group(1).replace('LeetCode [0-9]+: ', '').strip()
            return f'''<header class="text-center mb-4">
            <h1 class="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
            <p class="text-lg text-blue-100 mt-2">{match.group(2)}</p>
        </header>
        <div class="text-center text-sm text-blue-200 mb-8">
            {match.group(3)}
        </div>'''
        
        content = header_pattern1.sub(replace_header1, content)
        
        # 3. Ensure all cards have mb-8 spacing
        content = re.sub(
            r'<div([^>]*class="[^"]*card[^"]*"[^>]*)>',
            lambda m: f'<div{m.group(1).replace("card", "card mb-8") if "mb-" not in m.group(1) else m.group(1)}>',
            content
        )
        
        # 4. Update h2 elements to use consistent styling
        content = re.sub(
            r'<h2[^>]*>([^<]+)</h2>',
            r'<h2 class="text-2xl font-bold mb-4">\1</h2>',
            content
        )
        
        # 5. Ensure proper container structure
        if 'class="container mx-auto p-4 sm:p-6 lg:p-8"' not in content:
            content = re.sub(
                r'<body[^>]*>',
                r'<body class="text-gray-800">',
                content
            )
            
            # Wrap content in proper container if not already wrapped
            if '<div class="container mx-auto' not in content:
                content = re.sub(
                    r'(<body[^>]*>)\s*',
                    r'\1\n    <div class="container mx-auto p-4 sm:p-6 lg:p-8">\n        ',
                    content
                )
                content = re.sub(
                    r'(\s*</body>)',
                    r'\n    </div>\1',
                    content
                )
        
        # Check if we made any changes
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {file_path.name} - Updated successfully")
            return True
        else:
            print(f"ℹ️  {file_path.name} - No changes needed")
            return False
            
    except Exception as e:
        print(f"❌ {file_path.name} - Error: {str(e)}")
        return False

def main():
    """Main function to update all HTML files."""
    
    base_dir = Path(__file__).parent.parent
    categories_dir = base_dir / 'categories'
    
    if not categories_dir.exists():
        print("❌ Categories directory not found!")
        return
    
    print("🚀 Starting structure update for all HTML files...\n")
    
    updated_files = []
    skipped_files = []
    error_files = []
    
    # Process all HTML files in categories
    for category_dir in categories_dir.iterdir():
        if category_dir.is_dir():
            print(f"📁 Processing {category_dir.name}/")
            
            for html_file in category_dir.glob('*.html'):
                try:
                    if update_file_structure(html_file):
                        updated_files.append(str(html_file.relative_to(base_dir)))
                    else:
                        skipped_files.append(str(html_file.relative_to(base_dir)))
                except Exception as e:
                    error_files.append(f"{html_file.relative_to(base_dir)}: {str(e)}")
            
            print()  # Empty line between categories
    
    # Summary
    print("=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    print(f"✅ Updated: {len(updated_files)} files")
    print(f"ℹ️  Skipped: {len(skipped_files)} files")
    print(f"❌ Errors: {len(error_files)} files")
    
    if updated_files:
        print(f"\n📝 Updated files:")
        for file in updated_files:
            print(f"   - {file}")
    
    if error_files:
        print(f"\n❌ Files with errors:")
        for file in error_files:
            print(f"   - {file}")

if __name__ == "__main__":
    main()

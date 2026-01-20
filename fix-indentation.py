#!/usr/bin/env python3
"""
Script para corrigir identação automática em TODOS os templates .hbs
Detecta o tipo de arquivo e aplica identação apropriada.
"""

import os
import re
from pathlib import Path

def fix_yaml_indentation(content):
    """Fix YAML indentation"""
    lines = content.split('\n')
    fixed_lines = []
    indent_level = 0
    
    for line in lines:
        stripped = line.lstrip()
        if not stripped or stripped.startswith('#'):
            fixed_lines.append(line)
            continue
            
        # Detect indentation level from colons and list markers
        if stripped.endswith(':') or stripped.startswith('-'):
            fixed_lines.append('  ' * indent_level + stripped)
            if stripped.endswith(':') and not stripped.startswith('-'):
                indent_level += 1
        else:
            # Regular line keeps parent indent
            fixed_lines.append('  ' * indent_level + stripped)
    
    return '\n'.join(fixed_lines)

def fix_terraform_indentation(content):
    """Fix Terraform/HCL indentation"""
    lines = content.split('\n')
    fixed_lines = []
    indent_level = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            fixed_lines.append(line)
            continue
        
        # Decrease indent for closing braces
        if stripped.startswith('}'):
            indent_level = max(0, indent_level - 1)
        
        fixed_lines.append('  ' * indent_level + stripped)
        
        # Increase indent for opening braces
        if stripped.endswith('{'):
            indent_level += 1
    
    return '\n'.join(fixed_lines)

def fix_json_indentation(content):
    """Fix JSON indentation"""
    import json
    try:
        # Parse and reformat with proper indentation
        data = json.loads(content)
        return json.dumps(data, indent=2, ensure_ascii=False)
    except:
        # If parsing fails, return original
        return content

def fix_typescript_java_indentation(content):
    """Fix TypeScript/JavaScript/Java indentation"""
    lines = content.split('\n')
    fixed_lines = []
    indent_level = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            fixed_lines.append('')
            continue
        
        # Decrease indent for closing braces/brackets
        if stripped.startswith('}') or stripped.startswith(')') or stripped.startswith(']'):
            indent_level = max(0, indent_level - 1)
        
        # Add indented line
        fixed_lines.append('    ' * indent_level + stripped)
        
        # Increase indent for opening braces/brackets
        if stripped.endswith('{') or stripped.endswith('(') or stripped.endswith('['):
            if not stripped.startswith('//'):
                indent_level += 1
        
        # Decrease if line has both open and close
        if ('{' in stripped and '}' in stripped and 
            stripped.count('{') == stripped.count('}')):
            # Keep same level
            pass
    
    return '\n'.join(fixed_lines)

def process_file(file_path):
    """Process a single template file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if file is empty or very small
        if len(content.strip()) < 10:
            return False
        
        # Determine file type and apply appropriate fix
        ext = os.path.splitext(file_path)[0].split('.')[-1]
        
        if file_path.endswith('.yml.hbs') or file_path.endswith('.yaml.hbs'):
            fixed_content = fix_yaml_indentation(content)
        elif file_path.endswith('.tf.hbs'):
            fixed_content = fix_terraform_indentation(content)
        elif file_path.endswith('.json.hbs'):
            fixed_content = fix_json_indentation(content)
        elif any(file_path.endswith(e) for e in ['.ts.hbs', '.js.hbs', '.tsx.hbs', '.java.hbs']):
            fixed_content = fix_typescript_java_indentation(content)
        else:
            # Skip files we don't handle
            return False
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    print("🔧 Auto-fixing indentation for all templates...")
    print("")
    
    pro_dirs = Path('templates').glob('*/pro')
    total = 0
    fixed = 0
    
    for pro_dir in pro_dirs:
        for hbs_file in pro_dir.rglob('*.hbs'):
            # Skip Python files (already fixed)
            if hbs_file.name.endswith('.py.hbs'):
                continue
            
            total += 1
            if process_file(str(hbs_file)):
                fixed += 1
                print(f"✓ {hbs_file}")
    
    print("")
    print(f"✅ Processed: {total} files")
    print(f"🔧 Fixed: {fixed} files")
    print("")

if __name__ == '__main__':
    main()

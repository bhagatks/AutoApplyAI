import glob
import re
import os

def get_page_count(pdf_path):
    try:
        with open(pdf_path, 'rb') as f:
            content = f.read()
        
        # Look for /Type /Pages /Count X
        matches = re.findall(rb'/Type\s*/Pages\s*/Count\s*(\d+)', content)
        if not matches:
            matches = re.findall(rb'/Count\s*(\d+)\s*/Type\s*/Pages', content)
            
        if matches:
            return int(matches[0])
            
        # Alternative search for /Count X inside Pages object
        pages_objs = re.findall(rb'/Count\s*(\d+)', content)
        if pages_objs:
            # Return the last one or largest count as it usually represents the catalog total
            return max(int(c) for c in pages_objs)
            
        return "Unknown"
    except Exception as e:
        return f"Error: {e}"

print("=== CHECKING GENERATED PDF PAGE COUNTS ===")
pdfs = glob.glob("output/*.pdf")
for pdf in sorted(pdfs):
    count = get_page_count(pdf)
    size = os.path.getsize(pdf)
    print(f"File: {os.path.basename(pdf)} | Size: {size} bytes | Pages: {count}")

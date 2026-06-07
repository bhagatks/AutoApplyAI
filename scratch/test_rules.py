import os
import json
import re
import subprocess

RULES_FILE = 'resume_rules.json'
TEMPLATE_FILE = 'base_template.tex'
OUTPUT_DIR = 'output'

# Escaping function identical to server.py
def clean_latex(text, rules, is_competencies=False):
    if not text:
        return ""
    forbidden_chars = rules.get("syntax_constraints", {}).get("forbidden_characters", {})
    
    if "&" in forbidden_chars:
        text = text.replace("&", " and ")
        
    if "%" in forbidden_chars:
        text = re.sub(r'(?<!\\)%', r'\%', text)

    text = re.sub(r'(?<!\\)_', r'\_', text)
    text = re.sub(r'(?<!\\)\$', r'\$', text)
    text = re.sub(r'(?<!\\)#', r'\#', text)
    
    if not is_competencies:
        text = re.sub(r'\s+', ' ', text)
    else:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        text = "\n".join(lines)
        
    return text.strip()

# Word substitution identical to server.py
def substitute_forbidden_words(text, rules):
    forbidden_words = rules.get("tone_and_voice", {}).get("forbidden_words", {})
    for word, desc in forbidden_words.items():
        match = re.search(r"'(.*?)'", desc)
        replacement = match.group(1) if match else "journey"
        text = re.sub(re.escape(word), replacement, text, flags=re.IGNORECASE)
    return text

# Normalize name function identical to server.py
def normalize_name(text):
    text = text.lower().strip()
    # Remove non-alphanumeric (except spaces and dashes)
    text = re.sub(r'[^a-z0-9\s\-]', '', text)
    # Replace spaces and dashes with a single underscore
    text = re.sub(r'[\s\-]+', '_', text)
    return text.strip('_')

print("=== STARTING PYTHON RULES VALIDATION TESTS ===")

# 1. Load rules
if not os.path.exists(RULES_FILE):
    print(f"✗ [FAILED] Rules file not found at {RULES_FILE}")
    exit(1)

with open(RULES_FILE, 'r') as f:
    rules = json.load(f)
print("✓ [PASSED] Successfully loaded resume_rules.json")

# 2. Test dynamic character replacement
test_text = "MLOps & LLM Engineering with 25% efficiency gains"
expected_clean = "MLOps and LLM Engineering with 25\\% efficiency gains"
result_clean = clean_latex(test_text, rules)
if result_clean == expected_clean:
    print("✓ [PASSED] Dynamic Character Replacement (ampersand to 'and', escape %)")
else:
    print(f"✗ [FAILED] Dynamic Character Replacement. Result: {result_clean}")

# 3. Test forbidden word substitution
test_tone = "My professional trajectory has been focused on enterprise ML lifecycle."
expected_tone = "My professional journey has been focused on enterprise ML lifecycle."
result_tone = substitute_forbidden_words(test_tone, rules)
if result_tone == expected_tone:
    print("✓ [PASSED] Tone and Voice Forbidden Word Replacement ('trajectory' -> 'journey')")
else:
    print(f"✗ [FAILED] Tone and Voice Word Replacement. Result: {result_tone}")

# 4. Test template layout alterations
if not os.path.exists(TEMPLATE_FILE):
    print(f"✗ [FAILED] Template file not found at {TEMPLATE_FILE}")
    exit(1)

with open(TEMPLATE_FILE, 'r') as f:
    template_content = f.read()

layout = rules.get("page_defense_layout", {})

# margins replacement
geometry_margins = layout.get("geometry_margins")
template_content = re.sub(
    r'\\usepackage\[[^\]]*\]\{geometry\}',
    f'\\\\usepackage[{geometry_margins}]{{geometry}}',
    template_content
)

# spacing replacement
section_spacing = layout.get("section_spacing")
template_content = re.sub(
    r'\\titlespacing\{\\section\}[^%\n]*',
    section_spacing.replace('\\', '\\\\'),
    template_content
)

# list spacing replacement
list_spacing = layout.get("list_spacing")
template_content = re.sub(
    r'\\setlist\[itemize\]\{[^\}]*\}',
    f'\\\\setlist[itemize]{{{list_spacing}}}',
    template_content
)

# forbidden environment removal
forbidden_envs = layout.get("forbidden_environments", [])
for env in forbidden_envs:
    template_content = template_content.replace(f"\\begin{{{env}}}", "{")
    template_content = template_content.replace(f"\\end{{{env}}}", "\\par}")

# Check that modifications were applied in template string
margins_applied = f"\\usepackage[{geometry_margins}]{{geometry}}" in template_content
spacing_applied = section_spacing in template_content
list_applied = f"\\setlist[itemize]{{{list_spacing}}}" in template_content
quote_scrubbed = "\\begin{quote}" not in template_content and "\\end{quote}" not in template_content

if margins_applied and spacing_applied and list_applied and quote_scrubbed:
    print("✓ [PASSED] Dynamic Page Defense Spacing and Layout transformations")
else:
    print("✗ [FAILED] Spacing/Layout transformations failed to apply in template string:")
    print(f"   Margins applied: {margins_applied}")
    print(f"   Spacing applied: {spacing_applied}")
    print(f"   List spacing applied: {list_applied}")
    print(f"   Quote environment scrubbed: {quote_scrubbed}")

# 5. Inject mock variables and test compilation
mock_summary = clean_latex("Visionary leader with 20 plus years of experience in enterprise AI systems and scaling teams.", rules)
mock_competencies = clean_latex("\\item \\textbf{AI Engineering:} Building ML solutions.\n\\item \\textbf{MLOps:} Scaled pipelines.", rules, is_competencies=True)
mock_keywords = ["MLOps", "LLMs", "FastAPI"]

template_content = template_content.replace('%TOKEN_SUMMARY_ZONE%', mock_summary)
template_content = template_content.replace('%TOKEN_COMPETENCIES_ZONE%', mock_competencies)

# Add ATS strategy target block
ats_target = rules.get("ats_target_block", {})
if ats_target.get("required", False):
    format_string = ats_target.get("format_string", "")
    safe_kw_str = clean_latex(", ".join(mock_keywords), rules)
    ats_block = format_string.replace("{keywords}", safe_kw_str)
    template_content = template_content.replace("\\end{document}", ats_block + "\n\\end{document}")

# Dynamic naming convention test
company_norm = normalize_name("TestCompany")
title_norm = normalize_name("Staff AI Engineer")
output_naming = rules.get("profile", {}).get("output_naming_convention", "bhagath_resume_{company}_{title}")
base_filename = output_naming.format(company=company_norm, title=title_norm)

if base_filename == "bhagath_resume_testcompany_staff_ai_engineer":
    print("✓ [PASSED] Dynamic output file naming convention normalization")
else:
    print(f"✗ [FAILED] File naming convention normalization. Result: {base_filename}")

os.makedirs(OUTPUT_DIR, exist_ok=True)
tex_path = os.path.join(OUTPUT_DIR, f"{base_filename}.tex")
pdf_path = os.path.join(OUTPUT_DIR, f"{base_filename}.pdf")

with open(tex_path, 'w') as f:
    f.write(template_content)

print("Compiling LaTeX to PDF...")
tectonic_exec = "tectonic"
if os.path.exists("/opt/homebrew/bin/tectonic"):
    tectonic_exec = "/opt/homebrew/bin/tectonic"
tectonic_cmd = f'{tectonic_exec} -o "{OUTPUT_DIR}" "{tex_path}"'
result = subprocess.run(tectonic_cmd, shell=True, capture_output=True, text=True)

if result.returncode == 0 and os.path.exists(pdf_path):
    print("✓ [PASSED] Tectonic compiled dynamically generated LaTeX output file successfully")
    print(f"   Generated PDF size: {os.path.getsize(pdf_path)} bytes")
else:
    print("✗ [FAILED] Tectonic compilation failed:")
    print("Stdout:", result.stdout)
    print("Stderr:", result.stderr)

print("\n=== RULES VALIDATION TESTS COMPLETED ===")

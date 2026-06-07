import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Escaping function identical to server.js
function cleanLatex(text, isCompetencies = false) {
  if (!text) return '';
  // 1. Replace ampersands "&" with "and"
  let cleaned = text.replace(/&/g, ' and ');
  // 2. Escape percent symbol "%" -> "\%"
  cleaned = cleaned.replace(/(?<!\\)%/g, '\\%');
  // 3. Escape underscore "_" -> "\_"
  cleaned = cleaned.replace(/(?<!\\)_/g, '\\_');
  // 4. Escape dollar signs "$" -> "\$"
  cleaned = cleaned.replace(/(?<!\\)\$/g, '\\$');
  // 5. Escape hash symbols "#" -> "\#"
  cleaned = cleaned.replace(/(?<!\\)#/g, '\\#');
  
  if (!isCompetencies) {
    cleaned = cleaned.replace(/\s+/g, ' ');
  } else {
    cleaned = cleaned.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }
  return cleaned.trim();
}

console.log('=== RUNNING LATEX ESCAPING TESTS ===');

const testCases = [
  {
    name: 'Underscore Escaping',
    input: 'Working with python_developer roles and ml_ops lifecycle frameworks.',
    expected: 'Working with python\\_developer roles and ml\\_ops lifecycle frameworks.',
    isComp: false
  },
  {
    name: 'Ampersand replacement',
    input: 'Lead AI Strategy & Enterprise ML Lifecycle with R&D team.',
    expected: 'Lead AI Strategy and Enterprise ML Lifecycle with R and D team.',
    isComp: false
  },
  {
    name: 'Percentage Escaping',
    input: 'Increased throughput by 25% and reduced anomalies by 30%.',
    expected: 'Increased throughput by 25\\% and reduced anomalies by 30\\%.',
    isComp: false
  },
  {
    name: 'Dollar and Hash Escaping',
    input: 'Managed a budget of $120K for C# developments.',
    expected: 'Managed a budget of \\$120K for C\\# developments.',
    isComp: false
  },
  {
    name: 'Already Escaped Check',
    input: 'Already escaped \\% percent and \\_ underscore and \\$ dollar.',
    expected: 'Already escaped \\% percent and \\_ underscore and \\$ dollar.',
    isComp: false
  }
];

let allPassed = true;

testCases.forEach(tc => {
  const result = cleanLatex(tc.input, tc.isComp);
  if (result === tc.expected) {
    console.log(`✓ [PASSED] ${tc.name}`);
  } else {
    console.log(`✗ [FAILED] ${tc.name}`);
    console.log(`   Input:    ${tc.input}`);
    console.log(`   Expected: ${tc.expected}`);
    console.log(`   Result:   ${result}`);
    allPassed = false;
  }
});

console.log('\n=== TESTING SYSTEM DIRECTORY ACCESS ===');
const outputDir = './output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
console.log(`✓ Output directory exists or created: ${fs.existsSync(outputDir)}`);

const templatePath = './resume_template.tex';
if (fs.existsSync(templatePath)) {
  console.log(`✓ Base template file exists: ${templatePath}`);
  const content = fs.readFileSync(templatePath, 'utf8');
  console.log(`  Contains summary token: ${content.includes('%TOKEN_SUMMARY%')}`);
  console.log(`  Contains competencies token: ${content.includes('%TOKEN_COMPETENCIES%')}`);
} else {
  console.log(`✗ Base template file NOT found: ${templatePath}`);
  allPassed = false;
}

const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  console.log('\n=== TESTING GEMINI API CONNECTIVITY ===');
  console.log('Gemini API Key detected. Testing connectivity...');
  
  const mockJobDesc = 'We are looking for a Director of AI Engineering who is proficient in MLOps, LLMs, and Python. Needs to lead Strategy & vision execution.';
  
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Provide a quick response for testing in JSON: {"jobTitle": "Test Title", "companyName": "Test Company", "atsScore": 85, "analysis": "Looks good", "summary": "A test summary", "competencies": "item1"}`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            jobTitle: { type: "STRING" },
            companyName: { type: "STRING" },
            atsScore: { type: "INTEGER" },
            analysis: { type: "STRING" },
            summary: { type: "STRING" },
            competencies: { type: "STRING" }
          },
          required: ["jobTitle", "companyName", "atsScore", "analysis", "summary", "competencies"]
        }
      }
    })
  })
  .then(res => {
    if (res.ok) {
      console.log('✓ [PASSED] Gemini API connected successfully and schema accepted!');
    } else {
      res.text().then(text => {
        console.log(`✗ [FAILED] Gemini API returned error: ${res.status}\n${text}`);
      });
    }
  })
  .catch(err => {
    console.log(`✗ [FAILED] Gemini API request failed: ${err.message}`);
  });
} else {
  console.log('\n[INFO] Skipping Gemini API call test because GEMINI_API_KEY is not defined in the environment.');
}

if (allPassed) {
  console.log('\nAll local parsing & template checks passed!');
} else {
  console.log('\nSome test cases failed. Please review.');
  process.exit(1);
}

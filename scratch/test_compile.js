import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BASE_TEMPLATE_PATH = './resume_template.tex';
const OUTPUT_DIR = './output';

console.log('=== RUNNING LATEX COMPILATION TEST ===');

try {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (!fs.existsSync(BASE_TEMPLATE_PATH)) {
    throw new Error('Base template file not found.');
  }

  let content = fs.readFileSync(BASE_TEMPLATE_PATH, 'utf8');

  // Define mock summary and competencies following the exact structure
  const mockSummary = 'Visionary, truth-driven Engineering Leader with 20 plus years of software experience, specializing in building and scaling high-performing AI\\/ML teams. Proven track record of deploying production-grade agentic workflows and LLM applications at scale.';
  
  const mockCompetencies = `\\item \\textbf{AI Strategy and Vision Execution:} Expert at translating complex executive business objectives into executable engineering roadmaps, setting the technical vision for ML\\/LLM systems.
\\item \\textbf{Advanced AI and Agentic Workflows:} Deep technical expertise across LLM technologies including prompt engineering, Retrieval-Augmented Generation (RAG), vector embeddings, and tool-use orchestration.
\\item \\textbf{Lifecycle and Enterprise MLOps:} End-to-end ownership from research and rapid prototyping through production deployment, experiment tracking, and cloud-native observability.
\\item \\textbf{Cloud Infrastructure and Big Data:} Advanced proficiency with cloud-native ML ecosystems across Azure (Azure ML, Azure DevOps, Databricks) and AWS serverless computing.
\\item \\textbf{Team Scaling, Culture and Ethics:} Dedicated to cultivating a healthy, generative, and inclusive team culture focused on technical excellence and responsible AI principles.`;

  // Perform replace
  content = content.replace('%TOKEN_SUMMARY%', mockSummary);
  content = content.replace('%TOKEN_COMPETENCIES%', mockCompetencies);

  const texPath = path.join(OUTPUT_DIR, 'Bhagath_Siddi_Resume.tex');
  fs.writeFileSync(texPath, content, 'utf8');
  console.log(`✓ Mock LaTeX written to: ${texPath}`);

  // Run tectonic compilation
  const tectonicCmd = `/opt/homebrew/bin/tectonic -o "${OUTPUT_DIR}" "${texPath}"`;
  console.log(`Running: ${tectonicCmd}`);
  
  execSync(tectonicCmd);
  console.log('✓ Compilation command completed successfully!');

  const pdfPath = path.join(OUTPUT_DIR, 'Bhagath_Siddi_Resume.pdf');
  if (fs.existsSync(pdfPath)) {
    console.log(`✓ PDF successfully generated at: ${pdfPath}`);
    console.log(`  File size: ${fs.statSync(pdfPath).size} bytes`);
  } else {
    throw new Error(`PDF was not found at ${pdfPath} after compile completed.`);
  }

  console.log('\nCompilation Integration Test Passed successfully!');
} catch (error) {
  console.error('\nCompilation Integration Test FAILED:');
  console.error(error.message);
  process.exit(1);
}

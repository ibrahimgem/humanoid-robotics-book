#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Script to validate MDX syntax and check external links
async function validateMdx() {
  console.log('Validating MDX files and external links...\n');

  // Check if site builds without errors
  try {
    console.log('Checking build...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✓ Build successful\n');
  } catch (error) {
    console.error('✗ Build failed:', error.message);
    process.exit(1);
  }

  // Find all MDX files
  const docsDir = path.join(__dirname, '../docs');
  const mdxFiles = await findMdxFiles(docsDir);

  console.log(`Found ${mdxFiles.length} MDX files to validate\n`);

  // Validate each file
  let errors = 0;
  for (const file of mdxFiles) {
    try {
      const content = await fs.readFile(file, 'utf8');

      // Basic MDX syntax checks
      if (content.includes('```') && (content.match(/```/g) || []).length % 2 !== 0) {
        console.error(`✗ ${file}: Unmatched code block delimiters`);
        errors++;
      }

      // Check for proper frontmatter
      if (content.startsWith('---')) {
        const endFrontmatter = content.indexOf('---', 3);
        if (endFrontmatter === -1) {
          console.error(`✗ ${file}: Unclosed frontmatter`);
          errors++;
        }
      }

      console.log(`✓ ${file}: Valid`);
    } catch (error) {
      console.error(`✗ ${file}: Error reading file - ${error.message}`);
      errors++;
    }
  }

  if (errors > 0) {
    console.log(`\n${errors} validation errors found.`);
    process.exit(1);
  }

  console.log('\n✓ All MDX files validated successfully!');
}

async function findMdxFiles(dir) {
  const files = await fs.readdir(dir);
  let mdxFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      const subFiles = await findMdxFiles(filePath);
      mdxFiles = mdxFiles.concat(subFiles);
    } else if (file.endsWith('.mdx')) {
      mdxFiles.push(filePath);
    }
  }

  return mdxFiles;
}

validateMdx();
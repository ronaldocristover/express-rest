#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns to detect potential secrets
const SECRET_PATTERNS = [
  // API Keys
  { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"`]([a-zA-Z0-9_\-]{20,})/gi, name: 'API Key' },
  { pattern: /(?:secret[_-]?key|secretkey)\s*[:=]\s*['"`]([a-zA-Z0-9_\-]{20,})/gi, name: 'Secret Key' },
  
  // JWT Secrets
  { pattern: /(?:jwt[_-]?secret|jwtsecret)\s*[:=]\s*['"`]([a-zA-Z0-9_\-]{20,})/gi, name: 'JWT Secret' },
  
  // Database URLs with credentials
  { pattern: /(?:database[_-]?url|db[_-]?url)\s*[:=]\s*['"`]([^'"`\s]+:[^'"`\s]+@[^'"`\s]+)/gi, name: 'Database URL with credentials' },
  
  // AWS Keys
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' },
  { pattern: /(?:aws[_-]?secret|awssecret)\s*[:=]\s*['"`]([a-zA-Z0-9/+=]{40})/gi, name: 'AWS Secret Key' },
  
  // Private Keys
  { pattern: /-----BEGIN\s+(?:RSA\s+|EC\s+|DSA\s+)?PRIVATE\s+KEY-----/gi, name: 'Private Key' },
  
  // GitHub Tokens
  { pattern: /gh[prs]_[a-zA-Z0-9]{36}/g, name: 'GitHub Token' },
  
  // Generic tokens
  { pattern: /(?:token|bearer)\s*[:=]\s*['"`]([a-zA-Z0-9_\-]{20,})/gi, name: 'Token' },
  
  // Password patterns (avoid false positives with common words)
  { pattern: /(?:password|pwd|pass)\s*[:=]\s*['"`]([^'"`\s]{8,})/gi, name: 'Password' },
  
  // Redis URLs with auth
  { pattern: /redis:\/\/[^:]+:[^@]+@[^\/]+/gi, name: 'Redis URL with auth' },
  
  // MongoDB URLs with credentials
  { pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\/]+/gi, name: 'MongoDB URL with credentials' },
  
  // Generic base64 encoded secrets (longer than 32 chars)
  { pattern: /(?:secret|key|token|password)\s*[:=]\s*['"`]([A-Za-z0-9+/]{32,}={0,2})/gi, name: 'Base64 encoded secret' },
];

// File extensions to check
const EXTENSIONS_TO_CHECK = ['.ts', '.js', '.json', '.env', '.yaml', '.yml'];

// Files and directories to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.husky',
  'scripts/check-secrets.js', // Don't check this file itself
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function checkFileForSecrets(filePath) {
  if (shouldIgnoreFile(filePath)) {
    return [];
  }

  const ext = path.extname(filePath);
  if (!EXTENSIONS_TO_CHECK.includes(ext) && !filePath.includes('.env')) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const findings = [];

    SECRET_PATTERNS.forEach(({ pattern, name }) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        // Skip if it's a comment or example
        const line = content.split('\n')[content.substring(0, match.index).split('\n').length - 1];
        
        // Skip commented lines or obvious examples
        if (line.trim().startsWith('#') || 
            line.trim().startsWith('//') || 
            line.includes('example') || 
            line.includes('EXAMPLE') ||
            line.includes('your_') ||
            line.includes('YOUR_') ||
            line.includes('placeholder') ||
            line.includes('PLACEHOLDER')) {
          continue;
        }

        findings.push({
          file: filePath,
          type: name,
          line: content.substring(0, match.index).split('\n').length,
          match: match[0],
        });
      }
    });

    return findings;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

function scanDirectory(dir) {
  let findings = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      if (shouldIgnoreFile(fullPath)) {
        continue;
      }

      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findings = findings.concat(scanDirectory(fullPath));
      } else if (stat.isFile()) {
        findings = findings.concat(checkFileForSecrets(fullPath));
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dir}: ${error.message}`);
  }

  return findings;
}

function main() {
  console.log('🔍 Scanning for potential secrets and sensitive data...');
  
  const findings = scanDirectory(process.cwd());

  if (findings.length === 0) {
    console.log('✅ No potential secrets detected!');
    process.exit(0);
  }

  console.log(`\n❌ Found ${findings.length} potential secret(s):\n`);
  
  findings.forEach(finding => {
    console.log(`📄 File: ${finding.file}`);
    console.log(`📍 Line: ${finding.line}`);
    console.log(`🔑 Type: ${finding.type}`);
    console.log(`💡 Match: ${finding.match.substring(0, 50)}...`);
    console.log('---');
  });

  console.log('\n⚠️  Please review these findings and ensure no real secrets are committed.');
  console.log('💡 Consider using environment variables or a secure secret management system.');
  
  process.exit(1);
}

main();
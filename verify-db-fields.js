#!/usr/bin/env node
/**
 * Database Field Verification Script
 * 
 * This script verifies that the code matches the new database schema
 * based on chat-sql.txt specifications
 */

const fs = require('fs');
const path = require('path');

function findFieldUsage(directory, patterns) {
  const results = [];
  
  function searchInFile(filePath, content) {
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.search, 'g');
      let match;
      const lines = content.split('\n');
      
      while ((match = regex.exec(content)) !== null) {
        const lineNumber = content.substr(0, match.index).split('\n').length;
        results.push({
          file: filePath,
          line: lineNumber,
          pattern: pattern.name,
          match: match[0],
          issue: pattern.issue
        });
      }
    });
  }
  
  function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          searchInFile(filePath, content);
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  }
  
  walkDirectory(directory);
  return results;
}

function verifyDatabaseFields() {
  console.log('🔍 Database Field Verification\n');
  console.log('==========================================\n');
  
  // Define patterns to check for old field names
  const problemPatterns = [
    {
      name: 'Old spec field',
      search: /select.*['"']spec['"']/gi,
      issue: 'Should use "config" instead of "spec" field'
    },
    {
      name: 'Platform field on agents',
      search: /agents.*platform/gi,
      issue: 'Platform field no longer exists on agents table'
    },
    {
      name: 'Response time field',
      search: /response_time_ms/gi,
      issue: 'response_time_ms field no longer exists in logs table'
    },
    {
      name: 'Status field on logs',
      search: /logs.*status/gi,
      issue: 'Status field should be "level" in logs table'
    },
    {
      name: 'Deployed_at field',
      search: /deployed_at/gi,
      issue: 'deployed_at should be created_at in deployments table'
    },
    {
      name: 'Webhook/embed fields',
      search: /webhook_url|embed_code/gi,
      issue: 'webhook_url and embed_code should use "url" field'
    }
  ];
  
  // Check for issues in source files
  const srcDir = path.join(process.cwd(), 'src');
  const issues = findFieldUsage(srcDir, problemPatterns);
  
  // Fixed patterns (what we expect to see)
  const fixedPatterns = [
    {
      name: 'Config field usage',
      search: /select.*['"']config['"']/gi,
      issue: 'Good: Using config field correctly'
    },
    {
      name: 'Model field usage',
      search: /agents.*model/gi,
      issue: 'Good: Using model field instead of platform'
    },
    {
      name: 'Level field usage',
      search: /logs.*level/gi,
      issue: 'Good: Using level field correctly'
    }
  ];
  
  const goodUsages = findFieldUsage(srcDir, fixedPatterns);
  
  console.log('❌ Potential Issues Found:');
  if (issues.length === 0) {
    console.log('✅ No database field issues found!\n');
  } else {
    issues.forEach(issue => {
      console.log(`   ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Match: ${issue.match}\n`);
    });
  }
  
  console.log('✅ Good Usages Found:');
  if (goodUsages.length === 0) {
    console.log('⚠️  No corrected field usages detected.\n');
  } else {
    goodUsages.forEach(usage => {
      console.log(`   ${usage.file}:${usage.line} - ${usage.pattern}`);
      console.log(`   ${usage.issue}\n`);
    });
  }
  
  console.log('==========================================\n');
  
  // Summary
  const hasIssues = issues.length > 0;
  const hasGoodUsages = goodUsages.length > 0;
  
  if (!hasIssues && hasGoodUsages) {
    console.log('🎉 Database field migration looks good!');
    console.log('✨ Your code should now work with the new schema.\n');
    return true;
  } else if (hasIssues) {
    console.log('⚠️  Please fix the identified issues before deploying.');
    console.log('💡 The new schema expects these field changes:');
    console.log('   - workflows.spec → workflows.config');
    console.log('   - agents.platform → agents.model');
    console.log('   - logs.status → logs.level');
    console.log('   - deployments.deployed_at → deployments.created_at');
    console.log('   - deployments.webhook_url/embed_code → deployments.url\n');
    return false;
  } else {
    console.log('⚠️  No field usages detected. This might indicate other issues.\n');
    return false;
  }
}

// Schema verification
function verifySchemaAlignment() {
  console.log('📋 Schema Alignment Check:');
  console.log('==========================================');
  
  const schemaFile = path.join(process.cwd(), 'updated_kynex_schema.sql');
  const chatSqlFile = 'C:\\Users\\nadee\\OneDrive\\ドキュメント\\Nadeem\\chat-sql.txt';
  
  let schemaExists = fs.existsSync(schemaFile);
  let chatSqlExists = fs.existsSync(chatSqlFile);
  
  console.log(`✅ Updated schema file: ${schemaExists ? 'Found' : 'Missing'}`);
  console.log(`✅ Chat SQL reference: ${chatSqlExists ? 'Found' : 'Missing'}`);
  
  if (schemaExists) {
    const schemaContent = fs.readFileSync(schemaFile, 'utf8');
    const hasCorrectTables = [
      'CREATE TABLE users',
      'CREATE TABLE workflows', 
      'CREATE TABLE agents',
      'CREATE TABLE deployments',
      'CREATE TABLE logs',
      'CREATE TABLE subscription_usage',
      'CREATE TABLE webhook_events',
      'CREATE TABLE performance_metrics'
    ].every(table => schemaContent.includes(table));
    
    console.log(`✅ All required tables: ${hasCorrectTables ? 'Present' : 'Missing some tables'}`);
    console.log(`✅ RLS enabled: ${schemaContent.includes('ENABLE ROW LEVEL SECURITY') ? 'Yes' : 'No'}`);
    console.log(`✅ Policies defined: ${schemaContent.includes('CREATE POLICY') ? 'Yes' : 'No'}\n`);
  }
}

// Run verification
const isValid = verifyDatabaseFields();
verifySchemaAlignment();

// Recommendations
console.log('💡 Next Steps:');
console.log('==========================================');
console.log('1. Apply the updated schema: Copy updated_kynex_schema.sql to Supabase');
console.log('2. Test the application to ensure no database errors');
console.log('3. Check the browser console for any remaining field errors');
console.log('4. Verify RLS policies are working correctly\n');

process.exit(isValid ? 0 : 1);

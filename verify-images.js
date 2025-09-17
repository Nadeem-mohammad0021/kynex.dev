#!/usr/bin/env node
/**
 * KYNEX Image Verification Script
 * 
 * This script verifies that all required images are in place and properly configured.
 * Run this after updating your images and favicon.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  { 
    path: 'public/favicon.ico', 
    description: 'Main favicon (32x32 icon)',
    required: true 
  },
  { 
    path: 'public/apple-touch-icon.png', 
    description: 'Apple touch icon (180x180 PNG)',
    required: true 
  },
  { 
    path: 'public/images/kynex-logo.png', 
    description: 'Main KYNEX logo (PNG format)',
    required: true 
  }
];

const OPTIONAL_FILES = [
  { 
    path: 'public/images/kynex-logo.svg', 
    description: 'Vector KYNEX logo (SVG format)',
    required: false 
  }
];

function checkFile(fileInfo) {
  const fullPath = path.join(process.cwd(), fileInfo.path);
  const exists = fs.existsSync(fullPath);
  
  let status = '✅';
  let message = `Found: ${fileInfo.description}`;
  
  if (!exists) {
    status = fileInfo.required ? '❌' : '⚠️';
    message = `${fileInfo.required ? 'MISSING' : 'OPTIONAL'}: ${fileInfo.description}`;
  } else {
    // Get file size
    const stats = fs.statSync(fullPath);
    const sizeKB = Math.round(stats.size / 1024);
    message += ` (${sizeKB}KB)`;
  }
  
  return { status, message, exists, required: fileInfo.required };
}

function verifyImages() {
  console.log('🔍 KYNEX Image Verification\n');
  console.log('==========================================\n');
  
  let allRequired = true;
  let hasWarnings = false;
  
  // Check required files
  console.log('📋 Required Files:');
  for (const file of REQUIRED_FILES) {
    const result = checkFile(file);
    console.log(`${result.status} ${result.message}`);
    
    if (result.required && !result.exists) {
      allRequired = false;
    }
  }
  
  console.log('\n📋 Optional Files:');
  for (const file of OPTIONAL_FILES) {
    const result = checkFile(file);
    console.log(`${result.status} ${result.message}`);
    
    if (!result.exists) {
      hasWarnings = true;
    }
  }
  
  console.log('\n==========================================\n');
  
  // Check layout.tsx configuration
  const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const checks = [
      { 
        pattern: /favicon\.ico/, 
        message: 'Favicon reference in layout.tsx' 
      },
      { 
        pattern: /apple-touch-icon\.png/, 
        message: 'Apple touch icon reference in layout.tsx' 
      },
      { 
        pattern: /\/images\/kynex-logo\.png/, 
        message: 'KYNEX logo reference in layout.tsx' 
      }
    ];
    
    console.log('⚙️  Configuration Check:');
    for (const check of checks) {
      const found = check.pattern.test(layoutContent);
      console.log(`${found ? '✅' : '❌'} ${check.message}`);
      if (!found) allRequired = false;
    }
  } else {
    console.log('❌ Could not find src/app/layout.tsx');
    allRequired = false;
  }
  
  console.log('\n==========================================\n');
  
  // Final status
  if (allRequired) {
    console.log('🎉 All required images and configurations are in place!');
    if (hasWarnings) {
      console.log('⚠️  Some optional files are missing, but your app will work fine.');
    }
    console.log('\n✨ Your KYNEX application is ready to go!\n');
  } else {
    console.log('❌ Some required files or configurations are missing.');
    console.log('\n📝 To fix this:');
    console.log('1. Make sure all required image files are in the correct locations');
    console.log('2. Verify that layout.tsx has the correct favicon references');
    console.log('3. Run this script again to verify\n');
  }
  
  return allRequired;
}

// Additional helper function to generate recommended sizes
function generateImageRecommendations() {
  console.log('\n💡 Image Size Recommendations:');
  console.log('==========================================');
  console.log('favicon.ico: 16x16px or 32x32px (.ico file)');
  console.log('apple-touch-icon.png: 180x180px (PNG format)');
  console.log('kynex-logo.png: Optimized smaller size, 128x128px to 256x256px');
  console.log('  - Used in navigation: 28x28px to 40x40px');
  console.log('  - Used in loader: 20x20px to 44x44px');
  console.log('  - Social media: Can be larger but optimized for web');
  console.log('  - Should be square and high quality PNG');
  console.log('  - No oversized images - keep under 100KB for performance');
  console.log('==========================================\n');
}

// Run verification
const isValid = verifyImages();

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  generateImageRecommendations();
}

process.exit(isValid ? 0 : 1);

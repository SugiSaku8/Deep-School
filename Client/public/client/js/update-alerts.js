import { showAlert } from './utils/dialog';

// Update all alert calls to use showAlert
// This is a helper script to find and replace alert calls
// You can run this script to update the codebase

// Example usage:
// Find: alert\(([^)]+)\)
// Replace with: showAlert($1)

// For template literals:
// Find: alert\(`([^`]+)`\)
// Replace with: showAlert(`$1`)

// For multi-line alerts:
// Find: alert\([\s\S]+?\)
// Replace with: showAlert($1)

// Note: You'll need to manually review and update each file
// to ensure the dialog is properly imported and used

// Example of how to update a file programmatically:
/*
import fs from 'fs';
import path from 'path';

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Simple alert replacement
  content = content.replace(/alert\(([^)]+)\)/g, 'showAlert($1)');
  
  // Template literals
  content = content.replace(/alert\(`([^`]+)`\)/g, 'showAlert(`$1`)');
  
  // Multi-line alerts (simplified)
  content = content.replace(/alert\(([\s\S]+?)\)/g, 'showAlert($1)');
  
  // Add import if not present
  if (!content.includes('import { showAlert }')) {
    const importStatement = 'import { showAlert } from \'./utils/dialog\';\n';
    content = importStatement + content;
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// Example usage:
// updateFile(path.join(__dirname, 'path/to/file.js'));
*/

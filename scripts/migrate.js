const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source does not exist: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');
      
      // Update import paths
      content = content.replace(/from ['"]@\/src\/components/g, "from '@/components");
      content = content.replace(/from ['"]@\/src\/lib/g, "from '@/lib");
      content = content.replace(/from ['"]@\/src\/hooks/g, "from '@/hooks");
      content = content.replace(/import\.meta\.env/g, 'process.env');
      
      fs.writeFileSync(destPath, content, 'utf-8');
      console.log(`Copied and updated: ${destPath}`);
    }
  });
}

// Copy components
copyRecursive(
  path.join(__dirname, '../src/components'),
  path.join(__dirname, '../components')
);

// Copy hooks
copyRecursive(
  path.join(__dirname, '../src/hooks'),
  path.join(__dirname, '../hooks')
);

console.log('Migration complete!');

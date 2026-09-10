const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find template: `...`
  const templateRegex = /template\s*:\s*`([\s\S]*?)`,?\s*(styleUrl|styles|encapsulation|\n})/g;

  let match;
  let fileModified = false;

  // Need to be careful with replace, let's just find it and manually slice/splice or string replace if it matches exactly once.
  // Actually, standard regex match loop:

  const matches = [...content.matchAll(/template\s*:\s*`([\s\S]*?)`/g)];
  if (matches.length > 0) {
    console.log(`Found template in ${filePath}`);
    for (const match of matches) {
      const templateContent = match[1];
      const componentDir = path.dirname(filePath);
      const ext = path.extname(filePath);
      const baseName = path.basename(filePath, ext); // e.g. 'header.component'
      const htmlPath = path.join(componentDir, `${baseName}.html`);

      fs.writeFileSync(htmlPath, templateContent);
      console.log(`Created ${htmlPath}`);

      // Replace in content
      content = content.replace(match[0], `templateUrl: './${baseName}.html'`);
      fileModified = true;
    }
  }

  if (fileModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Done extracting templates.');

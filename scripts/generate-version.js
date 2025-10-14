const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateVersionFile() {
    const packageJson = require('../package.json');
    const version = packageJson.version;
    let commitHash = '';
    try {
        commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    } catch (e) {
        commitHash = 'unknown';
    }
    const buildDate = new Date().toISOString();

    const content = `// This file is auto-generated during build.\nexport const APP_VERSION = '${version}';\nexport const GIT_COMMIT = '${commitHash}';\nexport const BUILD_DATE = '${buildDate}';\n`;

    fs.writeFileSync(path.join(__dirname, '../src/version.ts'), content);
    console.log('Generated src/version.ts');
}

generateVersionFile();

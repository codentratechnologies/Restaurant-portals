const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // This regex targets the specific div that contains the manual breadcrumb
            // <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            //   <Link ...>...</Link>
            //   <ChevronRight className="w-4 h-4" />
            //   <span ...>...</span>
            // </div>
            const regex = /<div className="flex items-center gap-2 text-sm font-medium text-text-secondary">[\s\S]*?<ChevronRight className="w-4 h-4" \/>[\s\S]*?<\/div>/g;
            
            if (regex.test(content)) {
                content = content.replace(regex, '');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated manual breadcrumbs in: ${fullPath}`);
            }
        }
    }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);
console.log('Done!');

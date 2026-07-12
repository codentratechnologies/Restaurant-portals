const fs = require('fs');
const path = require('path');

function processDirectory(dir, prefix, excludeDirs = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                processDirectory(fullPath, prefix, excludeDirs);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            const ignoreList = ['/login', '/signup', '/forgot-password', '/select-workplace', '/dashboard'];
            
            const isIgnored = (p) => {
                if (p.startsWith(prefix)) return true;
                for (let ignore of ignoreList) {
                    if (p === ignore || p.startsWith(ignore + '/')) return true;
                }
                return false;
            };

            // replace to="/..."
            content = content.replace(/to="(\/[^"]+)"/g, (match, p1) => {
                if (isIgnored(p1)) return match;
                modified = true;
                return `to="${prefix}${p1}"`;
            });
            
            // replace to={`/...`}
            content = content.replace(/to=\{\s*`(\/[^`]+)`\s*\}/g, (match, p1) => {
                if (isIgnored(p1)) return match;
                modified = true;
                return `to={\`${prefix}${p1}\`}`;
            });
            
            // replace navigate('/...')
            content = content.replace(/navigate\('(\/[^']+)'\)/g, (match, p1) => {
                if (isIgnored(p1)) return match;
                modified = true;
                return `navigate('${prefix}${p1}')`;
            });

            // replace navigate(`/...`)
            content = content.replace(/navigate\(`(\/[^`]+)`\)/g, (match, p1) => {
                if (isIgnored(p1)) return match;
                modified = true;
                return `navigate(\`${prefix}${p1}\`)`;
            });
            
            // replace path: '/...'
            content = content.replace(/path:\s*'(\/[^']+)'/g, (match, p1) => {
                if (isIgnored(p1)) return match;
                modified = true;
                return `path: '${prefix}${p1}'`;
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(path.join(srcDir, 'admin-pages'), '/admin', ['auth']);
processDirectory(path.join(srcDir, 'restaurant-pages'), '/restaurant', ['auth']);
console.log('Done!');

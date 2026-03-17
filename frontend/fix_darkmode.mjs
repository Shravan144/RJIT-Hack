import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Replace hardcoded light mode colors with brand tokens, which handle both light and dark mode automatically
    content = content.replace(/\bbg-white\b/g, 'bg-brand-surface');
    content = content.replace(/\bbg-slate-50\b/g, 'bg-brand-bg');
    content = content.replace(/\bborder-slate-200\b/g, 'border-brand-border');
    content = content.replace(/\bborder-slate-100\b/g, 'border-brand-subtle');
    content = content.replace(/\btext-slate-900\b/g, 'text-brand-base');
    // Note: text-slate-700 -> text-brand-base logic mapping so dark mode text becomes #f8fafc instead of dark text on dark bg.
    content = content.replace(/\btext-slate-700\b/g, 'text-brand-base');
    content = content.replace(/\btext-slate-500\b/g, 'text-brand-muted');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
    }
});

console.log('Updated ' + changedCount + ' files.');

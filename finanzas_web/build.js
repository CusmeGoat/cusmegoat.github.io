import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = import.meta.dirname;
const files = ['index.html', 'app.js', 'data.js', 'domain.js', 'styles.css', 'sw.js', 'manifest.webmanifest', 'icon.svg'];
await mkdir(join(root, 'dist'), { recursive: true });
await Promise.all(files.map(file => copyFile(join(root, file), join(root, 'dist', file))));
console.log(`Prepared ${files.length} public files.`);

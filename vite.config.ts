import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// High-speed Tailwind CSS v4 compiler plugin for Vite
function tailwindV4Plugin(): Plugin {
    let tailwindCompiler: any = null;
    try {
        tailwindCompiler = require('tailwindcss');
    } catch {
        console.warn('Tailwind CSS module not found');
    }

    return {
        name: 'vite-plugin-tailwindcss-v4',
        enforce: 'pre',
        async transform(code: string, id: string) {
            if (!id.endsWith('.css') || !code.includes('tailwindcss')) {
                return null;
            }
            if (!tailwindCompiler) return null;

            // Scan all candidates from src files
            const srcDir = path.resolve('src');
            const candidates = new Set<string>();

            const scanDir = (dir: string) => {
                if (!fs.existsSync(dir)) return;
                for (const file of fs.readdirSync(dir)) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        scanDir(fullPath);
                    } else if (/\.(tsx|ts|jsx|js|html)$/.test(file)) {
                        const content = fs.readFileSync(fullPath, 'utf-8');
                        const matches = content.match(/[A-Za-z0-9-_:\/.\[\]#%]+/g) || [];
                        matches.forEach((m) => candidates.add(m));
                    }
                }
            };
            scanDir(srcDir);

            // Also scan html root
            if (fs.existsSync('index.html')) {
                const htmlContent = fs.readFileSync('index.html', 'utf-8');
                (htmlContent.match(/[A-Za-z0-9-_:\/.\[\]#%]+/g) || []).forEach((m) => candidates.add(m));
            }

            try {
                const compiled = await tailwindCompiler.compile(code, {
                    loadStylesheet: async (sheetId: string) => {
                        if (sheetId === 'tailwindcss' || sheetId.includes('tailwindcss')) {
                            const tailwindCssPath = require.resolve('tailwindcss/index.css');
                            return {
                                base: path.dirname(tailwindCssPath),
                                content: fs.readFileSync(tailwindCssPath, 'utf-8'),
                            };
                        }
                        const resolvedPath = path.resolve(path.dirname(id), sheetId);
                        if (fs.existsSync(resolvedPath)) {
                            return {
                                base: path.dirname(resolvedPath),
                                content: fs.readFileSync(resolvedPath, 'utf-8'),
                            };
                        }
                        throw new Error(`Stylesheet not found: ${sheetId}`);
                    },
                });

                const compiledCss = compiled.build(Array.from(candidates));
                return {
                    code: compiledCss,
                    map: null,
                };
            } catch (err) {
                console.error('Tailwind v4 compilation error:', err);
                return null;
            }
        },
    };
}

export default defineConfig({
    plugins: [
        tailwindV4Plugin(),
        react(),
    ],
});

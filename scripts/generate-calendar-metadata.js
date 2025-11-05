#!/usr/bin/env node

/**
 * Generate metadata tables for the liturgical calendar engine.
 * Currently extracts rank + commune information from Divinum Officium Sancti files (English).
 */

import fs from 'fs/promises';
import path from 'path';

const BASE_DIR = path.resolve('./divinum-officium/web/www/horas/English');
const OUTPUT_DIR = path.resolve('./src/data');

const RANK_KEYWORDS = [
    { test: /I\s+classis/i, value: 'first' },
    { test: /II\s+classis/i, value: 'second' },
    { test: /I\.?\s*class/i, value: 'first' },
    { test: /II\.?\s*class/i, value: 'second' },
    { test: /Duplex\s+maius/i, value: 'second' },
    { test: /Duplex/i, value: 'third' },
    { test: /Semiduplex/i, value: 'third' },
    { test: /Simplex/i, value: 'memorial' },
    { test: /Commemoratio/i, value: 'memorial' },
    { test: /Memorial/i, value: 'memorial' }
];

async function main() {
    const sanctiDir = path.join(BASE_DIR, 'Sancti');
    const entries = await fs.readdir(sanctiDir);
    const metadata = {};

    for (const entry of entries) {
        if (!entry.endsWith('.txt')) continue;
        const filePath = path.join(sanctiDir, entry);
        const content = await fs.readFile(filePath, 'utf-8');
        const saintMeta = extractSaintMetadata(content);
        if (!saintMeta) continue;

        const key = entry.replace(/\.txt$/i, '');
        metadata[key] = {
            file: entry,
            ...saintMeta
        };
    }

    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const jsonPath = path.join(OUTPUT_DIR, 'saints-metadata.json');
    await fs.writeFile(jsonPath, JSON.stringify(metadata, null, 2));

    const jsPath = path.join(OUTPUT_DIR, 'saints-metadata.js');
    const moduleSource = `export default ${JSON.stringify(metadata, null, 2)};\n`;
    await fs.writeFile(jsPath, moduleSource);

    console.log(`Saved metadata for ${Object.keys(metadata).length} saints to ${path.relative(process.cwd(), jsonPath)} and ${path.relative(process.cwd(), jsPath)}`);
}

function extractSaintMetadata(content) {
    const lines = content.split(/\r?\n/);
    const rankEntries = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('[Rank')) {
            const next = lines[i + 1] || '';
            rankEntries.push({ header: line, data: next });
        }
    }

    let title = null;
    let rawRank = '';
    let priority = '';
    let extra = '';

    if (rankEntries.length > 0) {
        // Prefer rubrica 1960 if available
        const preferred = rankEntries.find(entry => /1960/.test(entry.header)) || rankEntries[0];
        const parts = preferred.data.split(';;').map(part => part.trim());
        [title, rawRank = '', priority = '', extra = ''] = parts;
    }

    if (!title) {
        title = extractTitle(content);
    }

    const normalizedRank = normalizeRank(rawRank, priority);
    const commune = parseCommune(extra);

    return {
        title,
        rawRank,
        priority,
        rank: normalizedRank,
        commune
    };
}

function normalizeRank(raw, priority) {
    if (raw) {
        for (const candidate of RANK_KEYWORDS) {
            if (candidate.test.test(raw)) {
                return candidate.value;
            }
        }
    }

    // Fallback to priority number (1 highest, 12 lowest typically)
    if (priority) {
        const value = parseFloat(priority);
        if (!Number.isNaN(value)) {
            if (value <= 1.5) return 'first';
            if (value <= 3) return 'second';
            if (value <= 6) return 'third';
            return 'memorial';
        }
    }

    return raw ? 'memorial' : 'third';
}

function parseCommune(extra) {
    if (!extra) return null;

    const match = extra.match(/(?:ex|vide)\s+([^;]+)/i);
    if (!match) return null;

    let value = match[1].trim();
    // Normalize separators and ensure .txt suffix
    value = value.replace(/\s+/g, '');

    if (!value.toLowerCase().endsWith('.txt')) {
        value = `${value}.txt`;
    }

    return value;
}

function extractTitle(content) {
    const officiumMatch = content.match(/\[Officium\]\s*\n([^\n]+)/);
    if (officiumMatch) {
        return officiumMatch[1].trim();
    }

    const firstLine = content.split(/\r?\n/).find(line => line.trim());
    if (!firstLine) return null;

    return firstLine.replace(/\[.*?\]/g, '').trim();
}

main().catch(error => {
    console.error('Failed to generate calendar metadata:', error);
    process.exitCode = 1;
});

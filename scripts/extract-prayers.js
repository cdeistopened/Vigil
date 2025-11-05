#!/usr/bin/env node

/**
 * Divinum Officium Data Extractor - English & Latin Only
 * Processes DO repository for fast offline prayer access
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DivinumOfficiumParser } from '../src/parser.js';
import { LiturgicalCalendar } from '../src/calendar.js';

class DataExtractor {
    constructor(options = {}) {
        const {
            languages = ['English'],
            startDate = '2025-09-01',
            endDate = '2025-10-31',
            baseDir = './divinum-officium/web/www/horas',
            outputDir = './src/data'
        } = options;

        this.parser = new DivinumOfficiumParser();
        this.calendar = new LiturgicalCalendar();
        this.baseDir = baseDir;
        this.outputDir = outputDir;

        this.languages = languages;

        this.fileCache = new Map();
        this.processedDays = 0;

        this.startDate = this.normalizeDate(startDate);
        this.endDate = this.normalizeDate(endDate);

        if (Number.isNaN(this.startDate.getTime()) || Number.isNaN(this.endDate.getTime())) {
            throw new Error('Invalid start or end date supplied to DataExtractor');
        }

        if (this.endDate < this.startDate) {
            throw new Error('End date must be on or after the start date');
        }
    }

    normalizeDate(input) {
        if (input instanceof Date) {
            return new Date(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate());
        }
        if (typeof input === 'string') {
            const match = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (match) {
                const [, year, month, day] = match;
                return new Date(Number(year), Number(month) - 1, Number(day));
            }
        }
        return new Date(input);
    }

    /**
     * Main extraction - English & Latin for current year
     */
    async extract() {
        console.log('🚀 Extracting prayers...');

        await fs.mkdir(this.outputDir, { recursive: true });

        for (const language of this.languages) {
            console.log(`🌐 Extracting ${language}...`);
            await this.extractLanguage(language);
        }

        console.log('✅ Extraction complete!');
    }

    /**
     * Extract one language for the year
     */
    async extractLanguage(language) {
        const dataset = {
            extracted: new Date().toISOString(),
            language,
            range: {
                start: this.formatDateKey(this.startDate),
                end: this.formatDateKey(this.endDate)
            },
            source: 'Divinum Officium',
            prayers: {}
        };

        let dayCount = 0;
        for (let cursor = new Date(this.startDate); cursor <= this.endDate; cursor.setDate(cursor.getDate() + 1)) {
            const date = new Date(cursor.getTime());
            const dayKey = this.formatDateKey(date);

            try {
                console.log(`${language}: ${dayKey}`);
                dataset.prayers[dayKey] = await this.extractDay(date, language);
                dayCount++;
            } catch (error) {
                console.warn(`⚠️  ${language} ${dayKey}: ${error.message}`);
                dataset.prayers[dayKey] = this.createFallbackDay(date);
            }
        }

        const outputPath = path.join(this.outputDir, `prayers-${language.toLowerCase()}.json`);
        await fs.writeFile(outputPath, JSON.stringify(dataset, null, 2));

        console.log(`💾 ${language}: Saved ${dayCount} days`);
    }

    /**
     * Extract one day in one language
     */
    async extractDay(date, language) {
        const liturgicalDay = this.calendar.getLiturgicalDay(date);

        const prayers = {};

        const fileDescriptors = [
            { key: 'commune', descriptor: liturgicalDay.files.commune },
            { key: 'tempora', descriptor: liturgicalDay.files.tempora },
            { key: 'sancti', descriptor: liturgicalDay.files.sancti }
        ];

        const loadedSections = {};

        for (const { descriptor } of fileDescriptors) {
            if (!descriptor) continue;
            const { type, filename } = descriptor;
            const sections = await this.tryLoadFile(language, type, filename);
            for (const [sectionName, sectionData] of Object.entries(sections)) {
                loadedSections[sectionName] = sectionData;
            }
        }

        // Extract canonical hours
        const hours = this.extractSimpleHours(loadedSections);

        return {
            date: this.formatDateKey(date),
            liturgical: {
                season: liturgicalDay.season,
                week: liturgicalDay.week,
                dayOfWeek: liturgicalDay.dayOfWeek
            },
            observances: liturgicalDay.observances,
            primary: liturgicalDay.primary,
            commemorations: liturgicalDay.commemorations,
            hours
        };
    }

    /**
     * Try to load and parse a file, return empty if not found
     */
    async tryLoadFile(language, type, filename) {
        try {
            const content = await this.loadFile(language, type, filename);
            const parsed = this.parser.parseFile(content);
            const resolved = await this.parser.resolveReferences(parsed, async (reference) => {
                const refInfo = this.parseReference(reference, language);
                if (!refInfo) {
                    return reference.fullMatch || '';
                }

                try {
                    const refContent = await this.loadFile(refInfo.language, refInfo.type, refInfo.filename);
                    return refContent;
                } catch (error) {
                    console.warn(`Failed to load referenced file ${refInfo.type}/${refInfo.filename}:`, error.message);
                    return reference.fullMatch || '';
                }
            });

            return resolved.sections;
        } catch (error) {
            // File doesn't exist or failed to parse - return empty
            return {};
        }
    }

    parseReference(reference, language) {
        const type = reference.type || null;
        const file = reference.file || reference.path || reference.target;

        if (!type || !file) {
            return null;
        }

        const normalizedFilename = file.endsWith('.txt') ? file : `${file}.txt`;
        return {
            language,
            type,
            filename: normalizedFilename
        };
    }

    /**
     * Load file with caching
     */
    async loadFile(language, type, filename) {
        const filePath = path.join(this.baseDir, language, type, filename);
        const cacheKey = filePath;

        if (this.fileCache.has(cacheKey)) {
            return this.fileCache.get(cacheKey);
        }

        const content = await fs.readFile(filePath, 'utf-8');
        this.fileCache.set(cacheKey, content);
        return content;
    }

    /**
     * Extract hours in simple format for fast loading
     */
    extractSimpleHours(sections) {
        const hours = {
            matutinum: { name: 'Matins', prayers: [] },
            laudes: { name: 'Lauds', prayers: [] },
            prima: { name: 'Prime', prayers: [] },
            tertia: { name: 'Terce', prayers: [] },
            sexta: { name: 'Sext', prayers: [] },
            nona: { name: 'None', prayers: [] },
            vespera: { name: 'Vespers', prayers: [] },
            completorium: { name: 'Compline', prayers: [] }
        };

        // Map sections to hours based on name patterns
        for (const [sectionName, sectionData] of Object.entries(sections)) {
            const prayer = {
                title: this.formatSectionName(sectionName),
                text: this.cleanText(sectionData.text),
                type: this.determineSectionType(sectionName)
            };

            // Assign to appropriate hour(s)
            const lowerName = sectionName.toLowerCase();
            
            if (lowerName.includes('matutinum') || lowerName.includes('lectio') || lowerName.includes('responsory')) {
                hours.matutinum.prayers.push(prayer);
            } else if (lowerName.includes('laudes')) {
                hours.laudes.prayers.push(prayer);
            } else if (lowerName.includes('vespera')) {
                hours.vespera.prayers.push(prayer);
            } else if (lowerName.includes('oratio')) {
                // Prayer goes to all hours
                Object.values(hours).forEach(hour => hour.prayers.push(prayer));
            }
        }

        // Remove empty hours and ensure each hour has at least one prayer
        Object.keys(hours).forEach(hourKey => {
            if (hours[hourKey].prayers.length === 0) {
                hours[hourKey].prayers.push({
                    title: 'Prayer',
                    text: `Grant us, O Lord, to begin this hour with your blessing. Through Christ our Lord. Amen.`,
                    type: 'prayer'
                });
            }
        });

        return hours;
    }

    /**
     * Clean and format text for display
     */
    cleanText(text) {
        if (!text) return '';
        
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.match(/^\d+→/)) // Remove line numbers
            .join('\n');
    }

    /**
     * Format section names for display
     */
    formatSectionName(sectionName) {
        const nameMap = {
            'Oratio': 'Prayer',
            'Ant Laudes': 'Antiphons for Lauds',
            'Ant Vespera': 'Antiphons for Vespers',
            'Hymnus Laudes': 'Hymn',
            'Lectio1': 'First Reading',
            'Lectio2': 'Second Reading',
            'Lectio3': 'Third Reading'
        };

        return nameMap[sectionName] || sectionName.replace(/([A-Z])/g, ' $1').trim();
    }

    /**
     * Determine section type for styling
     */
    determineSectionType(sectionName) {
        const name = sectionName.toLowerCase();
        
        if (name.includes('ant')) return 'antiphon';
        if (name.includes('lectio')) return 'reading';
        if (name.includes('hymnus')) return 'hymn';
        if (name.includes('oratio')) return 'prayer';
        if (name.includes('responsory')) return 'responsory';
        
        return 'text';
    }

    /**
     * Format date as YYYY-MM-DD
     */
    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Create minimal fallback data
     */
    createFallbackDay(date) {
        return {
            date: this.formatDateKey(date),
            liturgical: {
                season: 'ordinary',
                week: 'Pent01',
                dayOfWeek: date.getDay()
            },
            hours: {
                laudes: {
                    name: 'Lauds',
                    prayers: [{
                        title: 'Morning Prayer',
                        text: 'O God, you have brought us to the beginning of a new day. Save us this day by your power. Through Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                },
                vespera: {
                    name: 'Vespers',
                    prayers: [{
                        title: 'Evening Prayer',
                        text: 'O God, you have brought us safely to the close of this day. Protect us through the night. Through Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                }
            }
        };
    }
}

// Run if called directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
    const cliOptions = parseArguments(process.argv.slice(2));
    const extractor = new DataExtractor(cliOptions);
    extractor.extract().catch((error) => {
        console.error('❌ Extraction failed:', error);
        process.exitCode = 1;
    });
}

export { DataExtractor };

function parseArguments(argv) {
    const options = {};
    const args = [...argv];

    while (args.length > 0) {
        const arg = args.shift();

        switch (arg) {
            case '--start':
            case '-s':
                options.startDate = requireValue(arg, args.shift());
                break;
            case '--end':
            case '-e':
                options.endDate = requireValue(arg, args.shift());
                break;
            case '--language':
            case '--lang':
            case '-l':
                options.languages = [requireValue(arg, args.shift())];
                break;
            case '--languages':
                options.languages = parseList(requireValue(arg, args.shift()));
                break;
            case '--output':
            case '-o':
                options.outputDir = requireValue(arg, args.shift());
                break;
            case '--base':
                options.baseDir = requireValue(arg, args.shift());
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
            default:
                console.warn(`⚠️  Unknown argument ignored: ${arg}`);
        }
    }

    return options;
}

function parseList(value) {
    return value.split(',').map(v => v.trim()).filter(Boolean);
}

function requireValue(flag, value) {
    if (!value) {
        throw new Error(`Missing value for ${flag}`);
    }
    return value;
}

function printHelp() {
    console.log(`Usage: node scripts/extract-prayers.js [options]\n\n` +
        `Options:\n` +
        `  -s, --start <YYYY-MM-DD>     Start date (inclusive)\n` +
        `  -e, --end <YYYY-MM-DD>       End date (inclusive)\n` +
        `  -l, --language <name>        Single language (default: English)\n` +
        `      --languages <list>       Comma-separated languages\n` +
        `  -o, --output <dir>           Output directory (default: ./src/data)\n` +
        `      --base <dir>             Divinum Officium base directory\n` +
        `  -h, --help                   Show this help message`);
}

/**
 * Divinum Officium Data Parser
 * Parses the complex text files from the Divinum Officium repository
 */

export class DivinumOfficiumParser {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Parse a liturgical text file
     * @param {string} content - Raw text content of the file
     * @returns {Object} Parsed liturgical data
     */
    parseFile(content) {
        const lines = content.split('\n');
        const result = {
            sections: {},
            metadata: {},
            references: []
        };

        let currentSection = null;
        let currentContent = [];

        for (let line of lines) {
            line = line.trim();
            
            // Skip empty lines and line numbers
            if (!line || /^\s*\d+→/.test(line)) {
                continue;
            }

            // Remove line number prefix if present
            line = line.replace(/^\s*\d+→/, '');

            // Check for section headers [Section Name]
            const sectionMatch = line.match(/^\[([^\]]+)\](.*)$/);
            if (sectionMatch) {
                // Save previous section
                if (currentSection && currentContent.length > 0) {
                    result.sections[currentSection] = this.processContent(currentContent.join('\n'));
                }

                // Start new section
                currentSection = sectionMatch[1];
                currentContent = [];
                
                // Handle section modifiers like (rubrica tridentina)
                const modifier = sectionMatch[2].trim();
                if (modifier) {
                    currentSection = `${currentSection}${modifier}`;
                }
                continue;
            }

            // Add line to current section
            if (currentSection) {
                currentContent.push(line);
            }
        }

        // Don't forget the last section
        if (currentSection && currentContent.length > 0) {
            result.sections[currentSection] = this.processContent(currentContent.join('\n'));
        }

        // Extract metadata from key sections
        this.extractMetadata(result);

        return result;
    }

    /**
     * Process content within a section
     * @param {string} content - Raw section content
     * @returns {Object} Processed content with references and conditionals
     */
    processContent(content) {
        const result = {
            text: content,
            references: [],
            conditionals: [],
            substitutions: []
        };

        // Find @ references
        const refMatches = content.matchAll(/@([^@\s]+)/g);
        for (const match of refMatches) {
            const descriptor = this.parseReferenceDescriptor(match[1]);
            result.references.push({
                type: 'reference',
                ...descriptor,
                fullMatch: match[0]
            });
        }

        // Find conditional statements (rubrica conditions)
        const condMatches = content.matchAll(/\(([^)]+)\)/g);
        for (const match of condMatches) {
            result.conditionals.push({
                type: 'conditional',
                condition: match[1],
                fullMatch: match[0]
            });
        }

        // Find text substitutions s/old/new/g
        const subMatches = content.matchAll(/s\/([^/]+)\/([^/]+)\/g?/g);
        for (const match of subMatches) {
            result.substitutions.push({
                type: 'substitution',
                from: match[1],
                to: match[2],
                fullMatch: match[0]
            });
        }

        return result;
    }

    /**
     * Extract key metadata from parsed sections
     * @param {Object} result - Parsed result object to modify
     */
    extractMetadata(result) {
        // Extract office name
        if (result.sections['Officium']) {
            result.metadata.officium = result.sections['Officium'].text;
        }

        // Extract rank information
        if (result.sections['Rank']) {
            const rankText = result.sections['Rank'].text;
            const rankParts = rankText.split(';;');
            if (rankParts.length >= 2) {
                result.metadata.rank = {
                    title: rankParts[0],
                    classification: rankParts[1],
                    priority: rankParts[2] || null,
                    source: rankParts[3] || null
                };
            }
        }

        // Extract rules
        if (result.sections['Rule']) {
            result.metadata.rules = result.sections['Rule'].text.split('\n').filter(r => r.trim());
        }
    }

    /**
     * Resolve cross-references in parsed content
     * @param {Object} parsedData - Parsed liturgical data
     * @param {Function} fileLoader - Function to load referenced files
     * @returns {Promise<Object>} Resolved data
     */
    async resolveReferences(parsedData, fileLoader) {
        const resolved = { ...parsedData };

        for (const [sectionName, sectionData] of Object.entries(resolved.sections)) {
            if (sectionData.references && sectionData.references.length > 0) {
                let resolvedText = sectionData.text;

                for (const ref of sectionData.references) {
                    try {
                        const referencedContent = await this.loadReference(ref, fileLoader);
                        resolvedText = resolvedText.replace(ref.fullMatch, referencedContent);
                    } catch (error) {
                        console.warn(`Failed to resolve reference ${ref.fullMatch}:`, error);
                        // Keep the original reference if resolution fails
                    }
                }

                resolved.sections[sectionName] = {
                    ...sectionData,
                    text: resolvedText,
                    resolvedText
                };
            }
        }

        return resolved;
    }

    /**
     * Load a referenced file or section
     * @param {Object} reference - Reference object
     * @param {Function} fileLoader - Function to load files
     * @returns {Promise<string>} Referenced content
     */
    async loadReference(reference, fileLoader) {
        const cacheKey = `${reference.path || reference.target}:${reference.section || ''}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const content = await fileLoader(reference);
            const parsed = this.parseFile(content);
            
            let result;
            if (reference.section) {
                // Get specific section
                result = parsed.sections[reference.section]?.text || '';
            } else {
                // Get entire content or first meaningful section
                result = parsed.sections['Officium']?.text || 
                        parsed.sections['Oratio']?.text || 
                        Object.values(parsed.sections)[0]?.text || '';
            }

            if (reference.range) {
                result = this.extractRange(result, reference.range);
            }

            if (reference.substitutions && reference.substitutions.length > 0) {
                result = this.applySubstitutions(result, reference.substitutions);
            }

            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error(`Error loading reference ${reference.raw || reference.target}:`, error);
            return `[Reference: ${reference.fullMatch}]`;
        }
    }

    parseReferenceDescriptor(rawTarget) {
        const descriptor = {
            raw: rawTarget,
            target: rawTarget,
            path: null,
            type: null,
            file: null,
            section: null,
            modifiers: [],
            range: null,
            substitutions: []
        };

        if (!rawTarget) {
            return descriptor;
        }

        const parts = rawTarget.split(':');
        const pathPart = parts.shift();
        descriptor.path = pathPart;
        descriptor.modifiers = parts;

        const segments = pathPart.split('/');
        if (segments.length >= 2) {
            descriptor.type = segments[0];
            descriptor.file = segments.slice(1).join('/');
        }

        let current = null;
        if (parts.length > 0 && parts[0]) {
            descriptor.section = parts[0];
            current = parts.slice(1);
        } else {
            current = parts;
        }

        if (current && current.length > 0) {
            current.forEach(mod => {
                const trimmed = mod.trim();
                if (!trimmed) return;
                if (trimmed.startsWith('::')) {
                    descriptor.range = this.parseRange(trimmed.substring(2));
                } else if (trimmed.startsWith('s/')) {
                    const substitution = this.parseSubstitution(trimmed);
                    if (substitution) {
                        descriptor.substitutions.push(substitution);
                    }
                }
            });
        }

        return descriptor;
    }

    parseRange(rawRange) {
        if (!rawRange) return null;
        const [start, end] = rawRange.split('-').map(val => Number(val));
        if (Number.isNaN(start)) return null;
        return {
            start,
            end: Number.isNaN(end) ? start : end
        };
    }

    extractRange(text, range) {
        if (!range) return text;
        const lines = text.split(/\r?\n/);
        const startIdx = Math.max(range.start - 1, 0);
        const endIdx = Math.min(range.end, lines.length);
        return lines.slice(startIdx, endIdx).join('\n');
    }

    parseSubstitution(raw) {
        const match = raw.match(/^s\/([^/]+)\/([^/]+)\/(g?)/);
        if (!match) return null;
        const [, from, to, flags] = match;
        return {
            from,
            to,
            flags: flags || ''
        };
    }

    applySubstitutions(text, substitutions) {
        let result = text;
        substitutions.forEach(sub => {
            const regex = new RegExp(sub.from, sub.flags.includes('g') ? 'g' : '');
            result = result.replace(regex, sub.to);
        });
        return result;
    }

    /**
     * Extract hours data from parsed liturgical file
     * @param {Object} parsedData - Parsed liturgical data
     * @returns {Object} Hours organized by canonical hour
     */
    extractHours(parsedData) {
        const hours = {
            matutinum: { name: 'Matins', sections: {} },
            laudes: { name: 'Lauds', sections: {} },
            prima: { name: 'Prime', sections: {} },
            tertia: { name: 'Terce', sections: {} },
            sexta: { name: 'Sext', sections: {} },
            nona: { name: 'None', sections: {} },
            vespera: { name: 'Vespers', sections: {} },
            completorium: { name: 'Compline', sections: {} }
        };

        // Map sections to appropriate hours
        for (const [sectionName, sectionData] of Object.entries(parsedData.sections)) {
            const lowerSection = sectionName.toLowerCase();
            
            // Matins
            if (lowerSection.includes('matutinum') || lowerSection.includes('lectio') || lowerSection.includes('responsory')) {
                hours.matutinum.sections[sectionName] = sectionData;
            }
            // Lauds
            else if (lowerSection.includes('laudes')) {
                hours.laudes.sections[sectionName] = sectionData;
            }
            // Vespers
            else if (lowerSection.includes('vespera')) {
                hours.vespera.sections[sectionName] = sectionData;
            }
            // Common sections (used by multiple hours)
            else if (lowerSection.includes('oratio') || lowerSection.includes('hymnus') || 
                    lowerSection.includes('capitulum') || lowerSection.includes('versum')) {
                // Add to multiple hours as appropriate
                Object.keys(hours).forEach(hourKey => {
                    hours[hourKey].sections[sectionName] = sectionData;
                });
            }
        }

        return hours;
    }
}

export default DivinumOfficiumParser;

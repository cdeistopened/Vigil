#!/usr/bin/env node

/**
 * Simple Prayer Extractor - Get working data fast
 * Focuses on saints files and basic temporal files for MVP
 */

import fs from 'fs/promises';
import path from 'path';
import { DivinumOfficiumParser } from './src/parser.js';

async function extractPrayers() {
    console.log('🏃‍♂️ Quick prayer extraction for MVP...');
    
    const parser = new DivinumOfficiumParser();
    await fs.mkdir('./src/data', { recursive: true });
    
    // Extract just today and nearby dates for testing
    const today = new Date();
    const prayers = {};
    
    for (let i = -7; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dateKey = date.toISOString().split('T')[0];
        console.log(`📅 Processing ${dateKey}...`);
        
        prayers[dateKey] = await extractDay(date, parser);
    }
    
    // Save English prayers
    await fs.writeFile('./src/data/prayers-english.json', JSON.stringify({
        extracted: new Date().toISOString(),
        language: 'English',
        prayers
    }, null, 2));
    
    console.log('✅ Saved 15 days of English prayers for testing');
}

async function extractDay(date, parser) {
    const dayData = {
        date: date.toISOString().split('T')[0],
        hours: {
            laudes: { name: 'Lauds', prayers: [] },
            vespera: { name: 'Vespers', prayers: [] },
            matutinum: { name: 'Matins', prayers: [] },
            completorium: { name: 'Compline', prayers: [] }
        }
    };
    
    // Try to load saint file for this date
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const saintFile = `${month}-${day}.txt`;
    
    try {
        const saintPath = `./divinum-officium/web/www/horas/English/Sancti/${saintFile}`;
        const content = await fs.readFile(saintPath, 'utf-8');
        const parsed = parser.parseFile(content);
        
        // Extract prayers from sections
        for (const [sectionName, sectionData] of Object.entries(parsed.sections)) {
            const prayer = {
                title: formatSectionName(sectionName),
                text: cleanText(sectionData.text),
                type: determineSectionType(sectionName)
            };
            
            // Add to appropriate hours
            const name = sectionName.toLowerCase();
            if (name.includes('laudes') || name.includes('oratio')) {
                dayData.hours.laudes.prayers.push(prayer);
            }
            if (name.includes('vespera') || name.includes('oratio')) {
                dayData.hours.vespera.prayers.push(prayer);
            }
            if (name.includes('matutinum') || name.includes('lectio')) {
                dayData.hours.matutinum.prayers.push(prayer);
            }
            if (name.includes('oratio')) {
                dayData.hours.completorium.prayers.push(prayer);
            }
        }
        
        console.log(`  ✅ Found saint: ${parsed.metadata.officium || 'Saint of the day'}`);
        
    } catch (error) {
        // No saint file - add basic prayers
        console.log(`  📝 No saint file, using basic prayers`);
        
        const basicPrayers = [
            {
                title: 'Prayer',
                text: 'O God, you have brought us to the beginning of a new day. Save us this day by your power, that we may not fall into sin, but that all our words may be directed and all our thoughts and works regulated according to your justice. Through Christ our Lord. Amen.',
                type: 'prayer'
            }
        ];
        
        Object.values(dayData.hours).forEach(hour => {
            hour.prayers = [...basicPrayers];
        });
    }
    
    // Ensure each hour has at least one prayer
    Object.values(dayData.hours).forEach(hour => {
        if (hour.prayers.length === 0) {
            hour.prayers.push({
                title: 'Prayer',
                text: `Grant us, O Lord, to sanctify this hour with your blessing. Through Christ our Lord. Amen.`,
                type: 'prayer'
            });
        }
    });
    
    return dayData;
}

function formatSectionName(sectionName) {
    const nameMap = {
        'Oratio': 'Prayer',
        'Lectio4': 'Fourth Reading',
        'Lectio5': 'Fifth Reading',
        'Lectio6': 'Sixth Reading',
        'Invit': 'Invitatory',
        'Officium': 'Office'
    };
    return nameMap[sectionName] || sectionName;
}

function determineSectionType(sectionName) {
    const name = sectionName.toLowerCase();
    if (name.includes('lectio')) return 'reading';
    if (name.includes('oratio')) return 'prayer';
    if (name.includes('ant')) return 'antiphon';
    return 'text';
}

function cleanText(text) {
    if (!text) return '';
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.match(/^\d+→/))
        .join('\n');
}

// Run the extraction
extractPrayers().catch(console.error);
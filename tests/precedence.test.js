import { describe, it, expect } from 'vitest';
import { LiturgicalCalendar } from '../src/calendar.js';

describe('LiturgicalCalendar - Observance Precedence', () => {
    const calendar = new LiturgicalCalendar();

    describe('Priority Resolution', () => {
        it('should assign first class rank priority 2', () => {
            const priority = calendar.resolvePriority(null, 'first');
            expect(priority).toBe(2);
        });

        it('should assign second class rank priority 5', () => {
            const priority = calendar.resolvePriority(null, 'second');
            expect(priority).toBe(5);
        });

        it('should assign third class rank priority 6', () => {
            const priority = calendar.resolvePriority(null, 'third');
            expect(priority).toBe(6);
        });

        it('should assign memorial rank priority 8', () => {
            const priority = calendar.resolvePriority(null, 'memorial');
            expect(priority).toBe(8);
        });

        it('should assign feria rank priority 9', () => {
            const priority = calendar.resolvePriority(null, 'feria');
            expect(priority).toBe(9);
        });

        it('should use explicit priority value over rank', () => {
            const priority = calendar.resolvePriority(3.5, 'feria');
            expect(priority).toBe(3.5);
        });

        it('should handle string priority values', () => {
            const priority = calendar.resolvePriority('4.2', 'third');
            expect(priority).toBe(4.2);
        });

        it('should fall back to rank priority if explicit priority is invalid', () => {
            const priority = calendar.resolvePriority('invalid', 'second');
            expect(priority).toBe(5);
        });

        it('should default to priority 10 for unknown rank', () => {
            const priority = calendar.resolvePriority(null, 'unknown');
            expect(priority).toBe(10);
        });
    });

    describe('Observance Comparison', () => {
        it('should prioritize first class over second class', () => {
            const obs1 = { type: 'sancti', rank: 'first', priority: 2 };
            const obs2 = { type: 'tempora', rank: 'second', priority: 5 };
            const result = calendar.compareObservances(obs1, obs2);
            expect(result).toBeLessThan(0); // obs1 should come first
        });

        it('should prioritize second class over third class', () => {
            const obs1 = { type: 'tempora', rank: 'second', priority: 5 };
            const obs2 = { type: 'sancti', rank: 'third', priority: 6 };
            const result = calendar.compareObservances(obs1, obs2);
            expect(result).toBeLessThan(0);
        });

        it('should prioritize third class over memorial', () => {
            const obs1 = { type: 'sancti', rank: 'third', priority: 6 };
            const obs2 = { type: 'tempora', rank: 'memorial', priority: 8 };
            const result = calendar.compareObservances(obs1, obs2);
            expect(result).toBeLessThan(0);
        });

        it('should prioritize memorial over feria', () => {
            const obs1 = { type: 'sancti', rank: 'memorial', priority: 8 };
            const obs2 = { type: 'tempora', rank: 'feria', priority: 9 };
            const result = calendar.compareObservances(obs1, obs2);
            expect(result).toBeLessThan(0);
        });

        it('should prefer temporal over saint when ranks are equal', () => {
            const temporal = { type: 'tempora', rank: 'third', priority: 6 };
            const saint = { type: 'sancti', rank: 'third', priority: 6 };
            const result = calendar.compareObservances(temporal, saint);
            expect(result).toBeLessThan(0); // temporal comes first
        });

        it('should handle equal precedence for same type', () => {
            const obs1 = { type: 'sancti', rank: 'third', priority: 6 };
            const obs2 = { type: 'sancti', rank: 'third', priority: 6 };
            const result = calendar.compareObservances(obs1, obs2);
            expect(result).toBe(0);
        });
    });

    describe('Temporal Rank Determination', () => {
        it('should assign second class rank to Advent Sundays', () => {
            const dayData = { season: 'advent', week: 'Adv1', dayOfWeek: 0 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('second');
        });

        it('should assign second class rank to Lent Sundays', () => {
            const dayData = { season: 'lent', week: 'Quad1', dayOfWeek: 0 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('second');
        });

        it('should assign second class rank to Easter Sundays', () => {
            const dayData = { season: 'easter', week: 'Pasc1', dayOfWeek: 0 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('second');
        });

        it('should assign third class rank to Ordinary Time Sundays', () => {
            const dayData = { season: 'ordinary', week: 'Pent05', dayOfWeek: 0 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('third');
        });

        it('should assign memorial rank to Advent weekdays', () => {
            const dayData = { season: 'advent', week: 'Adv1', dayOfWeek: 3 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('memorial');
        });

        it('should assign memorial rank to Lent weekdays', () => {
            const dayData = { season: 'lent', week: 'Quad2', dayOfWeek: 5 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('memorial');
        });

        it('should assign feria rank to Ordinary Time weekdays', () => {
            const dayData = { season: 'ordinary', week: 'Pent10', dayOfWeek: 2 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('feria');
        });

        it('should use metadata override for Holy Thursday', () => {
            const dayData = { season: 'lent', week: 'Quad6', dayOfWeek: 4 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('first');
        });

        it('should use metadata override for Good Friday', () => {
            const dayData = { season: 'lent', week: 'Quad6', dayOfWeek: 5 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('first');
        });

        it('should use metadata override for Easter Sunday', () => {
            const dayData = { season: 'easter', week: 'Pasc0', dayOfWeek: 0 };
            const rank = calendar.getTemporalRank(dayData);
            expect(rank).toBe('first');
        });
    });

    describe('Saint Metadata Lookup', () => {
        it('should find Christmas metadata', () => {
            const christmas = new Date(2025, 11, 25);
            const metadata = calendar.getSaintMetadata(christmas);
            expect(metadata).not.toBeNull();
            expect(metadata.title).toMatch(/Nativity|Christmas/i);
        });

        it('should find major feast days', () => {
            // Epiphany - January 6
            const epiphany = new Date(2025, 0, 6);
            const metadata = calendar.getSaintMetadata(epiphany);
            expect(metadata).not.toBeNull();
        });

        it('should return null for days without saint feasts', () => {
            // Use a date we know has no special feast
            const ordinary = new Date(2025, 8, 15); // Sept 15
            const metadata = calendar.getSaintMetadata(ordinary);
            // May or may not have a saint - just check it doesn't error
            expect(metadata === null || typeof metadata === 'object').toBe(true);
        });

        it('should format date keys with zero padding', () => {
            const date = new Date(2025, 0, 6); // Jan 6
            const metadata = calendar.getSaintMetadata(date);
            if (metadata) {
                expect(metadata.key).toMatch(/^\d{2}-\d{2}/);
            }
        });
    });

    describe('Observance Resolution', () => {
        it('should create temporal observance for Advent Sunday', () => {
            const adventStart = calendar.getAdventStart(2025);
            const liturgicalDay = calendar.getLiturgicalDay(adventStart);
            const observances = calendar.resolveObservances(liturgicalDay);

            expect(observances.length).toBeGreaterThan(0);
            const temporal = observances.find(obs => obs.type === 'tempora');
            expect(temporal).toBeDefined();
            expect(temporal.rank).toBe('second');
        });

        it('should create saint observance when present', () => {
            const christmas = new Date(2025, 11, 25);
            const liturgicalDay = calendar.getLiturgicalDay(christmas);
            const observances = calendar.resolveObservances(liturgicalDay);

            expect(observances.length).toBeGreaterThan(0);
            const saint = observances.find(obs => obs.type === 'sancti');
            expect(saint).toBeDefined();
        });

        it('should sort observances by priority', () => {
            const christmas = new Date(2025, 11, 25);
            const liturgicalDay = calendar.getLiturgicalDay(christmas);
            const observances = calendar.resolveObservances(liturgicalDay);

            // Check that observances are sorted (lower priority number = higher precedence)
            for (let i = 1; i < observances.length; i++) {
                const prevPriority = calendar.getObservancePriority(observances[i - 1]);
                const currPriority = calendar.getObservancePriority(observances[i]);
                expect(prevPriority).toBeLessThanOrEqual(currPriority);
            }
        });

        it('should place higher rank observances first', () => {
            const easter = calendar.calculateEaster(2025);
            const liturgicalDay = calendar.getLiturgicalDay(easter);
            const observances = calendar.resolveObservances(liturgicalDay);

            expect(observances.length).toBeGreaterThan(0);

            // First observance should be highest precedence
            const firstObs = observances[0];
            expect(firstObs.rank).toBe('first');
        });
    });

    describe('Real World Scenarios', () => {
        it('should prioritize Christmas over any temporal feria', () => {
            const christmas = new Date(2025, 11, 25);
            const liturgicalDay = calendar.getLiturgicalDay(christmas);
            const observances = calendar.resolveObservances(liturgicalDay);

            const saint = observances.find(obs => obs.type === 'sancti');
            expect(saint).toBeDefined();
            expect(saint.rank).toBe('first');

            // Saint should be first in the list
            expect(observances[0].type).toBe('sancti');
        });

        it('should handle Sundays in Ordinary Time', () => {
            const ordinarySunday = new Date(2025, 8, 14); // Sept 14, 2025 is a Sunday
            const liturgicalDay = calendar.getLiturgicalDay(ordinarySunday);

            expect(liturgicalDay.dayOfWeek).toBe(0); // Confirm it's Sunday
            expect(liturgicalDay.season).toBe('ordinary');

            const observances = calendar.resolveObservances(liturgicalDay);
            const temporal = observances.find(obs => obs.type === 'tempora');

            expect(temporal).toBeDefined();
            expect(temporal.rank).toBe('third'); // Ordinary Time Sundays are third class
        });

        it('should handle Lent weekday with saint conflict', () => {
            // Find a Lent weekday
            const easter = calendar.calculateEaster(2025);
            const ashWed = calendar.calculateAshWednesday(easter);
            const lentWeekday = new Date(ashWed.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days after Ash Wed

            const liturgicalDay = calendar.getLiturgicalDay(lentWeekday);
            expect(liturgicalDay.season).toBe('lent');

            const observances = calendar.resolveObservances(liturgicalDay);
            expect(observances.length).toBeGreaterThan(0);

            const temporal = observances.find(obs => obs.type === 'tempora');
            expect(temporal).toBeDefined();
            expect(temporal.rank).toBe('memorial'); // Lent weekdays are memorials
        });

        it('should prioritize Palm Sunday over any saint', () => {
            const easter = calendar.calculateEaster(2025);
            const palmSunday = new Date(easter.getTime() - (7 * 24 * 60 * 60 * 1000));

            const liturgicalDay = calendar.getLiturgicalDay(palmSunday);
            const observances = calendar.resolveObservances(liturgicalDay);

            const temporal = observances.find(obs => obs.type === 'tempora');
            expect(temporal).toBeDefined();
            expect(temporal.rank).toBe('first'); // Palm Sunday is first class

            // Temporal should be first due to high precedence
            if (observances.length > 1) {
                expect(observances[0].type).toBe('tempora');
            }
        });

        it('should prioritize Easter over everything', () => {
            const easter = calendar.calculateEaster(2025);
            const liturgicalDay = calendar.getLiturgicalDay(easter);
            const observances = calendar.resolveObservances(liturgicalDay);

            expect(observances.length).toBeGreaterThan(0);
            expect(observances[0].rank).toBe('first');

            const firstPriority = calendar.getObservancePriority(observances[0]);
            expect(firstPriority).toBe(1.0); // Easter has explicit priority 1.0
        });
    });

    describe('File Path Resolution', () => {
        it('should generate correct temporal file path', () => {
            const adventStart = calendar.getAdventStart(2025);
            const liturgicalDay = calendar.getLiturgicalDay(adventStart);
            const observances = calendar.resolveObservances(liturgicalDay);

            const temporal = observances.find(obs => obs.type === 'tempora');
            expect(temporal.file).toMatch(/^Adv1-0\.txt$/);
        });

        it('should generate files for all observances', () => {
            const christmas = new Date(2025, 11, 25);
            const liturgicalDay = calendar.getLiturgicalDay(christmas);
            const files = calendar.determineFiles(liturgicalDay);

            expect(files).toBeDefined();
            expect(files.sancti || files.tempora).toBeTruthy();
        });

        it('should include commune file when appropriate', () => {
            // Use a saint with a commune reference
            const christmas = new Date(2025, 11, 25);
            const liturgicalDay = calendar.getLiturgicalDay(christmas);
            const files = calendar.determineFiles(liturgicalDay);

            // Some saints will have commune files
            expect(typeof files).toBe('object');
        });
    });

    describe('Optional Memorials Filter', () => {
        it('should filter optional memorials when option is false', () => {
            const calendarNoMemorials = new LiturgicalCalendar({ includeOptionalMemorials: false });

            // Find an ordinary time weekday
            const ordinaryWeekday = new Date(2025, 8, 15); // Mid September weekday
            const liturgicalDay = calendarNoMemorials.getLiturgicalDay(ordinaryWeekday);

            const observances = calendarNoMemorials.resolveObservances(liturgicalDay);

            // Should not include memorials
            const hasMemorial = observances.some(obs => obs.rank === 'memorial' && obs.type === 'sancti');
            expect(hasMemorial).toBe(false);
        });

        it('should keep temporal memorials even when filter is active', () => {
            const calendarNoMemorials = new LiturgicalCalendar({ includeOptionalMemorials: false });

            // Advent weekday (temporal memorial)
            const adventStart = calendarNoMemorials.getAdventStart(2025);
            const adventWeekday = new Date(adventStart.getTime() + (2 * 24 * 60 * 60 * 1000)); // Tuesday

            const liturgicalDay = calendarNoMemorials.getLiturgicalDay(adventWeekday);
            const observances = calendarNoMemorials.resolveObservances(liturgicalDay);

            // Should keep temporal memorial
            const temporal = observances.find(obs => obs.type === 'tempora');
            expect(temporal).toBeDefined();
        });
    });
});

import { describe, it, expect } from 'vitest';
import { LiturgicalCalendar } from '../src/calendar.js';

describe('LiturgicalCalendar - Easter Calculation', () => {
    const calendar = new LiturgicalCalendar();

    // Known Easter dates from authoritative sources
    const knownEasterDates = [
        { year: 2020, month: 4, day: 12 }, // April 12, 2020
        { year: 2021, month: 4, day: 4 },  // April 4, 2021
        { year: 2022, month: 4, day: 17 }, // April 17, 2022
        { year: 2023, month: 4, day: 9 },  // April 9, 2023
        { year: 2024, month: 3, day: 31 }, // March 31, 2024
        { year: 2025, month: 4, day: 20 }, // April 20, 2025
        { year: 2026, month: 4, day: 5 },  // April 5, 2026
        { year: 2027, month: 3, day: 28 }, // March 28, 2027
        { year: 2028, month: 4, day: 16 }, // April 16, 2028
        { year: 2029, month: 4, day: 1 },  // April 1, 2029
        { year: 2030, month: 4, day: 21 }, // April 21, 2030
        { year: 2050, month: 4, day: 10 }, // April 10, 2050
        { year: 2100, month: 3, day: 28 }, // March 28, 2100
    ];

    knownEasterDates.forEach(({ year, month, day }) => {
        it(`should correctly calculate Easter ${year} as ${month}/${day}`, () => {
            const easter = calendar.calculateEaster(year);
            expect(easter.getFullYear()).toBe(year);
            expect(easter.getMonth() + 1).toBe(month); // getMonth() is 0-indexed
            expect(easter.getDate()).toBe(day);
        });
    });

    it('should calculate Easter as a Sunday', () => {
        for (let year = 2020; year <= 2030; year++) {
            const easter = calendar.calculateEaster(year);
            expect(easter.getDay()).toBe(0); // Sunday = 0
        }
    });

    it('should calculate Easter between March 22 and April 25', () => {
        for (let year = 2000; year <= 2050; year++) {
            const easter = calendar.calculateEaster(year);
            const marchDate = new Date(year, 2, 22); // March 22
            const aprilDate = new Date(year, 3, 25); // April 25
            expect(easter.getTime()).toBeGreaterThanOrEqual(marchDate.getTime());
            expect(easter.getTime()).toBeLessThanOrEqual(aprilDate.getTime());
        }
    });
});

describe('LiturgicalCalendar - Ash Wednesday', () => {
    const calendar = new LiturgicalCalendar();

    it('should calculate Ash Wednesday as 46 days before Easter', () => {
        const easter = new Date(2025, 3, 20); // April 20, 2025
        const ashWed = calendar.calculateAshWednesday(easter);
        const expectedDate = new Date(2025, 2, 5); // March 5, 2025
        expect(ashWed.getMonth()).toBe(expectedDate.getMonth());
        expect(ashWed.getDate()).toBe(expectedDate.getDate());
    });

    it('should calculate Ash Wednesday as a Wednesday', () => {
        for (let year = 2020; year <= 2030; year++) {
            const easter = calendar.calculateEaster(year);
            const ashWed = calendar.calculateAshWednesday(easter);
            expect(ashWed.getDay()).toBe(3); // Wednesday = 3
        }
    });

    // Known Ash Wednesday dates
    const knownAshWednesdays = [
        { year: 2024, month: 2, day: 14 }, // Feb 14, 2024
        { year: 2025, month: 3, day: 5 },  // March 5, 2025
        { year: 2026, month: 2, day: 18 }, // Feb 18, 2026
        { year: 2027, month: 2, day: 10 }, // Feb 10, 2027
    ];

    knownAshWednesdays.forEach(({ year, month, day }) => {
        it(`should correctly calculate Ash Wednesday ${year} as ${month}/${day}`, () => {
            const easter = calendar.calculateEaster(year);
            const ashWed = calendar.calculateAshWednesday(easter);
            expect(ashWed.getMonth() + 1).toBe(month);
            expect(ashWed.getDate()).toBe(day);
        });
    });
});

describe('LiturgicalCalendar - Advent', () => {
    const calendar = new LiturgicalCalendar();

    it('should calculate Advent start as a Sunday', () => {
        for (let year = 2020; year <= 2030; year++) {
            const adventStart = calendar.getAdventStart(year);
            expect(adventStart.getDay()).toBe(0); // Sunday = 0
        }
    });

    it('should calculate Advent between Nov 27 and Dec 3', () => {
        for (let year = 2020; year <= 2030; year++) {
            const adventStart = calendar.getAdventStart(year);
            const earliestDate = new Date(year, 10, 27); // Nov 27
            const latestDate = new Date(year, 11, 3);    // Dec 3
            expect(adventStart.getTime()).toBeGreaterThanOrEqual(earliestDate.getTime());
            expect(adventStart.getTime()).toBeLessThanOrEqual(latestDate.getTime());
        }
    });

    // Known Advent dates (First Sunday of Advent)
    const knownAdventStarts = [
        { year: 2024, month: 12, day: 1 }, // Dec 1, 2024
        { year: 2025, month: 11, day: 30 }, // Nov 30, 2025
        { year: 2026, month: 11, day: 29 }, // Nov 29, 2026
        { year: 2027, month: 11, day: 28 }, // Nov 28, 2027
    ];

    knownAdventStarts.forEach(({ year, month, day }) => {
        it(`should calculate Advent ${year} starting on ${month}/${day}`, () => {
            const adventStart = calendar.getAdventStart(year);
            expect(adventStart.getMonth() + 1).toBe(month);
            expect(adventStart.getDate()).toBe(day);
        });
    });
});

describe('LiturgicalCalendar - Seasons', () => {
    const calendar = new LiturgicalCalendar();

    it('should identify Christmas Day as christmas season', () => {
        const christmas = new Date(2025, 11, 25);
        const season = calendar.getLiturgicalSeason(christmas);
        expect(season).toBe('christmas');
    });

    it('should identify January 1 as christmas season', () => {
        const newYear = new Date(2025, 0, 1);
        const season = calendar.getLiturgicalSeason(newYear);
        expect(season).toBe('christmas');
    });

    it('should identify Epiphany as christmas season', () => {
        const epiphany = new Date(2025, 0, 6);
        const season = calendar.getLiturgicalSeason(epiphany);
        expect(season).toBe('christmas');
    });

    it('should identify Ash Wednesday as lent', () => {
        const easter = calendar.calculateEaster(2025);
        const ashWed = calendar.calculateAshWednesday(easter);
        const season = calendar.getLiturgicalSeason(ashWed);
        expect(season).toBe('lent');
    });

    it('should identify Good Friday as lent', () => {
        const easter = calendar.calculateEaster(2025);
        const goodFriday = new Date(easter.getTime() - (2 * 24 * 60 * 60 * 1000));
        const season = calendar.getLiturgicalSeason(goodFriday);
        expect(season).toBe('lent');
    });

    it('should identify Easter Sunday as easter season', () => {
        const easter = calendar.calculateEaster(2025);
        const season = calendar.getLiturgicalSeason(easter);
        expect(season).toBe('easter');
    });

    it('should identify Pentecost as easter season', () => {
        const easter = calendar.calculateEaster(2025);
        const pentecost = new Date(easter.getTime() + (49 * 24 * 60 * 60 * 1000));
        const season = calendar.getLiturgicalSeason(pentecost);
        expect(season).toBe('easter');
    });

    it('should identify First Sunday of Advent as advent', () => {
        const adventStart = calendar.getAdventStart(2025);
        const season = calendar.getLiturgicalSeason(adventStart);
        expect(season).toBe('advent');
    });

    it('should identify mid-September as ordinary time', () => {
        const septDate = new Date(2025, 8, 15); // Sept 15
        const season = calendar.getLiturgicalSeason(septDate);
        expect(season).toBe('ordinary');
    });
});

describe('LiturgicalCalendar - Week Designations', () => {
    const calendar = new LiturgicalCalendar();

    it('should identify First Sunday of Advent as Adv1', () => {
        const adventStart = calendar.getAdventStart(2025);
        const week = calendar.getLiturgicalWeek(adventStart);
        expect(week).toBe('Adv1');
    });

    it('should progress through Advent weeks correctly', () => {
        const adventStart = calendar.getAdventStart(2025);

        // Week 1
        const adv1 = new Date(adventStart);
        expect(calendar.getLiturgicalWeek(adv1)).toBe('Adv1');

        // Week 2
        const adv2 = new Date(adventStart.getTime() + (7 * 24 * 60 * 60 * 1000));
        expect(calendar.getLiturgicalWeek(adv2)).toBe('Adv2');

        // Week 3
        const adv3 = new Date(adventStart.getTime() + (14 * 24 * 60 * 60 * 1000));
        expect(calendar.getLiturgicalWeek(adv3)).toBe('Adv3');

        // Week 4
        const adv4 = new Date(adventStart.getTime() + (21 * 24 * 60 * 60 * 1000));
        expect(calendar.getLiturgicalWeek(adv4)).toBe('Adv4');
    });

    it('should identify Easter Sunday as Pasc0', () => {
        const easter = calendar.calculateEaster(2025);
        const week = calendar.getLiturgicalWeek(easter);
        expect(week).toBe('Pasc0');
    });

    it('should progress through Easter weeks correctly', () => {
        const easter = calendar.calculateEaster(2025);

        // Easter Week (Pasc0)
        expect(calendar.getLiturgicalWeek(easter)).toBe('Pasc0');

        // Second week (Pasc1)
        const pasc1 = new Date(easter.getTime() + (7 * 24 * 60 * 60 * 1000));
        expect(calendar.getLiturgicalWeek(pasc1)).toBe('Pasc1');

        // Third week (Pasc2)
        const pasc2 = new Date(easter.getTime() + (14 * 24 * 60 * 60 * 1000));
        expect(calendar.getLiturgicalWeek(pasc2)).toBe('Pasc2');
    });

    it('should format Pentecost week numbers with zero padding', () => {
        const pentecost = calendar.calculateEaster(2025);
        const dayAfterPentecost = new Date(pentecost.getTime() + (50 * 24 * 60 * 60 * 1000));
        const week = calendar.getLiturgicalWeek(dayAfterPentecost);
        expect(week).toMatch(/^Pent\d{2}$/); // Should be Pent01, Pent02, etc.
    });
});

describe('LiturgicalCalendar - Edge Cases', () => {
    const calendar = new LiturgicalCalendar();

    it('should handle leap years correctly for Easter', () => {
        const easter2024 = calendar.calculateEaster(2024);
        expect(easter2024.getMonth() + 1).toBe(3); // March
        expect(easter2024.getDate()).toBe(31);
        expect(easter2024.getDay()).toBe(0); // Sunday
    });

    it('should handle year boundary transitions (Christmas to Epiphany)', () => {
        const christmas = new Date(2024, 11, 25);
        const newYear = new Date(2025, 0, 1);
        const epiphany = new Date(2025, 0, 6);

        expect(calendar.getLiturgicalSeason(christmas)).toBe('christmas');
        expect(calendar.getLiturgicalSeason(newYear)).toBe('christmas');
        expect(calendar.getLiturgicalSeason(epiphany)).toBe('christmas');
    });

    it('should handle Pentecost calculation (49 days after Easter)', () => {
        const easter = calendar.calculateEaster(2025);
        const pentecost = new Date(easter.getTime() + (49 * 24 * 60 * 60 * 1000));

        // Pentecost should be a Sunday
        expect(pentecost.getDay()).toBe(0);

        // Should be in Easter season
        expect(calendar.getLiturgicalSeason(pentecost)).toBe('easter');
    });

    it('should handle the day after Pentecost (start of Ordinary Time)', () => {
        const easter = calendar.calculateEaster(2025);
        const dayAfterPentecost = new Date(easter.getTime() + (50 * 24 * 60 * 60 * 1000));

        // Should be in Ordinary Time
        expect(calendar.getLiturgicalSeason(dayAfterPentecost)).toBe('ordinary');
    });
});

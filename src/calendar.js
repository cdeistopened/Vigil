import saintsMetadata from './data/saints-metadata.js';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SEASON_NAMES = {
    Adv: 'Advent',
    Nat: 'Christmastide',
    Epi: 'Epiphanytide',
    Quad: 'Lent',
    Quadp: 'Pre-Lent',
    Pasc: 'Eastertide',
    Pent: 'Time after Pentecost'
};

const RANK_PRIORITY = {
    first: 2,
    second: 5,
    third: 6,
    memorial: 8,
    feria: 9
};

// Temporal metadata keyed by `${week}-${dayOfWeek}` with overrides on rank/title/notes.
// This is partial coverage focused on Sundays, privileged ferias, Ember days, and Holy Week.
const TEMPORA_METADATA = {
    // Advent Sundays & ferias
    'Adv1-0': { rank: 'second', title: 'First Sunday of Advent', priority: 5.1 },
    'Adv2-0': { rank: 'second', title: 'Second Sunday of Advent', priority: 5.2 },
    'Adv3-0': { rank: 'second', title: 'Third Sunday of Advent (Gaudete)', priority: 5.3 },
    'Adv4-0': { rank: 'second', title: 'Fourth Sunday of Advent', priority: 5.4 },
    'Adv3-3': { rank: 'memorial', title: 'Ember Wednesday of Advent' },
    'Adv3-5': { rank: 'memorial', title: 'Ember Friday of Advent' },
    'Adv3-6': { rank: 'memorial', title: 'Ember Saturday of Advent' },
    'Adv4-1': { rank: 'memorial', title: 'Feria in Advent' },

    // Christmas Octave & Epiphanytide
    'Nat1-0': { rank: 'first', title: 'Sunday in the Octave of Christmas' },
    'Nat1-6': { rank: 'memorial', title: 'Vigil of the Epiphany', notes: 'treated as feria' },
    'Epi0-0': { rank: 'second', title: 'Holy Family (Sunday after Epiphany)' },

    // Pre-Lent (Septuagesima) Sundays
    'Quadp1-0': { rank: 'second', title: 'Septuagesima Sunday' },
    'Quadp2-0': { rank: 'second', title: 'Sexagesima Sunday' },
    'Quadp3-0': { rank: 'second', title: 'Quinquagesima Sunday' },

    // Lent Sundays and ferias
    'Quad1-0': { rank: 'second', title: 'First Sunday of Lent', priority: 5.1 },
    'Quad2-0': { rank: 'second', title: 'Second Sunday of Lent', priority: 5.2 },
    'Quad3-0': { rank: 'second', title: 'Third Sunday of Lent', priority: 5.3 },
    'Quad4-0': { rank: 'second', title: 'Fourth Sunday of Lent (Laetare)', priority: 5.4 },
    'Quad5-0': { rank: 'second', title: 'Passion Sunday', priority: 5.5 },
    'Quad6-0': { rank: 'first', title: 'Palm Sunday', priority: 2.1 },
    'Quad1-3': { rank: 'memorial', title: 'Ember Wednesday of Lent' },
    'Quad1-5': { rank: 'memorial', title: 'Ember Friday of Lent' },
    'Quad1-6': { rank: 'memorial', title: 'Ember Saturday of Lent' },
    'Quad6-4': { rank: 'first', title: 'Holy Thursday' },
    'Quad6-5': { rank: 'first', title: 'Good Friday' },
    'Quad6-6': { rank: 'first', title: 'Holy Saturday' },

    // Eastertide
    'Pasc0-0': { rank: 'first', title: 'Easter Sunday', priority: 1.0 },
    'Pasc0-1': { rank: 'first', title: 'Easter Monday' },
    'Pasc0-2': { rank: 'first', title: 'Easter Tuesday' },
    'Pasc0-3': { rank: 'first', title: 'Easter Wednesday' },
    'Pasc0-4': { rank: 'first', title: 'Easter Thursday' },
    'Pasc0-5': { rank: 'first', title: 'Easter Friday' },
    'Pasc0-6': { rank: 'first', title: 'Easter Saturday' },
    'Pasc1-0': { rank: 'second', title: 'Low Sunday (Dominica in Albis)', priority: 5.0 },
    'Pasc2-0': { rank: 'third', title: 'Second Sunday after Easter', priority: 6.1 },
    'Pasc3-0': { rank: 'third', title: 'Third Sunday after Easter', priority: 6.2 },
    'Pasc4-0': { rank: 'third', title: 'Fourth Sunday after Easter', priority: 6.3 },
    'Pasc5-0': { rank: 'third', title: 'Fifth Sunday after Easter', priority: 6.4 },
    'Pasc3-0': { rank: 'third', title: 'Third Sunday after Easter' },
    'Pasc4-0': { rank: 'third', title: 'Fourth Sunday after Easter' },
    'Pasc5-0': { rank: 'third', title: 'Fifth Sunday after Easter' },
    'Pasc5-3': { rank: 'memorial', title: 'Rogation Wednesday' },
    'Pasc5-4': { rank: 'memorial', title: 'Rogation Thursday (Vigil of Ascension)' },
    'Pasc5-5': { rank: 'memorial', title: 'Rogation Friday' },
    'Pasc6-0': { rank: 'second', title: 'Sunday after Ascension', priority: 5.6 },
    'Pasc7-0': { rank: 'first', title: 'Pentecost Sunday', priority: 1.1 },
    'Pasc7-1': { rank: 'first', title: 'Whit Monday' },
    'Pasc7-2': { rank: 'first', title: 'Whit Tuesday' },

    // Time after Pentecost Sundays (default third-class, but Ember days later)
    'Pent01-0': { rank: 'first', title: 'Trinity Sunday', priority: 2.4 },
    'Pent02-0': { rank: 'third', title: 'Second Sunday after Pentecost', priority: 6.2 },
    'Pent03-0': { rank: 'third', title: 'Third Sunday after Pentecost', priority: 6.3 },
    'Pent04-0': { rank: 'third', title: 'Fourth Sunday after Pentecost', priority: 6.4 },
    'Pent05-0': { rank: 'third', title: 'Fifth Sunday after Pentecost', priority: 6.5 },
    'Pent06-0': { rank: 'third', title: 'Sixth Sunday after Pentecost', priority: 6.6 },
    'Pent07-0': { rank: 'third', title: 'Seventh Sunday after Pentecost', priority: 6.7 },
    'Pent08-0': { rank: 'third', title: 'Eighth Sunday after Pentecost', priority: 6.8 },
    'Pent09-0': { rank: 'third', title: 'Ninth Sunday after Pentecost', priority: 6.9 },
    'Pent10-0': { rank: 'third', title: 'Tenth Sunday after Pentecost', priority: 7.0 },
    'Pent11-0': { rank: 'third', title: 'Eleventh Sunday after Pentecost', priority: 7.1 },
    'Pent12-0': { rank: 'third', title: 'Twelfth Sunday after Pentecost', priority: 7.2 },
    'Pent13-0': { rank: 'third', title: 'Thirteenth Sunday after Pentecost', priority: 7.3 },
    'Pent14-0': { rank: 'third', title: 'Fourteenth Sunday after Pentecost', priority: 7.4 },
    'Pent15-0': { rank: 'third', title: 'Fifteenth Sunday after Pentecost', priority: 7.5 },
    'Pent16-0': { rank: 'third', title: 'Sixteenth Sunday after Pentecost', priority: 7.6 },
    'Pent17-0': { rank: 'third', title: 'Seventeenth Sunday after Pentecost', priority: 7.7 },
    'Pent18-0': { rank: 'third', title: 'Eighteenth Sunday after Pentecost', priority: 7.8 },
    'Pent19-0': { rank: 'third', title: 'Nineteenth Sunday after Pentecost', priority: 7.9 },
    'Pent20-0': { rank: 'third', title: 'Twentieth Sunday after Pentecost', priority: 8.0 },
    'Pent21-0': { rank: 'third', title: 'Twenty-First Sunday after Pentecost', priority: 8.1 },
    'Pent22-0': { rank: 'third', title: 'Twenty-Second Sunday after Pentecost', priority: 8.2 },
    'Pent23-0': { rank: 'third', title: 'Twenty-Third Sunday after Pentecost', priority: 8.3 },
    'Pent24-0': { rank: 'third', title: 'Twenty-Fourth Sunday after Pentecost', priority: 8.4 },
    'Pent03-0': { rank: 'third', title: 'Third Sunday after Pentecost' },
    'Pent04-0': { rank: 'third', title: 'Fourth Sunday after Pentecost' },
    'Pent05-0': { rank: 'third', title: 'Fifth Sunday after Pentecost' },
    'Pent06-0': { rank: 'third', title: 'Sixth Sunday after Pentecost' },
    'Pent07-0': { rank: 'third', title: 'Seventh Sunday after Pentecost' },
    'Pent08-0': { rank: 'third', title: 'Eighth Sunday after Pentecost' },
    'Pent09-0': { rank: 'third', title: 'Ninth Sunday after Pentecost' },
    'Pent10-0': { rank: 'third', title: 'Tenth Sunday after Pentecost' },
    'Pent11-0': { rank: 'third', title: 'Eleventh Sunday after Pentecost' },
    'Pent12-0': { rank: 'third', title: 'Twelfth Sunday after Pentecost' },
    'Pent13-0': { rank: 'third', title: 'Thirteenth Sunday after Pentecost' },
    'Pent14-0': { rank: 'third', title: 'Fourteenth Sunday after Pentecost' },
    'Pent15-0': { rank: 'third', title: 'Fifteenth Sunday after Pentecost' },
    'Pent16-0': { rank: 'third', title: 'Sixteenth Sunday after Pentecost' },
    'Pent17-0': { rank: 'third', title: 'Seventeenth Sunday after Pentecost' },
    'Pent18-0': { rank: 'third', title: 'Eighteenth Sunday after Pentecost' },
    'Pent19-0': { rank: 'third', title: 'Nineteenth Sunday after Pentecost' },
    'Pent20-0': { rank: 'third', title: 'Twentieth Sunday after Pentecost' },
    'Pent21-0': { rank: 'third', title: 'Twenty-First Sunday after Pentecost' },
    'Pent22-0': { rank: 'third', title: 'Twenty-Second Sunday after Pentecost' },
    'Pent23-0': { rank: 'third', title: 'Twenty-Third Sunday after Pentecost' },
    'Pent24-0': { rank: 'third', title: 'Twenty-Fourth Sunday after Pentecost' },

    // Ember days after Pentecost (September)
    'Pent17-3': { rank: 'memorial', title: 'Ember Wednesday after Pentecost' },
    'Pent17-5': { rank: 'memorial', title: 'Ember Friday after Pentecost' },
    'Pent17-6': { rank: 'memorial', title: 'Ember Saturday after Pentecost' },

    // Advent & Lent vigils (when treated as ferias)
    'Pent04-6': { rank: 'memorial', title: 'Vigil of St. John the Baptist', notes: 'treated as feria in 1960 rubrics' },
    'Pent23-6': { rank: 'memorial', title: 'Vigil of All Saints' }
};

/**
 * Liturgical Calendar Engine
 * Calculates liturgical dates and determines which files to load
 */

export class LiturgicalCalendar {
    constructor(options = {}) {
        this.currentYear = new Date().getFullYear();
        this.options = {
            includeOptionalMemorials: true,
            ...options
        };
        this.saintMetadata = saintsMetadata;
        this.saintKeys = Object.keys(saintsMetadata);
    }

    /**
     * Get the current liturgical data for a given date
     * @param {Date} date - The date to get liturgical data for
     * @returns {Object} Liturgical information for the date
     */
    getLiturgicalDay(date = new Date()) {
        const civilDate = this.normalizeDate(date);

        const dayData = {
            date: civilDate,
            season: this.getLiturgicalSeason(civilDate),
            week: this.getLiturgicalWeek(civilDate),
            dayOfWeek: civilDate.getDay(), // 0 = Sunday, 1 = Monday, etc.
            saint: this.getSaintOfDay(civilDate),
            rank: 'feria', // Default to weekday
            files: {
                tempora: null,
                sancti: null,
                commune: null
            }
        };

        // Determine primary file sources
        dayData.files = this.determineFiles(dayData);

        return dayData;
    }

    /**
     * Determine which liturgical season we're in
     * @param {Date} date - The date to check
     * @returns {string} The liturgical season
     */
    getLiturgicalSeason(date) {
        const year = date.getFullYear();
        const easter = this.calculateEaster(year);
        
        // Calculate key dates
        const adventStart = this.getAdventStart(year);
        const christmasStart = new Date(year, 11, 25); // December 25
        const epiphany = new Date(year, 0, 6); // January 6
        const ashWednesday = this.calculateAshWednesday(easter);
        const pentecost = new Date(easter.getTime() + (49 * 24 * 60 * 60 * 1000)); // 49 days after Easter
        
        // Determine season
        if (date >= adventStart && date < christmasStart) {
            return 'advent';
        } else if (date >= christmasStart || date <= epiphany) {
            return 'christmas';
        } else if (date >= ashWednesday && date < easter) {
            return 'lent';
        } else if (date >= easter && date <= pentecost) {
            return 'easter';
        } else {
            return 'ordinary';
        }
    }

    /**
     * Calculate Easter Sunday for a given year using the algorithm
     * @param {number} year - The year to calculate Easter for
     * @returns {Date} Easter Sunday date
     */
    calculateEaster(year) {
        // Using the algorithm for Western Easter
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        
        return new Date(year, month - 1, day);
    }

    /**
     * Calculate Ash Wednesday (46 days before Easter)
     * @param {Date} easter - Easter Sunday date
     * @returns {Date} Ash Wednesday date
     */
    calculateAshWednesday(easter) {
        return new Date(easter.getTime() - (46 * 24 * 60 * 60 * 1000));
    }

    /**
     * Calculate the start of Advent (4th Sunday before Christmas)
     * @param {number} year - The year
     * @returns {Date} First Sunday of Advent
     */
    getAdventStart(year) {
        const christmas = new Date(year, 11, 25);
        const christmasDay = christmas.getDay();
        const daysToSubtract = christmasDay === 0 ? 28 : (21 + christmasDay);
        return new Date(christmas.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
    }

    /**
     * Get the liturgical week designation
     * @param {Date} date - The date
     * @returns {string} Week designation (e.g., "Adv1", "Pent03")
     */
    getLiturgicalWeek(date) {
        const season = this.getLiturgicalSeason(date);
        const year = date.getFullYear();
        
        switch (season) {
            case 'advent':
                return this.getAdventWeek(date, year);
            case 'christmas':
                return this.getChristmasWeek(date, year);
            case 'lent':
                return this.getLentWeek(date, year);
            case 'easter':
                return this.getEasterWeek(date, year);
            default:
                return this.getOrdinaryWeek(date, year);
        }
    }

    /**
     * Get Advent week designation
     * @param {Date} date - The date
     * @param {number} year - The year
     * @returns {string} Advent week (Adv1-4)
     */
    getAdventWeek(date, year) {
        const adventStart = this.getAdventStart(year);
        const daysDiff = Math.floor((date - adventStart) / (24 * 60 * 60 * 1000));
        const week = Math.floor(daysDiff / 7) + 1;
        return `Adv${week}`;
    }

    /**
     * Get Lent week designation
     * @param {Date} date - The date
     * @param {number} year - The year
     * @returns {string} Lent week (Quad1-6)
     */
    getLentWeek(date, year) {
        const easter = this.calculateEaster(year);
        const ashWednesday = this.calculateAshWednesday(easter);
        const daysDiff = Math.floor((date - ashWednesday) / (24 * 60 * 60 * 1000));
        
        if (daysDiff < 4) return 'Quadp1'; // Pre-Lent
        const week = Math.floor((daysDiff - 4) / 7) + 1;
        return week <= 6 ? `Quad${week}` : 'Quad6';
    }

    /**
     * Get Easter week designation
     * @param {Date} date - The date
     * @param {number} year - The year
     * @returns {string} Easter week (Pasc0-7)
     */
    getEasterWeek(date, year) {
        const easter = this.calculateEaster(year);
        const daysDiff = Math.floor((date - easter) / (24 * 60 * 60 * 1000));
        const week = Math.floor(daysDiff / 7);
        return `Pasc${week}`;
    }

    /**
     * Get Ordinary Time week designation
     * @param {Date} date - The date
     * @param {number} year - The year
     * @returns {string} Ordinary Time week (Pent01-24)
     */
    getOrdinaryWeek(date, year) {
        const easter = this.calculateEaster(year);
        const pentecost = new Date(easter.getTime() + (49 * 24 * 60 * 60 * 1000));
        
        if (date < pentecost) {
            // Before Pentecost - probably Epiphany season
            const epiphany = new Date(year, 0, 6);
            const daysDiff = Math.floor((date - epiphany) / (24 * 60 * 60 * 1000));
            const week = Math.floor(daysDiff / 7) + 1;
            return `Epi${week}`;
        } else {
            // After Pentecost
            const daysDiff = Math.floor((date - pentecost) / (24 * 60 * 60 * 1000));
            const week = Math.floor(daysDiff / 7) + 1;
            return week <= 24 ? `Pent${week.toString().padStart(2, '0')}` : 'Pent24';
        }
    }

    /**
     * Get Christmas week designation
     * @param {Date} date - The date
     * @param {number} year - The year
     * @returns {string} Christmas week designation
     */
    getChristmasWeek(date, year) {
        const christmas = new Date(year, 11, 25);
        const daysDiff = Math.floor((date - christmas) / (24 * 60 * 60 * 1000));
        
        if (daysDiff < 0) {
            // Before Christmas but in Christmas season - probably late December of previous year
            return 'Nat1';
        } else if (daysDiff < 8) {
            return 'Nat1'; // Christmas Octave
        } else {
            return 'Nat2'; // After Christmas Octave
        }
    }

    /**
     * Get saint commemoration for a given date
     * @param {Date} date - The date
     * @returns {Object|null} Saint information or null if no saint
     */
    getSaintOfDay(date) {
        const meta = this.getSaintMetadata(date);
        if (!meta) {
            return null;
        }

        return {
            filename: meta.file,
            hasProper: true,
            title: meta.title,
            rank: meta.rank,
            commune: meta.commune
        };
    }

    /**
     * Determine which files to load for a given liturgical day
     * @param {Object} dayData - Liturgical day information
     * @returns {Object} File paths to load
     */
    determineFiles(dayData) {
        const observances = this.resolveObservances(dayData);
        dayData.observances = observances;
        dayData.primary = observances[0] || null;
        dayData.commemorations = observances.slice(1);

        const files = {
            tempora: null,
            sancti: null,
            commune: null
        };

        const temporal = observances.find(obs => obs.type === 'tempora');
        const saint = observances.find(obs => obs.type === 'sancti');

        if (temporal) {
            files.tempora = this.normalizeFileRef('Tempora', temporal.file);
        }

        if (saint) {
            files.sancti = this.normalizeFileRef('Sancti', saint.file);
            if (saint.commune) {
                files.commune = this.normalizeFileRef('Commune', saint.commune);
            } else if (saint.rank && saint.rank !== 'feria') {
                files.commune = this.normalizeFileRef('Commune', 'C10.txt');
            }
        }

        return files;
    }

    resolveObservances(dayData) {
        const observances = [];

        const temporal = this.buildTemporalObservance(dayData);
        if (temporal) {
            observances.push(temporal);
        }

        const saint = this.buildSaintObservance(dayData.date);
        if (saint) {
            observances.push(saint);
        }

        observances.sort((a, b) => this.compareObservances(a, b));

        if (!this.options.includeOptionalMemorials) {
            return observances.filter(obs => obs.rank !== 'memorial' || obs.type === 'tempora');
        }

        return observances;
    }

    buildTemporalObservance(dayData) {
        const file = `${dayData.week}-${dayData.dayOfWeek}.txt`;
        const rank = this.getTemporalRank(dayData);
        const title = this.formatTemporalTitle(dayData.week, dayData.dayOfWeek, dayData.season);
        const meta = TEMPORA_METADATA[`${dayData.week}-${dayData.dayOfWeek}`] || {};

        return {
            type: 'tempora',
            title,
            rank,
            file,
            season: dayData.season,
            priority: this.resolvePriority(meta.priority, rank)
        };
    }

    buildSaintObservance(date) {
        const saintMeta = this.getSaintMetadata(date);
        if (!saintMeta) return null;

        const { file, title, rank = 'third', rawRank = null, commune = null, priority = null } = saintMeta;

        return {
            type: 'sancti',
            title: title || file,
            rank,
            rawRank,
            commune,
            file,
            priority: this.resolvePriority(priority, rank)
        };
    }

    compareObservances(a, b) {
        const aPriority = this.getObservancePriority(a);
        const bPriority = this.getObservancePriority(b);

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        if (a.type === b.type) {
            return 0;
        }

        if (a.type === 'tempora' && b.type === 'sancti') {
            return -1;
        }

        if (a.type === 'sancti' && b.type === 'tempora') {
            return 1;
        }

        return 0;
    }

    getTemporalRank(dayData) {
        const { season, dayOfWeek, week } = dayData;

        const key = `${week}-${dayOfWeek}`;
        const meta = TEMPORA_METADATA[key];
        if (meta && meta.rank) {
            return meta.rank;
        }

        if (dayOfWeek === 0) {
            if (['advent', 'lent', 'easter'].includes(season)) {
                return 'second';
            }
            return 'third';
        }

        if (season === 'lent' || season === 'advent') {
            return 'memorial';
        }

        return 'feria';
    }

    formatTemporalTitle(week, dayOfWeek, season) {
        const key = `${week}-${dayOfWeek}`;
        const meta = TEMPORA_METADATA[key];
        if (meta && meta.title) {
            return meta.title;
        }

        const weekLabel = this.formatWeekLabel(week, season);
        const weekday = WEEKDAY_NAMES[dayOfWeek] || `Day ${dayOfWeek}`;

        if (dayOfWeek === 0) {
            if (weekLabel) {
                return `${weekLabel} Sunday`;
            }
            return `${weekday}`;
        }

        if (weekLabel) {
            return `${weekday} in ${weekLabel}`;
        }

        return `${weekday} (${week})`;
    }

    formatWeekLabel(week, season) {
        if (!week) return null;
        const match = week.match(/^([A-Za-z]+)(\d+)?$/);
        if (!match) return week;

        const [, prefix, numberRaw] = match;
        const num = Number.parseInt(numberRaw, 10);
        const seasonName = SEASON_NAMES[prefix] || season || prefix;

        if (Number.isInteger(num) && num > 0) {
            if (prefix === 'Pent') {
                return `${ordinal(num)} Week after Pentecost`;
            }
            if (prefix === 'Pasc') {
                return `${ordinal(num)} Week of Easter`;
            }
            if (prefix === 'Adv') {
                return `${ordinal(num)} Week of Advent`;
            }
            if (prefix === 'Quad') {
                return `${ordinal(num)} Week of Lent`;
            }
            if (prefix === 'Quadp') {
                return `${ordinal(num)} Week of Pre-Lent`;
            }
            return `${ordinal(num)} Week of ${seasonName}`;
        }

        if (prefix === 'Pasc0') {
            return 'Easter Octave';
        }

        return seasonName;
    }

    getSaintMetadata(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const keyBase = `${month}-${day}`;

        if (this.saintMetadata[keyBase]) {
            return { key: keyBase, ...this.saintMetadata[keyBase] };
        }

        const alternate = this.saintKeys.find(key => key.startsWith(keyBase));
        if (alternate) {
            return { key: alternate, ...this.saintMetadata[alternate] };
        }

        return null;
    }

    normalizeDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }

    getObservancePriority(observance) {
        if (Number.isFinite(observance.priority)) {
            return observance.priority;
        }

        return this.resolvePriority(null, observance.rank);
    }

    resolvePriority(priorityValue, rank) {
        if (priorityValue !== null && priorityValue !== undefined) {
            const value = typeof priorityValue === 'string' ? priorityValue.trim() : priorityValue;
            if (value !== '') {
                const parsed = Number(value);
                if (!Number.isNaN(parsed)) {
                    return parsed;
                }
            }
        }

        return RANK_PRIORITY[rank] ?? 10;
    }

    normalizeFileRef(defaultType, rawValue) {
        if (!rawValue) return null;

        if (typeof rawValue === 'object' && rawValue !== null) {
            if (rawValue.type && rawValue.filename) {
                return rawValue;
            }
        }

        if (rawValue.includes('/')) {
            const [prefix, rest] = rawValue.split('/', 2);
            const type = this.mapFileType(prefix) || defaultType;
            return {
                type,
                filename: rest
            };
        }

        return {
            type: defaultType,
            filename: rawValue
        };
    }

    mapFileType(prefix) {
        switch (prefix) {
            case 'Tempora':
            case 'TemporaM':
            case 'TemporaOP':
                return prefix;
            case 'Sancti':
            case 'SanctiM':
                return prefix;
            case 'Commune':
            case 'CommuneM':
                return prefix;
            default:
                return null;
        }
    }

    /**
     * Get file path for Divinum Officium data
     * @param {string} category - 'Latin', 'English', etc.
     * @param {string} type - 'Sancti', 'Tempora', 'Commune', 'Psalterium'
     * @param {string} filename - The specific file
     * @returns {string} Full file path
     */
    getFilePath(category, type, filename) {
        return `divinum-officium/web/www/horas/${category}/${type}/${filename}`;
    }

    /**
     * Get today's liturgical day
     * @returns {Object} Today's liturgical information
     */
    getToday() {
        return this.getLiturgicalDay(new Date());
    }
}

function ordinal(number) {
    const n = Number.parseInt(number, 10);
    if (!Number.isInteger(n)) return `${number}`;

    const abs = Math.abs(n);
    const mod100 = abs % 100;
    if (mod100 >= 11 && mod100 <= 13) {
        return `${n}th`;
    }

    switch (abs % 10) {
        case 1:
            return `${n}st`;
        case 2:
            return `${n}nd`;
        case 3:
            return `${n}rd`;
        default:
            return `${n}th`;
    }
}

export default LiturgicalCalendar;

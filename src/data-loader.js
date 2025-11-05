/**
 * Data Loader - Loads and caches prayer data
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.prayerData = null;
        this.availableRange = null;
    }

    /**
     * Initialize and load prayer data
     */
    async init() {
        if (this.prayerData) return;
        
        try {
            console.log('🔄 Attempting to load prayer data...');
            
            // Load the pre-processed prayer data
            const response = await fetch('/prayers-english.json');
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.prayerData = await response.json();
            this.availableRange = this.resolveRange(this.prayerData);
            console.log(`📚 Loaded ${Object.keys(this.prayerData.prayers).length} days of prayers`);
            if (this.availableRange) {
                console.log(`🗓️  Available range: ${this.availableRange.start} → ${this.availableRange.end}`);
            }
        } catch (error) {
            console.error('❌ Failed to load prayer data:', error);
            console.error('📍 Error details:', error.message);
            
            // Don't throw - use fallback data instead
            console.log('🔄 Using fallback prayer data');
            this.prayerData = this.createFallbackDataSet();
            this.availableRange = this.resolveRange(this.prayerData);
        }
    }

    /**
     * Get prayers for a specific date
     * @param {Date} date - Date to get prayers for
     * @returns {Object|null} Prayer data for the date
     */
    getPrayersForDate(date) {
        if (!this.prayerData) {
            throw new Error('Data not loaded. Call init() first.');
        }

        const dateKey = this.formatDateKey(date);

        if (this.availableRange && !this.isDateInRange(date)) {
            console.warn(`⚠️  Requested date ${dateKey} outside available range (${this.availableRange.start} → ${this.availableRange.end})`);
        }
        
        // Check cache first
        if (this.cache.has(dateKey)) {
            return this.cache.get(dateKey);
        }

        // Get prayers from loaded data
        const prayers = this.prayerData.prayers[dateKey];
        
        if (prayers) {
            this.cache.set(dateKey, prayers);
            return prayers;
        }

        // Return fallback data if date not found
        return this.createFallbackPrayers(date);
    }

    /**
     * Get prayers for today
     * @returns {Object} Today's prayers
     */
    getTodaysPrayers() {
        return this.getPrayersForDate(new Date());
    }

    /**
     * Create fallback prayers when no data is available
     * @param {Date} date - Date for fallback
     * @returns {Object} Fallback prayer data
     */
    createFallbackPrayers(date) {
        const dateKey = this.formatDateKey(date);
        const fallback = {
            date: dateKey,
            hours: {
                matutinum: {
                    name: 'Matins',
                    prayers: [{
                        title: 'Night Prayer',
                        text: 'O Lord, open my lips, and my mouth shall declare your praise. Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',
                        type: 'prayer'
                    }]
                },
                laudes: {
                    name: 'Lauds',
                    prayers: [{
                        title: 'Morning Prayer',
                        text: 'O God, you have brought us to the beginning of a new day. Save us this day by your power, that we may not fall into sin, but that all our words may be directed and all our thoughts and works regulated according to your justice. Through Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                },
                prima: {
                    name: 'Prime',
                    prayers: [{
                        title: 'First Hour',
                        text: 'Grant, O Lord, that we may pass this day in gladness and peace, without stumbling and without stain. Through Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                },
                tertia: {
                    name: 'Terce',
                    prayers: [{
                        title: 'Third Hour',
                        text: 'Come, Holy Spirit, fill the hearts of the faithful and kindle in them the fire of your love. Through Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                },
                sexta: {
                    name: 'Sext',
                    prayers: [{
                        title: 'Sixth Hour',
                        text: 'O God, who at the sixth hour led your Only-begotten Son to the Cross for our salvation, blot out our sins and lead us to everlasting life. Through the same Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                },
                nona: {
                    name: 'None',
                    prayers: [{
                        title: 'Ninth Hour',
                        text: 'O God, who at the ninth hour allowed your Only-begotten Son to ascend the Cross for our salvation, grant that we who have known the mystery of his Passion may merit to receive the gifts of his mercy. Through the same Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                },
                vespera: {
                    name: 'Vespers',
                    prayers: [{
                        title: 'Evening Prayer',
                        text: 'O God, you have brought us safely to the evening hour. Protect us through the darkness of the night and grant us peaceful rest. Through Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                },
                completorium: {
                    name: 'Compline',
                    prayers: [{
                        title: 'Night Prayer',
                        text: 'Visit, we beseech you, O Lord, this dwelling, and drive far from it all snares of the enemy. Let your holy angels dwell herein to preserve us in peace, and let your blessing be always upon us. Through Christ our Lord. Amen.',
                        type: 'prayer'
                    }]
                }
            }
        };

        this.cache.set(fallback.date, fallback);
        return fallback;
    }

    /**
     * Preload prayers for the next few days
     * @param {number} days - Number of days to preload
     */
    async preloadPrayers(days = 7) {
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            this.getPrayersForDate(date);
        }
        
        console.log(`⚡ Preloaded ${days} days of prayers`);
    }

    /**
     * Get available date range
     * @returns {Object} Date range information
     */
    getAvailableDateRange() {
        if (!this.prayerData) return null;
        
        if (!this.availableRange) {
            this.availableRange = this.resolveRange(this.prayerData);
        }

        return this.availableRange;
    }

    /**
     * Check if prayers are available for a specific date
     * @param {Date} date - Date to check
     * @returns {boolean} True if prayers are available
     */
    hasDataForDate(date) {
        if (!this.prayerData) return false;
        
        const dateKey = this.formatDateKey(date);

        if (this.availableRange && !this.isDateInRange(date)) {
            return false;
        }

        return dateKey in this.prayerData.prayers;
    }

    /**
     * Create fallback dataset when file loading fails
     * @returns {Object} Fallback prayer dataset
     */
    createFallbackDataSet() {
        console.log('📝 Creating fallback prayer dataset');
        
        const today = new Date();
        const fallback = this.createFallbackPrayers(today);
        const dateKey = fallback.date;

        return {
            extracted: new Date().toISOString(),
            language: 'English',
            range: {
                start: dateKey,
                end: dateKey,
                count: 1
            },
            prayers: {
                [dateKey]: fallback
            }
        };
    }

    /**
     * Determine range metadata from dataset
     * @param {Object} data - Loaded dataset
     * @returns {Object|null} Range with start/end/count
     */
    resolveRange(data) {
        if (!data || !data.prayers) return null;

        if (data.range && data.range.start && data.range.end) {
            const count = data.range.count || Object.keys(data.prayers).length;
            return {
                start: data.range.start,
                end: data.range.end,
                count
            };
        }

        const dates = Object.keys(data.prayers).sort();
        if (dates.length === 0) return null;

        return {
            start: dates[0],
            end: dates[dates.length - 1],
            count: dates.length
        };
    }

    /**
     * Determine if a date falls in the available range
     * @param {Date} date
     * @returns {boolean}
     */
    isDateInRange(date) {
        if (!this.availableRange) return true;

        const dateKey = this.formatDateKey(date);
        return dateKey >= this.availableRange.start && dateKey <= this.availableRange.end;
    }

    /**
     * Format date as YYYY-MM-DD
     * @param {Date} date
     * @returns {string}
     */
    formatDateKey(date) {
        const normalized = date instanceof Date ? date : new Date(date);
        const year = normalized.getFullYear();
        const month = String(normalized.getMonth() + 1).padStart(2, '0');
        const day = String(normalized.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

export { DataLoader };
export default DataLoader;

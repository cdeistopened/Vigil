/**
 * Prayer Renderer
 * Renders liturgical content in a readable format
 */

export class PrayerRenderer {
    constructor(container) {
        this.container = container;
    }

    /**
     * Render a complete hour of prayer
     * @param {Object} hourData - Hour data with sections
     * @param {string} hourName - Name of the hour (e.g., 'Lauds')
     */
    renderHour(hourData, hourName) {
        this.container.innerHTML = '';
        
        // Create hour header
        const header = document.createElement('div');
        header.className = 'hour-header';
        header.innerHTML = `
            <h1>${hourName}</h1>
            <p class="hour-date">${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
        `;
        this.container.appendChild(header);

        // Render sections in liturgical order
        this.renderSectionsInOrder(hourData, hourName.toLowerCase());
    }

    /**
     * Render sections in proper liturgical order
     * @param {Object} hourData - Hour data with sections
     * @param {string} hourKey - Hour key for ordering
     */
    renderSectionsInOrder(hourData, hourKey) {
        const sectionOrder = this.getSectionOrder(hourKey);
        
        for (const sectionType of sectionOrder) {
            const sections = this.findSectionsByType(hourData.sections, sectionType);
            
            for (const [sectionName, sectionData] of sections) {
                this.renderSection(sectionName, sectionData);
            }
        }
    }

    /**
     * Get the proper order of sections for each hour
     * @param {string} hourKey - Hour identifier
     * @returns {Array} Ordered list of section types
     */
    getSectionOrder(hourKey) {
        const orders = {
            matutinum: [
                'invitatorium', 'hymnus', 'ant matutinum', 'lectio', 'responsory', 
                'te deum', 'oratio'
            ],
            laudes: [
                'ant laudes', 'capitulum', 'hymnus laudes', 'versum', 
                'ant benedictus', 'oratio'
            ],
            prima: [
                'ant prima', 'capitulum', 'hymnus prima', 'versum', 'oratio'
            ],
            tertia: [
                'ant tertia', 'capitulum', 'hymnus tertia', 'versum', 'oratio'
            ],
            sexta: [
                'ant sexta', 'capitulum', 'hymnus sexta', 'versum', 'oratio'
            ],
            nona: [
                'ant nona', 'capitulum', 'hymnus nona', 'versum', 'oratio'
            ],
            vespera: [
                'ant vespera', 'capitulum', 'hymnus vespera', 'versum', 
                'ant magnificat', 'oratio'
            ],
            completorium: [
                'ant completorium', 'hymnus completorium', 'capitulum', 
                'versum', 'ant nunc dimittis', 'oratio'
            ]
        };

        return orders[hourKey] || ['oratio', 'ant', 'hymnus', 'lectio', 'responsory'];
    }

    /**
     * Find sections matching a type
     * @param {Object} sections - All sections
     * @param {string} type - Section type to find
     * @returns {Array} Array of [name, data] pairs
     */
    findSectionsByType(sections, type) {
        const matches = [];
        const typePattern = new RegExp(type.replace(/\s+/g, '\\s+'), 'i');
        
        for (const [name, data] of Object.entries(sections)) {
            if (typePattern.test(name)) {
                matches.push([name, data]);
            }
        }
        
        return matches;
    }

    /**
     * Render a single section
     * @param {string} sectionName - Name of the section
     * @param {Object} sectionData - Section data
     */
    renderSection(sectionName, sectionData) {
        const section = document.createElement('div');
        section.className = 'prayer-section';
        
        // Section header
        const header = document.createElement('h2');
        header.textContent = this.formatSectionName(sectionName);
        section.appendChild(header);

        // Section content
        const content = this.renderSectionContent(sectionData);
        section.appendChild(content);

        this.container.appendChild(section);
    }

    /**
     * Format section name for display
     * @param {string} sectionName - Raw section name
     * @returns {string} Formatted name
     */
    formatSectionName(sectionName) {
        const nameMap = {
            'Oratio': 'Prayer',
            'Ant Laudes': 'Antiphons for Lauds',
            'Ant Vespera': 'Antiphons for Vespers',
            'Ant Matutinum': 'Antiphons for Matins',
            'Hymnus Laudes': 'Hymn for Lauds',
            'Hymnus Vespera': 'Hymn for Vespers',
            'Capitulum Laudes': 'Short Reading',
            'Capitulum Vespera': 'Short Reading',
            'Versum 1': 'Verse',
            'Versum 2': 'Verse',
            'Lectio1': 'First Reading',
            'Lectio2': 'Second Reading',
            'Lectio3': 'Third Reading',
            'Responsory1': 'First Responsory',
            'Responsory2': 'Second Responsory',
            'Responsory3': 'Third Responsory'
        };

        return nameMap[sectionName] || sectionName.replace(/([A-Z])/g, ' $1').trim();
    }

    /**
     * Render section content with appropriate formatting
     * @param {Object} sectionData - Section data
     * @returns {HTMLElement} Rendered content element
     */
    renderSectionContent(sectionData) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'section-content';

        const text = sectionData.resolvedText || sectionData.text;
        
        if (!text || text.trim() === '') {
            contentDiv.innerHTML = '<p class="no-content">Content not available</p>';
            return contentDiv;
        }

        // Process the text based on content type
        if (this.isAntiphon(sectionData)) {
            contentDiv.appendChild(this.renderAntiphon(text));
        } else if (this.isReading(sectionData)) {
            contentDiv.appendChild(this.renderReading(text));
        } else if (this.isPsalm(sectionData)) {
            contentDiv.appendChild(this.renderPsalm(text));
        } else if (this.isHymn(sectionData)) {
            contentDiv.appendChild(this.renderHymn(text));
        } else {
            contentDiv.appendChild(this.renderGenericText(text));
        }

        return contentDiv;
    }

    /**
     * Check if content is an antiphon
     * @param {Object} sectionData - Section data
     * @returns {boolean} True if antiphon
     */
    isAntiphon(sectionData) {
        return /ant/i.test(sectionData.text) || sectionData.text.includes('*');
    }

    /**
     * Check if content is a reading
     * @param {Object} sectionData - Section data
     * @returns {boolean} True if reading
     */
    isReading(sectionData) {
        return /lectio|reading/i.test(sectionData.text) || sectionData.text.includes('!');
    }

    /**
     * Check if content is a psalm
     * @param {Object} sectionData - Section data
     * @returns {boolean} True if psalm
     */
    isPsalm(sectionData) {
        return /psalm/i.test(sectionData.text) || sectionData.text.includes(';;');
    }

    /**
     * Check if content is a hymn
     * @param {Object} sectionData - Section data
     * @returns {boolean} True if hymn
     */
    isHymn(sectionData) {
        return /hymn/i.test(sectionData.text);
    }

    /**
     * Render antiphon text
     * @param {string} text - Antiphon text
     * @returns {HTMLElement} Rendered antiphon
     */
    renderAntiphon(text) {
        const div = document.createElement('div');
        div.className = 'antiphon';
        
        const lines = text.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const p = document.createElement('p');
            p.className = 'antiphon-line';
            
            // Handle antiphon markers (*)
            if (line.includes('*')) {
                const parts = line.split('*');
                p.innerHTML = `<span class="antiphon-incipit">${parts[0].trim()}</span> <span class="antiphon-marker">*</span> <span class="antiphon-continuation">${parts[1]?.trim() || ''}</span>`;
            } else {
                p.textContent = line.trim();
            }
            
            div.appendChild(p);
        });
        
        return div;
    }

    /**
     * Render reading text
     * @param {string} text - Reading text
     * @returns {HTMLElement} Rendered reading
     */
    renderReading(text) {
        const div = document.createElement('div');
        div.className = 'reading';
        
        const lines = text.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const p = document.createElement('p');
            
            // Handle scripture references (lines starting with !)
            if (line.startsWith('!')) {
                p.className = 'scripture-reference';
                p.textContent = line.substring(1).trim();
            } else {
                p.className = 'reading-text';
                p.textContent = line.trim();
            }
            
            div.appendChild(p);
        });
        
        return div;
    }

    /**
     * Render psalm text
     * @param {string} text - Psalm text
     * @returns {HTMLElement} Rendered psalm
     */
    renderPsalm(text) {
        const div = document.createElement('div');
        div.className = 'psalm';
        
        const lines = text.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const p = document.createElement('p');
            p.className = 'psalm-verse';
            
            // Handle psalm numbers (;;number)
            if (line.includes(';;')) {
                const parts = line.split(';;');
                p.innerHTML = `${parts[0].trim()} <span class="psalm-number">(Ps ${parts[1]?.trim()})</span>`;
            } else {
                p.textContent = line.trim();
            }
            
            div.appendChild(p);
        });
        
        return div;
    }

    /**
     * Render hymn text
     * @param {string} text - Hymn text
     * @returns {HTMLElement} Rendered hymn
     */
    renderHymn(text) {
        const div = document.createElement('div');
        div.className = 'hymn';
        
        const lines = text.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const p = document.createElement('p');
            p.className = 'hymn-line';
            p.textContent = line.trim();
            div.appendChild(p);
        });
        
        return div;
    }

    /**
     * Render generic text
     * @param {string} text - Generic text
     * @returns {HTMLElement} Rendered text
     */
    renderGenericText(text) {
        const div = document.createElement('div');
        div.className = 'prayer-text';
        
        const lines = text.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line.trim();
            div.appendChild(p);
        });
        
        return div;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.container.innerHTML = '<div class="loading">Loading prayers...</div>';
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.container.innerHTML = `<div class="error">Error: ${message}</div>`;
    }
}

export default PrayerRenderer;
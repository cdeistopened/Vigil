/**
 * Simple Prayer Renderer - for new data format
 * Renders liturgical content from pre-processed prayer data
 */

export class SimplePrayerRenderer {
    constructor(container) {
        this.container = container;
    }

    /**
     * Render a complete hour of prayer
     * @param {Object} hourData - Hour data with prayers array
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

        // Render each prayer
        if (hourData.prayers && hourData.prayers.length > 0) {
            hourData.prayers.forEach(prayer => {
                this.renderPrayer(prayer);
            });
        } else {
            this.showNoPrayers();
        }
    }

    /**
     * Render a single prayer
     * @param {Object} prayer - Prayer data with title, text, type
     */
    renderPrayer(prayer) {
        const section = document.createElement('div');
        section.className = `prayer-section prayer-${prayer.type}`;
        
        // Prayer title
        const header = document.createElement('h2');
        header.textContent = prayer.title;
        section.appendChild(header);

        // Prayer content
        const content = this.renderPrayerContent(prayer);
        section.appendChild(content);

        this.container.appendChild(section);
    }

    /**
     * Render prayer content with appropriate formatting
     * @param {Object} prayer - Prayer data
     * @returns {HTMLElement} Rendered content element
     */
    renderPrayerContent(prayer) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'section-content';

        if (!prayer.text || prayer.text.trim() === '') {
            contentDiv.innerHTML = '<p class="no-content">Content not available</p>';
            return contentDiv;
        }

        // Process the text based on prayer type
        switch (prayer.type) {
            case 'antiphon':
                contentDiv.appendChild(this.renderAntiphon(prayer.text));
                break;
            case 'reading':
                contentDiv.appendChild(this.renderReading(prayer.text));
                break;
            case 'psalm':
                contentDiv.appendChild(this.renderPsalm(prayer.text));
                break;
            case 'hymn':
                contentDiv.appendChild(this.renderHymn(prayer.text));
                break;
            case 'prayer':
            default:
                contentDiv.appendChild(this.renderGenericText(prayer.text));
                break;
        }

        return contentDiv;
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
                p.innerHTML = `<span class="antiphon-incipit">${this.escapeHtml(parts[0].trim())}</span> <span class="antiphon-marker">*</span> <span class="antiphon-continuation">${this.escapeHtml(parts[1]?.trim() || '')}</span>`;
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
                p.innerHTML = `${this.escapeHtml(parts[0].trim())} <span class="psalm-number">(Ps ${this.escapeHtml(parts[1]?.trim())})</span>`;
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
        
        // Handle special formatting tokens
        text = this.processSpecialTokens(text);
        
        const lines = text.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line.trim();
            div.appendChild(p);
        });
        
        return div;
    }

    /**
     * Process special formatting tokens like $Qui vivis
     * @param {string} text - Text to process
     * @returns {string} Processed text
     */
    processSpecialTokens(text) {
        // Expand common liturgical endings
        const expansions = {
            '$Qui vivis': 'Who lives and reigns with the Father in the unity of the Holy Spirit, God, for ever and ever. Amen.',
            '$Per Dominum': 'Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, God, for ever and ever. Amen.',
            '$Qui tecum': 'Who lives and reigns with you in the unity of the Holy Spirit, God, for ever and ever. Amen.'
        };

        let processedText = text;
        for (const [token, expansion] of Object.entries(expansions)) {
            processedText = processedText.replace(token, expansion);
        }

        return processedText;
    }

    /**
     * Show message when no prayers are available
     */
    showNoPrayers() {
        const div = document.createElement('div');
        div.className = 'prayer-section';
        div.innerHTML = `
            <h2>No Prayers Available</h2>
            <p class="no-content">No prayers are available for this hour today.</p>
        `;
        this.container.appendChild(div);
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

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default SimplePrayerRenderer;
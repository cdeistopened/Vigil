/**
 * Vigil - Liturgy of the Hours App
 * Main application entry point
 */

import { DivinumOfficiumParser } from './parser.js';
import { LiturgicalCalendar } from './calendar.js';
import { SimplePrayerRenderer } from './simple-renderer.js';
import { DataLoader } from './data-loader.js';

class VigilApp {
    constructor() {
        this.parser = new DivinumOfficiumParser();
        this.calendar = new LiturgicalCalendar();
        this.renderer = new SimplePrayerRenderer(document.getElementById('prayer-content'));
        this.dataLoader = new DataLoader();
        
        this.currentHour = 'laudes';
        this.currentData = null;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.setupEventListeners();
        await this.loadTodaysPrayers();
    }

    /**
     * Set up event listeners for navigation
     */
    setupEventListeners() {
        // Hour navigation buttons
        const hourButtons = document.querySelectorAll('.hour-button');
        hourButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const hour = e.target.dataset.hour;
                this.switchHour(hour);
            });
        });

        // Update active button styling
        this.updateActiveButton();
    }

    /**
     * Switch to a different hour
     * @param {string} hour - Hour to switch to
     */
    async switchHour(hour) {
        if (hour === this.currentHour) return;

        this.currentHour = hour;
        this.updateActiveButton();
        
        if (this.currentData) {
            this.displayHour(hour);
        } else {
            await this.loadTodaysPrayers();
        }
    }

    /**
     * Update active button styling
     */
    updateActiveButton() {
        const buttons = document.querySelectorAll('.hour-button');
        buttons.forEach(button => {
            button.classList.toggle('active', button.dataset.hour === this.currentHour);
        });
    }

    /**
     * Load today's prayers
     */
    async loadTodaysPrayers() {
        try {
            this.renderer.showLoading();

            // Initialize data loader
            await this.dataLoader.init();

            // Load today's prayers from real data
            this.currentData = this.dataLoader.getTodaysPrayers();
            console.log('Loaded prayers for:', this.currentData.date);

            // Display liturgical date information
            this.displayLiturgicalDate();

            // Preload upcoming days for fast access
            await this.dataLoader.preloadPrayers(7);

            this.displayHour(this.currentHour);

        } catch (error) {
            console.error('Error loading prayers:', error);
            this.renderer.showError('Failed to load today\'s prayers. Please try again.');
        }
    }

    /**
     * Display liturgical date information in the header
     */
    displayLiturgicalDate() {
        const dateElement = document.getElementById('liturgical-date');
        if (!dateElement || !this.currentData) return;

        const date = new Date(this.currentData.date + 'T00:00:00');
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const primary = this.currentData.primary;
        const observanceName = primary ? primary.title : 'Feria';

        dateElement.innerHTML = `
            <strong>${formattedDate}</strong><br>
            ${observanceName}
        `;
    }


    /**
     * Display a specific hour
     * @param {string} hour - Hour to display
     */
    displayHour(hour) {
        if (!this.currentData || !this.currentData.hours[hour]) {
            this.renderer.showError(`No data available for ${hour}`);
            return;
        }

        const hourData = this.currentData.hours[hour];
        this.renderer.renderHour(hourData, hourData.name);
    }

    /**
     * File loader function for parser (placeholder)
     * @param {string} filePath - Path to file to load
     * @returns {Promise<string>} File content
     */
    async loadFile(filePath) {
        // In a real implementation, this would load files from the server
        // For now, return empty string or throw error
        throw new Error(`File loading not implemented: ${filePath}`);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vigilApp = new VigilApp();
});

export default VigilApp;
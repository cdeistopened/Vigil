# Vigil - Liturgy of the Hours App

A modern web application for praying the Liturgy of the Hours, inspired by and designed to work with the [Divinum Officium](https://github.com/DivinumOfficium/divinum-officium) project.

## Features

- **Complete Daily Prayer**: All 8 canonical hours (Matins, Lauds, Prime, Terce, Sext, None, Vespers, Compline)
- **Liturgical Calendar Integration**: Automatically calculates liturgical seasons and feast days
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Rich Text Formatting**: Proper formatting for antiphons, psalms, readings, and hymns
- **Easy Navigation**: Simple click/tap navigation between different hours
- **Clean, Readable Typography**: Designed for comfortable prayer and reading

## Architecture

The app is built with modern web technologies and a modular architecture:

> Need to inspect the Divinum Officium source? See `docs/divinum-officium-structure.md` for a quick reference to the bundled data set.

> Working on calendar precedence? Start with `docs/calendar-precedence.md` for rank hierarchy and implementation notes.

### Core Components

1. **Parser (`src/parser.js`)** - Parses Divinum Officium text files with their complex cross-reference system
2. **Calendar (`src/calendar.js`)** - Calculates liturgical dates, seasons, and determines which prayers to use
3. **Renderer (`src/renderer.js`)** - Renders prayers in a beautiful, readable format
4. **Main App (`src/main.js`)** - Coordinates all components and handles user interaction

### Key Features of the Parser

- Handles square-bracket section format: `[Section Name]`
- Resolves `@` cross-references: `@Commune/C10`, `@Sancti/12-25`
- Processes conditional logic: `(rubrica tridentina)`, `(sed tempore paschali)`
- Supports text substitutions: `s/old/new/g`

### Liturgical Calendar Engine

- Calculates Easter and all moveable feasts
- Determines liturgical seasons (Advent, Christmas, Lent, Easter, Ordinary Time)
- Handles the complex precedence system of the liturgical calendar
- Automatically selects appropriate files from Sancti, Tempora, and Commune directories

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd vigil
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Navigation
- Click on any hour button (Matins, Lauds, Prime, etc.) to view that hour's prayers
- The app starts with Lauds (morning prayer) by default
- The active hour is highlighted in the navigation

### Prayer Types
The app formats different types of content appropriately:

- **Antiphons** - Green background, with special formatting for the `*` marker
- **Readings** - Blue background, with scripture references highlighted
- **Psalms** - Orange background, with psalm numbers noted
- **Hymns** - Purple background, formatted as verse
- **Prayers** - Standard formatting for collects and other prayers

## Data Integration

Currently, the app uses sample liturgical data for demonstration. To integrate with real Divinum Officium data:

1. Place the `divinum-officium` repository in the project root
2. Implement file loading in the `loadFile` method in `src/main.js`
3. The parser is ready to handle the complex Divinum Officium format

### File Structure Expected

```
divinum-officium/
├── web/www/horas/
│   ├── Latin/
│   │   ├── Sancti/          # Saints (daily files: 01-01.txt, 01-02.txt, etc.)
│   │   ├── Tempora/         # Seasonal cycle (Adv1-0.txt, Pasc1-1.txt, etc.)
│   │   ├── Commune/         # Common texts (C1.txt through C12.txt)
│   │   └── Psalterium/      # Psalms and standard prayers
│   ├── English/
│   └── [other languages]/
```

## Technical Details

### Liturgical Calendar Calculations
- Uses the standard Western Easter calculation algorithm
- Handles all major liturgical seasons and their transitions
- Calculates moveable feast dates relative to Easter

### Cross-Reference Resolution
The parser can resolve complex references like:
- `@Sancti/12-25` → Load Christmas day prayers
- `@Commune/C10:Versum 2` → Load specific verse from Blessed Virgin Mary common
- `@Psalterium/Special/Major Special:Adv Versum 3` → Load Advent verse from special psalter

### Responsive Design
- Mobile-first approach
- Stacks navigation vertically on small screens
- Optimized for reading on various screen sizes
- Print-friendly styling

## Contributing

This project is designed to work with the Divinum Officium data format. Contributions are welcome, especially:

- Enhanced liturgical calendar calculations
- Additional language support
- Improved cross-reference resolution
- Better mobile user experience
- Integration with actual Divinum Officium data files

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- [Divinum Officium Project](https://github.com/DivinumOfficium/divinum-officium) - for the comprehensive liturgical database
- The developers and contributors of the Divinum Officium project
- The Catholic liturgical tradition that preserves these beautiful prayers

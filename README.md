# 🗺️ Mood Mapper - Premium Location Discovery App

A modern, production-ready React + Node.js application that helps users discover perfect places based on their mood. Features a professional dark theme, Google Maps integration, and intelligent mood-based recommendations.

## ✨ Features

### 🎯 Core Functionality
- **Mood-Based Recommendations**: Smart filtering based on user mood (Work, Date, Quick Bite, Budget)
- **Google Maps Integration**: Interactive maps with real-time location tracking
- **Advanced Search**: Autocomplete suggestions with backend API integration
- **Geolocation**: Automatic user location detection
- **Real-time Data**: Live place information including ratings, hours, and distance
- **Smart Filtering**: Sort by distance, rating, or name; filter by open/closed status
- **Detailed Information**: View ratings, distance, operating hours, and price levels
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18
- **Maps**: Google Maps JavaScript API
- **Places**: Google Places API
- **Styling**: CSS3 with modern design patterns

## Getting Started

### Prerequisites

1. Get a Google Maps JavaScript API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs for your project:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Allow Location Access**: The app will request your location to find nearby places
2. **Select Your Mood**: Choose from Work, Date, Quick Bite, or Budget
3. **Find Places**: Click "Find Nearby Places" to get recommendations
4. **Explore Results**: 
   - View places on the interactive map
   - Browse the detailed list with ratings and hours
   - Click on any place to see more details
5. **Filter & Sort**: Use the filters to refine your results

## Project Structure

```
src/
├── components/
│   ├── MapComponent.js      # Google Maps integration
│   ├── MoodSelector.js      # Mood selection interface
│   ├── PlacesList.js        # Place cards and details
│   └── Filters.js           # Sorting and filtering controls
├── services/
│   └── placesService.js     # Google Places API integration
├── App.js                   # Main application component
├── index.js                 # Application entry point
└── index.css                # Global styles
```

## API Integration

The app integrates with several Google APIs:

- **Places API**: Searches for nearby establishments based on keywords
- **Maps JavaScript API**: Renders interactive maps with markers
- **Geocoding API**: Converts addresses to coordinates (future enhancement)

## Features Breakdown

### Mood-based Search
Each mood is associated with specific keywords:
- **Work**: cafe, coworking, library, wifi
- **Date**: restaurant, romantic, bar, park
- **Quick Bite**: fast food, cafe, bakery, takeout
- **Budget**: cheap, affordable, budget, value

### Place Information Display
- Star ratings with visual indicators
- Distance calculation from user's location
- Operating hours with open/closed status
- Price level indicators ($, $$, $$$)
- Place types and categories

### Interactive Features
- Clickable map markers with info windows
- Selectable place cards with highlighting
- Dynamic map centering on selection
- Smooth animations and transitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Notes

- The app requires location services to be enabled
- Google Maps API usage may incur costs based on usage
- The search radius is set to 2km by default
- Maximum of 20 results are displayed to maintain performance

# Smart Nearby Places Recommender - Full Stack

A location-based recommendation app with separate frontend and backend architecture that suggests nearby places based on your mood and preferences.

## 🏗️ Architecture

```
smart-nearby-places-recommender/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   └── ...
│   ├── public/               # Static assets
│   └── package.json
├── backend/                  # Node.js Express API server
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── middleware/          # Express middleware
│   └── package.json
└── package.json             # Root package.json for running both
```

## 🚀 Features

### Frontend (React)
- **Mood-based Recommendations**: Select from Work, Date, Quick Bite, or Budget moods
- **Interactive Map**: Google Maps integration with place markers
- **Smart Filtering**: Sort by distance, rating, or name; filter by open/closed status
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Dynamic place information with ratings and hours

### Backend (Node.js/Express)
- **RESTful API**: Clean API endpoints for places and moods
- **Google Places Integration**: Secure server-side API calls
- **Error Handling**: Comprehensive error handling and validation
- **Rate Limiting**: Protection against API abuse
- **Security**: CORS, helmet, and environment variable management

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Google Maps JavaScript API key** from [Google Cloud Console](https://console.cloud.google.com/)
3. **Enable APIs** for your project:
   - Maps JavaScript API
   - Places API
   - Geocoding API

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd smart-nearby-places-recommender
npm run install-all
```

### 2. Environment Setup

#### Backend Environment
Create `backend/.env`:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### Frontend Environment
Create `frontend/.env`:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start the Application

#### Development Mode (Recommended)
```bash
npm run dev
```
This starts both frontend and backend concurrently:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

#### Individual Services
```bash
# Start backend only
npm run backend

# Start frontend only
npm run frontend
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start backend with production build
npm start
```

## 📡 API Endpoints

### Places API
- `POST /api/places/nearby` - Get nearby places based on mood and location
- `GET /api/places/moods` - Get available moods
- `GET /api/places/details/:placeId` - Get detailed information about a place

### Health Check
- `GET /api/health` - Check API health status

## 🎯 Usage

1. **Start the application** using `npm run dev`
2. **Allow Location Access** when prompted by the browser
3. **Select Your Mood** from the available options
4. **Find Places** to get personalized recommendations
5. **Explore Results** on the map and detailed list
6. **Filter & Sort** to refine your search

## 🔧 Technical Details

### Frontend Technology Stack
- **React 18** with modern hooks
- **Axios** for API communication
- **Google Maps JavaScript API** for mapping
- **CSS3** with responsive design

### Backend Technology Stack
- **Node.js** with Express.js
- **Google Maps Services SDK** for Places API
- **Helmet** for security headers
- **Rate Limiting** for API protection
- **CORS** for cross-origin requests

### Data Flow
1. Frontend requests moods from backend
2. User selects mood and shares location
3. Frontend sends location and mood to backend
4. Backend calls Google Places API securely
5. Backend processes and returns formatted data
6. Frontend displays results on map and list

## 🔒 Security Features

- **API Key Protection**: Google Maps API key stored server-side
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Configuration**: Restricted to frontend URL
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses

## 📱 Responsive Design

- **Desktop**: Side-by-side map and list layout
- **Mobile**: Stacked layout with optimized touch interactions
- **Tablet**: Adaptive layout for medium screens

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm start
# Ensure environment variables are set in production
```

### Environment Variables
- `NODE_ENV`: Set to 'production' for production deployment
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `PORT`: Backend server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS configuration

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure Google Maps API key is valid
   - Check that all required APIs are enabled
   - Verify API key restrictions

2. **CORS Issues**
   - Check FRONTEND_URL environment variable
   - Ensure backend is running before frontend

3. **Location Access**
   - Enable location services in browser
   - Use HTTPS in production for geolocation

4. **Build Errors**
   - Run `npm run install-all` to ensure all dependencies
   - Check Node.js version compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📊 Performance Notes

- **Search Radius**: 2km by default (configurable)
- **Result Limit**: 20 places maximum for performance
- **Caching**: Consider implementing Redis for production
- **Monitoring**: Add logging and monitoring for production use

## 🔮 Future Enhancements

- User authentication and favorites
- Advanced filtering options
- Real-time place updates
- Machine learning recommendations
- Multi-language support
- Offline functionality

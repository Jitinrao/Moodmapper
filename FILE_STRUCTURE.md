# Mood Mapper - File Structure

This document outlines the complete file structure for the Mood Mapper application, matching the modern design with all requested features.

## 📁 Directory Structure

```
mood-mapper/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── favicon.ico
│   └── icons/
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── src/
│   ├── index.js
│   ├── index.css
│   ├── App.js
│   ├── App.css
│   ├── tailwind.config.js
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   └── Saved.jsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Separator.jsx
│   │   │   ├── Checkbox.jsx
│   │   │   ├── Radio.jsx
│   │   │   ├── Switch.jsx
│   │   │   ├── Slider.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Label.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Dialog.jsx
│   │   │   ├── Sheet.jsx
│   │   │   ├── Popover.jsx
│   │   │   ├── HoverCard.jsx
│   │   │   ├── Command.jsx
│   │   │   ├── Kbd.jsx
│   │   │   ├── ScrollArea.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── TableBody.jsx
│   │   │   ├── TableCell.jsx
│   │   │   ├── TableHead.jsx
│   │   │   ├── TableRow.jsx
│   │   │   ├── TableFooter.jsx
│   │   │   ├── TableCaption.jsx
│   │   │   ├── Accordion.jsx
│   │   │   ├── AccordionContent.jsx
│   │   │   ├── AccordionItem.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── TabsList.jsx
│   │   │   ├── TabsTrigger.jsx
│   │   │   ├── TabsContent.jsx
│   │   │   └── Collapsible.jsx
│   │   ├── Navbar.jsx
│   │   ├── MoodSelector.jsx
│   │   ├── SearchAutocomplete.jsx
│   │   ├── MapView.jsx
│   │   ├── PlaceCard.jsx
│   │   ├── Filters.jsx
│   │   ├── RadiusControl.jsx
│   │   ├── TravelModeToggle.jsx
│   │   ├── SkeletonLoaders.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── CurrentLocationButton.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   ├── authService.js
│   │   ├── firestoreService.js
│   │   ├── placesService.js
│   │   ├── autocompleteService.js
│   │   └── directionsService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── distanceCalculator.js
│   │   ├── localStorage.js
│   │   └── moodMapping.js
│   └── hooks/
│       ├── useAuth.js
│       ├── useLocalStorage.js
│       ├── useGeolocation.js
│       ├── useDebounce.js
│       ├── usePlaces.js
│       └── useDirections.js
├── package.json
├── tailwind.config.js
├── README.md
└── .env.example
```

## 📄 Core Files

### **Entry Points**
- `src/index.js` - React application entry
- `public/index.html` - SEO-optimized HTML with PWA support
- `public/manifest.json` - PWA manifest for installation

### **Main Application**
- `src/App.js` - Root component with routing and state management
- `src/App.css` - Global styles and Tailwind imports

### **Pages (4)**
- `src/pages/Landing.jsx` - Hero section with features
- `src/pages/Login.jsx` - Authentication page
- `src/pages/Home.jsx` - Main discover page
- `src/pages/Saved.jsx` - Protected saved places page

### **Components (12 Custom + 56 UI)**

#### **Custom Components (12)**
- `Navbar.jsx` - Navigation with auth integration
- `MoodSelector.jsx` - 4 mood buttons with animations
- `SearchAutocomplete.jsx` - Places search with suggestions
- `MapView.jsx` - Google Maps integration
- `PlaceCard.jsx` - Place display with ratings
- `Filters.jsx` - Filter sidebar with options
- `RadiusControl.jsx` - Search radius control
- `TravelModeToggle.jsx` - Travel mode selection
- `SkeletonLoaders.jsx` - Loading state components
- `ProtectedRoute.jsx` - Authentication guard
- `CurrentLocationButton.jsx` - Location button with geolocation

#### **UI Components (56)**
- **Form Components**: Button, Input, Card, Modal, Badge, Avatar, Checkbox, Radio, Switch, Slider, Progress, Textarea, Label, Select
- **Navigation**: Navigation, Breadcrumb, Pagination
- **Feedback**: Alert, Spinner, Skeleton, Tooltip, Toast
- **Overlays**: Dropdown, Dialog, Sheet, Popover, HoverCard, Command, Kbd, ScrollArea
- **Data Display**: Table, TableBody, TableCell, TableHead, TableRow, TableFooter, TableCaption
- **Interactive**: Tabs, Accordion, Collapsible
- **Advanced**: Search, Select, Separator, Command

### **Services (5)**
- `authService.js` - Firebase authentication (Google + Email)
- `firestoreService.js` - Database CRUD operations
- `placesService.js` - Google Places API integration
- `autocompleteService.js` - Location search autocomplete
- `directionsService.js` - Route calculation and display

### **Configuration (2)**
- `config/firebase.js` - Firebase initialization
- `context/AuthContext.jsx` - Authentication state management

### **Utilities (4)**
- `utils/constants.js` - New Delhi default location
- `utils/distanceCalculator.js` - Haversine distance formula
- `utils/localStorage.js` - Storage helpers
- `utils/moodMapping.js` - Mood configurations

### **Hooks (6)**
- `hooks/useAuth.js` - Authentication state
- `hooks/useLocalStorage.js` - Local storage management
- `hooks/useGeolocation.js` - Location services
- `hooks/useDebounce.js` - Debounce utility
- `hooks/usePlaces.js` - Places data management
- `hooks/useDirections.js` - Directions and routing

## 🎨 Design System

### **UI Components Structure**
- Built with **Shadcn/ui** components
- **Tailwind CSS** for styling
- **Consistent design language**
- **Dark/Light theme** support
- **Responsive design** for all devices
- **Accessibility** features (ARIA labels, keyboard navigation)
- **Micro-interactions** and smooth animations

## 🔐 Authentication Features

### **Multi-Provider Support**
- **Google OAuth** integration
- **Email/Password** authentication
- **Social login** options
- **Session management** with secure tokens
- **Password reset** via email
- **Email verification** system

### **Protected Routes**
- Role-based access control
- Automatic redirect to login
- Session persistence
- Token refresh mechanism

## 🗺️ Places Features

### **Google Maps Integration**
- **Interactive map** with markers
- **Place details** and information
- **Route calculation** and directions
- **Real-time search** with autocomplete
- **Saved places** management
- **Distance calculation** from user location

### **Advanced Search**
- **Autocomplete** suggestions
- **Filter by** category, rating, price
- **Sort by** distance, rating, relevance
- **Search history** tracking
- **Radius-based** search

## 🎯 Mood-Based Recommendations

### **Smart Filtering**
- **4 mood categories**: Work, Date, Quick Bite, Budget
- **Intelligent suggestions** based on mood
- **Personalized recommendations**
- **Time-based** suggestions
- **Location-aware** mood mapping

## 📱 PWA Features

### **Installation Support**
- **Web App Manifest** with app shortcuts
- **Service Worker** for offline functionality
- **Add to Home Screen** capability
- **Push notifications** support
- **Background sync** for data
- **App icons** in all required sizes

## 🎨 Modern UI/UX

### **Professional Design**
- **Card-based layouts** with hover effects
- **Smooth animations** and transitions
- **Loading states** with skeleton screens
- **Error handling** with friendly messages
- **Success states** with confirmations
- **Responsive design** for mobile and desktop

### **User Experience**
- **Intuitive navigation** with breadcrumbs
- **Smart defaults** and suggestions
- **Progressive enhancement** approach
- **Accessibility** compliance (WCAG 2.1)
- **Performance optimization** with lazy loading

## 📊 Data Management

### **Local Storage**
- **Recently viewed** places tracking
- **Search history** management
- **User preferences** persistence
- **Saved places** collections
- **Offline data** caching

### **Firebase Integration**
- **Real-time sync** across devices
- **Cloud storage** for user data
- **Authentication state** management
- **Data backup** and recovery

## 🚀 Performance Features

### **Optimization**
- **Code splitting** for faster loading
- **Image optimization** with lazy loading
- **Service worker** caching
- **Minified production** builds
- **SEO optimization** with meta tags

### **Development Tools**
- **Hot module replacement** for fast development
- **ESLint** configuration
- **Prettier** code formatting
- **TypeScript** support (optional)
- **Jest** testing framework

## 📋 Configuration

### **Environment Variables**
- Firebase configuration
- Google Maps API key
- Service endpoints
- Development/production modes
- Security settings

### **Build Configuration**
- **Webpack** bundling
- **Babel** transpilation
- **PostCSS** processing
- **Asset optimization**
- **Source maps** for debugging

This structure provides a scalable, maintainable, and feature-rich foundation for the Mood Mapper application with modern React patterns and best practices.

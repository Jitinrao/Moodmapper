# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- Vercel account
- GitHub repository (recommended)
- Google Maps API key with billing enabled
- MongoDB Atlas database (for production)

### Environment Variables Required

In Vercel dashboard, add these environment variables:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email_for_notifications
EMAIL_PASS=your_email_password
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the `vercel.json` configuration

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all required environment variables listed above

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### 📁 Project Structure for Vercel

```
nearby-tracker/
├── vercel.json              # Vercel configuration
├── package.json             # Root package.json
├── frontend/
│   ├── build/               # Built React app
│   └── package.json         # Frontend dependencies
└── backend/
    ├── server.js            # Express app (exported for Vercel)
    └── package.json         # Backend dependencies
```

### 🔧 Configuration Details

**vercel.json** handles:
- Frontend build (`frontend/build`)
- Backend serverless functions
- API routing (`/api/*` → backend)

**Backend server.js**:
- Exports app for Vercel: `module.exports = app`
- Only starts server locally (not in production)

**Frontend**:
- Uses `/api` for production (Vercel proxy)
- Uses `http://localhost:5001/api` for development

### 🌐 Post-Deployment

1. **Test the Application**
   - Check if frontend loads
   - Test "Use My Location" feature
   - Verify places are displayed

2. **Monitor Logs**
   - Check Vercel logs for any errors
   - Monitor API calls and database connections

3. **Domain Setup** (Optional)
   - Add custom domain in Vercel dashboard
   - Update Google Maps API key restrictions

### 🐛 Common Issues

**Backend not responding:**
- Check environment variables in Vercel
- Verify MongoDB connection string
- Check Vercel function logs

**Google Maps not loading:**
- Ensure API key has billing enabled
- Check API key restrictions (add Vercel domain)
- Verify Places API is enabled

**CORS Issues:**
- Vercel automatically handles CORS between frontend and backend
- No additional configuration needed

### 📱 Performance Optimization

- Frontend is automatically optimized by Vercel
- Backend runs as serverless functions
- Database connections are pooled by MongoDB Atlas

### 🔒 Security Notes

- Environment variables are securely stored in Vercel
- MongoDB should use IP whitelisting
- Google Maps API key should be restricted to your domain

---

**Your app will be live at:** `https://your-project-name.vercel.app`

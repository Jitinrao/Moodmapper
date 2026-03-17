# 🚀 **Google Maps API Setup Guide**

## 📋 **Quick Setup Steps:**

### **1. Get Google Maps API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Places API** (search for "Places API" and enable)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key

### **2. Configure API Key**
Edit `/backend/.env` file:
```bash
# Replace YOUR_GOOGLE_MAPS_API_KEY_HERE with your actual key
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### **3. Set API Restrictions (Recommended)**
In Google Cloud Console:
1. Go to your API key settings
2. Under **Application restrictions**, select **HTTP referrers**
3. Add: `http://localhost:3001` (for development)
4. Under **API restrictions**, select **Restrict key**
5. Select **Places API** only

### **4. Restart Backend**
```bash
cd backend
npm start
```

### **5. Test Frontend**
```bash
cd frontend
npm start
```

---

## 🔧 **Current Status:**

### **✅ Backend**: Running on port 5001
- ✅ API endpoint: `GET /api/places/nearby`
- ✅ Real Google Maps integration
- ✅ No mock data
- ✅ Proper error handling

### **✅ Frontend**: Ready
- ✅ Calls correct API endpoint
- ✅ Calculates distances from user location
- ✅ Shows real data from backend

### **⚠️ Missing**: Valid Google Maps API Key

---

## 🧪 **Test the Setup:**

### **Before Adding API Key:**
```bash
curl "http://localhost:5001/api/places/nearby?lat=37.7749&lng=-122.4194&keyword=restaurant&radius=5000"
# Expected: Error message about missing API key
```

### **After Adding API Key:**
```bash
curl "http://localhost:5001/api/places/nearby?lat=37.7749&lng=-122.4194&keyword=restaurant&radius=5000"
# Expected: Real places from Google Maps API
```

---

## 🎯 **What's Fixed:**

### **✅ Technical Issues Resolved:**
1. **API Route Mismatch**: Added GET `/nearby` route
2. **Mock Data**: Removed all dummy/test data
3. **Error Handling**: Clear error messages for debugging
4. **Distance Calculation**: Accurate distance from user location
5. **State Management**: Proper API response handling

### **✅ Integration Complete:**
- Frontend calls: `GET /api/places/nearby?lat=X&lng=Y&keyword=Z&radius=R`
- Backend responds: Real Google Maps places with distances
- No more "Test Cafe", "Test Restaurant" dummy data

---

## 🏁 **Next Steps:**

1. **Add your Google Maps API key** to `/backend/.env`
2. **Restart backend server**
3. **Test the application**
4. **Enjoy real place recommendations!**

---

## 🔍 **Troubleshooting:**

### **If you see "API key not configured":**
- Check that you replaced `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `.env`
- Ensure no extra spaces or quotes around the key

### **If you see "REQUEST_DENIED":**
- Verify API key has Places API enabled
- Check referrer restrictions (add `http://localhost:3001`)
- Ensure billing is enabled on your Google Cloud project

### **If no places are returned:**
- Check that location coordinates are valid
- Try different keywords (restaurant, cafe, etc.)
- Increase radius parameter

---

**🎉 Once you add a valid API key, your recommended places section will show real data from Google Maps!**

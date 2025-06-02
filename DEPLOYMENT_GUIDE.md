# 🚀 Kuku Coach Production Deployment Guide

## 📋 **Deployment Sequence Overview**

1. **Deploy Backend First** → Get production API URL
2. **Configure Frontend** → Update API endpoint  
3. **Deploy Frontend** → Deploy with production config
4. **Test Integration** → Verify everything works

---

## 🏆 **Recommended Platforms**

### **Backend: Render.com** 🔧
**Perfect for Python APIs** - Excellent for backend services, free tier available, great performance

### **Frontend: Netlify** 🌐
**Perfect for React/Vite** - Instant deployments, excellent CDN, great for static sites

---

## 📚 **Step-by-Step Instructions**

### **Phase 1: Deploy Backend to Render.com**

1. **Prepare Backend Repository**:
   ```bash
   # Ensure your backend code is pushed to GitHub
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Deploy to Render.com**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your backend GitHub repository
   - Configure settings:
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python start_api.py` (or your main app file)
     - **Instance Type**: Free tier for MVP
   - Click "Create Web Service"

3. **Get Your Production URL**:
   - Render will provide a URL like: `https://your-app-name.onrender.com`
   - Test health endpoint: `https://your-app-name.onrender.com/health`

### **Phase 2: Configure Frontend for Production**

1. **Create Environment File for Local Testing**:
   ```bash
   # Create .env.local (already configured to be ignored by git)
   echo "VITE_API_BASE_URL=https://your-app-name.onrender.com/api" > .env.local
   ```

2. **Replace URL with Your Actual Render Backend**:
   ```bash
   # Replace 'your-app-name' with your actual Render app name
   VITE_API_BASE_URL=https://YOUR_ACTUAL_RENDER_URL.onrender.com/api
   ```

3. **Test Locally with Production Backend**:
   ```bash
   npm run dev
   # Test that your local frontend connects to production backend
   ```

### **Phase 3: Deploy Frontend to Netlify**

1. **Push Frontend to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push origin main
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select your frontend repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - **Add Environment Variables**:
     - Go to "Site settings" → "Environment variables"
     - Add variable:
       - **Key**: `VITE_API_BASE_URL`
       - **Value**: `https://your-app-name.onrender.com/api`
   - Click "Deploy site"

3. **Get Your Production URL**:
   - Netlify provides: `https://random-name-123.netlify.app`
   - You can customize this in site settings

### **Phase 4: Test Production Deployment**

1. **Test Full Flow**:
   - Visit your Netlify URL
   - Test voice recording
   - Verify API communication
   - Test audio playback
   - Check session history

2. **Monitor Logs**:
   - Render logs for backend errors
   - Netlify logs for frontend build errors
   - Browser console for client errors

---

## 🛠️ **Environment Configuration**

Your code is already configured to use environment variables! It will automatically use:

### **Development** (Local)
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000/api
```

### **Production** (Netlify)
```bash
# Netlify Environment Variables
VITE_API_BASE_URL=https://your-app-name.onrender.com/api
```

---

## 🔧 **Platform-Specific Tips**

### **Render.com Backend Tips**
- **Free Tier**: Great for MVP, spins down after 15 minutes of inactivity
- **Environment Variables**: Set in Render dashboard under "Environment"
- **Health Checks**: Render automatically monitors your service health
- **Logs**: Real-time logs available in Render dashboard
- **Custom Domains**: Add custom domain in "Settings" → "Custom Domains"
- **Database**: Can add PostgreSQL database easily if needed later

### **Netlify Frontend Tips**
- **Build Settings**: Automatically detects Vite projects
- **Branch Deploys**: Automatic deployments on git push
- **Preview Deployments**: Get preview URLs for pull requests
- **Custom Domain**: Easy to set up custom domain
- **Analytics**: Built-in analytics available
- **Environment Variables**: Set in site settings for different environments

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**:
   - Ensure your backend allows your Netlify domain in CORS settings
   - Add `https://your-site-name.netlify.app` to allowed origins

2. **API Not Found**:
   - Double-check the environment variable in Netlify
   - Ensure Render deployment is successful and healthy
   - Note: Render free tier spins down - first request may be slow

3. **Audio Issues**:
   - Verify HTTPS is working (required for microphone access)
   - Check audio file serving from Render

4. **Render Cold Starts**:
   - Free tier spins down after inactivity
   - First request after downtime takes ~30 seconds
   - Consider upgrading to paid tier for production

### **Debugging Commands**

```bash
# Test backend health
curl https://your-app-name.onrender.com/health

# Check environment variables locally
npm run dev
# Open browser console and check: import.meta.env.VITE_API_BASE_URL

# Test Netlify build locally
npm run build
npm run preview
```

---

## 🎯 **Production Checklist**

- [ ] Backend deployed to Render.com
- [ ] Backend health endpoint responding
- [ ] Frontend environment configured
- [ ] Frontend deployed to Netlify  
- [ ] Environment variables set in Netlify
- [ ] Full user flow tested
- [ ] CORS configured correctly
- [ ] HTTPS working (required for microphone)
- [ ] Audio files serving correctly
- [ ] Error monitoring configured

---

## 🔗 **Quick Reference Links**

- **Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
- **Netlify Dashboard**: [app.netlify.com](https://app.netlify.com)
- **Your Production URLs** (update after deployment):
  - Backend: `https://your-app-name.onrender.com`
  - Frontend: `https://your-site-name.netlify.app`

---

## 💡 **Platform Benefits**

### **Why Render.com for Backend:**
- ✅ Easy Python deployment
- ✅ Automatic HTTPS
- ✅ Built-in monitoring
- ✅ Free tier available
- ✅ Easy database integration
- ✅ Real-time logs

### **Why Netlify for Frontend:**
- ✅ Optimized for React/Vite
- ✅ Global CDN
- ✅ Instant deployments
- ✅ Preview deployments
- ✅ Easy custom domains
- ✅ Built-in forms and functions

---

## 🎉 **Next Steps After Deployment**

1. **Custom Domain**: Add custom domain to both Render and Netlify
2. **Monitoring**: Set up error tracking (Sentry)
3. **Analytics**: Add user analytics
4. **Performance**: Consider Render paid tier for better performance
5. **Security**: Review and enhance security headers 
# 🚀 Kuku Coach - Netlify Deployment Guide

## 📋 Quick Deployment Checklist

- [ ] **Step 1**: Prepare your repository
- [ ] **Step 2**: Build and test locally 
- [ ] **Step 3**: Deploy to Netlify
- [ ] **Step 4**: Configure environment variables
- [ ] **Step 5**: Set up your backend URL
- [ ] **Step 6**: Test the deployed application

---

## 🛠️ Step 1: Prepare Your Repository

### 1.1 Ensure all files are committed
```bash
# Check status
git status

# Add any uncommitted files
git add .
git commit -m "Prepare for Netlify deployment"

# Push to your main branch
git push origin main
```

### 1.2 Verify deployment files are in place
Your project now includes:
- ✅ `netlify.toml` - Netlify configuration with redirects and headers
- ✅ `package.json` - Contains proper build script (`npm run build`)
- ✅ `vite.config.ts` - Proper Vite configuration
- ✅ `env.example` - Environment variable template

---

## 🏗️ Step 2: Build and Test Locally

### 2.1 Test the production build
```bash
# Install dependencies (if needed)
npm install

# Create production build
npm run build

# Test the production build locally
npm run preview
```

### 2.2 Verify build output
- Check that `dist/` folder is created
- Verify `dist/index.html` contains your app
- Ensure `dist/assets/` contains your JS/CSS files

---

## 🌐 Step 3: Deploy to Netlify

### Option A: Direct Git Integration (Recommended)

1. **Go to Netlify**: Visit [netlify.com](https://netlify.com)
2. **Sign up/Login**: Use GitHub, GitLab, or Bitbucket
3. **New site**: Click "Add new site" → "Import an existing project"
4. **Connect repository**: 
   - Choose your Git provider (GitHub recommended)
   - Select your Kuku Coach repository
5. **Configure build settings**:
   - **Branch to deploy**: `main` (or your default branch)
   - **Build command**: `npm run build` (auto-detected)
   - **Publish directory**: `dist` (auto-detected)
6. **Deploy**: Click "Deploy site"

### Option B: Manual Upload (Quick Test)

1. **Build locally**:
   ```bash
   npm run build
   ```
2. **Go to Netlify**: Visit [netlify.com](https://netlify.com)
3. **Drag & Drop**: Drag the `dist` folder to the deployment area
4. **Get URL**: Netlify provides a temporary URL

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Access site settings
1. **Go to your site**: Click on your site in Netlify dashboard
2. **Site settings**: Click "Site settings"
3. **Environment variables**: Go to "Environment variables" in the sidebar

### 4.2 Add required variables
Click "Add variable" and add:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_API_BASE_URL` | `your-backend-url/api` | Your backend API endpoint |

**Example values**:
- For Render: `https://your-app-name.onrender.com/api`
- For Heroku: `https://your-app-name.herokuapp.com/api`
- For Railway: `https://your-app-name.railway.app/api`
- For local testing: `http://localhost:8000/api`

### 4.3 Redeploy after adding variables
1. **Go to Deploys**: Click "Deploys" tab
2. **Trigger deploy**: Click "Trigger deploy" → "Deploy site"

---

## 🔗 Step 5: Set Up Your Backend URL

### 5.1 If you have a backend deployed:
```bash
# Example backend URLs:
VITE_API_BASE_URL=https://kuku-coach-api.onrender.com/api
VITE_API_BASE_URL=https://kuku-coach-backend.herokuapp.com/api
```

### 5.2 If you need to deploy backend first:
Follow these platforms for Python/FastAPI backends:
- **Render.com** (Recommended for Python)
- **Railway.app** (Easy deployment)
- **Heroku** (Popular choice)

### 5.3 For testing without backend:
```bash
# The app will use mock data
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🧪 Step 6: Test Your Deployed Application

### 6.1 Basic functionality test
1. **Visit your site**: Use the Netlify URL (e.g., `https://amazing-name-123.netlify.app`)
2. **Test microphone**: Ensure microphone access works (HTTPS required)
3. **Test navigation**: Check all routes work properly
4. **Check console**: Open browser DevTools for any errors

### 6.2 Voice functionality test
1. **Start session**: Click to start a new coaching session
2. **Record audio**: Test microphone recording
3. **API connection**: Check if backend communication works
4. **Audio playback**: Verify AI responses play correctly

### 6.3 Mobile testing
1. **Responsive design**: Test on different screen sizes
2. **Mobile browser**: Test on actual mobile devices
3. **PWA features**: Check if app works like native app

---

## 🎨 Step 7: Customize Your Deployment

### 7.1 Custom domain (Optional)
1. **Buy domain**: Purchase from any domain registrar
2. **Add to Netlify**: Site settings → "Domain management" → "Add custom domain"
3. **Configure DNS**: Point your domain to Netlify (instructions provided)

### 7.2 Site name customization
1. **Site settings**: Go to site settings
2. **Change site name**: Under "Site details" → "Change site name"
3. **Choose name**: Pick a memorable name like `kuku-coach-app`

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "Page Not Found" on refresh
**Cause**: React Router needs server-side redirects
**Solution**: ✅ Already fixed with `netlify.toml` file

### Issue 2: API calls failing
**Symptoms**: Network errors, 404s for API calls
**Solutions**:
1. Check environment variable is set correctly
2. Verify backend URL is accessible
3. Check CORS settings on backend
4. Ensure backend is running

### Issue 3: Microphone not working
**Cause**: HTTPS required for microphone access
**Solution**: Netlify automatically provides HTTPS

### Issue 4: Build failures
**Common causes**:
- Missing dependencies: Run `npm install`
- TypeScript errors: Fix errors shown in build log
- Environment variables: Check Netlify environment settings

### Issue 5: Assets not loading
**Symptoms**: Missing images, fonts, or styles
**Solutions**:
1. Check file paths in your code
2. Ensure files are in `public/` or imported correctly
3. Clear browser cache and hard refresh

---

## 📊 Monitoring Your Deployment

### 7.1 Netlify Analytics
- **Page views**: Track visitor traffic
- **Performance**: Monitor site speed
- **Forms**: If you add forms later

### 7.2 Build monitoring
- **Deploy notifications**: Set up Slack/email notifications
- **Build logs**: Monitor for warnings or errors
- **Deploy previews**: Test changes before going live

---

## 🚀 Advanced Features (Optional)

### 8.1 Branch deploys
- **Feature branches**: Automatic deploys for feature branches
- **Deploy previews**: Preview changes in pull requests

### 8.2 Form handling
- **Contact forms**: Built-in form processing
- **Spam protection**: Automatic spam filtering

### 8.3 Serverless functions
- **API routes**: Add serverless functions if needed
- **Form processing**: Handle form submissions

---

## 📝 Quick Reference Commands

```bash
# Local development
npm run dev                 # Start dev server

# Build and test
npm run build              # Build for production
npm run preview            # Preview production build

# Deployment
git add .                  # Stage changes
git commit -m "message"    # Commit changes
git push origin main       # Deploy to Netlify (auto)
```

---

## 🎯 Success Checklist

After following this guide, you should have:

- [ ] ✅ Working Netlify deployment with custom URL
- [ ] ✅ Environment variables properly configured
- [ ] ✅ Backend API connection working
- [ ] ✅ Voice recording and playback functional
- [ ] ✅ Mobile-responsive design working
- [ ] ✅ All routes accessible (no 404s on refresh)
- [ ] ✅ HTTPS enabled for microphone access
- [ ] ✅ Performance optimized with caching headers

**🎉 Congratulations!** Your Kuku Coach app is now live on Netlify!

---

## 📞 Support Resources

- **Netlify Docs**: [netlify.com/docs](https://docs.netlify.com)
- **Vite Deployment**: [vitejs.dev/guide/build.html](https://vitejs.dev/guide/build.html)
- **React Router**: [reactrouter.com](https://reactrouter.com)
- **Netlify Support**: [community.netlify.com](https://community.netlify.com) 
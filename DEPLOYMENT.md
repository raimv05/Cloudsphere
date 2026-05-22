# Deployment Guide — Render

This guide walks you through deploying Cloudsphere to [Render](https://render.com), a modern cloud platform for hosting web apps.

## Prerequisites

- Render account (free tier available at https://render.com)
- GitHub repository with your code pushed (or Render can connect to a GitHub repo)
- MongoDB Atlas account with a connection URI
- Git installed locally

## Step 1: Prepare Your Repository

Ensure your project is clean and ready:

```bash
# Add and commit all changes
git add .
git commit -m "Prepare for Render deployment"

# Push to GitHub (if not already done)
git push origin main
```

**Important:** Verify `.gitignore` includes `.env` to prevent exposing secrets like `MONGO_URI` and `JWT_SECRET`.

## Step 2: Create MongoDB Atlas Connection

If you haven't already:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>`
4. Replace `<user>`, `<password>`, `<cluster>`, and `<dbname>` with your values
5. Keep this string safe — you'll add it to Render environment variables

## Step 3: Deploy to Render

### Option A: Using render.yaml (Recommended)

This repository includes a `render.yaml` file that defines both backend and frontend services.

1. Go to https://render.com/dashboard
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Select the repository and branch (`main`)
5. Render will automatically detect `render.yaml` and create services
6. Review the services (Backend API + Static Frontend)
7. Add environment variables:
   - **Service:** `cloudsphere-backend`
     - `MONGO_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string (e.g., generate with `openssl rand -hex 32`)
   - **Service:** `cloudsphere-frontend`
     - `VITE_API_URL`: `https://cloudsphere-backend.onrender.com` (auto-filled)
8. Click **Deploy Blueprint**

### Option B: Manual Deployment

If you prefer to deploy services manually:

#### Backend Service

1. In Render Dashboard, click **New +** → **Web Service**
2. Connect your GitHub repository
3. Fill in:
   - **Name:** `cloudsphere-backend`
   - **Environment:** Node
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free (or paid for production)
4. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
5. Click **Create Web Service**
6. Wait for deployment to complete (5-10 minutes)
7. Note the backend URL: `https://cloudsphere-backend.onrender.com`

#### Frontend Service

1. In Render Dashboard, click **New +** → **Static Site**
2. Connect your GitHub repository
3. Fill in:
   - **Name:** `cloudsphere-frontend`
   - **Environment:** Node 18+
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/dist`
4. Add environment variable:
   - `VITE_API_URL`: `https://cloudsphere-backend.onrender.com`
5. Click **Create Static Site**
6. Wait for deployment (5-10 minutes)

## Step 4: Configure Frontend API URL

Render will automatically set `VITE_API_URL` during build. Ensure your client is configured to use this:

Check [client/src/services/api.js](../client/src/services/api.js):

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

If using a different setup, update to:

```javascript
const API_BASE_URL = 'https://cloudsphere-backend.onrender.com';
```

## Step 5: Access Your Deployment

After both services deploy successfully:

- **Frontend:** Visit `https://cloudsphere-frontend.onrender.com`
- **Backend API:** Visit `https://cloudsphere-backend.onrender.com/api/health`
- **Login with seeded user:**
  - Email: `user@example.com`
  - Password: `Password123!`

## Step 6: Seed Production Data (Optional)

To populate your production database with demo data:

1. In Render Dashboard, select the backend service
2. Go to **Shell** tab
3. Run:
   ```bash
   cd server && npm run seed
   ```
4. Confirm the seeding completed successfully

## Troubleshooting

### Backend service fails to start

- Check logs in Render Dashboard: **Logs** tab
- Ensure `MONGO_URI` is correct and MongoDB Atlas allows connections from Render IPs
- Verify all required environment variables are set

### Frontend shows "Cannot reach API"

- Ensure `VITE_API_URL` is set to the correct backend URL
- Check browser console for CORS errors
- Verify backend is running: Visit `https://cloudsphere-backend.onrender.com/api/health`

### Build fails

- Check build logs for specific errors
- Ensure `package.json` in both `server` and `client` have correct scripts
- Verify all dependencies are listed (no missing imports)

### MongoDB connection fails

- Verify your MongoDB Atlas whitelist allows Render IPs (use `0.0.0.0/0` for open access, or whitelist Render's IP range)
- Test connection string locally first
- Ensure database name in URI matches your MongoDB setup

## Production Best Practices

1. **Security:**
   - Never commit `.env` (use `.gitignore`)
   - Use strong `JWT_SECRET` (min 32 chars)
   - Keep MongoDB credentials private

2. **Monitoring:**
   - Enable Render's error tracking
   - Set up alerts for failed deployments
   - Monitor backend logs for errors

3. **Scaling:**
   - Upgrade from Free to Paid plan for production use
   - Consider read replicas for high-traffic scenarios
   - Implement caching (Redis) for frequently accessed data

4. **Updates:**
   - Push to `main` branch to trigger automatic re-deployment
   - Test locally before pushing to production

## Useful Render Commands

- **View logs:** Render Dashboard → Service → **Logs**
- **Restart service:** Render Dashboard → Service → **Settings** → **Restart**
- **Update environment variables:** Render Dashboard → Service → **Environment** → Edit and save

## Cost Estimates (as of May 2026)

- **Free Plan:** Backend (auto-sleeps after 15 min inactivity) + Static frontend
- **Starter Plan:** ~$7/month per service (recommended for light production use)
- **Standard Plan:** ~$12+/month per service (for consistent traffic)

MongoDB Atlas free tier includes 512MB storage (sufficient for demo/small projects).

---

**Support:** For Render-specific issues, visit [Render Docs](https://render.com/docs)

**Need help?** Check the [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for project architecture details.

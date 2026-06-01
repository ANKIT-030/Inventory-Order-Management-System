# InvenTrack - Deployment Guide

This guide provides step-by-step instructions for deploying the Inventory & Order Management System to cloud platforms.

## Production Services

- **Database**: [Neon PostgreSQL](https://neon.tech/) (Serverless PostgreSQL)
- **Backend Service**: [Render](https://render.com/) or [Railway](https://railway.app/)
- **Frontend App**: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)

---

## 1. Database Deployment (Neon)

1. Sign up for a free account at [Neon](https://neon.tech/).
2. Create a new project named `inventrack`.
3. In the Neon Console, copy the connection string. It will look like this:
   `postgresql://alex:abc123xyz@ep-cool-breeze-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **Important**: Since the backend uses asyncpg, you must change the prefix from `postgresql://` to `postgresql+asyncpg://` when setting the backend environment variable.
   - Modified Connection URL:
     `postgresql+asyncpg://alex:abc123xyz@ep-cool-breeze-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## 2. Backend Deployment (Render)

1. Sign up at [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the project.
4. Set the following options:
   - **Name**: `inventrack-backend`
   - **Environment**: `Python`
   - **Branch**: `main`
   - **Root Directory**: `backend` (if you are deploying from a monorepo, set root directory to `backend`)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Advanced** to add environment variables:
   - `DATABASE_URL`: *Your Neon connection string (with postgresql+asyncpg://)*
   - `SECRET_KEY`: *A strong randomly generated string*
   - `JWT_ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
6. Click **Create Web Service**. Wait for the build and deployment process to complete.
7. Copy the public URL of your backend (e.g. `https://inventrack-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Sign up at [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Connect your GitHub repository.
4. In the configuration window:
5. Set **Root Directory** to `frontend`.
6. Set **Framework Preset** to **Vite**.
7. In the **Environment Variables** section, add:
   - Name: `VITE_API_URL`
   - Value: *Your deployed Render backend URL (e.g. `https://inventrack-backend.onrender.com`)*
8. Click **Deploy**. Vercel will build the React assets and host them on a CDN.
9. Open the provided `.vercel.app` link to use the live application.

---

## 📊 Environment Variable Reference Sheet

| Environment Variable | Service | Purpose | Recommended Value |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend | Connection URL for Postgres | `postgresql+asyncpg://<user>:<password>@<host>/<dbname>?sslmode=require` |
| `SECRET_KEY` | Backend | Used to sign JWT credentials | Secure random string (e.g. generated via `openssl rand -hex 32`) |
| `JWT_ALGORITHM` | Backend | JWT cryptography algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | Lifetime of session tokens | `60` |
| `VITE_API_URL` | Frontend | Target API endpoint of backend | Deployed backend service URL (no trailing slash) |

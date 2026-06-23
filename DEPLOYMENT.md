# PraVaDhya Foods – Enterprise Deployment & Operations Manual

This master manual contains comprehensive guides for deploying, configuring, and operating the **PraVaDhya Foods ("సంప్రదాయ రుచులకు కొత్త చిరునామా!")** Restaurant Management Platform.

---

## 📖 Table of Contents
1. [Environment Setup Guide](#1-environment-setup-guide)
2. [Database Setup Guide](#2-database-setup-guide)
3. [Admin Setup Guide](#3-admin-setup-guide)
4. [Deployment Guide](#4-deployment-guide)
5. [Production Security & Operations Checklist](#5-production-security--operations-checklist)

---

## 1. Environment Setup Guide

The application behavior, sessions, database connections, and storage pipelines are controlled through environment variables. Copy the `.env.example` file to `.env` to begin:

```bash
cp .env.example .env
```

### Required Configuration Variables

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/pravadhya_db?schema=public` |
| `JWT_SECRET` | Secret key for access tokens (15m expiration) | Run `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens (7d expiration) | Run `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Canonical URL of the frontend | `https://pravadhyafoods.com` |
| `PORT` | Local server port | `3000` |
| `NODE_ENV` | Mode of operation | `production` |
| `STORAGE_PROVIDER` | Menu image upload handler | `local` (or `s3`, `cloudinary`, `azure`) |

### Storage Provider Configuration Details

#### Option A: Local File Uploads (`STORAGE_PROVIDER="local"`)
No additional credentials are required. Food images are saved inside the `/public/uploads/menu/` directory on the local container volume.
> [!WARNING]
> If deploying in ephemeral serverless environments (like Vercel or AWS Amplify), local uploads will be wiped on restarts. Use Cloudinary, AWS S3, or Azure Blob Storage instead.

#### Option B: AWS S3 Cloud Bucket (`STORAGE_PROVIDER="s3"`)
```env
STORAGE_PROVIDER="s3"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="pravadhya-food-menu-bucket"
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

#### Option C: Cloudinary Media Suite (`STORAGE_PROVIDER="cloudinary"`)
```env
STORAGE_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="pravadhyacloud"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz1"
CLOUDINARY_URL="cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz1@pravadhyacloud"
```

---

## 2. Database Setup Guide

The platform uses **Prisma ORM** with **PostgreSQL** for maximum production scalability and relational integrity.

### Step 1: Provision a PostgreSQL Database
You can provision PostgreSQL via:
* **Docker Container** (Included in `docker-compose.yml`)
* **Managed Cloud Instances** (e.g., Neon.tech, Supabase, AWS RDS, or Aiven)

### Step 2: Push the Relational Schema
Once your `DATABASE_URL` is set in `.env`, sync the database tables with the schema:
```bash
npx prisma generate
npx prisma db push
```

### Step 3: Seed Default Branch, Settings, and Menu Items
Seed the database to populate the 20 physical tables, settings blocks, default branches, and authentic Telugu cuisines (Punugulu, Garelu, Andhra Meals, etc.):
```bash
npx prisma db seed
```
**Verify database models seeded:**
* Check that `RestaurantBranch` contains `default-branch-guntur`
* Check that `Table` table contains exactly 20 records (numbered 1 to 20) with appropriate seating capacities (2 to 12 guests)
* Check that `Setting` table is populated with GST (`0`), Delivery Charge (`0`), and Branding options

---

## 3. Admin Setup Guide

To protect owner panels, default credentials are not hardcoded. Instead, an automated initialization wizard is triggered on first launch.

### Step 1: Access Setup Portal
Launch the server and navigate to:
```text
http://localhost:3000/admin/dashboard
```
The middleware detects that no administrator exists in the database and automatically redirects you to the setup wizard at:
```text
http://localhost:3000/admin/setup
```

### Step 2: Initialize the Administrator Account
Provide the following in the setup form:
1. **Full Name** (e.g., `PraVaDhya Owner`)
2. **Email Address** (e.g., `admin@pravadhya.com`)
3. **Password** (Must satisfy strength checks: 8+ chars, numbers, uppercase, lowercase, special characters)

Click **Initialize Platform**. The wizard will hash the password using `bcrypt` (10 rounds) and write the admin record to the database, along with a default configuration state.

### Step 3: Log In to the Admin Suite
You will be redirected to the login panel at `/admin/login`. Enter the credentials you just created.

---

## 4. Deployment Guide

### Method A: Docker Deployment (Recommended)

Docker packages the Next.js runtime and PostgreSQL engine into isolated, reproducible containers.

1. **Spin up containers in detached mode**:
   ```bash
   docker compose up --build -d
   ```
2. **Confirm services are running**:
   ```bash
   docker compose ps
   ```
   This will spin up:
   * **Database Container (`pravadhya-postgres-db`)**: Running PostgreSQL on port `5432`.
   * **Web Application Container (`pravadhya-web-app`)**: Next.js running on port `3000`.

> [!NOTE]
> The Docker container is pre-configured to automatically run `npx prisma db push` before booting the server to ensure database sync.

---

### Method B: VPS / Dedicated Server (Nginx Reverse Proxy)

If deploying to a virtual private server:

1. **Clone the repository and install dependencies**:
   ```bash
   npm ci
   ```
2. **Build the production build**:
   ```bash
   npm run build
   ```
3. **Use PM2 to run the Next.js app in the background**:
   ```bash
   npm install -g pm2
   # Start the application
   pm2 start npm --name "pravadhya-app" -- run start
   ```
4. **Configure Nginx as a reverse proxy** (e.g., `/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name pravadhyafoods.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
5. **Secure with SSL using Certbot (Let's Encrypt)**:
   ```bash
   sudo certbot --nginx -d pravadhyafoods.com
   ```

---

### Method C: Vercel / Serverless Deployment

1. Set up a PostgreSQL instance on **Supabase** or **Neon**.
2. Connect your repository to Vercel.
3. Configure all environment variables in Vercel's Dashboard.
4. Set `STORAGE_PROVIDER` to `s3` or `cloudinary` (Local storage uploads are ephemeral on Vercel).
5. Vercel will automatically build and deploy your application.

---

## 5. Production Security & Operations Checklist

### 🛡️ Security Hardening
* [ ] **SSL / HTTPS Enforced**: Ensure all traffic is redirected to HTTPS (Nginx rewrite or Vercel settings).
* [ ] **Secure Cookies**: Check that cookies (`auth_token`, `refresh_token`) have `Secure`, `HttpOnly`, and `SameSite=Lax` parameters active in production.
* [ ] **CORS Settings**: Set `NEXT_PUBLIC_APP_URL` matching your exact domain to limit resource sharing.
* [ ] **Audit Trail Logging**: Audit logs are generated for `CUSTOMER_LOGIN`, `CUSTOMER_REGISTER`, `PASSWORD_RESET`, `REVIEW_APPROVED`, `REVIEW_REJECTED`, `TABLE_ASSIGNED`, `TABLE_RELEASED`, and `SETTINGS_UPDATED`. Monitor `/api/admin/audit` to spot rogue accesses.
* [ ] **Secret Rotation**: Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` periodically to prevent replay token reuse.

### ⚙️ Operational Best Practices
* [ ] **Firewall**: Lock port `5432` on your cloud server so only localhost or your application container can communicate with the PostgreSQL instance.
* [ ] **Menu Image Directory**: If using local uploads, ensure permissions permit write access to the `/public/uploads/menu/` directory.
* [ ] **Database Backups**: Set up automated cron jobs to backup PostgreSQL data (`pg_dump`) to an external secure cloud storage vault.
* [ ] **Lighthouse Performance**: Enable Next.js image optimization features, lazy-load client dashboard sub-forms, and keep critical routes static for sub-second loading speeds.

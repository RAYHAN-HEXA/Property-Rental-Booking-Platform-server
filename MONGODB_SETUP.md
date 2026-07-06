# MongoDB Atlas Setup - Step by Step

## 🍃 Creating Your MongoDB Atlas Account

### Step 1: Sign Up
1. Visit **https://www.mongodb.com/cloud/atlas**
2. Click **"Try Free"** or **"Start Free"**
3. Sign up with:
   - Google account (fastest)
   - GitHub account
   - Email (requires verification)

### Step 2: Create Your First Cluster
After logging in:

1. Click **"Build a Database"**
2. Select **"M0 Sandbox"** (FREE - 512MB storage)
3. Choose cloud provider:
   - **AWS** (recommended)
   - **Google Cloud**
   - **Azure**
4. Select region closest to your users:
   - **us-east-1** (US East - good for North America)
   - **eu-central-1** (Europe)
   - **ap-southeast-1** (Asia Pacific)
5. Name: `Cluster0` (default is fine)
6. Cluster name: `property-rental`
7. Click **"Create Cluster"**
8. Wait 2-3 minutes for cluster to be created

### Step 3: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"+ Add New Database User"**
3. Fill in:
   ```
   Username: property-rental-admin
   Password: [Click "Autogenerate Secure Password"]
   ```
   **⚠️ SAVE THIS PASSWORD - you won't see it again!**
4. **Database User Privileges**: `Read and write to any database`
5. Click **"Add User"**

### Step 4: Configure Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"+ Add IP Address"**
3. Select **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - This allows Vercel to connect to your database
4. Click **"Confirm"**

### Step 5: Get Your Connection String

1. Go to **"Database"** page
2. Click **"Connect"** button on your cluster
3. Select **"Drivers"** tab
4. Choose **"Node.js"** and version **"6.0 or later"**
5. Copy the connection string

**Your connection string will look like:**
```
mongodb+srv://property-rental-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Step 6: Add Database Name

Update your connection string to include the database name:

**Before:**
```
mongodb+srv://property-rental-admin:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**After (add /property-rental before ?):**
```
mongodb+srv://property-rental-admin:password@cluster0.xxxxx.mongodb.net/property-rental?retryWrites=true&w=majority
```

### Step 7: Test Connection

Using MongoDB Shell or Compass, verify:
```bash
mongosh "mongodb+srv://property-rental-admin:password@cluster0.xxxxx.mongodb.net/property-rental"
```

## 📋 Environment Variable Template

Copy this to your Vercel environment variables:

```env
MONGODB_URI=mongodb+srv://property-rental-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/property-rental?retryWrites=true&w=majority
```

Replace:
- `YOUR_PASSWORD` with the password you saved
- `cluster0.xxxxx.mongodb.net` with your actual cluster host

## 🔧 Troubleshooting

### "Connection timeout"
- Check Network Access includes `0.0.0.0/0`
- Verify cluster status is "Active"
- Ensure username/password are correct

### "Authentication failed"
- Verify username matches Database User
- Check password has no extra spaces
- Ensure user has "Read and write" permissions

### "IP not whitelisted"
- Add `0.0.0.0/0` in Network Access
- Wait 1-2 minutes for changes to apply

## 📊 Cluster Management

### View Your Cluster
- Go to: https://cloud.mongodb.com
- Click "Database" → Select your cluster

### Monitor Usage
- **Metrics Tab**: View connection count, operations
- **Metrics Tab**: Check storage usage

### Upgrade Cluster
- Free tier: 512MB storage
- When you need more: Click "Cluster" → "Upgrade"

## 🔒 Security Best Practices

1. ✅ Use strong passwords for database users
2. ✅ Limit IP whitelist when possible (not 0.0.0.0/0)
3. ✅ Enable MongoDB Atlas encryption
4. ✅ Monitor for unusual activity
5. ✅ Back up your data regularly

## 💡 Quick Reference

| What You Need | Where to Find It |
|---------------|------------------|
| Connection String | Database → Connect → Drivers |
| Username | Database Access |
| Password | ⚠️ Save when creating user |
| Cluster Status | Database → Clusters |
| Network Access | Security → Network Access |

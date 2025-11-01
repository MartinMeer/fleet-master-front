# DockerHub Quick Start Guide 🚀

## Step-by-Step Instructions

### 1️⃣ Create DockerHub Account (if you don't have one)

Go to https://hub.docker.com/signup and create an account.

---

### 2️⃣ Login to DockerHub

Open terminal:
```bash
docker login
```
- **Username**: Your DockerHub username
- **Password**: Your DockerHub password

✅ You should see: "Login Succeeded"

---

### 3️⃣ Push Your Images

**Linux/Mac:**
```bash
cd infrastructure

# First time: Make scripts executable
chmod +x make-executable.sh && ./make-executable.sh

# Set your username (replace 'yourusername')
export DOCKERHUB_USERNAME=yourusername

# Optional: Set version tag (default is 'latest')
export IMAGE_VERSION=v1.0.0

# Push to DockerHub
./docker-push.sh
```

**Windows:**
```bash
cd infrastructure

# Set your username (replace 'yourusername')
set DOCKERHUB_USERNAME=yourusername

# Optional: Set version tag (default is 'latest')
set IMAGE_VERSION=v1.0.0

# Push to DockerHub
docker-push.bat
```

---

### 4️⃣ Verify on DockerHub

1. Go to https://hub.docker.com/repositories/yourusername
2. You should see:
   - `fleetmaster-marketing`
   - `fleetmaster-main`

---

### 5️⃣ Pull and Use Your Images Anywhere

```bash
# Pull images
docker pull yourusername/fleetmaster-marketing:latest
docker pull yourusername/fleetmaster-main:latest

# Run with docker-compose
cd infrastructure
docker-compose -f docker-compose.hub.yml up
```

---

## 🎯 What Gets Pushed?

Your script will push:
- `yourusername/fleetmaster-marketing:latest` - Marketing site
- `yourusername/fleetmaster-marketing:v1.0.0` - Versioned marketing site
- `yourusername/fleetmaster-main:latest` - Main app
- `yourusername/fleetmaster-main:v1.0.0` - Versioned main app

---

## 📝 Important Notes

- **Replace `yourusername`** with your actual DockerHub username
- **Images are public by default** - anyone can pull them
- **Version tags are optional** - use semantic versioning (v1.0.0, v1.1.0, etc.)
- **Latest tag** always points to the newest version

---

## 🔐 Security Tip

Use access tokens instead of passwords:
1. Go to https://hub.docker.com/settings/security
2. Create new access token
3. Use token as password when running `docker login`

---

## ❓ Need More Details?

See **[DOCKERHUB_GUIDE.md](DOCKERHUB_GUIDE.md)** for complete documentation including:
- Versioning strategies
- CI/CD integration
- Security best practices
- Troubleshooting

---

## 🎉 That's It!

Your images are now on DockerHub and can be pulled from anywhere! 🌍


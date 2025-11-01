# DockerHub Deployment Guide

Complete guide to pushing FleetMaster images to DockerHub.

---

## 📋 Prerequisites

1. **DockerHub Account**
   - Create account at https://hub.docker.com/signup
   - Verify your email address

2. **Docker Desktop Running**
   - Ensure Docker Desktop is running on your machine

---

## 🔐 Step 1: Login to DockerHub

Open terminal and login:

```bash
docker login
```

Enter your credentials:
- **Username**: Your DockerHub username
- **Password**: Your DockerHub password (or access token)

**Using Access Token (Recommended):**
1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Give it a name (e.g., "FleetMaster")
4. Copy the token
5. Use token as password when running `docker login`

---

## 🚀 Step 2: Push Images to DockerHub

### Quick Method (Using Scripts)

**Linux/Mac:**
```bash
cd infrastructure

# Set your DockerHub username
export DOCKERHUB_USERNAME=yourusername

# Optional: Set version (defaults to 'latest')
export IMAGE_VERSION=v1.0.0

# Make script executable
chmod +x docker-push.sh

# Push images
./docker-push.sh
```

**Windows:**
```bash
cd infrastructure

# Set your DockerHub username
set DOCKERHUB_USERNAME=yourusername

# Optional: Set version (defaults to 'latest')
set IMAGE_VERSION=v1.0.0

# Push images
docker-push.bat
```

### Manual Method

#### 1. Build and Tag Images

**Marketing Site:**
```bash
cd apps/marketing-site
docker build -t yourusername/fleetmaster-marketing:latest --target production .
docker build -t yourusername/fleetmaster-marketing:v1.0.0 --target production .
```

**Main App:**
```bash
cd apps/main-app
docker build -t yourusername/fleetmaster-main:latest --target production .
docker build -t yourusername/fleetmaster-main:v1.0.0 --target production .
```

#### 2. Push Images

**Marketing Site:**
```bash
docker push yourusername/fleetmaster-marketing:latest
docker push yourusername/fleetmaster-marketing:v1.0.0
```

**Main App:**
```bash
docker push yourusername/fleetmaster-main:latest
docker push yourusername/fleetmaster-main:v1.0.0
```

---

## 🏷️ Versioning Strategy

### Semantic Versioning

Use semantic versioning for releases:
- `v1.0.0` - Major.Minor.Patch
- `v1.0.1` - Bug fixes
- `v1.1.0` - New features (backward compatible)
- `v2.0.0` - Breaking changes

### Tags to Push

Always push both:
1. **Specific version**: `v1.0.0` - Immutable, for production
2. **Latest**: `latest` - Always points to newest version

Example:
```bash
# Tag with version and latest
docker tag myimage:v1.0.0 yourusername/fleetmaster-main:v1.0.0
docker tag myimage:v1.0.0 yourusername/fleetmaster-main:latest

# Push both
docker push yourusername/fleetmaster-main:v1.0.0
docker push yourusername/fleetmaster-main:latest
```

---

## 📦 Creating DockerHub Repositories

### Option 1: Auto-create (Automatic)
- Repositories are created automatically on first push
- Default to public repositories

### Option 2: Manual Creation (Recommended)
1. Go to https://hub.docker.com/repositories
2. Click "Create Repository"
3. Name: `fleetmaster-marketing` and `fleetmaster-main`
4. Description: Add meaningful descriptions
5. Visibility: Choose Public or Private
6. Click "Create"

---

## 🔍 Verify Images

After pushing, verify on DockerHub:

1. Go to https://hub.docker.com/r/yourusername/fleetmaster-marketing
2. Check "Tags" tab - should see `latest` and your version
3. Repeat for `fleetmaster-main`

---

## 📥 Pulling Images from DockerHub

Anyone can now pull your images:

```bash
# Pull latest version
docker pull yourusername/fleetmaster-marketing:latest
docker pull yourusername/fleetmaster-main:latest

# Pull specific version
docker pull yourusername/fleetmaster-marketing:v1.0.0
docker pull yourusername/fleetmaster-main:v1.0.0

# Run containers
docker run -p 80:80 yourusername/fleetmaster-marketing:latest
```

---

## 🔄 Update docker-compose.yml for DockerHub

Create a `docker-compose.hub.yml` to use DockerHub images:

```yaml
services:
  marketing-site:
    image: yourusername/fleetmaster-marketing:latest
    container_name: fleetmaster-marketing
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - fleetmaster-network

  main-app:
    image: yourusername/fleetmaster-main:latest
    container_name: fleetmaster-main
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - fleetmaster-network

  gateway:
    image: nginx:alpine
    container_name: fleetmaster-gateway
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      marketing-site:
        condition: service_healthy
      main-app:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - fleetmaster-network

networks:
  fleetmaster-network:
    driver: bridge
```

Run with:
```bash
docker-compose -f docker-compose.hub.yml up -d
```

---

## 🎯 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/docker-push.yml`:

```yaml
name: Push to DockerHub

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: yourusername/fleetmaster-marketing
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./apps/marketing-site
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          target: production
```

---

## 🔒 Security Best Practices

### 1. Use Access Tokens
- Never use your password directly
- Create access tokens with limited scope
- Rotate tokens regularly

### 2. Scan Images
```bash
# Scan for vulnerabilities
docker scan yourusername/fleetmaster-main:latest
```

### 3. Multi-arch Support
Build for multiple platforms:
```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  -t yourusername/fleetmaster-main:latest \
  --push .
```

### 4. Private Repositories
- Use private repositories for proprietary code
- Share access only with team members
- Use organization accounts for team projects

---

## 🛠️ Troubleshooting

### "Access Denied" Error
**Problem:** Cannot push to DockerHub
**Solution:**
1. Check you're logged in: `docker info | grep Username`
2. Re-login: `docker login`
3. Verify repository exists and you have write access

### "Requested Access to Resource Denied"
**Problem:** Trying to push to someone else's namespace
**Solution:** Use your own username in image tags

### Image Too Large
**Problem:** Push takes too long or fails
**Solution:**
1. Check image size: `docker images`
2. Optimize Dockerfile (multi-stage builds)
3. Use `.dockerignore` file
4. Remove unnecessary dependencies

### Rate Limiting
**Problem:** "Too many requests"
**Solution:**
1. Login to DockerHub (increases rate limit)
2. Wait a few minutes
3. Consider DockerHub Pro for higher limits

---

## 📊 Best Practices

### 1. Tagging Strategy
```bash
# Semantic versioning
v1.0.0, v1.0.1, v1.1.0

# Environment tags
prod, staging, dev

# Date tags
2025-11-01

# Git commit tags
sha-abc123
```

### 2. Documentation
Add to your DockerHub repository:
- Description of what the image contains
- How to run the container
- Required environment variables
- Link to full documentation

### 3. README on DockerHub
Create a `README.md` in your repository root:
```markdown
# FleetMaster Marketing Site

Production-ready Docker image for FleetMaster marketing site.

## Usage

\`\`\`bash
docker pull yourusername/fleetmaster-marketing:latest
docker run -p 80:80 yourusername/fleetmaster-marketing:latest
\`\`\`

## Tags

- `latest` - Latest stable version
- `v1.x.x` - Specific versions
```

---

## 📚 Additional Resources

- [DockerHub Documentation](https://docs.docker.com/docker-hub/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## 🎉 Quick Reference

### Push with Version
```bash
export DOCKERHUB_USERNAME=yourusername
export IMAGE_VERSION=v1.0.0
./docker-push.sh
```

### Pull and Run
```bash
docker pull yourusername/fleetmaster-main:latest
docker run -p 3001:80 yourusername/fleetmaster-main:latest
```

### Check Image Info
```bash
docker images | grep fleetmaster
docker inspect yourusername/fleetmaster-main:latest
```

---

**Need Help?** Check [infrastructure/README.md](README.md) for more Docker documentation.


# FleetMaster Docker Infrastructure

This directory contains Docker configuration for running FleetMaster applications in both **development** and **production** modes.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development Mode](#development-mode)
- [Production Mode](#production-mode)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+

### Development Mode (Hot Reload)

**Linux/Mac:**
```bash
cd infrastructure
chmod +x make-executable.sh && ./make-executable.sh  # First time only
./start-dev.sh
```

**Windows:**
```bash
cd infrastructure
start-dev.bat
```

**Or manually:**
```bash
cd infrastructure
docker-compose -f docker-compose.dev.yml up --build
```

Access your apps:
- **Marketing Site**: http://localhost:3000
- **Main App**: http://localhost:3001

### Production Mode

**Linux/Mac:**
```bash
cd infrastructure
chmod +x make-executable.sh && ./make-executable.sh  # First time only
./start-prod.sh
```

**Windows:**
```bash
cd infrastructure
start-prod.bat
```

**Or manually:**
```bash
cd infrastructure
docker-compose -f docker-compose.yml up --build
```

Access via gateway:
- **Gateway**: http://localhost

---

## 🔧 Development Mode

### Features

✅ **Hot Reload** - Changes to source files are reflected immediately  
✅ **Direct Port Access** - Each app runs on its own port  
✅ **Volume Mounting** - Source code is mounted for live updates  
✅ **Development Config** - Uses development API endpoints  
✅ **Faster Iteration** - No rebuild needed for code changes

### What's Running

- **Marketing Site** (port 3000) - React app with esbuild dev server
- **Main App** (port 3001) - React app with esbuild dev server

### Environment Variables

- `NODE_ENV=development`
- API URLs configured in `apps/*/src/config/app.config.js`

### Source Code Volumes

The following directories are mounted as volumes:
- `apps/marketing-site/src` → `/app/src`
- `apps/main-app/src` → `/app/src`

### Stopping Development Environment

**Windows:**
```bash
stop-dev.bat
```

**Linux/Mac:**
```bash
./stop-dev.sh
```

**Or manually:**
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 🏭 Production Mode

### Features

✅ **Optimized Builds** - Minified and tree-shaken code  
✅ **Nginx Serving** - Production-ready web server  
✅ **Security Headers** - X-Frame-Options, CSP, etc.  
✅ **Health Checks** - Container health monitoring  
✅ **Gateway Routing** - Nginx reverse proxy for routing  
✅ **Small Images** - Multi-stage builds for minimal size

### What's Running

- **Marketing Site** - Nginx serving static files
- **Main App** - Nginx serving static files
- **Gateway** - Nginx reverse proxy (port 80)

### Environment Variables

- `NODE_ENV=production`
- Production API URLs configured in `apps/*/src/config/app.config.js`

### Stopping Production Environment

**Windows:**
```bash
stop-prod.bat
```

**Linux/Mac:**
```bash
./stop-prod.sh
```

**Or manually:**
```bash
docker-compose -f docker-compose.yml down
```

---

## 🏗️ Architecture

### Multi-Stage Dockerfile

Both frontend apps use multi-stage Dockerfiles with the following stages:

1. **base** - Install dependencies (shared layer)
2. **development** - Development server with hot reload
3. **builder** - Build production assets
4. **production** - Nginx serving static files

### Directory Structure

```
infrastructure/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── docker-compose.hub.yml      # DockerHub images configuration
├── Dockerfile.backend          # Backend service (optional)
├── nginx/                      # Gateway nginx config
│   └── nginx.conf
├── start-dev.sh / .bat         # Start development
├── start-prod.sh / .bat        # Start production
├── stop-dev.sh / .bat          # Stop development
├── stop-prod.sh / .bat         # Stop production
├── docker-push.sh / .bat       # Push to DockerHub
├── DOCKERHUB_GUIDE.md          # Complete DockerHub guide
└── README.md                   # This file
```

---

## ⚙️ Configuration

### App Configuration Files

Environment-specific settings are in:
- `apps/main-app/src/config/app.config.js`
- `apps/marketing-site/src/config/app.config.js`

### Docker Compose Override

Create a `docker-compose.override.yml` for local customizations:

```yaml
services:
  main-app:
    ports:
      - "4001:3001"  # Custom port mapping
```

### Environment Variables

You can pass additional environment variables:

```yaml
services:
  main-app:
    environment:
      - API_URL=http://custom-backend:8080/api
```

---

## 🔍 Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are taken:

```bash
# Stop conflicting services
docker-compose -f docker-compose.dev.yml down

# Or change ports in docker-compose.dev.yml
```

### Build Fails

```bash
# Clean rebuild
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Hot Reload Not Working

On Windows, Docker volume mounts may have issues with file watching:

1. Ensure Docker Desktop is using WSL 2 backend
2. Store project in WSL filesystem for better performance
3. Or disable hot reload and rebuild containers when needed

### View Logs

```bash
# Development
docker-compose -f docker-compose.dev.yml logs -f

# Production
docker-compose -f docker-compose.yml logs -f

# Specific service
docker logs fleetmaster-main-dev -f
```

### Container Health

```bash
# Check container status
docker ps

# Check health
docker inspect fleetmaster-main | grep -A 10 Health
```

---

## 📝 Common Commands

### Development

```bash
# Start with logs
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build marketing-site

# View logs
docker-compose -f docker-compose.dev.yml logs -f main-app

# Restart service
docker-compose -f docker-compose.dev.yml restart main-app

# Stop
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Production

```bash
# Start with logs
docker-compose up

# Start in background
docker-compose up -d

# Rebuild
docker-compose build

# Stop
docker-compose down

# Stop and remove everything
docker-compose down -v --remove-orphans
```

---

## 🔄 Switching Modes

To switch from development to production:

```bash
# Stop development
docker-compose -f docker-compose.dev.yml down

# Start production
docker-compose up --build
```

---

## 📊 Performance Tips

### Development

- Use WSL 2 backend on Windows for better file watching
- Keep node_modules in named volumes for faster builds
- Use `--build` sparingly - only when dependencies change

### Production

- Multi-stage builds keep final images small (~25MB per app)
- Nginx caching reduces server load
- Health checks enable automatic recovery
- Gzip compression reduces bandwidth

---

## 🔐 Security Notes

Production mode includes:
- Security headers (X-Frame-Options, CSP, etc.)
- Server tokens disabled
- Read-only file systems where possible
- Non-root users in containers
- Minimal attack surface (distroless images)

---

## 🌐 DockerHub Deployment

### Push Images to DockerHub

**Quick Method:**

**Linux/Mac:**
```bash
export DOCKERHUB_USERNAME=yourusername
export IMAGE_VERSION=v1.0.0  # Optional, defaults to 'latest'
chmod +x docker-push.sh
./docker-push.sh
```

**Windows:**
```bash
set DOCKERHUB_USERNAME=yourusername
set IMAGE_VERSION=v1.0.0
docker-push.bat
```

This will:
1. Build both frontend apps
2. Tag them with your DockerHub username
3. Push to DockerHub

### Pull and Run from DockerHub

After pushing, anyone can use your images:

```bash
# Pull images
docker pull yourusername/fleetmaster-marketing:latest
docker pull yourusername/fleetmaster-main:latest

# Run with DockerHub images
docker-compose -f docker-compose.hub.yml up
```

### Complete DockerHub Guide

For detailed instructions including:
- Setting up DockerHub account
- Login and authentication
- Versioning strategy
- CI/CD integration
- Security best practices

See **[DOCKERHUB_GUIDE.md](DOCKERHUB_GUIDE.md)**

---

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [DockerHub Guide](DOCKERHUB_GUIDE.md) - Complete guide to pushing images

---

Made with ❤️ by FleetMaster Team


# FleetMaster Pro 🚗

<div align="center">

![FleetMaster](apps/main-app/resources/FleetMasterMain01.png)

**Complete Fleet Management & Car Maintenance Tracking Solution**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Documentation](#documentation)

</div>

---

## 📋 Overview

FleetMaster Pro is a modern, scalable fleet management and vehicle maintenance tracking solution designed for individuals and small to medium-sized transportation companies. Built with a thin-client architecture, this frontend application provides a beautiful, responsive UI while delegating all business logic to a backend API.

### Key Highlights

- 🎨 **Modern UI/UX** - Built with React, Shadcn UI, and Radix UI components
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🏗️ **Monorepo Architecture** - Separate marketing site and main application
- 🔐 **Authentication Ready** - Integrated authentication and authorization flow
- 📊 **Comprehensive Tracking** - Service history, maintenance plans, mileage tracking, and more
- 🎯 **Thin Client Design** - UI-focused with backend-driven business logic
- 🐳 **Docker Ready** - Full dev/prod Docker setup with hot reload
- 🚀 **GitHub Pages Compatible** - Easy static hosting deployment

---

## ✨ Features

### For Individual Users
- Track your personal vehicle maintenance and service history
- Set up maintenance schedules and reminders
- Monitor mileage and fuel consumption
- Store service records and receipts
- Access maintenance guides and recommendations

### For Fleet Managers
- Manage multiple vehicles from a single dashboard
- Track maintenance costs across your fleet
- Schedule preventive maintenance
- Monitor vehicle health and status
- Generate reports and analytics
- Alert system for upcoming maintenance

### Technical Features
- **Service History Management** - Complete service record tracking with image uploads
- **Maintenance Planning** - Smart scheduling based on mileage and time intervals
- **Mileage Tracking** - History and analytics for fuel efficiency
- **Alert System** - Notifications for upcoming maintenance
- **Multi-vehicle Support** - Manage personal cars or entire fleets
- **Export Functionality** - Generate PDF reports
- **Responsive Design** - Mobile-first approach
- **Theme Support** - Light/dark mode

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript
- **Styling:** TailwindCSS 3.4
- **UI Components:** Shadcn UI + Radix UI
- **State Management:** Zustand
- **Routing:** React Router 7
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Animations:** Motion (Framer Motion)
- **Build Tool:** ESBuild
- **Package Manager:** npm with Workspaces

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx
- **Deployment:** GitHub Pages, Docker
- **CI/CD:** Shell scripts for staging/production

---

## 📁 Project Structure

```
fleetmaster-monorepo/
├── apps/
│   ├── main-app/              # Main fleet management application
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # API services
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── lib/           # Utility functions
│   │   │   └── types/         # TypeScript definitions
│   │   ├── dist/              # Build output
│   │   └── package.json
│   │
│   └── marketing-site/        # Marketing/landing page
│       ├── src/
│       ├── dist/
│       └── package.json
│
├── packages/
│   └── shared/                # Shared assets (images, etc.)
│
├── infrastructure/
│   ├── docker-compose.yml     # Production Docker composition
│   ├── docker-compose.dev.yml # Development Docker composition
│   ├── Dockerfile.backend     # Backend Docker image
│   ├── nginx/                 # Gateway nginx configuration
│   ├── start-dev.sh / .bat    # Start development mode
│   ├── start-prod.sh / .bat   # Start production mode
│   ├── stop-dev.sh / .bat     # Stop development
│   ├── stop-prod.sh / .bat    # Stop production
│   └── README.md              # Docker documentation
│
├── doc/                       # Documentation
│   ├── architecture-notes/    # Architecture decisions
│   ├── deployment-tips/       # Deployment guides
│   ├── dev-tips/              # Development guides
│   └── feat-plans/            # Feature planning
│
├── scripts/
│   ├── deploy-staging.sh      # Staging deployment
│   └── deploy-production.sh   # Production deployment
│
└── package.json               # Root package.json (workspaces)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0 (for local development)
- **npm** >= 9.0.0
- **Docker** + **Docker Compose** (for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fleetmaster-monorepo.git
   cd fleetmaster-monorepo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   npm run install:all
   ```

3. **Start development servers**
   
   **Option A: Using Docker (Recommended)**
   ```bash
   cd infrastructure
   
   # Linux/Mac
   chmod +x make-executable.sh && ./make-executable.sh
   ./start-dev.sh
   
   # Windows
   start-dev.bat
   ```
   
   **Option B: Using Node.js directly**
   ```bash
   # Run both apps
   npm run dev

   # Or run individually
   cd apps/main-app && npm run dev       # Main application only
   cd apps/marketing-site && npm run dev # Marketing site only
   ```

4. **Open in browser**
   - Marketing Site: `http://localhost:3000`
   - Main App: `http://localhost:3001`

### Building for Production

```bash
# Build all apps
npm run build

# Or build individually
npm run build:main-app
npm run build:marketing
```

Build output will be in `apps/*/dist/` directories.

---

## 🐳 Docker Deployment

FleetMaster Pro includes **full Docker support** with separate **development** and **production** modes.

### Development Mode (Hot Reload)

Run the application with live code reloading for active development:

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

**Access:**
- Marketing Site: http://localhost:3000
- Main App: http://localhost:3001

**Features:**
- ✅ Hot reload on code changes
- ✅ Direct port access to each app
- ✅ Volume mounting for live updates
- ✅ Development API endpoints
- ✅ Faster iteration cycle

### Production Mode (Optimized)

Run the application with production-optimized builds:

**Linux/Mac:**
```bash
cd infrastructure
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

**Access:**
- Gateway: http://localhost

**Features:**
- ✅ Minified, optimized builds
- ✅ Nginx web server
- ✅ Security headers enabled
- ✅ Health checks
- ✅ Gateway routing
- ✅ Small image sizes (~25MB per app)

### Stopping Services

**Linux/Mac:**
```bash
./stop-dev.sh   # Stop development
./stop-prod.sh  # Stop production
```

**Windows:**
```bash
stop-dev.bat   # Stop development
stop-prod.bat  # Stop production
```

### Docker Architecture

Both frontend apps use **multi-stage Dockerfiles**:
1. **base** - Install dependencies (shared layer)
2. **development** - Development server with hot reload
3. **builder** - Build production assets
4. **production** - Nginx serving static files

### Push to DockerHub

Share your images on DockerHub:

**Linux/Mac:**
```bash
cd infrastructure
export DOCKERHUB_USERNAME=yourusername
./docker-push.sh
```

**Windows:**
```bash
cd infrastructure
set DOCKERHUB_USERNAME=yourusername
docker-push.bat
```

### Complete Docker Documentation

For comprehensive Docker setup, configuration, and troubleshooting, see:
- **[Docker Infrastructure Guide](infrastructure/README.md)** - Complete Docker documentation
- **[DockerHub Guide](infrastructure/DOCKERHUB_GUIDE.md)** - Push images to DockerHub

---

## 🔧 Configuration

### Environment Modes

The application supports two modes:

1. **Development Mode** - Uses localStorage for demo/testing
2. **Production Mode** - Connects to backend API

Configure in `apps/main-app/src/config/app.config.js`:

```javascript
export const config = {
  mode: 'development', // or 'production'
  apiUrl: 'https://api.yourbackend.com',
  // ... other settings
};
```

### Backend Integration

The frontend is designed as a thin client and expects a RESTful API backend. See [BACKEND_INTEGRATION_GUIDE.md](doc/architecture-notes/BACKEND_INTEGRATION_GUIDE.md) for API specifications.

---

## 📚 Documentation

Comprehensive documentation is available in the `/doc` directory:

- **[Architecture Summary](doc/architecture-notes/architecture_summary.md)** - System design and principles
- **[Deployment Guide](doc/deployment-tips/MONOREPO_README.md)** - Deployment instructions
- **[Backend Integration](doc/dev-tips/backend_image_upload_api.md)** - API integration guide
- **[Development Tips](doc/dev-tips/)** - Development best practices
- **[Feature Plans](doc/feat-plans/)** - Roadmap and planning

---

## 📜 Available Scripts

### Root Level
```bash
npm run dev                    # Run both apps in dev mode
npm run build                  # Build all apps
npm run test                   # Run tests in all workspaces
npm run lint                   # Run linter in all workspaces
npm run clean                  # Clean all build outputs and node_modules
npm run deploy:staging         # Deploy to staging
npm run deploy:production      # Deploy to production
```

### Workspace Scripts
```bash
npm run dev:main-app           # Run main app in dev mode
npm run dev:marketing          # Run marketing site in dev mode
npm run build:main-app         # Build main app
npm run build:marketing        # Build marketing site
```

### Docker Scripts (in infrastructure/)

**Linux/Mac:**
```bash
./start-dev.sh                 # Start development mode
./start-prod.sh                # Start production mode
./stop-dev.sh                  # Stop development
./stop-prod.sh                 # Stop production
```

**Windows:**
```bash
start-dev.bat                  # Start development mode
start-prod.bat                 # Start production mode
stop-dev.bat                   # Stop development
stop-prod.bat                  # Stop production
```

---

## 🎨 UI Components

This project uses **Shadcn UI** - a collection of re-usable components built with Radix UI and TailwindCSS. Components are:

- ✅ Fully accessible (WAI-ARIA compliant)
- 🎨 Customizable with TailwindCSS
- 📱 Mobile responsive
- 🌙 Dark mode compatible
- ♿ Keyboard navigable

Available components include: Button, Card, Dialog, Form, Input, Select, Table, Toast, Dropdown, Tabs, and many more.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write descriptive variable and function names
- Use Tailwind classes for styling (no inline CSS)
- Implement accessibility features
- Add comments for complex logic

---

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/yourusername/fleetmaster-monorepo/issues) page to report bugs or request features.

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Browser/OS information

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**FleetMaster Team**

---

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Beautiful icon set

---

## 📞 Support

For support, please reach out via:
- GitHub Issues: [Report an issue](https://github.com/yourusername/fleetmaster-monorepo/issues)
- Email: support@fleetmaster.com (update with your actual email)

---

<div align="center">

**Made with ❤️ by the FleetMaster Team**

⭐ Star this repository if you find it helpful!

</div>

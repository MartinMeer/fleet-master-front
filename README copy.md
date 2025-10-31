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
- 🐳 **Docker Ready** - Containerized deployment support
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
│   ├── docker-compose.yml     # Docker composition
│   ├── Dockerfile.backend     # Backend Docker image
│   └── nginx/                 # Nginx configuration
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

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** (optional, for containerized deployment)

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
   ```bash
   # Run both apps
   npm run dev

   # Or run individually
   npm run dev:main-app      # Main application only
   npm run dev:marketing     # Marketing site only
   ```

4. **Open in browser**
   - Main App: `http://localhost:3000` (or check console for actual port)
   - Marketing Site: `http://localhost:3001` (or check console for actual port)

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

### Using Docker Compose

```bash
# Build Docker images
npm run docker:build

# Start containers
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

### Manual Docker Build

```bash
cd apps/marketing-site
docker build -t fleetmaster-marketing .
docker run -p 8080:80 fleetmaster-marketing
```

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
npm run docker:build           # Build Docker images
npm run docker:up              # Start Docker containers
npm run docker:down            # Stop Docker containers
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

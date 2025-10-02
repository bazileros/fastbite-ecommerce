# 🍔 FastBite - Modern Food Ordering Platform

[![Next.js](https://img.shields.io/badge/Next.js-13+-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Convex](https://img.shields.io/badge/Convex-1.27+-000000?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjIwQzE0IDIxLjEgMTMuMSAyMiAxMiAyMkg0QzIuOSAyMiAyIDIxLjEgMiAyMFY0QzIgMi45IDIuOSAyIDQgMkgxMkMxMy4xIDIgMTQgMi45IDE0IDRWNFoiIGZpbGw9IiMwMDAiLz4KPC9zdmc+Cg==)](https://convex.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-06B6D4?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

FastBite is a modern, full-stack food ordering platform built with cutting-edge technologies. Experience seamless ordering with real-time updates, secure payments, and an intuitive user interface.

![FastBite Preview](./public/fastbite-logo.png)

## ✨ Features

### 🍽️ Core Functionality
- **Real-time Menu Management** - Dynamic menu updates with instant synchronization
- **Advanced Cart System** - Persistent cart with customization options
- **Flexible Meal Customization** - Toppings, sides, and beverages for each meal
- **Order Tracking** - Real-time order status updates
- **Guest Checkout** - No account required for ordering

### 🔐 Security & Authentication
- **Enterprise Authentication** - Logto-powered secure login system
- **Role-Based Access Control** - Customer, Staff, Manager, and Admin roles
- **Social Login** - Google, GitHub, and other OAuth providers
- **Secure Payments** - Paystack integration with webhook verification

### 🛠️ Technical Excellence
- **Type-Safe Development** - Full TypeScript coverage with Zod validation
- **Real-time Database** - Convex-powered reactive data layer
- **Modern UI/UX** - Radix UI components with Tailwind CSS
- **File Storage** - MinIO-powered secure image management
- **Docker Support** - Containerized development and deployment

### 📊 Admin Features
- **Analytics Dashboard** - Comprehensive business insights
- **Menu Management** - CRUD operations for meals and categories
- **Order Management** - Staff dashboard for order processing
- **User Management** - Role assignment and user administration
- **Audit Logging** - Complete activity tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+
- npm 9.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fastbite.git
   cd fastbite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Database Setup

```bash
# Initialize Convex
npm run convex:dev

# Deploy schema
npm run convex:deploy

# Seed with sample data
npm run db:seed
```

## 🏗️ Architecture

```
fastbite/
├── app/                    # Next.js 13+ App Router
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Radix UI primitives
│   └── ...               # Feature components
├── convex/                # Backend functions
│   ├── _generated/       # Auto-generated types
│   ├── mutations.ts      # Write operations
│   ├── queries.ts        # Read operations
│   ├── schema.ts         # Database schema
│   └── actions.ts        # Server actions
├── lib/                  # Utilities & configuration
│   ├── types.ts          # TypeScript definitions
│   ├── schemas.ts        # Zod validation schemas
│   ├── utils.ts          # Helper functions
│   └── ...               # Service integrations
├── docs/                 # Documentation
├── public/               # Static assets
└── tests/                # Test suites
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 13+](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5+](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **State**: React Context + [Convex React](https://docs.convex.dev/)

### Backend
- **Database**: [Convex](https://convex.dev/) - Real-time database
- **Authentication**: [Logto](https://logto.io/) - Enterprise auth
- **Payments**: [Paystack](https://paystack.com/) - Payment processing
- **Image Storage**: [ImageKit](https://imagekit.io/) - Image CDN & optimization
- **Email**: [Nodemailer](https://nodemailer.com/) - Email service

### DevOps
- **Containerization**: [Docker](https://docker.com/)
- **Orchestration**: Docker Compose
- **Deployment**: [Coolify](https://coolify.io/) (Traefik/Caddy) / [Vercel](https://vercel.com/)
- **CI/CD**: GitHub Actions (optional)

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run convex:dev       # Start Convex development
npm run convex:deploy    # Deploy Convex functions

# Database
npm run db:seed          # Seed database with sample data
npm run db:migrate       # Run database migrations

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run compose:up       # Start all services
npm run compose:down     # Stop all services

# Testing & Quality
npm test                 # Run test suite
npm run type-check       # TypeScript type checking
npm run lint             # ESLint code linting
npm run build            # Production build

# Utilities
npm run clean            # Clean build artifacts
npm run format           # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables

```env
# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Convex
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url

# Logto Authentication
LOGTO_ENDPOINT=https://your-logto-instance.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_BASE_URL=http://localhost:3000
LOGTO_COOKIE_SECRET=your-random-secret-key

# Paystack Payments
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Docker Setup

For local development with all services:

```bash
# Start full stack
docker-compose up -d

# With Paystack testing (includes nginx)
docker-compose --profile paystack-testing up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Setup Guide](docs/setup.md)** - Complete installation and configuration
- **[Coolify Deployment](docs/coolify-deployment.md)** - Production deployment guide
- **[Convex Backend](docs/convex.md)** - Database and serverless functions
- **[Logto Auth](docs/logto.md)** - Authentication and authorization
- **[Zod Validation](docs/zod.md)** - Input validation and type safety
- **[Paystack Integration](docs/paystack.md)** - Payment processing
- **[ImageKit Integration](docs/imagekit-integration.md)** - Image storage and optimization
- **[Frontend Architecture](docs/frontend.md)** - UI/UX and components
- **[Security Guide](docs/security.md)** - Security best practices
- **[Contributing](docs/contributing.md)** - Development guidelines

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- MealCard.test.tsx

# E2E testing
npm run test:e2e
```

### Test Coverage
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for critical user flows
- E2E tests with Playwright

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Export static files (optional)
npm run export
```

### Deployment Options

#### Coolify (Recommended)
1. Connect your repository
2. Configure environment variables
3. Deploy with automatic SSL

#### Vercel
1. Import project to Vercel
2. Set environment variables
3. Deploy with global CDN

#### Docker
```bash
# Build production image
docker build -t fastbite:latest .

# Run in production
docker run -p 3000:3000 fastbite:latest
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Convex** for the amazing real-time database
- **Logto** for enterprise authentication
- **Paystack** for reliable payment processing
- **ImageKit** for powerful image optimization and CDN
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Coolify** for simplified self-hosted deployments

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/fastbite/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/fastbite/discussions)
- **Documentation**: [FastBite Docs](docs/)

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Loyalty program integration
- [ ] Multi-restaurant support
- [ ] Real-time chat support
- [ ] Advanced filtering and search
- [ ] Order scheduling
- [ ] Push notifications

### Technical Improvements
- [ ] GraphQL API layer
- [ ] Microservices architecture
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] Automated testing pipeline

---

<p align="center">
  Made with ❤️ for food lovers everywhere
</p>

<p align="center">
  <a href="#-fastbite---modern-food-ordering-platform">Back to top</a>
</p>
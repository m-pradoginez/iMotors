# iMotors Web Frontend

Frontend application for iMotors - a B2C car recommendation and Total Cost of Ownership (TCO) calculation platform for the Brazilian market.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: TailwindCSS v4
- **Routing**: React Router v7
- **Icons**: Lucide React

## Features

- **Constraint Input Form**: Budget, mileage, city/highway ratio, state selection, category and fuel preferences
- **TCO Report Page**: Top 3 vehicle recommendations with image previews and detailed monthly cost breakdown
- **External Redirects**: Direct links to Webmotors and OLX with UTM tracking

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/           # API client and fetch utilities
├── components/    # Reusable UI components
├── lib/           # Utility functions
├── pages/         # Route pages
├── types/         # TypeScript type definitions
└── App.tsx        # Main application component
```

## API Integration

The frontend consumes the iMotors API (defined in `api/openapi.yaml`) with the following endpoints:

- `POST /recommendations` - Get personalized vehicle recommendations
- `GET /vehicles` - Query vehicle catalog
- `GET /health` - Health check

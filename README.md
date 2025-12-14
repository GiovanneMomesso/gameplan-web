# Gameplan Web Application

A modern, feature-rich web application for managing sports groups and matches. Built with React, TypeScript, and Vite.

## Features

✨ **Authentication**
- User registration and login
- JWT token-based authentication
- Protected routes

🏆 **Group Management**
- Create and manage sports groups
- View group members
- Invite users to groups

⚽ **Match Management**
- Create, edit, and delete matches
- Apply to join matches
- View match participants
- Set location, time, and price per member

🎨 **Modern UI/UX**
- Glassmorphism design effects
- Smooth animations and transitions
- Responsive layout
- Dark theme with vibrant gradients

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **CSS Modules** - Component-scoped styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running (default: http://localhost:8080)

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd gameplan-web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (or copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your API base URL:
```
VITE_API_BASE_URL=http://localhost:8080
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── api/                    # API client (auto-generated)
│   ├── hooks/             # React Query hooks
│   ├── models/            # TypeScript models
│   ├── services/          # API services
│   └── utils/             # API utilities
├── components/            # Reusable UI components
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Modal/
│   ├── Navbar/
│   ├── Spinner/
│   ├── EmptyState/
│   ├── ProtectedRoute.tsx
│   ├── CreateGroupModal/
│   ├── CreateMatchModal/
│   ├── EditMatchModal/
│   ├── InviteSection/
│   └── MatchCard/
├── contexts/              # React contexts
│   └── AuthContext.tsx
├── pages/                 # Page components
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/
│   ├── GroupDetail/
│   └── AcceptInvite/
├── styles/                # Global styles
│   ├── variables.css     # CSS custom properties
│   └── global.css        # Global styles
├── utils/                 # Utility functions
│   └── dateFormatter.ts
├── App.tsx               # Main app component with routing
├── main.tsx              # Application entry point
└── vite-env.d.ts         # Vite environment types

## Usage

### Authentication

1. **Register**: Navigate to `/register` and create a new account
2. **Login**: Use your credentials at `/login`
3. **Logout**: Click the logout button in the navbar

### Managing Groups

1. **Create Group**: Click "Create Group" on the dashboard
2. **View Groups**: All your groups are displayed on the dashboard
3. **Group Details**: Click on a group card to view matches and manage invites

### Managing Matches

1. **Create Match**: In a group detail page, click "Create Match"
2. **Edit Match**: Click "Edit" on any match card
3. **Delete Match**: Click "Delete" and confirm
4. **Apply for Match**: Click "Apply" to join a match

### Invites

1. **Create Invite**: In the group detail page, enter a user ID and click "Create Invite"
2. **Share Secret**: Copy the generated secret hash and share it with the user
3. **Accept Invite**: Navigate to `/invites/accept` and enter the secret hash

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |

## Design System

The application uses a comprehensive design system with:

- **Color Palette**: Vibrant purple/blue gradients with semantic colors
- **Typography**: Inter font family with consistent sizing scale
- **Spacing**: 8px base unit with consistent scale
- **Components**: Reusable, accessible components with consistent styling
- **Effects**: Glassmorphism, smooth transitions, and micro-animations

## License

MIT
# gameplan-web

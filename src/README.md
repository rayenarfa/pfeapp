# Project Structure

This project follows a feature-based organization pattern with separate core utilities and reusable components.

## Directory Structure

```
src/
├── assets/                    # Static assets like images and styles
│   ├── images/                # Image files
│   └── styles/                # Global styles
│
├── core/                      # Core application code
│   ├── config/                # App configuration
│   │   └── firebase/          # Firebase setup
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   └── services/              # API and external services
│       ├── api/               # API clients
│       └── auth/              # Authentication services
│
├── hooks/                     # Custom React hooks
│
├── components/                # Reusable UI components
│   ├── ui/                    # Basic UI components
│   │   ├── modals/            # Modal dialogs
│   │   ├── cards/             # Card components
│   │   ├── feedback/          # Notifications, alerts, etc.
│   │   └── button/            # Button components
│   ├── forms/                 # Form components
│   └── layout/                # Layout components
│
├── features/                  # Feature-based modules
│   ├── auth/                  # Authentication feature
│   │   └── components/        # Auth components
│   ├── products/              # Products feature
│   │   └── components/        # Product components
│   ├── users/                 # User management feature
│   │   └── components/        # User components
│   └── admin/                 # Admin dashboard feature
│       └── components/        # Admin components
│
├── pages/                     # Page components
│   ├── errors/                # Error pages
│   └── ...                    # Other page directories
│
├── routes/                    # Routing configuration
│
└── context/                   # React context definitions
```

## Import Conventions

- Use relative imports for closely related files
- Use absolute imports for distant imports (e.g., from core or components)
- Use index files for cleaner imports

Example:

```typescript
// Good: Using index files
import { useAuth, useUsers } from "../../hooks";

// Good: Using absolute imports for distant modules
import { Button } from "../../components/ui/button";
```

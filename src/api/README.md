# Gameplan API Client

A complete TypeScript API client for the Gameplan Service, built with Axios and React Query.

## Installation

Make sure you have the required dependencies installed:

```bash
npm install axios @tanstack/react-query
# or
yarn add axios @tanstack/react-query
```

## Setup

### 1. Configure React Query Provider

Wrap your app with the `QueryClientProvider`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

### 2. Configure API Base URL

Set the API base URL via environment variable:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

Or modify `src/api/config.ts` directly.

## Usage Examples

### Authentication

#### Login
```tsx
import { useLogin } from './api';

function LoginForm() {
  const login = useLogin();

  const handleSubmit = async (email: string, password: string) => {
    try {
      const response = await login.mutateAsync({ email, password });
      console.log('Login successful:', response.token);
      // Token is automatically stored
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit('user@example.com', 'password');
    }}>
      {/* Form fields */}
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
      {login.isError && <p>Error: {login.error.message}</p>}
    </form>
  );
}
```

#### Register
```tsx
import { useRegister } from './api';

function RegisterForm() {
  const register = useRegister();

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      const message = await register.mutateAsync({ name, email, password });
      console.log(message);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // ... form implementation
}
```

#### Logout
```tsx
import { useLogout } from './api';

function LogoutButton() {
  const { logout } = useLogout();

  return <button onClick={logout}>Logout</button>;
}
```

### Groups

#### Fetch User Groups
```tsx
import { useUserGroups } from './api';

function GroupsList() {
  const { data: groups, isLoading, error } = useUserGroups();

  if (isLoading) return <div>Loading groups...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {groups?.map((group) => (
        <li key={group.id}>
          {group.name} - Admin: {group.adminName}
        </li>
      ))}
    </ul>
  );
}
```

#### Create a Group
```tsx
import { useCreateGroup, useUserGroups } from './api';
import { useQueryClient } from '@tanstack/react-query';
import { groupKeys } from './api/hooks/useGroups';

function CreateGroupForm() {
  const queryClient = useQueryClient();
  const createGroup = useCreateGroup();

  const handleCreate = async (name: string) => {
    try {
      const group = await createGroup.mutateAsync({ name });
      console.log('Group created:', group);
      
      // Invalidate groups query to refetch
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  // ... form implementation
}
```

#### Fetch Group Matches
```tsx
import { useGroupMatches } from './api';

function GroupMatches({ groupId }: { groupId: number }) {
  const { data: matches, isLoading } = useGroupMatches(groupId);

  if (isLoading) return <div>Loading matches...</div>;

  return (
    <ul>
      {matches?.map((match) => (
        <li key={match.id}>
          {match.location} - {new Date(match.time).toLocaleString()}
          <br />
          Price: ${match.pricePerMember} | Participants: {match.participants.length}
        </li>
      ))}
    </ul>
  );
}
```

### Matches

#### Create a Match
```tsx
import { useCreateMatch } from './api';
import { useQueryClient } from '@tanstack/react-query';
import { groupKeys } from './api/hooks/useGroups';

function CreateMatchForm({ groupId }: { groupId: number }) {
  const queryClient = useQueryClient();
  const createMatch = useCreateMatch();

  const handleCreate = async () => {
    try {
      const match = await createMatch.mutateAsync({
        location: 'Central Park',
        pricePerMember: 15.0,
        maxParticipants: 10,
        time: new Date().toISOString(),
        groupId,
      });
      
      // Invalidate group matches to refetch
      queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
    } catch (error) {
      console.error('Failed to create match:', error);
    }
  };

  // ... form implementation
}
```

#### Apply for a Match
```tsx
import { useApplyForMatch } from './api';

function ApplyButton({ matchId }: { matchId: number }) {
  const applyForMatch = useApplyForMatch();

  const handleApply = async () => {
    try {
      await applyForMatch.mutateAsync(matchId);
      console.log('Applied successfully!');
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  return (
    <button onClick={handleApply} disabled={applyForMatch.isPending}>
      {applyForMatch.isPending ? 'Applying...' : 'Apply for Match'}
    </button>
  );
}
```

#### Update a Match
```tsx
import { useUpdateMatch } from './api';

function UpdateMatchForm({ matchId }: { matchId: number }) {
  const updateMatch = useUpdateMatch();

  const handleUpdate = async () => {
    try {
      const updated = await updateMatch.mutateAsync({
        matchId,
        data: {
          location: 'New Location',
          pricePerMember: 20.0,
        },
      });
      console.log('Match updated:', updated);
    } catch (error) {
      console.error('Failed to update match:', error);
    }
  };

  // ... form implementation
}
```

#### Delete a Match
```tsx
import { useDeleteMatch } from './api';

function DeleteMatchButton({ matchId }: { matchId: number }) {
  const deleteMatch = useDeleteMatch();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure?')) return;
    
    try {
      await deleteMatch.mutateAsync(matchId);
      console.log('Match deleted');
    } catch (error) {
      console.error('Failed to delete match:', error);
    }
  };

  return <button onClick={handleDelete}>Delete Match</button>;
}
```

### Invites

#### Create an Invite
```tsx
import { useCreateInvite } from './api';

function InviteUserButton({ groupId, userId }: { groupId: number; userId: number }) {
  const createInvite = useCreateInvite();

  const handleInvite = async () => {
    try {
      const invite = await createInvite.mutateAsync({
        groupId,
        data: { invitedUserId: userId },
      });
      console.log('Invite created with secret:', invite.secretHash);
    } catch (error) {
      console.error('Failed to create invite:', error);
    }
  };

  return <button onClick={handleInvite}>Invite User</button>;
}
```

#### Submit an Invite
```tsx
import { useSubmitInvite } from './api';

function AcceptInviteForm() {
  const submitInvite = useSubmitInvite();

  const handleSubmit = async (userId: number, secretHash: string) => {
    try {
      await submitInvite.mutateAsync({ userId, secretHash });
      console.log('Invite accepted!');
    } catch (error) {
      console.error('Failed to accept invite:', error);
    }
  };

  // ... form implementation
}
```

## Direct Service Usage

You can also use the services directly without hooks:

```tsx
import { authService, matchService, groupService } from './api';

// Login
const response = await authService.login({ email, password });

// Create a match
const match = await matchService.createMatch({
  location: 'Stadium',
  pricePerMember: 25,
  maxParticipants: 20,
  time: new Date().toISOString(),
  groupId: 1,
});

// Get user groups
const groups = await groupService.getUserGroups();
```

## TypeScript Support

All models are fully typed. Import types as needed:

```tsx
import type {
  LoginRequest,
  LoginResponse,
  MatchSummary,
  GroupSummary,
  UserResponse,
  ProfileType,
} from './api';
```

## Error Handling

All hooks and services use a standardized `ApiError` type:

```tsx
import { useLogin, ApiError } from './api';

const login = useLogin();

if (login.isError) {
  const error: ApiError = login.error;
  console.log('Message:', error.message);
  console.log('Status:', error.status);
  console.log('Code:', error.code);
}
```

## Project Structure

```
src/api/
├── config.ts              # API configuration
├── apiClient.ts           # Axios instance with interceptors
├── index.ts               # Main barrel export
├── models/
│   ├── auth.ts           # Authentication models
│   ├── user.ts           # User models
│   ├── match.ts          # Match models
│   ├── group.ts          # Group models
│   └── index.ts          # Models barrel export
├── services/
│   ├── authService.ts    # Authentication service
│   ├── userService.ts    # User service
│   ├── matchService.ts   # Match service
│   ├── groupService.ts   # Group service
│   └── index.ts          # Services barrel export
├── hooks/
│   ├── useAuth.ts        # Authentication hooks
│   ├── useUsers.ts       # User hooks
│   ├── useMatches.ts     # Match hooks
│   ├── useGroups.ts      # Group hooks
│   └── index.ts          # Hooks barrel export
└── utils/
    ├── tokenStorage.ts   # JWT token storage
    └── errorHandler.ts   # Error handling utilities
```

## License

MIT

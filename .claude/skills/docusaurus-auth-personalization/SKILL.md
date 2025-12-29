---
name: docusaurus-auth-personalization
description: Integrate Better Auth authentication system with Docusaurus sites and implement personalized content delivery based on user background profiling. Use when you need to (1) Add authentication to a Docusaurus site with OAuth providers (GitHub, Google), (2) Create user onboarding surveys that collect programming, robotics, and AI/ML experience levels, (3) Personalize documentation content based on user skill levels and interests, (4) Track user progress through learning modules, (5) Generate adaptive learning paths, or (6) Implement protected routes requiring authentication. Includes complete database schemas, React components for user profiling, and content personalization patterns.
---

# Docusaurus Auth & Personalization

Integrate Better Auth authentication and build personalized learning experiences in Docusaurus sites based on user backgrounds.

## Overview

This skill enables authentication and content personalization for Docusaurus documentation sites. It provides:

- **Better Auth Integration** - OAuth (GitHub, Google), email/password, session management
- **User Profiling** - Collect backgrounds: programming (Python, JS, C++), robotics (ROS, ROS 2), hardware, simulation tools, AI/ML
- **Content Personalization** - Adaptive content based on skill levels, hide/show prerequisites, personalized navigation
- **Progress Tracking** - Monitor user journey, completion status, time spent
- **Recommendation Engine** - Suggest relevant modules based on interests and progress

## Quick Start

### 1. Install Dependencies

```bash
bash scripts/setup_better_auth.sh
```

This installs:
- `better-auth` - Authentication framework
- `@better-auth/react` - React hooks
- `pg` - PostgreSQL client
- `drizzle-orm` - Database ORM
- OAuth provider packages

### 2. Configure Environment

Create `.env`:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
BETTER_AUTH_SECRET="min-32-char-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth credentials
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

**Get OAuth credentials:**
- GitHub: Settings → Developer settings → OAuth Apps
- Google: Cloud Console → APIs & Services → Credentials

### 3. Run Database Migrations

```bash
psql $DATABASE_URL -f scripts/create_auth_tables.sql
```

Creates tables:
- `users`, `sessions`, `accounts` (Better Auth core)
- `user_profiles` (background data)
- `user_content_preferences` (personalization settings)
- `user_progress` (learning tracking)

### 4. Set Up Better Auth

Copy `assets/auth.ts` to `src/lib/auth.ts` and customize as needed.

### 5. Add Onboarding Survey

Copy `assets/OnboardingSurvey.tsx` to `src/components/OnboardingSurvey.tsx`.

Use in a route:

```tsx
import OnboardingSurvey from '@site/src/components/OnboardingSurvey';

function OnboardingPage() {
  return <OnboardingSurvey />;
}
```

## Workflow

### Authentication Flow

1. **User visits site** → Shows login page if authentication required
2. **User signs in** → OAuth (GitHub/Google) or email/password
3. **First-time user** → Redirect to onboarding survey
4. **Survey completion** → Profile saved to `user_profiles` table
5. **Personalization applied** → Content adapted to user's background
6. **Progress tracked** → Visits, completions recorded in `user_progress`

### Content Personalization Flow

1. **Load user profile** → Query `user_profiles` and `user_content_preferences`
2. **Determine skill levels** → Calculate beginner/intermediate/advanced from profile
3. **Generate learning path** → Custom module sequence based on experience
4. **Render adaptive content** → Show/hide sections based on level
5. **Track engagement** → Record time spent, completion status
6. **Update recommendations** → Suggest next modules

## API Routes

### Session Management

**GET `/api/session`**
- Returns current user session
- Used to check authentication status

**POST `/api/auth/signin`**
- Initiate sign-in flow
- Supports OAuth and email/password

**POST `/api/auth/signout`**
- End user session
- Clears authentication cookies

### User Profile

**GET `/api/user/profile`**
- Fetch user's background profile
- Returns data from `user_profiles` table

**POST `/api/user/profile`**
- Save/update user profile
- Accepts survey responses

Example request:

```json
{
  "pythonLevel": "intermediate",
  "ros2Level": "beginner",
  "hasRobotExperience": false,
  "mlLevel": "advanced",
  "preferredLearningStyle": "hands-on",
  "interests": ["manipulation", "computer_vision"]
}
```

### Progress Tracking

**POST `/api/user/progress/visit`**
- Log page visit
- Track time spent

**POST `/api/user/progress/complete`**
- Mark module as completed
- Update learning path

**GET `/api/user/progress`**
- Get user's progress data
- Returns completed modules, recommendations

## Personalization Patterns

### Level-Based Content

Show content based on user's skill level:

```mdx
import { LevelContent } from '@site/src/components/PersonalizedContent';

<LevelContent level="beginner">
## What is ROS 2?
Basic introduction for beginners...
</LevelContent>

<LevelContent level="advanced">
## DDS Middleware Internals
Advanced concepts for experienced users...
</LevelContent>
```

### Conditional Prerequisites

Hide prerequisites if user already knows the topic:

```mdx
import { PrerequisiteWarning } from '@site/src/components/PersonalizedContent';

<PrerequisiteWarning module="ros2-advanced" />
```

Shows warning only if user's `ros2Level` is 'none' or 'beginner'.

### Skill-Based Tips

Show language-specific tips:

```mdx
import { SkillBasedTip } from '@site/src/components/PersonalizedContent';

<SkillBasedTip requiredSkill="pythonLevel">
**Python Tip:** Use type hints for better ROS 2 node interfaces...
</SkillBasedTip>
```

Only visible if `pythonLevel` is 'beginner' or 'none'.

### Adaptive Navigation

Generate personalized sidebar:

```typescript
// src/theme/DocSidebar/index.tsx
import { useUserProfile } from '@/hooks/useUserProfile';

const profile = useUserProfile();
const recommendedPath = generateLearningPath(profile);

// Show "Recommended for You" section
const sidebar = [
  {
    type: 'category',
    label: 'Recommended for You',
    items: recommendedPath.map(id => ({ type: 'doc', id }))
  },
  // ... rest of sidebar
];
```

### Progress Dashboard

Display learning progress:

```tsx
import { ProgressDashboard } from '@site/src/components/ProgressDashboard';

<ProgressDashboard />
```

Shows:
- Completion percentage
- Next recommended modules
- Estimated time to complete path

## Database Schema

### user_profiles

Stores user background information:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT | References `users.id` |
| `python_level` | TEXT | beginner/intermediate/advanced/expert |
| `ros2_level` | TEXT | none/beginner/intermediate/advanced/expert |
| `ml_level` | TEXT | AI/ML experience level |
| `has_robot_experience` | BOOLEAN | Physical robot experience |
| `robot_platforms` | TEXT[] | Array of platform names |
| `gazebo_experience` | BOOLEAN | Gazebo simulator experience |
| `isaac_sim_experience` | BOOLEAN | NVIDIA Isaac Sim experience |
| `preferred_learning_style` | TEXT | theory/hands-on/mixed |
| `interests` | TEXT[] | Array of topic interests |

### user_content_preferences

Controls content visibility:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT | References `users.id` |
| `show_beginner_content` | BOOLEAN | Display beginner sections |
| `show_intermediate_content` | BOOLEAN | Display intermediate sections |
| `show_advanced_content` | BOOLEAN | Display advanced sections |
| `recommended_modules` | TEXT[] | Personalized module list |
| `completed_modules` | TEXT[] | Finished modules |

### user_progress

Tracks engagement:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT | References `users.id` |
| `module_id` | TEXT | Module identifier |
| `page_id` | TEXT | Page identifier |
| `visited` | BOOLEAN | Page has been visited |
| `time_spent_seconds` | INTEGER | Seconds on page |
| `completed` | BOOLEAN | Module marked complete |
| `rating` | INTEGER | User rating (1-5) |

## Protected Routes

### Middleware Protection

Protect advanced content:

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth';

export async function middleware(req) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (req.nextUrl.pathname.startsWith('/docs/advanced') && !session) {
    return Response.redirect(new URL('/login', req.url));
  }
}
```

### Component-Level Protection

```tsx
import { useSession } from '@better-auth/react';

function ProtectedContent({ children }) {
  const { data: session, isLoading } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!session) return <LoginPrompt />;

  return <>{children}</>;
}
```

## Advanced Features

### Learning Path Generation

Automatically generate personalized paths:

```typescript
function generateLearningPath(profile: UserProfile): string[] {
  const path = ['introduction'];

  // Add fundamentals if needed
  if (profile.ros2Level === 'none' || profile.ros2Level === 'beginner') {
    path.push('ros2-fundamentals');
  }

  // Skip to advanced if experienced
  if (profile.ros2Level === 'advanced' || profile.ros2Level === 'expert') {
    path.push('ros2-advanced', 'distributed-systems');
  }

  // Add AI/ML modules if interested and experienced
  if (profile.mlLevel !== 'none' && profile.interests.includes('ai')) {
    path.push('ml-integration', 'vla-models');
  }

  // Hardware modules for users with robot experience
  if (profile.hasRobotExperience) {
    path.push('hardware-integration', 'deployment');
  }

  return path;
}
```

### Recommendation Engine

Content-based recommendations:

```typescript
function getRecommendations(
  profile: UserProfile,
  completedModules: string[]
): Module[] {
  const allModules = getAllModules();

  return allModules
    .filter(m => !completedModules.includes(m.id))
    .map(m => ({
      module: m,
      score: calculateRelevanceScore(m, profile)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ module }) => module);
}
```

### Adaptive Difficulty

Adjust based on performance:

```typescript
function getAdaptiveDifficulty(progress: UserProgress): 'easy' | 'medium' | 'hard' {
  const avgTime = calculateAverageTime(progress);
  const avgRating = calculateAverageRating(progress);

  // Fast + high rating = increase difficulty
  if (avgTime < 1800 && avgRating >= 4) return 'hard';

  // Slow + low rating = decrease difficulty
  if (avgTime > 3600 && avgRating < 3) return 'easy';

  return 'medium';
}
```

## Detailed References

For comprehensive implementation guides, see:

- **[better-auth-integration.md](references/better-auth-integration.md)** - Complete Better Auth setup, OAuth configuration, API routes, session management, troubleshooting
- **[personalization-patterns.md](references/personalization-patterns.md)** - Content personalization strategies, conditional rendering, progress tracking, recommendation algorithms

## Resources

### Scripts

- **setup_better_auth.sh** - Install all npm dependencies
- **create_auth_tables.sql** - Database schema migration

### Assets

- **auth.ts** - Better Auth configuration template
- **OnboardingSurvey.tsx** - User profiling questionnaire component

### References

- **better-auth-integration.md** - Authentication implementation guide (7k words)
- **personalization-patterns.md** - Content personalization patterns (4k words)

## Testing

### Test Authentication Flow

```bash
# Start dev server
npm run start

# Navigate to /login
# Click "Sign in with GitHub"
# Complete OAuth flow
# Verify redirect to onboarding if first-time user
```

### Test Profile Creation

```bash
# Submit profile via API
curl -X POST http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "pythonLevel": "intermediate",
    "ros2Level": "beginner",
    "mlLevel": "advanced"
  }'
```

### Test Personalization

1. Create user with beginner profile
2. Verify only beginner content visible
3. Create user with advanced profile
4. Verify advanced content visible, prerequisites hidden

## Production Checklist

- [ ] Set strong `BETTER_AUTH_SECRET` (min 32 chars)
- [ ] Configure production OAuth credentials
- [ ] Enable HTTPS and secure cookies
- [ ] Set up database backups
- [ ] Enable email verification
- [ ] Implement rate limiting on auth endpoints
- [ ] Monitor authentication metrics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Test protected routes
- [ ] Verify personalization works for all user types

## Troubleshooting

**"Database connection failed"**
- Verify `DATABASE_URL` format
- Check PostgreSQL is running
- Ensure SSL settings match environment

**"OAuth callback error"**
- Verify callback URLs match exactly
- Check CLIENT_ID and CLIENT_SECRET
- Ensure `NEXT_PUBLIC_APP_URL` is correct

**"Session not persisting"**
- Check `BETTER_AUTH_SECRET` is set
- Verify cookies are enabled
- Check `useSecureCookies` setting

**"Profile not saving"**
- Verify database tables exist
- Check API route is accessible
- Inspect browser console for errors

For detailed troubleshooting, see [better-auth-integration.md](references/better-auth-integration.md#troubleshooting).

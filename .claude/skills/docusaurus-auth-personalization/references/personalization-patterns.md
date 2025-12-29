# Content Personalization Patterns

Strategies for personalizing Docusaurus content based on user profiles and backgrounds.

## Table of Contents

1. [Personalization Strategies](#personalization-strategies)
2. [Conditional Content Rendering](#conditional-content-rendering)
3. [Adaptive Navigation](#adaptive-navigation)
4. [Progress Tracking](#progress-tracking)
5. [Recommendation Engine](#recommendation-engine)

## Personalization Strategies

### Level-Based Content Adaptation

Adjust content complexity based on user's experience level:

```typescript
interface ContentLevel {
  beginner: boolean;
  intermediate: boolean;
  advanced: boolean;
}

function getContentLevels(profile: UserProfile): ContentLevel {
  // Calculate overall level based on multiple factors
  const levels = [
    profile.pythonLevel,
    profile.ros2Level,
    profile.mlLevel,
  ].filter(l => l && l !== 'none');

  const hasAdvanced = levels.some(l => l === 'advanced' || l === 'expert');
  const hasIntermediate = levels.some(l => l === 'intermediate' || l === 'advanced' || l === 'expert');

  return {
    beginner: !hasIntermediate,
    intermediate: hasIntermediate && !hasAdvanced,
    advanced: hasAdvanced,
  };
}
```

### Prerequisite Detection

Hide or show prerequisites based on user knowledge:

```typescript
function shouldShowPrerequisites(profile: UserProfile, module: string): boolean {
  const prereqMap = {
    'ros2-advanced': profile.ros2Level === 'none' || profile.ros2Level === 'beginner',
    'ml-integration': profile.mlLevel === 'none',
    'cpp-optimization': profile.cppLevel === 'beginner',
  };

  return prereqMap[module] ?? false;
}
```

### Learning Path Customization

Generate personalized learning paths:

```typescript
function generateLearningPath(profile: UserProfile): string[] {
  const path: string[] = ['introduction']; // Always start here

  // Add modules based on experience
  if (profile.ros2Level === 'none' || profile.ros2Level === 'beginner') {
    path.push('ros2-fundamentals', 'ros2-intermediate');
  }

  // Skip basics if user has experience
  if (profile.ros2Level === 'intermediate' || profile.ros2Level === 'advanced') {
    path.push('ros2-advanced', 'distributed-systems');
  }

  // Add simulation based on tools experience
  if (!profile.gazeboExperience && !profile.isaacSimExperience) {
    path.push('simulation-basics');
  } else if (profile.isaacSimExperience) {
    path.push('isaac-advanced');
  }

  // AI/ML content
  if (profile.mlLevel !== 'none') {
    path.push('ml-integration', 'vla-models');
  }

  // Hardware-specific content
  if (profile.hasRobotExperience) {
    path.push('hardware-integration', 'real-world-deployment');
  }

  return path;
}
```

## Conditional Content Rendering

### MDX Custom Components

Create personalized MDX components:

```tsx
// src/components/PersonalizedContent.tsx
import { useUserProfile } from '@/hooks/useUserProfile';

export function LevelContent({ level, children }) {
  const profile = useUserProfile();
  const levels = getContentLevels(profile);

  if (!levels[level]) return null;

  return <div className="level-content">{children}</div>;
}

export function PrerequisiteWarning({ module }) {
  const profile = useUserProfile();

  if (!shouldShowPrerequisites(profile, module)) return null;

  return (
    <div className="alert alert-warning">
      <h4>Prerequisites Recommended</h4>
      <p>Consider completing the fundamentals modules first for better understanding.</p>
    </div>
  );
}

export function SkillBasedTip({ requiredSkill, children }) {
  const profile = useUserProfile();

  if (profile[requiredSkill] === 'none' || profile[requiredSkill] === 'beginner') {
    return <div className="tip tip-info">{children}</div>;
  }

  return null;
}
```

### Usage in MDX

```mdx
---
title: Advanced ROS 2 Patterns
---

import { LevelContent, PrerequisiteWarning, SkillBasedTip } from '@site/src/components/PersonalizedContent';

<PrerequisiteWarning module="ros2-advanced" />

<LevelContent level="beginner">

## What is ROS 2?

ROS 2 (Robot Operating System 2) is a set of software libraries and tools...

</LevelContent>

<LevelContent level="intermediate">

## Advanced Communication Patterns

DDS middleware provides Quality of Service (QoS) configurations...

</LevelContent>

<SkillBasedTip requiredSkill="pythonLevel">

**Python Tip:** You can use type hints to make your ROS 2 nodes more robust...

</SkillBasedTip>
```

## Adaptive Navigation

### Personalized Sidebar

Generate custom sidebar based on user profile:

```typescript
// src/theme/DocSidebar/index.tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function PersonalizedDocSidebar() {
  const profile = useUserProfile();
  const recommendedModules = generateLearningPath(profile);

  const sidebarItems = [
    {
      type: 'category',
      label: 'Recommended for You',
      items: recommendedModules.map(id => ({
        type: 'doc',
        id,
        label: getModuleLabel(id),
      })),
    },
    {
      type: 'category',
      label: 'All Modules',
      items: allModules,
    },
  ];

  return <DocSidebar items={sidebarItems} />;
}
```

### Dynamic Module Visibility

Hide/show modules based on prerequisites:

```typescript
function filterModulesByPrerequisites(
  modules: Module[],
  profile: UserProfile
): Module[] {
  return modules.filter(module => {
    if (!module.prerequisites) return true;

    return module.prerequisites.every(prereq => {
      const userLevel = profile[`${prereq}Level`];
      return userLevel && userLevel !== 'none';
    });
  });
}
```

### Progress-Based Navigation

Show "Next Recommended" based on progress:

```typescript
function getNextRecommendedModule(
  completedModules: string[],
  profile: UserProfile
): string | null {
  const learningPath = generateLearningPath(profile);

  for (const moduleId of learningPath) {
    if (!completedModules.includes(moduleId)) {
      return moduleId;
    }
  }

  return null;
}
```

## Progress Tracking

### Track Page Visits

```typescript
// src/hooks/usePageTracking.ts
import { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      await fetch('/api/user/progress/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });
    };

    trackVisit();
  }, [location.pathname]);
}
```

### Mark Modules Complete

```typescript
export function useModuleCompletion() {
  const markComplete = async (moduleId: string) => {
    await fetch('/api/user/progress/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId,
        completedAt: new Date().toISOString(),
      }),
    });
  };

  return { markComplete };
}
```

### Progress Dashboard Component

```tsx
function ProgressDashboard() {
  const profile = useUserProfile();
  const progress = useUserProgress();
  const learningPath = generateLearningPath(profile);

  const completedCount = progress.completedModules.length;
  const totalCount = learningPath.length;
  const percentage = (completedCount / totalCount) * 100;

  return (
    <div className="progress-dashboard">
      <h2>Your Learning Progress</h2>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p>
        {completedCount} of {totalCount} modules completed ({percentage.toFixed(0)}%)
      </p>

      <h3>Recommended Next Steps</h3>
      <ul>
        {learningPath
          .filter(id => !progress.completedModules.includes(id))
          .slice(0, 3)
          .map(id => (
            <li key={id}>
              <a href={`/docs/${id}`}>{getModuleLabel(id)}</a>
            </li>
          ))}
      </ul>
    </div>
  );
}
```

## Recommendation Engine

### Content-Based Recommendations

Recommend modules based on interests and completed modules:

```typescript
function getRecommendations(
  profile: UserProfile,
  completedModules: string[],
  allModules: Module[]
): Module[] {
  const scores = allModules.map(module => {
    let score = 0;

    // Interest alignment
    const matchingInterests = module.topics.filter(topic =>
      profile.interests.includes(topic)
    );
    score += matchingInterests.length * 3;

    // Level appropriateness
    const levels = getContentLevels(profile);
    if (module.level === 'beginner' && levels.beginner) score += 2;
    if (module.level === 'intermediate' && levels.intermediate) score += 2;
    if (module.level === 'advanced' && levels.advanced) score += 2;

    // Prerequisites met
    const prereqsMet = module.prerequisites?.every(prereq =>
      completedModules.some(id => id.includes(prereq))
    ) ?? true;
    if (prereqsMet) score += 5;

    // Already completed
    if (completedModules.includes(module.id)) score = 0;

    return { module, score };
  });

  return scores
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ module }) => module);
}
```

### Collaborative Filtering

Recommend based on what similar users completed:

```typescript
async function getCollaborativeRecommendations(
  userId: string
): Promise<string[]> {
  // Find users with similar profiles
  const similarUsers = await pool.query(`
    SELECT u.user_id,
           COUNT(CASE WHEN u.completed_modules && $2 THEN 1 END) as overlap
    FROM user_content_preferences u
    WHERE u.user_id != $1
      AND u.python_level = (SELECT python_level FROM user_profiles WHERE user_id = $1)
      AND u.ros2_level = (SELECT ros2_level FROM user_profiles WHERE user_id = $1)
    ORDER BY overlap DESC
    LIMIT 10
  `, [userId, completedModules]);

  // Get modules they completed that current user hasn't
  const recommendations = await pool.query(`
    SELECT DISTINCT unnest(completed_modules) as module_id,
           COUNT(*) as frequency
    FROM user_content_preferences
    WHERE user_id = ANY($1)
      AND NOT (completed_modules && $2)
    GROUP BY module_id
    ORDER BY frequency DESC
    LIMIT 5
  `, [similarUsers.rows.map(u => u.user_id), completedModules]);

  return recommendations.rows.map(r => r.module_id);
}
```

### Adaptive Difficulty

Adjust content difficulty based on user performance:

```typescript
function getAdaptiveDifficulty(progress: UserProgress): 'easy' | 'medium' | 'hard' {
  const recentModules = progress.completedModules.slice(-5);
  const avgTimeSpent = recentModules.reduce((sum, moduleId) => {
    const time = progress.timeSpent[moduleId] || 0;
    return sum + time;
  }, 0) / recentModules.length;

  const avgRating = recentModules.reduce((sum, moduleId) => {
    const rating = progress.ratings[moduleId] || 3;
    return sum + rating;
  }, 0) / recentModules.length;

  // Fast completion + high rating = increase difficulty
  if (avgTimeSpent < 1800 && avgRating >= 4) return 'hard';

  // Slow completion + low rating = decrease difficulty
  if (avgTimeSpent > 3600 && avgRating < 3) return 'easy';

  return 'medium';
}
```

## Implementation Checklist

- [ ] Create user profile schema
- [ ] Implement profile collection flow
- [ ] Build conditional content components
- [ ] Set up progress tracking
- [ ] Create personalized sidebar
- [ ] Implement recommendation engine
- [ ] Add progress dashboard
- [ ] Test with different user profiles
- [ ] Monitor personalization effectiveness
- [ ] Iterate based on user feedback

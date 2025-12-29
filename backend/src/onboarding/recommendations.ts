import { UserProfileData } from '../db/schema';

// ============================================================================
// Recommendation Types
// ============================================================================

export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  url?: string;
}

export interface RecommendationsResult {
  id: string;
  title: string;
  matchScore: number;
  reason: string;
  category: string;
}

// ============================================================================
// Content Database (sample recommendations)
// ============================================================================

const CONTENT_DATABASE: ContentRecommendation[] = [
  // Python-focused content
  {
    id: 'python-basics',
    title: 'Python Fundamentals for Robotics',
    description: 'Learn Python programming basics with robotics examples',
    category: 'programming',
    difficulty: 'beginner',
    tags: ['python', 'programming', 'basics'],
    url: '/docs/python-basics',
  },
  {
    id: 'python-intermediate',
    title: 'Intermediate Python for Robotics',
    description: 'OOP, decorators, and advanced Python patterns',
    category: 'programming',
    difficulty: 'intermediate',
    tags: ['python', 'programming', 'oop'],
    url: '/docs/python-intermediate',
  },
  {
    id: 'ros2-python',
    title: 'ROS 2 with Python',
    description: 'Build robotics applications using ROS 2 and Python',
    category: 'robotics',
    difficulty: 'intermediate',
    tags: ['ros2', 'python', 'robotics'],
    url: '/docs/ros2-python',
  },

  // C++ focused content
  {
    id: 'cpp-basics',
    title: 'C++ Fundamentals for Robotics',
    description: 'Learn C++ programming for performance-critical robotics',
    category: 'programming',
    difficulty: 'beginner',
    tags: ['cpp', 'programming', 'performance'],
    url: '/docs/cpp-basics',
  },
  {
    id: 'cpp-ros',
    title: 'ROS 2 with C++',
    description: 'Build high-performance robotics applications with ROS 2 and C++',
    category: 'robotics',
    difficulty: 'advanced',
    tags: ['ros2', 'cpp', 'performance'],
    url: '/docs/ros2-cpp',
  },

  // Hardware/Robotics content
  {
    id: 'robotics-intro',
    title: 'Introduction to Robotics',
    description: 'Core concepts in robotics: kinematics, dynamics, control',
    category: 'robotics',
    difficulty: 'beginner',
    tags: ['robotics', 'kinematics', 'control'],
    url: '/docs/robotics-intro',
  },
  {
    id: 'turtlebot',
    title: 'TurtleBot 3 Development',
    description: 'Practical robot development with TurtleBot 3',
    category: 'robotics',
    difficulty: 'intermediate',
    tags: ['turtlebot', 'ros2', 'hardware'],
    url: '/docs/turtlebot',
  },
  {
    id: 'fetch-robot',
    title: 'Fetch Robot Programming',
    description: 'Programming mobile manipulation robots',
    category: 'robotics',
    difficulty: 'advanced',
    tags: ['fetch', 'mobile-manipulation', 'ros'],
    url: '/docs/fetch-robot',
  },
  {
    id: 'ur5-programming',
    title: 'UR5 Arm Programming',
    description: 'Industrial robot arm programming and control',
    category: 'robotics',
    difficulty: 'advanced',
    tags: ['ur5', 'industrial', 'manipulation'],
    url: '/docs/ur5',
  },

  // AI/ML content
  {
    id: 'ml-intro',
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to ML algorithms and concepts',
    category: 'ai-ml',
    difficulty: 'beginner',
    tags: ['machine-learning', 'fundamentals'],
    url: '/docs/ml-intro',
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning for Robotics',
    description: 'Neural networks and deep learning applications',
    category: 'ai-ml',
    difficulty: 'intermediate',
    tags: ['deep-learning', 'neural-networks'],
    url: '/docs/deep-learning',
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision for Robots',
    description: 'Image processing and vision-based robotics',
    category: 'ai-ml',
    difficulty: 'intermediate',
    tags: ['computer-vision', 'opencv', 'vision'],
    url: '/docs/computer-vision',
  },
  {
    id: 'llm-robotics',
    title: 'Large Language Models in Robotics',
    description: 'Using LLMs for natural language robot control',
    category: 'ai-ml',
    difficulty: 'advanced',
    tags: ['llm', 'nlp', 'natural-language'],
    url: '/docs/llm-robotics',
  },
  {
    id: 'rl-robotics',
    title: 'Reinforcement Learning for Robotics',
    description: 'Training robots with RL algorithms',
    category: 'ai-ml',
    difficulty: 'expert',
    tags: ['reinforcement-learning', 'rl', 'training'],
    url: '/docs/rl-robotics',
  },

  // Interest-specific content
  {
    id: 'healthtech-robotics',
    title: 'Medical Robotics',
    description: 'Robotics in healthcare and surgery',
    category: 'healthtech',
    difficulty: 'advanced',
    tags: ['medical', 'healthcare', 'surgery'],
    url: '/docs/medical-robotics',
  },
  {
    id: 'robot-security',
    title: 'Robot Cybersecurity',
    description: 'Securing robots from cyber threats',
    category: 'cybersecurity',
    difficulty: 'advanced',
    tags: ['security', 'cybersecurity', 'safety'],
    url: '/docs/robot-security',
  },
  {
    id: 'autonomous-vehicles',
    title: 'Autonomous Vehicle Systems',
    description: 'Self-driving car technology and implementation',
    category: 'autonomous-vehicles',
    difficulty: 'expert',
    tags: ['autonomous', 'self-driving', 'vehicles'],
    url: '/docs/autonomous-vehicles',
  },
  {
    id: 'humanoid-robots',
    title: 'Humanoid Robot Development',
    description: 'Building and programming humanoid robots',
    category: 'humanoid-robots',
    difficulty: 'expert',
    tags: ['humanoid', 'bipedal', 'dexterous'],
    url: '/docs/humanoid-robots',
  },
];

// ============================================================================
// Recommendation Engine
// ============================================================================

export function generateRecommendations(profile: UserProfileData): RecommendationsResult[] {
  const recommendations: Array<RecommendationsResult & { score: number }> = [];

  // Score based on software skills
  if (profile.softwareSkills) {
    for (const [skill, level] of Object.entries(profile.softwareSkills)) {
      if (level && level !== 'none') {
        const baseScore = getLevelScore(level);

        // Find matching content
        for (const content of CONTENT_DATABASE) {
          if (content.tags.includes(skill.toLowerCase()) ||
              (skill.toLowerCase() === 'cpp' && content.tags.includes('cpp')) ||
              (skill.toLowerCase() === 'python' && content.tags.includes('python'))) {
            const difficultyMatch = getDifficultyMatch(baseScore, content.difficulty);
            const existing = recommendations.find(r => r.id === content.id);

            if (existing) {
              existing.score = Math.max(existing.score, difficultyMatch);
              existing.reason = `${existing.reason}, ${skill} experience`;
            } else {
              recommendations.push({
                id: content.id,
                title: content.title,
                matchScore: difficultyMatch,
                reason: `Based on your ${skill} experience (${level})`,
                category: content.category,
              });
            }
          }
        }
      }
    }
  }

  // Score based on hardware experience
  if (profile.hardwareExperience?.hasRobotExperience) {
    for (const content of CONTENT_DATABASE) {
      if (content.category === 'robotics') {
        const existing = recommendations.find(r => r.id === content.id);
        if (!existing) {
          recommendations.push({
            id: content.id,
            title: content.title,
            matchScore: 85,
            reason: 'Based on your robotics experience',
            category: content.category,
          });
        }
      }
    }
  }

  // Score based on ROS experience
  if (profile.hardwareExperience?.rosExperience &&
      profile.hardwareExperience.rosExperience !== 'none') {
    const rosLevel = profile.hardwareExperience.rosExperience;
    const rosContent = CONTENT_DATABASE.filter(c => c.tags.includes('ros') || c.tags.includes('ros2'));

    for (const content of rosContent) {
      const existing = recommendations.find(r => r.id === content.id);
      const difficultyScore = getLevelScore(rosLevel);

      if (existing) {
        existing.score = Math.max(existing.score, difficultyScore);
      } else {
        recommendations.push({
          id: content.id,
          title: content.title,
          matchScore: difficultyScore,
          reason: `Based on your ROS ${rosLevel} experience`,
          category: content.category,
        });
      }
    }
  }

  // Score based on ML background
  if (profile.mlBackground?.mlLevel && profile.mlBackground.mlLevel !== 'none') {
    const mlLevel = profile.mlBackground.mlLevel;
    const mlContent = CONTENT_DATABASE.filter(c => c.category === 'ai-ml');

    for (const content of mlContent) {
      const existing = recommendations.find(r => r.id === content.id);
      const difficultyScore = getLevelScore(mlLevel);

      if (existing) {
        existing.score = Math.max(existing.score, difficultyScore);
      } else {
        recommendations.push({
          id: content.id,
          title: content.title,
          matchScore: difficultyScore,
          reason: `Based on your ML background (${mlLevel})`,
          category: content.category,
        });
      }
    }
  }

  // LLM experience boost
  if (profile.mlBackground?.hasLlmExperience) {
    const llmContent = CONTENT_DATABASE.filter(c => c.tags.includes('llm'));
    for (const content of llmContent) {
      const existing = recommendations.find(r => r.id === content.id);
      if (!existing) {
        recommendations.push({
          id: content.id,
          title: content.title,
          matchScore: 95,
          reason: 'Based on your LLM experience',
          category: content.category,
        });
      }
    }
  }

  // CV experience boost
  if (profile.mlBackground?.hasCvExperience) {
    const cvContent = CONTENT_DATABASE.filter(c => c.tags.includes('computer-vision'));
    for (const content of cvContent) {
      const existing = recommendations.find(r => r.id === content.id);
      if (!existing) {
        recommendations.push({
          id: content.id,
          title: content.title,
          matchScore: 90,
          reason: 'Based on your computer vision experience',
          category: content.category,
        });
      }
    }
  }

  // Score based on interests
  if (profile.interests && profile.interests.length > 0) {
    for (const interest of profile.interests) {
      const interestContent = CONTENT_DATABASE.filter(c =>
        c.tags.includes(interest) || c.category === interest
      );

      for (const content of interestContent) {
        const existing = recommendations.find(r => r.id === content.id);
        if (!existing) {
          recommendations.push({
            id: content.id,
            title: content.title,
            matchScore: 80,
            reason: `Based on your interest in ${interest}`,
            category: content.category,
          });
        }
      }
    }
  }

  // Adjust scores based on learning style
  if (profile.learningStyle) {
    // Learning style doesn't significantly change scores,
    // but could be used for content format recommendations
  }

  // Sort by score and return top 5
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ score, ...rest }) => ({
      ...rest,
      matchScore: Math.round(score),
    }));
}

// ============================================================================
// Helper Functions
// ============================================================================

function getLevelScore(level: string): number {
  const scores: Record<string, number> = {
    none: 0,
    beginner: 60,
    intermediate: 75,
    advanced: 90,
    expert: 100,
  };
  return scores[level] || 50;
}

function getDifficultyMatch(userLevel: number, contentDifficulty: string): number {
  const difficultyLevels: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };

  const contentLevel = difficultyLevels[contentDifficulty] || 50;

  // Perfect match is when user level slightly exceeds content difficulty
  if (userLevel >= contentLevel) {
    return Math.min(100, userLevel + 5);
  }

  // If content is harder, reduce score
  return Math.max(40, userLevel - (contentLevel - userLevel) / 2);
}

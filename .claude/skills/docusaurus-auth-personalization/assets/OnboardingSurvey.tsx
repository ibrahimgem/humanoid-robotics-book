/**
 * Onboarding Survey Component
 *
 * Collects user background information for content personalization:
 * - Programming experience (Python, JavaScript, C++)
 * - Robotics background (ROS, ROS 2)
 * - Hardware experience
 * - Simulation tools
 * - AI/ML background
 * - Learning preferences
 */

import React, { useState } from 'react';

interface UserProfile {
  // Programming background
  pythonLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  javascriptLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  cppLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  // Robotics background
  rosLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  ros2Level: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

  // Hardware experience
  hasRobotExperience: boolean;
  robotPlatforms: string[];

  // Simulation tools
  gazeboExperience: boolean;
  isaacSimExperience: boolean;
  unityRoboticsExperience: boolean;

  // AI/ML background
  mlLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  hasLlmExperience: boolean;
  hasCvExperience: boolean;

  // Learning preferences
  preferredLearningStyle: 'theory' | 'hands-on' | 'mixed';
  interests: string[];
}

const OnboardingSurvey: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        // Redirect to personalized content
        window.location.href = '/docs/introduction';
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const steps = [
    {
      title: 'Programming Experience',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">What's your programming background?</h2>

          <div className="space-y-4">
            <LevelSelector
              label="Python"
              value={profile.pythonLevel}
              onChange={(val) => updateProfile('pythonLevel', val)}
            />
            <LevelSelector
              label="JavaScript/TypeScript"
              value={profile.javascriptLevel}
              onChange={(val) => updateProfile('javascriptLevel', val)}
            />
            <LevelSelector
              label="C++"
              value={profile.cppLevel}
              onChange={(val) => updateProfile('cppLevel', val)}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Robotics Background',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Tell us about your robotics experience</h2>

          <div className="space-y-4">
            <LevelSelector
              label="ROS (Robot Operating System)"
              value={profile.rosLevel}
              onChange={(val) => updateProfile('rosLevel', val)}
              includeNone
            />
            <LevelSelector
              label="ROS 2"
              value={profile.ros2Level}
              onChange={(val) => updateProfile('ros2Level', val)}
              includeNone
            />

            <div className="mt-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.hasRobotExperience || false}
                  onChange={(e) => updateProfile('hasRobotExperience', e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg">I have hands-on robot experience</span>
              </label>
            </div>

            {profile.hasRobotExperience && (
              <MultiSelect
                label="Which robot platforms have you worked with?"
                options={[
                  'TurtleBot',
                  'Fetch',
                  'PR2',
                  'UR5/UR10',
                  'ABB',
                  'Boston Dynamics (Spot/Atlas)',
                  'Humanoid (NAO, Pepper, etc.)',
                  'Custom/DIY',
                ]}
                selected={profile.robotPlatforms || []}
                onChange={(val) => updateProfile('robotPlatforms', val)}
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Simulation & AI',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Simulation Tools & AI Experience</h2>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Simulation Platforms</h3>
            <CheckboxGroup
              options={[
                { label: 'Gazebo', key: 'gazeboExperience' },
                { label: 'NVIDIA Isaac Sim', key: 'isaacSimExperience' },
                { label: 'Unity Robotics', key: 'unityRoboticsExperience' },
              ]}
              values={profile}
              onChange={updateProfile}
            />

            <h3 className="text-xl font-semibold mt-6">AI/ML Background</h3>
            <LevelSelector
              label="Machine Learning"
              value={profile.mlLevel}
              onChange={(val) => updateProfile('mlLevel', val)}
              includeNone
            />

            <CheckboxGroup
              options={[
                { label: 'Experience with LLMs (GPT, Claude, etc.)', key: 'hasLlmExperience' },
                { label: 'Computer Vision experience', key: 'hasCvExperience' },
              ]}
              values={profile}
              onChange={updateProfile}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Learning Preferences',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">How do you prefer to learn?</h2>

          <div className="space-y-4">
            <RadioGroup
              label="Learning Style"
              options={[
                { value: 'theory', label: 'Theory first, then practice' },
                { value: 'hands-on', label: 'Hands-on practice first, theory as needed' },
                { value: 'mixed', label: 'Mix of both equally' },
              ]}
              selected={profile.preferredLearningStyle}
              onChange={(val) => updateProfile('preferredLearningStyle', val)}
            />

            <MultiSelect
              label="What topics interest you most?"
              options={[
                'Manipulation & Grasping',
                'Navigation & Path Planning',
                'Computer Vision',
                'Natural Language Processing',
                'Reinforcement Learning',
                'Sim-to-Real Transfer',
                'Humanoid Locomotion',
                'Multi-Robot Systems',
              ]}
              selected={profile.interests || []}
              onChange={(val) => updateProfile('interests', val)}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`text-sm ${idx <= currentStep ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}
            >
              {step.title}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current step content */}
      <div className="min-h-[400px]">{steps[currentStep].content}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Complete Profile
          </button>
        )}
      </div>
    </div>
  );
};

// Helper components
const LevelSelector: React.FC<{
  label: string;
  value?: string;
  onChange: (val: string) => void;
  includeNone?: boolean;
}> = ({ label, value, onChange, includeNone }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="flex gap-2">
      {includeNone && (
        <button
          onClick={() => onChange('none')}
          className={`px-4 py-2 rounded ${value === 'none' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          None
        </button>
      )}
      {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={`px-4 py-2 rounded ${value === level ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
    </div>
  </div>
);

const MultiSelect: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}> = ({ label, options, selected, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <label key={option} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, option]);
              } else {
                onChange(selected.filter((s) => s !== option));
              }
            }}
            className="w-4 h-4 text-blue-600"
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const CheckboxGroup: React.FC<{
  options: { label: string; key: string }[];
  values: any;
  onChange: (key: string, val: boolean) => void;
}> = ({ options, values, onChange }) => (
  <div className="space-y-2">
    {options.map(({ label, key }) => (
      <label key={key} className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={values[key] || false}
          onChange={(e) => onChange(key, e.target.checked)}
          className="w-5 h-5 text-blue-600"
        />
        <span>{label}</span>
      </label>
    ))}
  </div>
);

const RadioGroup: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  selected?: string;
  onChange: (val: string) => void;
}> = ({ label, options, selected, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="space-y-2">
      {options.map(({ value, label }) => (
        <label key={value} className="flex items-center space-x-3">
          <input
            type="radio"
            checked={selected === value}
            onChange={() => onChange(value)}
            className="w-5 h-5 text-blue-600"
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default OnboardingSurvey;

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FormData {
  softwareSkills: string;
  hardwareExperience: string;
  mlBackground: string;
  interests: string[];
}

interface OnboardingQuestionnaireProps {
  onComplete?: (data: FormData) => void;
  onError?: (error: string) => void;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ onComplete, onError }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    softwareSkills: '',
    hardwareExperience: '',
    mlBackground: '',
    interests: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;
  const interestsOptions = [
    'Humanoid Robotics',
    'AI & Machine Learning',
    'Computer Vision',
    'Robotics Control Systems',
    'ROS (Robot Operating System)',
    'Physical AI',
    'Bipedal Locomotion',
    'Reinforcement Learning',
    'Computer Vision',
    'Natural Language Processing',
    'Motion Planning',
    'Sensor Fusion'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.softwareSkills.trim()) {
          newErrors.softwareSkills = 'Please describe your software skills';
        }
        break;
      case 2:
        if (!formData.hardwareExperience.trim()) {
          newErrors.hardwareExperience = 'Please describe your hardware experience';
        }
        break;
      case 3:
        if (!formData.mlBackground.trim()) {
          newErrors.mlBackground = 'Please describe your ML background';
        }
        break;
      case 4:
        if (formData.interests.length === 0) {
          newErrors.interests = 'Please select at least one interest';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof errors];
        return newErrors;
      });
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];

      return {
        ...prev,
        interests: newInterests
      };
    });
    // Clear error when user selects an interest
    if (errors.interests) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.interests;
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Call backend API to save onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onComplete?.(formData);
      } else {
        onError?.(data.error || 'Failed to save onboarding data');
      }
    } catch (error) {
      onError?.('An error occurred while saving onboarding data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Software Skills';
      case 2: return 'Hardware Experience';
      case 3: return 'ML Background';
      case 4: return 'Your Interests';
      default: return '';
    }
  };

  const getStepSubtitle = (step: number) => {
    switch (step) {
      case 1: return 'Tell us about your programming and software development experience';
      case 2: return 'Describe your experience with hardware and electronics';
      case 3: return 'Share your background in machine learning and AI';
      case 4: return 'Select the topics that interest you most';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <label htmlFor="softwareSkills" className="block text-sm font-medium text-gray-300 mb-2">
              Your Software Skills
            </label>
            <textarea
              id="softwareSkills"
              value={formData.softwareSkills}
              onChange={(e) => handleInputChange('softwareSkills', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.softwareSkills
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'
              }`}
              rows={4}
              placeholder="Describe your programming languages, frameworks, tools, and development experience..."
            />
            {errors.softwareSkills && (
              <p className="mt-1 text-sm text-red-400">{errors.softwareSkills}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <label htmlFor="hardwareExperience" className="block text-sm font-medium text-gray-300 mb-2">
              Your Hardware Experience
            </label>
            <textarea
              id="hardwareExperience"
              value={formData.hardwareExperience}
              onChange={(e) => handleInputChange('hardwareExperience', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.hardwareExperience
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'
              }`}
              rows={4}
              placeholder="Describe your experience with electronics, robotics, sensors, microcontrollers, etc..."
            />
            {errors.hardwareExperience && (
              <p className="mt-1 text-sm text-red-400">{errors.hardwareExperience}</p>
            )}
          </div>
        );
      case 3:
        return (
          <div>
            <label htmlFor="mlBackground" className="block text-sm font-medium text-gray-300 mb-2">
              Your ML Background
            </label>
            <textarea
              id="mlBackground"
              value={formData.mlBackground}
              onChange={(e) => handleInputChange('mlBackground', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.mlBackground
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-cyan-500 focus:border-cyan-500'
              }`}
              rows={4}
              placeholder="Describe your experience with machine learning, neural networks, deep learning, etc..."
            />
            {errors.mlBackground && (
              <p className="mt-1 text-sm text-red-400">{errors.mlBackground}</p>
            )}
          </div>
        );
      case 4:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Select Your Interests
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {interestsOptions.map((interest) => (
                <label
                  key={interest}
                  className="flex items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-500 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => toggleInterest(interest)}
                    className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700"
                  />
                  <span className="ml-3 text-gray-300">{interest}</span>
                </label>
              ))}
            </div>
            {errors.interests && (
              <p className="mt-2 text-sm text-red-400">{errors.interests}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {getStepTitle(currentStep)}
          </h2>
          <p className="text-gray-400 mb-6">
            {getStepSubtitle(currentStep)}
          </p>

          {/* Progress bar */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-cyan-500 border-cyan-500 text-white'
                        : 'bg-gray-800 border-gray-600 text-gray-400'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`h-1 w-16 transition-all duration-300 ${
                        step < currentStep ? 'bg-cyan-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 1
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30'
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {currentStep === totalSteps ? 'Saving...' : 'Next'}
              </div>
            ) : currentStep === totalSteps ? (
              'Complete Onboarding'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingQuestionnaire;
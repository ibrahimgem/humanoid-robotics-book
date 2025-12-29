import React, { useState } from 'react';
import { SignupButton, SigninButton, AuthButtons } from '../buttons';

const AuthButtonsDemo: React.FC = () => {
  const [loadingState, setLoadingState] = useState<'none' | 'signup' | 'signin'>('none');

  const handleSignup = () => {
    setLoadingState('signup');
    setTimeout(() => {
      setLoadingState('none');
      alert('Signup clicked!');
    }, 2000);
  };

  const handleSignin = () => {
    setLoadingState('signin');
    setTimeout(() => {
      setLoadingState('none');
      alert('Signin clicked!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Auth Buttons Demo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Individual Buttons */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Individual Buttons</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg mb-2">Primary Variant</h3>
                <div className="flex gap-4">
                  <SignupButton onClick={handleSignup} loading={loadingState === 'signup'} />
                  <SigninButton onClick={handleSignin} loading={loadingState === 'signin'} />
                </div>
              </div>

              <div>
                <h3 className="text-lg mb-2">Secondary Variant</h3>
                <div className="flex gap-4">
                  <SignupButton variant="secondary" onClick={handleSignup} />
                  <SigninButton variant="secondary" onClick={handleSignin} />
                </div>
              </div>

              <div>
                <h3 className="text-lg mb-2">Ghost Variant</h3>
                <div className="flex gap-4">
                  <SignupButton variant="ghost" onClick={handleSignup} />
                  <SigninButton variant="ghost" onClick={handleSignin} />
                </div>
              </div>
            </div>
          </div>

          {/* Combined Buttons */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Combined Auth Buttons</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-2">Primary Variant</h3>
                <AuthButtons
                  onSignupClick={handleSignup}
                  onSigninClick={handleSignin}
                  variant="primary"
                  loading={loadingState !== 'none'}
                />
              </div>

              <div>
                <h3 className="text-lg mb-2">Secondary Variant</h3>
                <AuthButtons
                  onSignupClick={handleSignup}
                  onSigninClick={handleSignin}
                  variant="secondary"
                />
              </div>

              <div>
                <h3 className="text-lg mb-2">Ghost Variant</h3>
                <AuthButtons
                  onSignupClick={handleSignup}
                  onSigninClick={handleSignin}
                  variant="ghost"
                />
              </div>

              <div>
                <h3 className="text-lg mb-2">Different Sizes</h3>
                <div className="space-y-4">
                  <AuthButtons
                    onSignupClick={handleSignup}
                    onSigninClick={handleSignin}
                    size="sm"
                  />
                  <AuthButtons
                    onSignupClick={handleSignup}
                    onSigninClick={handleSignin}
                    size="md"
                  />
                  <AuthButtons
                    onSignupClick={handleSignup}
                    onSigninClick={handleSignin}
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthButtonsDemo;
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { login, register, loginWithGoogle } from '../services/authService';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
  onClose: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, onClose }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Reset form when component mounts
  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setAuthError('');
    setAuthMode('login');
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        if (password !== confirmPassword) {
          setAuthError('Passwords do not match');
          setAuthLoading(false);
          return;
        }

        if (password.length < 8) {
          setAuthError('Password must be at least 8 characters long');
          setAuthLoading(false);
          return;
        }

        const response = await register({
          email,
          password1: password,
          password2: confirmPassword,
          first_name: firstName,
          last_name: lastName,
        });

        onAuthSuccess(response.user);
      } else {
        const response = await login({ email, password });
        onAuthSuccess(response.user);
      }

      onClose();
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);

    try {
      await loginWithGoogle();

    } catch (error: any) {
      setAuthError(error.message || 'Google login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setAuthError('');
  };

  return (
    <div>
      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={authLoading}
        className="w-full mb-4 flex items-center cursor-pointer justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {authLoading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="flex items-center mb-4">
        <hr className="flex-1 border-gray-300" />
        <span className="px-3 text-gray-500 text-sm">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* Error Message */}
      {authError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {authError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {/* Name Fields for Registration */}
        {authMode === 'register' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Confirm Password Field for Registration */}
        {authMode === 'register' && (
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={authLoading}
          className="w-full cursor-pointer py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
        >
          {authLoading ? (
            authMode === 'login' ? 'Signing in...' : 'Creating account...'
          ) : (
            authMode === 'login' ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>

      {/* Toggle Mode */}
      <div className="mt-6 text-center">
        <span className="text-gray-600">
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
        </span>
        <button
          onClick={toggleAuthMode}
          className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
        >
          {authMode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
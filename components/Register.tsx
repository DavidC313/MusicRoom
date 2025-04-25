'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (pass: string) => {
    const errors: string[] = [];
    if (pass.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(pass)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(pass)) errors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(pass)) errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) errors.push('Password must contain at least one special character');
    return errors;
  };

  useEffect(() => {
    if (password) {
      setPasswordErrors(validatePassword(password));
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  useEffect(() => {
    if (email) {
      setEmailError(validateEmail(email));
    } else {
      setEmailError('');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setError(emailValidation);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordErrors.length > 0) {
      setError('Please fix the password requirements below');
      return;
    }

    try {
      await register(email, password);
      router.push('/');
    } catch (error) {
      setError('Failed to create account. Please try again.');
    }
  };

  const isFormValid = Boolean(
    !emailError && 
    passwordErrors.length === 0 && 
    password === confirmPassword && 
    email && 
    password && 
    confirmPassword
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/musicroom.webp"
            alt="Music Room Logo"
            width={300}
            height={200}
            className="rounded-lg shadow-lg"
            priority
          />
          <h1 className="text-4xl font-bold text-white tracking-wide">MusicRoom</h1>
          <p className="text-gray-400 text-sm">Create your music creation space</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                emailError ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your email"
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                passwordErrors.length > 0 ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Create a password"
              required
            />
            {password && (
              <div className="mt-2 space-y-1">
                {[
                  { text: 'At least 8 characters', valid: password.length >= 8 },
                  { text: 'One uppercase letter', valid: /[A-Z]/.test(password) },
                  { text: 'One lowercase letter', valid: /[a-z]/.test(password) },
                  { text: 'One number', valid: /[0-9]/.test(password) },
                  { text: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
                ].map((req, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
                      req.valid ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      {req.valid ? '✓' : ''}
                    </span>
                    <span className={req.valid ? 'text-green-400' : 'text-gray-400'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Confirm your password"
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid}
          >
            Create Account
          </button>
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link 
                href="/" 
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                Return to Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 
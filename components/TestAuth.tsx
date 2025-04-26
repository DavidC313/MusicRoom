'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

export default function TestAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Starting auth test...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Success:', result.user.email);
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Detailed error:', {
          error,
          message: error.message,
          code: error.code,
          stack: error.stack
        });
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  return (
    <div className="p-4">
      <h2>Firebase Auth Test</h2>
      <form onSubmit={handleTest} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Test Auth
        </button>
      </form>
    </div>
  );
} 
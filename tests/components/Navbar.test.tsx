import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: jest.fn(),
    isAdmin: false,
  }),
}));

describe('Navbar Component', () => {
  it('renders logo and title', () => {
    render(<Navbar />);
    
    // Check if the Music Room title is present
    expect(screen.getByText('Music Room')).toBeInTheDocument();
  });

  it('renders profile link when user is authenticated', () => {
    // Mock useAuth to return a user
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: { email: 'test@example.com' },
      logout: jest.fn(),
      isAdmin: false,
    }));

    render(<Navbar />);
    
    // Check if profile link is present in the desktop menu
    const desktopProfileLink = screen.getAllByRole('link', { name: /profile/i })[0];
    expect(desktopProfileLink).toBeInTheDocument();
    expect(desktopProfileLink.getAttribute('href')).toBe('/profile');
  });
}); 
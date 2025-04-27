import React from 'react';
import { render, screen } from '@testing-library/react';
import UserProfile from '@/components/UserProfile';
import { FaUser, FaMusic, FaHistory, FaCog, FaSignOutAlt } from 'react-icons/fa';

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaUser: () => <div data-testid="fa-user" />,
  FaMusic: () => <div data-testid="fa-music" />,
  FaHistory: () => <div data-testid="fa-history" />,
  FaCog: () => <div data-testid="fa-cog" />,
  FaSignOutAlt: () => <div data-testid="fa-sign-out" />,
}));

// Mock the default user data
const mockUser = {
  username: 'MusicMaker',
  email: 'musicmaker@example.com',
  joinDate: '2024-01-01',
  compositions: 12,
  totalPlayTime: '24h 36m'
};

jest.mock('@/components/UserProfile', () => {
  return {
    __esModule: true,
    default: (props) => {
      // Use the mock user data but allow it to be overridden in tests
      const user = props.testUser || mockUser;
      const UserProfile = jest.requireActual('@/components/UserProfile').default;
      return <UserProfile {...props} user={user} />;
    }
  };
});

describe('UserProfile', () => {
  it('renders user profile information correctly', () => {
    render(<UserProfile />);

    // Check user information
    expect(screen.getByText('MusicMaker')).toBeInTheDocument();
    expect(screen.getByText('musicmaker@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Member since/)).toBeInTheDocument();

    // Check stats
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Compositions')).toBeInTheDocument();
    expect(screen.getByText('24h 36m')).toBeInTheDocument();
    expect(screen.getByText('Total Play Time')).toBeInTheDocument();

    // Check settings section
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('Receive updates about your compositions')).toBeInTheDocument();
    expect(screen.getByText('Enable')).toBeInTheDocument();
  });

  it('renders icons correctly', () => {
    render(<UserProfile />);

    // Check for icon components
    expect(screen.getByTestId('fa-music')).toBeInTheDocument();
    expect(screen.getByTestId('fa-history')).toBeInTheDocument();
  });

  it('renders user avatar with first letter of username', () => {
    render(<UserProfile />);
    
    const avatar = screen.getByText('M');
    expect(avatar).toBeInTheDocument();
    expect(avatar.parentElement).toHaveClass('rounded-full');
  });

  it('renders fallback avatar when username is not available', () => {
    const userWithoutUsername = {
      username: null,
      email: 'musicmaker@example.com',
      joinDate: '2024-01-01',
      compositions: 12,
      totalPlayTime: '24h 36m'
    };
    
    render(<UserProfile testUser={userWithoutUsername} />);
    
    const avatar = screen.getByText('U');
    expect(avatar).toBeInTheDocument();
    expect(avatar.parentElement).toHaveClass('rounded-full');
  });

  it('applies correct styling classes', () => {
    render(<UserProfile />);

    // Check main container
    const mainContainer = screen.getByTestId('user-profile-container');
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-900');

    // Check profile card
    const profileCard = screen.getByTestId('profile-card');
    expect(profileCard).toHaveClass('bg-gray-800', 'rounded-xl', 'shadow-lg');

    // Check stats cards
    const statsCards = screen.getAllByTestId('stats-card');
    statsCards.forEach(card => {
      expect(card).toHaveClass('bg-gray-700', 'rounded-lg');
    });
  });
}); 
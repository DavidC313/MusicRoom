import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

// Mock the auth context
const mockLogout = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAdmin: false,
    logout: mockLogout,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock console.error to prevent error messages in test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Navbar', () => {
  beforeEach(() => {
    mockLogout.mockClear();
    (console.error as jest.Mock).mockClear();
  });

  it('renders the logo and navigation links', () => {
    render(<Navbar />);
    
    // Check if logo is present
    expect(screen.getByAltText('MusicRoom Logo')).toBeInTheDocument();
    
    // Check if navigation links are present
    expect(screen.getAllByText('Home')[0]).toBeInTheDocument();
    expect(screen.getByText('MusicRoom')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    render(<Navbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    // Mock authenticated user
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
      },
      isAdmin: false,
      logout: mockLogout,
    }));

    render(<Navbar />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows admin menu when user is admin', () => {
    // Mock admin user
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: {
        email: 'admin@example.com',
        displayName: 'Admin User',
      },
      isAdmin: true,
      logout: mockLogout,
    }));

    render(<Navbar />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    render(<Navbar />);
    
    // Menu should be hidden by default
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    
    // Click hamburger button
    fireEvent.click(screen.getByTestId('mobile-menu-button'));
    
    // Menu should be visible
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    
    // Click close button
    fireEvent.click(screen.getByTestId('mobile-menu-close'));
    
    // Menu should be hidden again
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });

  it('shows email when displayName is not available', () => {
    // Mock user without displayName
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: {
        email: 'test@example.com',
        displayName: null,
      },
      isAdmin: false,
      logout: mockLogout,
    }));

    render(<Navbar />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('handles logout error gracefully', async () => {
    // Mock authenticated user with failing logout
    const mockError = new Error('Logout failed');
    const mockFailingLogout = jest.fn().mockRejectedValue(mockError);
    
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
      },
      isAdmin: false,
      logout: mockFailingLogout,
    }));

    render(<Navbar />);

    // Click logout button
    fireEvent.click(screen.getByText('Logout'));

    // Wait for error to be logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error logging out:', mockError);
    });
  });

  it('shows mobile menu with all navigation items when authenticated', () => {
    // Mock authenticated admin user
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: {
        email: 'admin@example.com',
        displayName: 'Admin User',
      },
      isAdmin: true,
      logout: mockLogout,
    }));

    render(<Navbar />);
    
    // Open mobile menu
    fireEvent.click(screen.getByTestId('mobile-menu-button'));
    
    // Check all navigation items are present in the mobile menu
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toBeInTheDocument();
    
    // Verify all links are in the mobile menu
    const links = mobileMenu.querySelectorAll('a, button');
    expect(links).toHaveLength(6); // Home, Music Room, Profile, Admin, Logout
    
    expect(mobileMenu.querySelector('a[href="/"]')).toHaveTextContent('Home');
    expect(mobileMenu.querySelector('a[href="/music-room"]')).toHaveTextContent('Music Room');
    expect(mobileMenu.querySelector('a[href="/profile"]')).toHaveTextContent('Profile');
    expect(mobileMenu.querySelector('a[href="/admin"]')).toHaveTextContent('Admin');
    expect(mobileMenu.querySelector('span')).toHaveTextContent('Admin User');
    expect(mobileMenu.querySelector('button.hover\\:text-gray-300')).toHaveTextContent('Logout');
  });

  it('handles successful logout', async () => {
    // Mock authenticated user
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
      },
      isAdmin: false,
      logout: mockLogout,
    }));

    render(<Navbar />);

    // Click logout button
    fireEvent.click(screen.getByText('Logout'));

    // Verify logout was called
    expect(mockLogout).toHaveBeenCalled();
  });

  it('handles keyboard navigation', () => {
    render(<Navbar />);
    
    // Open mobile menu
    fireEvent.click(screen.getByTestId('mobile-menu-button'));
    
    // Get all focusable elements
    const focusableElements = screen.getByTestId('mobile-menu').querySelectorAll(
      'a, button, [tabindex="0"]'
    );
    
    // Verify all elements are focusable
    focusableElements.forEach((element) => {
      expect(element).toHaveAttribute('tabindex', '0');
    });
  });

  it('handles long display names gracefully', () => {
    const longName = 'A'.repeat(100);
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: {
        email: 'test@example.com',
        displayName: longName,
      },
      isAdmin: false,
      logout: mockLogout,
    }));

    render(<Navbar />);
    
    // Verify the name is displayed without breaking the layout
    const nameElement = screen.getByText(longName);
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveClass('truncate');
    expect(nameElement).toHaveClass('max-w-[200px]');
  });

  it('handles special characters in display names', () => {
    const specialName = 'User!@#$%^&*()_+{}|:"<>?';
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: {
        email: 'test@example.com',
        displayName: specialName,
      },
      isAdmin: false,
      logout: mockLogout,
    }));

    render(<Navbar />);
    expect(screen.getByText(specialName)).toBeInTheDocument();
  });

  it('closes mobile menu when clicking outside', () => {
    render(<Navbar />);
    
    // Open mobile menu
    fireEvent.click(screen.getByTestId('mobile-menu-button'));
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    
    // Click outside the menu
    fireEvent.mouseDown(document.body);
    
    // Menu should be closed
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });

  it('closes mobile menu when navigating', () => {
    render(<Navbar />);
    
    // Open mobile menu
    fireEvent.click(screen.getByTestId('mobile-menu-button'));
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    
    // Click a navigation link in the mobile menu
    const mobileMenu = screen.getByTestId('mobile-menu');
    const homeLink = mobileMenu.querySelector('a[href="/"]');
    fireEvent.click(homeLink!);
    
    // Menu should be closed
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });

  it('handles missing auth context gracefully', () => {
    // Mock missing auth context
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockImplementation(() => undefined);
    
    render(<Navbar />);
    
    // Should still render without crashing
    expect(screen.getByAltText('MusicRoom Logo')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('handles image loading error gracefully', () => {
    // Mock image error
    const originalImage = window.Image;
    window.Image = class extends originalImage {
      constructor() {
        super();
        setTimeout(() => this.onerror(new Error('Failed to load image')), 0);
      }
    };

    render(<Navbar />);
    
    // Should still render without crashing
    expect(screen.getByAltText('MusicRoom Logo')).toBeInTheDocument();
    
    // Restore original Image
    window.Image = originalImage;
  });
}); 
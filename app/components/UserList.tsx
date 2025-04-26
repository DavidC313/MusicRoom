import Image from 'next/image';
import { User } from '@/types/user';

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

export default function UserList({ users, onUserSelect }: UserListProps) {
  const handleUserClick = (user: User) => {
    onUserSelect(user);
  };

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.uid}
          onClick={() => handleUserClick(user)}
          className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-sm">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                {user.displayName || 'Anonymous User'}
              </h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
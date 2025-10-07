import React from 'react';
import { User, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/authContext';

interface HeaderProps {
  onProfileClick: () => void;
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onLoginClick }) => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="grid justify-self-end items-center mb-8">
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <User size={20} />
              Profile
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <LogIn size={20} />
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
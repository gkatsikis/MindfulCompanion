import React from 'react';
import { User, LogIn } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogin, onLogout, onProfileClick }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-light text-gray-800">
        How are you feeling today?
      </h1>
      
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
              onClick={onLogout}
              className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onLogin}
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
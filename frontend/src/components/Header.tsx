import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogIn, Cloud } from 'lucide-react';
import { useAuth } from '../contexts/authContext';

interface HeaderProps {
  onProfileClick: () => void;
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onLoginClick }) => {
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between w-full">
      {/* Wordmark */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 cursor-pointer group"
        aria-label="Mindful Companion home"
      >
        <Cloud
          size={26}
          className="text-sky fill-sky-soft group-hover:text-sky-deep transition-colors"
          strokeWidth={1.75}
        />
        <span className="font-display text-xl text-ink tracking-wide">
          Mindful <span className="italic text-sky-deep">Companion</span>
        </span>
      </button>

      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            {location.pathname === '/profile' ? (
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-full cursor-pointer text-ink-soft hover:text-ink hover:bg-white/70 transition-all"
              >
                ← Back to Journal
              </button>
            ) : (
              <button
                onClick={onProfileClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-ink-soft hover:text-ink hover:bg-white/70 transition-all cursor-pointer"
              >
                <User size={18} strokeWidth={1.75} />
                Profile
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full text-ink-soft hover:text-dawn-deep hover:bg-white/70 transition-all cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-dawn hover:bg-dawn-deep text-white rounded-full shadow-soft hover:shadow-lift transition-all cursor-pointer"
          >
            <LogIn size={18} strokeWidth={1.75} />
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;

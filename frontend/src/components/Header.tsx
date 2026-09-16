import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, Cloud } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';

interface HeaderProps {
  onLoginClick?: () => void;
}

const pill =
  'px-4 py-2 rounded-full whitespace-nowrap text-ink-soft hover:text-ink hover:bg-card/70 transition-all cursor-pointer';

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between w-full gap-4">
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
        <span className="font-display text-lg sm:text-xl text-ink tracking-wide whitespace-nowrap">
          Mindful <span className="italic text-sky-deep">Companion</span>
        </span>
      </button>

      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
        {isLoggedIn ? (
          <>
            {location.pathname === '/journal' ? (
              <button onClick={() => navigate('/')} className={pill}>
                ← <span className="hidden sm:inline">Back to writing</span>
                <span className="sm:hidden">Write</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/journal')}
                className={`flex items-center gap-2 ${pill}`}
                aria-label="Your journal"
              >
                <BookOpen size={18} strokeWidth={1.75} />
                <span className="hidden sm:inline">Your journal</span>
              </button>
            )}
            <button onClick={logout} className={`${pill} hover:text-dawn-strong`}>
              Log out
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-dawn-strong hover:bg-dawn-stronger text-white rounded-full shadow-soft hover:shadow-lift transition-all cursor-pointer whitespace-nowrap"
          >
            <LogIn size={18} strokeWidth={1.75} />
            Sign in
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;

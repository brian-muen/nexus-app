import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { closeLogInModal, closeSignUpModal, openLogInModal, openSignUpModal } from '@/redux/slices/modalSlice';
import PenguinLogo from '@/components/PenguinLogo';
import { Button } from '@/components/ui/button';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-cyan-600' : 'text-gray-700 hover:text-cyan-600'}`;

export default function LandingHeader() {
  const dispatch = useDispatch<AppDispatch>();

  const handleLoginClick = () => {
    dispatch(closeSignUpModal());
    dispatch(openLogInModal());
  };

  const handleSignUpClick = () => {
    dispatch(closeLogInModal());
    dispatch(openSignUpModal());
  };

  return (
    <header className="sticky top-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-3">
            <PenguinLogo className="w-16 h-16" />
            <span className="text-2xl font-bold text-gradient">Nexus</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass} end>
              Overview
            </NavLink>
            <NavLink to="/calendar" className={navLinkClass}>
              Calendar
            </NavLink>
            <NavLink to="/todo" className={navLinkClass}>
              To-Do
            </NavLink>
            <NavLink to="/chatbot" className={navLinkClass}>
              AI Assistant
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-medium" onClick={handleLoginClick}>
              Login
            </Button>
            <Button
              className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              onClick={handleSignUpClick}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

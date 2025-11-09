import AnimatedBackground from '@/components/AnimatedBackground';
import type { ReactNode } from 'react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <LandingHeader />
      <main className="flex-1">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}

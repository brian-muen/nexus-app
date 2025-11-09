import PenguinLogo from '@/components/PenguinLogo';

export default function LandingFooter() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <PenguinLogo className="w-8 h-8" />
            <span className="text-xl font-bold text-gradient">Nexus</span>
          </div>
          <p className="text-gray-600 text-sm">© 2024 Nexus. Built with ❤️ at hackathons.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-cyan-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-cyan-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-cyan-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

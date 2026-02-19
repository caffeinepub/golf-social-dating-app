import { Link, useMatchRoute } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Map, Calendar, MessageCircle, Building2, Trophy, LogOut } from 'lucide-react';
import DropdownNavigation from './DropdownNavigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const matchRoute = useMatchRoute();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    window.location.href = '/';
  };

  const isActive = (path: string) => {
    return !!matchRoute({ to: path });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fairwayGreen/5 via-white to-grassGreen/5">
      <header className="bg-white/80 backdrop-blur-md border-b border-courseGreen/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <DropdownNavigation />
              <Link to="/map" className="flex items-center gap-3 group">
                <img 
                  src="/assets/generated/lime-greens-logo.dim_400x200.png" 
                  alt="Lime Greens" 
                  className="h-10 w-auto group-hover:scale-105 transition-transform" 
                />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link to="/map">
                <Button 
                  variant={isActive('/map') ? 'default' : 'ghost'} 
                  className={`gap-2 transition-all ${isActive('/map') ? 'bg-courseGreen hover:bg-courseGreen/90' : ''}`}
                >
                  <Map className="w-4 h-4" />
                  Discover
                </Button>
              </Link>
              <Link to="/courses">
                <Button 
                  variant={isActive('/courses') ? 'default' : 'ghost'} 
                  className={`gap-2 transition-all ${isActive('/courses') ? 'bg-courseGreen hover:bg-courseGreen/90' : ''}`}
                >
                  <Building2 className="w-4 h-4" />
                  Courses
                </Button>
              </Link>
              <Link to="/events">
                <Button 
                  variant={isActive('/events') ? 'default' : 'ghost'} 
                  className={`gap-2 transition-all ${isActive('/events') ? 'bg-courseGreen hover:bg-courseGreen/90' : ''}`}
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </Button>
              </Link>
              <Link to="/chat">
                <Button 
                  variant={isActive('/chat') ? 'default' : 'ghost'} 
                  className={`gap-2 transition-all ${isActive('/chat') ? 'bg-courseGreen hover:bg-courseGreen/90' : ''}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Button>
              </Link>
              <Link to="/sponsors">
                <Button 
                  variant={isActive('/sponsors') ? 'default' : 'ghost'} 
                  className={`gap-2 transition-all ${isActive('/sponsors') ? 'bg-courseGreen hover:bg-courseGreen/90' : ''}`}
                >
                  <Trophy className="w-4 h-4" />
                  Sponsors
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="gap-2 ml-4 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white/60 backdrop-blur-sm border-t border-courseGreen/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Lime Greens™</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <span className="text-red-500">♥</span>
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-courseGreen hover:text-fairwayGreen transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

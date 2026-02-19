import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Heart, Users, MapPin, Calendar } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, clear, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleGetStarted = () => {
    navigate({ to: '/sign-up' });
  };

  const handleSignIn = async () => {
    try {
      await login();
      // Navigate to map after successful login
      navigate({ to: '/map' });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/assets/generated/golf-course-hero.dim_1920x1080.png)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-fairwayGreen/90 via-courseGreen/80 to-grassGreen/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/assets/generated/lime-greens-logo.dim_400x200.png" 
              alt="Lime Greens" 
              className="h-24 w-auto drop-shadow-2xl" 
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Where Golfers
            <br />
            <span className="text-sandTan">Connect & Play</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Meet single golfers who share your passion. Connect through profiles, discover local courses, and tee off together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-courseGreen hover:bg-sandTan hover:text-white text-lg px-8 py-6 rounded-full shadow-xl transition-all hover:scale-105"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-courseGreen text-lg px-8 py-6 rounded-full shadow-xl transition-all"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
              <Heart className="w-10 h-10 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Find Your Match</h3>
              <p className="text-sm text-white/80">Connect with golfers who share your interests</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
              <MapPin className="w-10 h-10 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Discover Courses</h3>
              <p className="text-sm text-white/80">Find and book tee times at local courses</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
              <Calendar className="w-10 h-10 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Join Events</h3>
              <p className="text-sm text-white/80">Participate in golf events and tournaments</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
              <Users className="w-10 h-10 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Build Community</h3>
              <p className="text-sm text-white/80">Chat and connect with fellow golfers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

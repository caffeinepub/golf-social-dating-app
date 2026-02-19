import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import MapView from './pages/MapView';
import CourseBooking from './pages/CourseBooking';
import CourseDirectory from './pages/CourseDirectory';
import SponsorsPage from './pages/SponsorsPage';
import EventsPage from './pages/EventsPage';
import ChatPage from './pages/ChatPage';
import Layout from './components/Layout';
import ProfileSetup from './components/ProfileSetup';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function ProtectedLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  // Redirect to landing if not authenticated
  if (!isInitializing && !isAuthenticated) {
    navigate({ to: '/' });
    return null;
  }

  // Show loading state while checking profile
  if (isInitializing || profileLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-fairwayGreen via-courseGreen to-grassGreen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show profile setup if user doesn't have a profile
  if (userProfile === null) {
    return <ProfileSetup />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  // Redirect authenticated users to map
  if (!isInitializing && identity) {
    const currentPath = window.location.hash.split('?')[0];
    if (currentPath === '#/' || currentPath === '') {
      navigate({ to: '/map' });
      return null;
    }
  }

  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-up',
  component: SignUpPage,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedLayout,
});

const mapRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/map',
  component: MapView,
});

const courseBookingRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/courses/booking',
  component: CourseBooking,
});

const courseDirectoryRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/courses',
  component: CourseDirectory,
});

const sponsorsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/sponsors',
  component: SponsorsPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/events',
  component: EventsPage,
});

const chatRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/chat',
  component: ChatPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  signUpRoute,
  protectedRoute.addChildren([
    mapRoute,
    courseBookingRoute,
    courseDirectoryRoute,
    sponsorsRoute,
    eventsRoute,
    chatRoute,
  ]),
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

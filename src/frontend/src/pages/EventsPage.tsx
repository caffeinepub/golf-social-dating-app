import { useState, useMemo } from 'react';
import { useGetAllEvents, useCreateEvent, useRsvpToEvent, useCancelRsvp } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Plus, Users, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function EventsPage() {
  const { identity } = useInternetIdentity();
  const { data: eventsData, isLoading } = useGetAllEvents();
  const createEvent = useCreateEvent();
  const rsvpToEvent = useRsvpToEvent();
  const cancelRsvp = useCancelRsvp();
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const currentPrincipal = identity?.getPrincipal().toString();

  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (!eventsData) return { upcomingEvents: [], pastEvents: [] };
    
    const now = Date.now() * 1000000; // Convert to nanoseconds
    const upcoming: Array<{ event: any; rsvps: any[]; index: number }> = [];
    const past: Array<{ event: any; rsvps: any[]; index: number }> = [];
    
    eventsData.forEach(([event, rsvps], index) => {
      const eventData = { event, rsvps, index };
      if (Number(event.timestamp) > now) {
        upcoming.push(eventData);
      } else {
        past.push(eventData);
      }
    });
    
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [eventsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await createEvent.mutateAsync({ courseName, description });
      toast.success('Event created successfully!');
      setCourseName('');
      setDescription('');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to create event');
      console.error(error);
    }
  };

  const handleRsvp = async (eventId: number, isRsvpd: boolean) => {
    try {
      if (isRsvpd) {
        await cancelRsvp.mutateAsync(eventId);
        toast.success('RSVP cancelled');
      } else {
        await rsvpToEvent.mutateAsync(eventId);
        toast.success('RSVP confirmed!');
      }
    } catch (error) {
      toast.error('Failed to update RSVP');
      console.error(error);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUserRsvpd = (rsvps: any[]) => {
    return rsvps.some(principal => principal.toString() === currentPrincipal);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-fairwayGreen to-courseGreen bg-clip-text text-transparent">
            Golf Events
          </h1>
          <p className="text-muted-foreground">Join or host golf events in your area</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Golf Event</DialogTitle>
              <DialogDescription>Host a new golf event for the community</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., Pebble Beach Golf Links"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your event..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
              <p className="text-muted-foreground">Be the first to create a golf event!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(({ event, rsvps, index }) => {
              const isRsvpd = isUserRsvpd(rsvps);
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{event.courseName}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.timestamp)}
                        </CardDescription>
                      </div>
                      <Badge variant="default">Upcoming</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{rsvps.length} attending</span>
                    </div>
                    <Button 
                      variant={isRsvpd ? "outline" : "default"}
                      className="w-full gap-2"
                      onClick={() => handleRsvp(index, isRsvpd)}
                      disabled={rsvpToEvent.isPending || cancelRsvp.isPending}
                    >
                      {isRsvpd ? (
                        <>
                          <Check className="w-4 h-4" />
                          Cancel RSVP
                        </>
                      ) : (
                        'RSVP'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-muted-foreground">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map(({ event, rsvps, index }) => (
              <Card key={index} className="opacity-60 hover:opacity-80 transition-opacity">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{event.courseName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.timestamp)}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Past</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{rsvps.length} attended</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useGetCourseDirectory } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ExternalLink, Search, Calendar as CalendarIcon, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CourseBooking() {
  const { data: courses, isLoading } = useGetCourseDirectory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>('all');
  const [numPlayers, setNumPlayers] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<string>('all');

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    
    return courses.filter(([_, details]) => {
      const nameMatch = details.name.toLowerCase().includes(searchTerm.toLowerCase());
      // In a real app, we'd filter by actual availability and distance
      return nameMatch;
    });
  }, [courses, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-fairwayGreen to-courseGreen bg-clip-text text-transparent">
          Book a Tee Time
        </h1>
        <p className="text-muted-foreground">Search and book tee times at local golf courses</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Find the perfect tee time for your round</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search Courses</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Course name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="morning">Morning (6am - 12pm)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                  <SelectItem value="evening">Evening (5pm - 8pm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Players</Label>
              <Select value={numPlayers} onValueChange={setNumPlayers}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="1">1 Player</SelectItem>
                  <SelectItem value="2">2 Players</SelectItem>
                  <SelectItem value="3">3 Players</SelectItem>
                  <SelectItem value="4">4 Players</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Distance</Label>
            <Select value={maxDistance} onValueChange={setMaxDistance}>
              <SelectTrigger>
                <SelectValue placeholder="Any distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Distance</SelectItem>
                <SelectItem value="10">Within 10 miles</SelectItem>
                <SelectItem value="25">Within 25 miles</SelectItem>
                <SelectItem value="50">Within 50 miles</SelectItem>
                <SelectItem value="100">Within 100 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredCourses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map(([name, details]) => (
            <Card key={name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{details.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {details.isLocal ? 'Local booking available' : 'Regional course'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={details.isLocal ? 'default' : 'secondary'}>
                    {details.isLocal ? 'Local' : 'Regional'}
                  </Badge>
                  {selectedDate && (
                    <Badge variant="outline" className="gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {format(selectedDate, 'MMM d')}
                    </Badge>
                  )}
                  {timeSlot !== 'all' && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {timeSlot}
                    </Badge>
                  )}
                  {numPlayers !== 'all' && (
                    <Badge variant="outline" className="gap-1">
                      <Users className="w-3 h-3" />
                      {numPlayers} {numPlayers === '1' ? 'player' : 'players'}
                    </Badge>
                  )}
                </div>
                {details.website && (
                  <Button className="w-full gap-2" asChild>
                    <a href={details.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Book Now
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

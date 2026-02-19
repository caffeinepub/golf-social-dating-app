import { useState, useMemo } from 'react';
import { useGetCourseDirectory, useGetCourseWithMembers } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, MapPin, Search, Users, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CourseDirectory() {
  const { data: courses, isLoading } = useGetCourseDirectory();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    
    return courses.filter(([_, details]) => {
      const nameMatch = details.name.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = locationFilter === 'all' || 
        (locationFilter === 'local' && details.isLocal) ||
        (locationFilter === 'regional' && !details.isLocal);
      
      return nameMatch && locationMatch;
    });
  }, [courses, searchTerm, locationFilter]);

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
          Course Directory
        </h1>
        <p className="text-muted-foreground">Explore golf courses and connect with members</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Search Courses</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by course name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="local">Local Courses</SelectItem>
                  <SelectItem value="regional">Regional Courses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCourses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <img src="/assets/generated/golf-flag-icon.dim_128x128.png" alt="Golf Flag" className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map(([name, details]) => (
            <CourseCard 
              key={name} 
              courseName={name} 
              details={details}
              isExpanded={expandedCourse === name}
              onToggleExpand={() => setExpandedCourse(expandedCourse === name ? null : name)}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ 
  courseName, 
  details, 
  isExpanded, 
  onToggleExpand,
  navigate 
}: { 
  courseName: string; 
  details: any; 
  isExpanded: boolean; 
  onToggleExpand: () => void;
  navigate: any;
}) {
  const { data: courseWithMembers, isLoading: membersLoading } = useGetCourseWithMembers(courseName);

  const memberCount = courseWithMembers?.memberProfiles.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{details.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {details.isLocal ? 'Local Course' : 'Regional Course'}
            </CardDescription>
          </div>
          <img src="/assets/generated/golf-flag-icon.dim_128x128.png" alt="Golf Flag" className="w-12 h-12" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={details.isLocal ? 'default' : 'secondary'}>
            {details.isLocal ? 'Local' : 'Regional'}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
          </Badge>
        </div>

        <div className="flex gap-2 flex-wrap">
          {details.website && (
            <Button variant="outline" className="gap-2" asChild>
              <a href={details.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Visit Website
              </a>
            </Button>
          )}
          <Button 
            variant="default" 
            onClick={() => navigate({ to: '/courses/booking' })}
          >
            Book Tee Time
          </Button>
        </div>

        {/* Members Section */}
        <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                View Members ({memberCount})
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            {membersLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading members...</div>
            ) : memberCount === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No members yet</div>
            ) : (
              <>
                <Alert>
                  <AlertDescription className="text-sm">
                    Note: Direct messaging from course directory is currently limited. Visit the Map View to find and message members.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {courseWithMembers?.memberProfiles.map((profile, index) => {
                    const avatarUrl = profile.profilePhoto 
                      ? URL.createObjectURL(new Blob([new Uint8Array(profile.profilePhoto)], { type: 'image/jpeg' }))
                      : '/assets/generated/avatar-placeholder.dim_128x128.png';

                    return (
                      <Card 
                        key={index}
                        className="hover:bg-accent transition-colors"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={avatarUrl} alt="Profile" />
                              <AvatarFallback>
                                {profile.bio.substring(0, 2).toUpperCase() || 'GM'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {profile.bio.split('\n')[0] || 'Golfer'}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  HCP: {Number(profile.handicap)}
                                </Badge>
                                <span className="text-xs capitalize">
                                  {profile.gender}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

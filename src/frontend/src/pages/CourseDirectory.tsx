import { useState, useMemo } from 'react';
import { useGetCourseDirectory } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, MapPin, Search } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function CourseDirectory() {
  const { data: courses, isLoading } = useGetCourseDirectory();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');

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
        <p className="text-muted-foreground">Explore golf courses in your area</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(([name, details]) => (
            <Card key={name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{details.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {details.isLocal ? 'Local Course' : 'Regional Course'}
                    </CardDescription>
                  </div>
                  <img src="/assets/generated/golf-flag-icon.dim_128x128.png" alt="Golf Flag" className="w-12 h-12" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={details.isLocal ? 'default' : 'secondary'}>
                    {details.isLocal ? 'Local' : 'Regional'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {details.website && (
                    <Button variant="outline" className="flex-1 gap-2" asChild>
                      <a href={details.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => navigate({ to: '/booking' })}
                  >
                    Book Tee Time
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

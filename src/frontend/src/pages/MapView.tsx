import { useState, useMemo } from 'react';
import { useSearchMatches, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, User, MessageCircle, Eye } from 'lucide-react';
import { Gender, Preference } from '../backend';
import { useNavigate } from '@tanstack/react-router';

export default function MapView() {
  const { data: matches, isLoading } = useSearchMatches();
  const { data: currentProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  
  const [handicapRange, setHandicapRange] = useState<[number, number]>([0, 36]);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [preferenceFilter, setPreferenceFilter] = useState<string>('all');

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredMatches = useMemo(() => {
    if (!matches || !currentProfile) return [];
    
    return matches.filter(profile => {
      const handicap = Number(profile.handicap);
      const distance = calculateDistance(
        currentProfile.location.lat,
        currentProfile.location.long,
        profile.location.lat,
        profile.location.long
      );
      
      const handicapMatch = handicap >= handicapRange[0] && handicap <= handicapRange[1];
      const distanceMatch = distance <= maxDistance;
      const preferenceMatch = preferenceFilter === 'all' || profile.preference === preferenceFilter;
      
      return handicapMatch && distanceMatch && preferenceMatch;
    }).map(profile => ({
      profile,
      distance: calculateDistance(
        currentProfile.location.lat,
        currentProfile.location.long,
        profile.location.lat,
        profile.location.long
      )
    }));
  }, [matches, currentProfile, handicapRange, maxDistance, preferenceFilter]);

  const getGenderLabel = (gender: Gender) => {
    switch (gender) {
      case Gender.male:
        return 'Male';
      case Gender.female:
        return 'Female';
      case Gender.couple:
        return 'Couple';
      default:
        return gender;
    }
  };

  const getPreferenceLabel = (pref: Preference) => {
    switch (pref) {
      case Preference.business:
        return 'Business';
      case Preference.pleasure:
        return 'Pleasure';
      case Preference.casual:
        return 'Casual';
      case Preference.romantic:
        return 'Romantic';
      default:
        return pref;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-fairwayGreen to-courseGreen bg-clip-text text-transparent">
          Discover Golfers Near You
        </h1>
        <p className="text-muted-foreground">Connect with golfers who match your preferences</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Matches</CardTitle>
          <CardDescription>Refine your search to find the perfect golf partner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>Handicap Range: {handicapRange[0]} - {handicapRange[1]}</Label>
              <Slider
                min={0}
                max={36}
                step={1}
                value={handicapRange}
                onValueChange={(value) => setHandicapRange(value as [number, number])}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Max Distance: {maxDistance} miles</Label>
              <Slider
                min={5}
                max={100}
                step={5}
                value={[maxDistance]}
                onValueChange={(value) => setMaxDistance(value[0])}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Social Preference</Label>
              <Select value={preferenceFilter} onValueChange={setPreferenceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All preferences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Preferences</SelectItem>
                  <SelectItem value={Preference.business}>Business</SelectItem>
                  <SelectItem value={Preference.pleasure}>Pleasure</SelectItem>
                  <SelectItem value={Preference.casual}>Casual</SelectItem>
                  <SelectItem value={Preference.romantic}>Romantic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredMatches.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or check back later for new golfers in your area</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(({ profile, distance }, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-fairwayGreen to-courseGreen flex items-center justify-center">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar.getDirectURL()} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src="/assets/generated/avatar-placeholder.dim_128x128.png" 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">Golfer</CardTitle>
                      <CardDescription>Handicap: {profile.handicap.toString()}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{getGenderLabel(profile.gender)}</Badge>
                  <Badge variant="outline">{getPreferenceLabel(profile.preference)}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{distance.toFixed(1)} miles away</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => navigate({ to: '/chat' })}>
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                  <Button variant="default" size="sm" className="flex-1 gap-2">
                    <Eye className="w-4 h-4" />
                    View Profile
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

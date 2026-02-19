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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    })).sort((a, b) => a.distance - b.distance);
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

  const getPreferenceLabel = (preference: Preference) => {
    switch (preference) {
      case Preference.business:
        return 'Business';
      case Preference.pleasure:
        return 'Pleasure';
      case Preference.casual:
        return 'Casual';
      case Preference.romantic:
        return 'Romantic';
      default:
        return preference;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Finding your matches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-fairwayGreen to-courseGreen bg-clip-text text-transparent">
          Discover Golfers
        </h1>
        <p className="text-muted-foreground">Find your perfect golf partner nearby</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Matches</CardTitle>
          <CardDescription>Refine your search to find the perfect golf partner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label>Maximum Distance: {maxDistance} miles</Label>
            <Slider
              min={5}
              max={100}
              step={5}
              value={[maxDistance]}
              onValueChange={(value) => setMaxDistance(value[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
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
        </CardContent>
      </Card>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <img src="/assets/generated/golf-ball-icon.dim_64x64.png" alt="Golf Ball" className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more golfers</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(({ profile, distance }, index) => {
            const avatarUrl = profile.profilePhoto 
              ? URL.createObjectURL(new Blob([new Uint8Array(profile.profilePhoto)], { type: 'image/jpeg' }))
              : '/assets/generated/avatar-placeholder.dim_128x128.png';

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24 border-4 border-fairwayGreen">
                      <AvatarImage src={avatarUrl} alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-fairwayGreen to-courseGreen text-white text-2xl">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">
                    {profile.bio.split('\n')[0] || `Golfer ${index + 1}`}
                  </CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {distance.toFixed(1)} miles away
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="default">
                      Handicap: {Number(profile.handicap)}
                    </Badge>
                    <Badge variant="secondary">
                      {getGenderLabel(profile.gender)}
                    </Badge>
                    <Badge variant="outline">
                      {getPreferenceLabel(profile.preference)}
                    </Badge>
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground text-center line-clamp-2">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      className="flex-1 gap-2 bg-courseGreen hover:bg-courseGreen/90"
                      onClick={() => {
                        // Note: We don't have the actual Principal for matches from searchMatches
                        // This is a backend limitation - navigating to chat without Principal
                        navigate({ to: '/chat' });
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => {
                        // Note: We don't have the actual Principal for matches
                        // This is a backend limitation
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

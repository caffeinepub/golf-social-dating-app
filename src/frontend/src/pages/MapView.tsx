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

  // Convert avatar bytes to blob URLs
  const avatarUrls = useMemo(() => {
    if (!filteredMatches) return {};
    const urls: Record<number, string> = {};
    filteredMatches.forEach((item, index) => {
      if (item.profile.avatar) {
        const blob = new Blob([new Uint8Array(item.profile.avatar)], { type: 'image/jpeg' });
        urls[index] = URL.createObjectURL(blob);
      }
    });
    return urls;
  }, [filteredMatches]);

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
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your search to find the perfect match</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Handicap Range: {handicapRange[0]} - {handicapRange[1]}</Label>
            </div>
            <Slider
              value={handicapRange}
              onValueChange={(value) => setHandicapRange(value as [number, number])}
              min={0}
              max={54}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max Distance: {maxDistance} miles</Label>
            </div>
            <Slider
              value={[maxDistance]}
              onValueChange={(value) => setMaxDistance(value[0])}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Social Preference</Label>
            <Select value={preferenceFilter} onValueChange={setPreferenceFilter}>
              <SelectTrigger>
                <SelectValue />
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

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {filteredMatches.length} {filteredMatches.length === 1 ? 'Match' : 'Matches'} Found
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">No matches found</p>
              <p className="text-muted-foreground">Try adjusting your filters to see more golfers</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((item, index) => {
              const { profile, distance } = item;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        {avatarUrls[index] ? (
                          <img
                            src={avatarUrls[index]}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-4 border-courseGreen/20"
                          />
                        ) : (
                          <img
                            src="/assets/generated/avatar-placeholder.dim_128x128.png"
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-4 border-courseGreen/20"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2">Golfer {index + 1}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-courseGreen/10 text-courseGreen">
                            Handicap {profile.handicap.toString()}
                          </Badge>
                          <Badge variant="outline">{getGenderLabel(profile.gender)}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{distance.toFixed(1)} miles away</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Looking for: {getGenderLabel(profile.lookingFor)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Preference: </span>
                        <span className="font-medium">{getPreferenceLabel(profile.preference)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate({ to: '/chat' })}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-courseGreen hover:bg-grassGreen"
                      >
                        <Eye className="w-4 h-4 mr-2" />
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
    </div>
  );
}

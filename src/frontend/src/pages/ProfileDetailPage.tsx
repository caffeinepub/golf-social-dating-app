import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MapPin, User, Calendar, Heart, Users, Flag, MessageCircle } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ProfileDetailPage() {
  const params = useParams({ from: '/profile/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  
  let userPrincipal: Principal | null = null;
  try {
    userPrincipal = Principal.fromText(params.userId);
  } catch (e) {
    console.error('Invalid principal:', e);
  }

  const { data: profile, isLoading, error } = useGetUserProfile(userPrincipal);

  const currentUserPrincipal = identity?.getPrincipal();
  const isOwnProfile = currentUserPrincipal && userPrincipal && 
    currentUserPrincipal.toString() === userPrincipal.toString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/courses' })} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Button>
        <Card className="text-center py-12">
          <CardContent>
            <img src="/assets/generated/avatar-placeholder.dim_128x128.png" alt="Profile" className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Profile not found</h3>
            <p className="text-muted-foreground">This user's profile could not be loaded</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = profile.profilePhoto 
    ? URL.createObjectURL(new Blob([new Uint8Array(profile.profilePhoto)], { type: 'image/jpeg' }))
    : '/assets/generated/avatar-placeholder.dim_128x128.png';

  const genderLabels = {
    male: 'Male',
    female: 'Female',
    couple: 'Couple'
  };

  const preferenceLabels = {
    business: 'Business',
    pleasure: 'Pleasure',
    casual: 'Casual',
    romantic: 'Romantic'
  };

  const handleMessageClick = () => {
    if (userPrincipal) {
      // Store the target principal in sessionStorage as a workaround for navigation state limitations
      sessionStorage.setItem('chatTargetPrincipal', userPrincipal.toString());
      navigate({ to: '/chat' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/courses' })} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-32 h-32 border-4 border-fairwayGreen">
              <AvatarImage src={avatarUrl} alt="Profile" />
              <AvatarFallback className="text-3xl">
                {profile.bio.substring(0, 2).toUpperCase() || 'GM'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {profile.bio.split('\n')[0] || 'Golfer Profile'}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="gap-1">
                    <Flag className="w-3 h-3" />
                    Handicap: {Number(profile.handicap)}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <User className="w-3 h-3" />
                    {genderLabels[profile.gender]}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    Age: {Number(profile.age)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Looking For</p>
              <Badge variant="secondary">{genderLabels[profile.lookingFor]}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gender Preference</p>
              <Badge variant="secondary">{genderLabels[profile.genderPreference]}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Play Style</p>
              <Badge variant="secondary">{preferenceLabels[profile.preference]}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Location & Course */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location & Course
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Home Course</p>
              <p className="font-medium">{profile.homeCourse || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
              <p className="text-sm font-mono">
                {profile.location.lat.toFixed(4)}, {profile.location.long.toFixed(4)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 justify-center">
            <Button 
              variant="default" 
              className="gap-2 bg-courseGreen hover:bg-courseGreen/90"
              onClick={handleMessageClick}
              disabled={!!isOwnProfile}
            >
              <MessageCircle className="w-4 h-4" />
              {isOwnProfile ? 'Your Profile' : 'Send Message'}
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/map' })}>
              View on Map
            </Button>
          </div>
          {isOwnProfile && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              You cannot message yourself
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

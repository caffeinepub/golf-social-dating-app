import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Gender, Preference } from '../backend';

export default function ProfileSetup() {
  const [handicap, setHandicap] = useState('18');
  const [gender, setGender] = useState<Gender>(Gender.male);
  const [lookingFor, setLookingFor] = useState<Gender>(Gender.female);
  const [preference, setPreference] = useState<Preference>(Preference.casual);
  const [bio, setBio] = useState('');
  const [lat, setLat] = useState('40.7128');
  const [long, setLong] = useState('-74.0060');

  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveProfile.mutateAsync({
        handicap: BigInt(parseInt(handicap)),
        gender,
        genderPreference: lookingFor,
        lookingFor,
        preference,
        bio,
        location: {
          lat: parseFloat(lat),
          long: parseFloat(long),
        },
        avatar: undefined,
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fairwayGreen via-courseGreen to-grassGreen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to Golf Social!</CardTitle>
          <CardDescription>Let's set up your profile to start connecting with fellow golfers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="handicap">Handicap</Label>
                <Input
                  id="handicap"
                  type="number"
                  value={handicap}
                  onChange={(e) => setHandicap(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">I am</Label>
                <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.male}>Male</SelectItem>
                    <SelectItem value={Gender.female}>Female</SelectItem>
                    <SelectItem value={Gender.couple}>Couple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lookingFor">Looking for</Label>
                <Select value={lookingFor} onValueChange={(value) => setLookingFor(value as Gender)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.male}>Male</SelectItem>
                    <SelectItem value={Gender.female}>Female</SelectItem>
                    <SelectItem value={Gender.couple}>Couple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preference">Social Preference</Label>
                <Select value={preference} onValueChange={(value) => setPreference(value as Preference)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Preference.business}>Business</SelectItem>
                    <SelectItem value={Preference.pleasure}>Pleasure</SelectItem>
                    <SelectItem value={Preference.casual}>Casual</SelectItem>
                    <SelectItem value={Preference.romantic}>Romantic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="long">Longitude</Label>
                <Input
                  id="long"
                  type="number"
                  step="any"
                  value={long}
                  onChange={(e) => setLong(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself and your golfing interests..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

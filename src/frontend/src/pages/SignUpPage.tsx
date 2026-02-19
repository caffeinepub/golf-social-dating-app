import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Gender, Preference } from '../backend';
import { Upload, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { identity, login, isInitializing } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  const [age, setAge] = useState('25');
  const [handicap, setHandicap] = useState('18');
  const [gender, setGender] = useState<Gender>(Gender.male);
  const [lookingFor, setLookingFor] = useState<Gender>(Gender.female);
  const [bio, setBio] = useState('');
  const [lat, setLat] = useState('40.7128');
  const [long, setLong] = useState('-74.0060');
  const [homeCourse, setHomeCourse] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<Uint8Array | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [charCount, setCharCount] = useState(0);

  const maxBioLength = 1000;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG or PNG)');
      return;
    }

    try {
      // Read file as ArrayBuffer and convert to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      setProfilePhoto(uint8Array);

      // Create preview URL
      const blob = new Blob([uint8Array], { type: file.type });
      const previewUrl = URL.createObjectURL(blob);
      setPhotoPreview(previewUrl);
    } catch (error) {
      toast.error('Failed to process image');
      console.error(error);
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxBioLength) {
      setBio(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!identity) {
      toast.error('Please sign in first');
      try {
        await login();
      } catch (error) {
        console.error('Login error:', error);
      }
      return;
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      toast.error('Please enter a valid age between 18 and 100');
      return;
    }

    // Validate handicap
    const handicapNum = parseInt(handicap);
    if (isNaN(handicapNum) || handicapNum < -10 || handicapNum > 54) {
      toast.error('Please enter a valid handicap between -10 and 54');
      return;
    }

    // Validate coordinates
    const latNum = parseFloat(lat);
    const longNum = parseFloat(long);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      toast.error('Please enter a valid latitude between -90 and 90');
      return;
    }
    if (isNaN(longNum) || longNum < -180 || longNum > 180) {
      toast.error('Please enter a valid longitude between -180 and 180');
      return;
    }

    // Validate required fields
    if (!bio.trim()) {
      toast.error('Please tell us about yourself');
      return;
    }
    if (!homeCourse.trim()) {
      toast.error('Please enter your home course');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        age: BigInt(ageNum),
        handicap: BigInt(handicapNum),
        gender,
        lookingFor,
        genderPreference: lookingFor,
        preference: Preference.casual,
        bio: bio.trim(),
        location: {
          lat: latNum,
          long: longNum,
        },
        homeCourse: homeCourse.trim(),
        profilePhoto: profilePhoto || undefined,
        avatar: undefined,
      });
      toast.success('Profile created successfully!');
      navigate({ to: '/map' });
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  // Redirect to login if not authenticated and not initializing
  if (!isInitializing && !identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fairwayGreen via-courseGreen to-grassGreen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign In Required</CardTitle>
            <CardDescription className="text-center">
              Please sign in to create your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={async () => {
                try {
                  await login();
                } catch (error) {
                  console.error('Login error:', error);
                }
              }}
              className="bg-courseGreen hover:bg-grassGreen text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fairwayGreen via-courseGreen to-grassGreen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <img
            src="/assets/generated/lime-greens-logo.dim_400x200.png"
            alt="Lime Greens"
            className="h-16 w-auto mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold text-white mb-2">Join Lime Greens™</h1>
          <p className="text-white/90 text-lg">Create your profile and start connecting with fellow golfers</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-courseGreen to-grassGreen text-white rounded-t-lg">
            <CardTitle className="text-2xl">Your Golf Profile</CardTitle>
            <CardDescription className="text-white/90">
              Tell us about yourself and your ideal golf partner
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-lg font-semibold text-courseGreen">
                  Profile Photo
                </Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={photoPreview || '/assets/generated/avatar-placeholder.dim_128x128.png'}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-courseGreen shadow-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="photo"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-sandTan hover:bg-sandTan/80 text-white rounded-lg transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 mt-2">JPEG or PNG, max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-courseGreen font-semibold">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="border-courseGreen/30 focus:border-courseGreen"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handicap" className="text-courseGreen font-semibold">
                    Golf Handicap *
                  </Label>
                  <Input
                    id="handicap"
                    type="number"
                    min="-10"
                    max="54"
                    value={handicap}
                    onChange={(e) => setHandicap(e.target.value)}
                    required
                    className="border-courseGreen/30 focus:border-courseGreen"
                  />
                  <p className="text-xs text-gray-500">Range: -10 to 54</p>
                </div>
              </div>

              {/* Gender and Preference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-courseGreen font-semibold">I am *</Label>
                  <RadioGroup value={gender} onValueChange={(value) => setGender(value as Gender)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Gender.male} id="gender-male" />
                      <Label htmlFor="gender-male" className="cursor-pointer">
                        Male
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Gender.female} id="gender-female" />
                      <Label htmlFor="gender-female" className="cursor-pointer">
                        Female
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Gender.couple} id="gender-couple" />
                      <Label htmlFor="gender-couple" className="cursor-pointer">
                        Couple
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-courseGreen font-semibold">Looking For *</Label>
                  <RadioGroup value={lookingFor} onValueChange={(value) => setLookingFor(value as Gender)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Gender.male} id="looking-male" />
                      <Label htmlFor="looking-male" className="cursor-pointer">
                        Male
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Gender.female} id="looking-female" />
                      <Label htmlFor="looking-female" className="cursor-pointer">
                        Female
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={Gender.couple} id="looking-couple" />
                      <Label htmlFor="looking-couple" className="cursor-pointer">
                        Couple
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-courseGreen font-semibold">
                  About Me & My Ideal Golf Partner *
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={handleBioChange}
                  placeholder="Share your likes, dislikes, golf style, and what you're looking for in an ideal golf partner..."
                  required
                  rows={6}
                  className="border-courseGreen/30 focus:border-courseGreen resize-none"
                />
                <div className="flex justify-between text-sm">
                  <p className="text-gray-500">Tell us about yourself and your ideal match</p>
                  <p className={`${charCount > maxBioLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                    {charCount}/{maxBioLength}
                  </p>
                </div>
              </div>

              {/* Home Course */}
              <div className="space-y-2">
                <Label htmlFor="homeCourse" className="text-courseGreen font-semibold">
                  Home Course *
                </Label>
                <Input
                  id="homeCourse"
                  type="text"
                  value={homeCourse}
                  onChange={(e) => setHomeCourse(e.target.value)}
                  placeholder="e.g., Pebble Beach Golf Links"
                  required
                  className="border-courseGreen/30 focus:border-courseGreen"
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-courseGreen font-semibold">Location *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat" className="text-sm">
                      Latitude
                    </Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      required
                      className="border-courseGreen/30 focus:border-courseGreen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="long" className="text-sm">
                      Longitude
                    </Label>
                    <Input
                      id="long"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={long}
                      onChange={(e) => setLong(e.target.value)}
                      required
                      className="border-courseGreen/30 focus:border-courseGreen"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Enter your coordinates to find nearby golfers</p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={saveProfile.isPending}
                  className="w-full bg-gradient-to-r from-courseGreen to-grassGreen hover:from-grassGreen hover:to-courseGreen text-white text-lg py-6 rounded-lg shadow-lg transition-all"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    'Complete Sign Up'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 text-sm">
          <p>
            By signing up, you agree to connect with fellow golfers and enjoy the game together
          </p>
        </div>
      </div>
    </div>
  );
}

import { useGetSponsors } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ExternalLink } from 'lucide-react';

export default function SponsorsPage() {
  const { data: sponsors, isLoading } = useGetSponsors();

  // Mock sponsor data with additional details
  const sponsorDetails = sponsors?.map((name, index) => ({
    name,
    description: 'Supporting the golf community and helping golfers connect',
    category: index % 3 === 0 ? 'Equipment' : index % 3 === 1 ? 'Apparel' : 'Services',
    website: 'https://example.com',
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading sponsors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-fairwayGreen to-courseGreen bg-clip-text text-transparent">
          Our Sponsors
        </h1>
        <p className="text-muted-foreground">Supporting the golf community</p>
      </div>

      {sponsorDetails && sponsorDetails.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No sponsors yet</h3>
            <p className="text-muted-foreground">Check back later for sponsor information</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsorDetails?.map((sponsor, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src="/assets/generated/sponsor-placeholder.dim_200x100.png" 
                      alt={sponsor.name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<div class="flex items-center justify-center w-full h-full"><Trophy class="w-12 h-12 text-courseGreen" /></div>`;
                      }}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">{sponsor.name}</CardTitle>
                <CardDescription className="text-center">
                  <Badge variant="secondary" className="mt-2">{sponsor.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {sponsor.description}
                </p>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

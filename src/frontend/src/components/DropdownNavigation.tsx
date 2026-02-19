import { Link } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, Map, Building2, Calendar, MessageCircle, Trophy, User } from 'lucide-react';

export default function DropdownNavigation() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="border-courseGreen/30 hover:bg-courseGreen/10 hover:border-courseGreen transition-colors"
          aria-label="Navigation menu"
        >
          <Menu className="h-5 w-5 text-courseGreen" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56 bg-white/95 backdrop-blur-md border-courseGreen/20"
      >
        <Link to="/map">
          <DropdownMenuItem className="cursor-pointer gap-3 hover:bg-courseGreen/10 focus:bg-courseGreen/10">
            <Map className="w-4 h-4 text-courseGreen" />
            <span className="font-medium">Map View</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/courses">
          <DropdownMenuItem className="cursor-pointer gap-3 hover:bg-courseGreen/10 focus:bg-courseGreen/10">
            <Building2 className="w-4 h-4 text-courseGreen" />
            <span className="font-medium">Course Directory</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/booking">
          <DropdownMenuItem className="cursor-pointer gap-3 hover:bg-courseGreen/10 focus:bg-courseGreen/10">
            <Calendar className="w-4 h-4 text-courseGreen" />
            <span className="font-medium">Course Booking</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/events">
          <DropdownMenuItem className="cursor-pointer gap-3 hover:bg-courseGreen/10 focus:bg-courseGreen/10">
            <Calendar className="w-4 h-4 text-courseGreen" />
            <span className="font-medium">Events</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/chat">
          <DropdownMenuItem className="cursor-pointer gap-3 hover:bg-courseGreen/10 focus:bg-courseGreen/10">
            <MessageCircle className="w-4 h-4 text-courseGreen" />
            <span className="font-medium">Chat</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/sponsors">
          <DropdownMenuItem className="cursor-pointer gap-3 hover:bg-courseGreen/10 focus:bg-courseGreen/10">
            <Trophy className="w-4 h-4 text-courseGreen" />
            <span className="font-medium">Sponsors</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

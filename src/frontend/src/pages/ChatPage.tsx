import { useState, useEffect, useRef } from 'react';
import { useSearchMatches, useGetMessages, useSendMessage } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Gender } from '../backend';
import { toast } from 'sonner';

export default function ChatPage() {
  const { identity } = useInternetIdentity();
  const { data: matches } = useSearchMatches();
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [selectedPrincipal, setSelectedPrincipal] = useState<Principal | null>(null);
  const { data: messages } = useGetMessages(selectedPrincipal);
  const sendMessage = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentPrincipal = identity?.getPrincipal().toString();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPrincipal) return;

    try {
      await sendMessage.mutateAsync({
        recipient: selectedPrincipal,
        content: messageText,
      });
      setMessageText('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

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

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const selectMatch = (index: number) => {
    setSelectedUserIndex(index);
    // In a real app, we'd have actual principals for each match
    // For now, using a placeholder principal
    setSelectedPrincipal(Principal.fromText('aaaaa-aa'));
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-fairwayGreen to-courseGreen bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-muted-foreground">Connect with your matches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Your Matches</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {matches && matches.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No matches yet</p>
                  <p className="text-xs mt-1">Complete your profile to find matches</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {matches?.map((profile, index) => (
                    <button
                      key={index}
                      onClick={() => selectMatch(index)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedUserIndex === index
                          ? 'bg-courseGreen/10 border border-courseGreen/20'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {profile.avatar ? (
                            <AvatarImage src={profile.avatar.getDirectURL()} alt="Profile" />
                          ) : (
                            <AvatarImage src="/assets/generated/avatar-placeholder.dim_128x128.png" alt="Avatar" />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-fairwayGreen to-courseGreen text-white">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">Golfer {index + 1}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {getGenderLabel(profile.gender)} • Handicap {profile.handicap.toString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Thread */}
        <Card className="lg:col-span-2">
          {selectedUserIndex !== null && matches?.[selectedUserIndex] ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {matches[selectedUserIndex].avatar ? (
                      <AvatarImage src={matches[selectedUserIndex].avatar.getDirectURL()} alt="Profile" />
                    ) : (
                      <AvatarImage src="/assets/generated/avatar-placeholder.dim_128x128.png" alt="Avatar" />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-fairwayGreen to-courseGreen text-white">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Golfer {selectedUserIndex + 1}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {getGenderLabel(matches[selectedUserIndex].gender)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                  {messages && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((msg, idx) => {
                        const isSent = msg.sender.toString() === currentPrincipal;
                        return (
                          <div
                            key={idx}
                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isSent
                                  ? 'bg-courseGreen text-white'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs opacity-70">{formatTime(msg.timestamp)}</p>
                                {isSent && msg.read && (
                                  <Badge variant="secondary" className="text-xs py-0 px-1">Read</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="min-h-[60px] resize-none"
                      rows={2}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="h-[60px] w-[60px]"
                      disabled={!messageText.trim() || sendMessage.isPending}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a match to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

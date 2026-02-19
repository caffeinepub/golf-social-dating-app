import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Event, Message, Promise_, CourseWithProfiles } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['courseDirectory'] });
      queryClient.invalidateQueries({ queryKey: ['courseWithMembers'] });
    },
  });
}

export function useSearchMatches() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCourseDirectory() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, Promise_][]>({
    queryKey: ['courseDirectory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourseDirectory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCourseWithMembers(courseName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CourseWithProfiles | null>({
    queryKey: ['courseWithMembers', courseName],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCourseWithMembers(courseName);
    },
    enabled: !!actor && !isFetching && !!courseName,
  });
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetSponsors() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['sponsors'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSponsors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<[Event, Principal[]][]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseName, description }: { courseName: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(courseName, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useRsvpToEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rsvpToEvent(BigInt(eventId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useCancelRsvp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelRsvp(BigInt(eventId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useGetMessages(withUser: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', withUser?.toString()],
    queryFn: async () => {
      if (!actor || !withUser) return [];
      return actor.getMessages(withUser);
    },
    enabled: !!actor && !isFetching && !!withUser,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content }: { recipient: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(recipient, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.recipient.toString()] });
    },
  });
}

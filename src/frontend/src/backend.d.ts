import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Promise_ {
    isLocal: boolean;
    name: string;
    website: string;
}
export interface CourseWithProfiles {
    memberProfiles: Array<UserProfile>;
    details: Promise_;
}
export type Time = bigint;
export interface Coordinates {
    lat: number;
    long: number;
}
export interface Event {
    creator: Principal;
    description: string;
    timestamp: Time;
    courseName: string;
}
export interface Message {
    content: string;
    read: boolean;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface UserProfile {
    age: bigint;
    bio: string;
    profilePhoto?: Uint8Array;
    homeCourse: string;
    lookingFor: Gender;
    preference: Preference;
    genderPreference: Gender;
    gender: Gender;
    handicap: bigint;
    location: Coordinates;
    avatar?: Uint8Array;
}
export enum Gender {
    female = "female",
    male = "male",
    couple = "couple"
}
export enum Preference {
    pleasure = "pleasure",
    romantic = "romantic",
    business = "business",
    casual = "casual"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCourse(name: string, website: string, isLocal: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelRsvp(eventId: bigint): Promise<void>;
    createEvent(courseName: string, description: string): Promise<void>;
    getAllEvents(): Promise<Array<[Event, Array<Principal>]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourseDirectory(): Promise<Array<[string, Promise_]>>;
    getCourseWithMembers(courseName: string): Promise<CourseWithProfiles | null>;
    getMessages(withUser: Principal): Promise<Array<Message>>;
    getSponsors(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessageAsRead(withUser: Principal, timestamp: Time): Promise<void>;
    rsvpToEvent(eventId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchMatches(): Promise<Array<UserProfile>>;
    sendMessage(recipient: Principal, content: string): Promise<void>;
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Promise_ {
    isLocal: boolean;
    name: string;
    website: string;
}
export type Time = bigint;
export interface Coordinates {
    lat: number;
    long: number;
}
export interface Message {
    content: string;
    read: boolean;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface Event {
    creator: Principal;
    description: string;
    timestamp: Time;
    courseName: string;
}
export interface UserProfile {
    bio: string;
    lookingFor: Gender;
    preference: Preference;
    genderPreference: Gender;
    gender: Gender;
    handicap: bigint;
    location: Coordinates;
    avatar?: ExternalBlob;
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
    getMessages(withUser: Principal): Promise<Array<Message>>;
    getSponsors(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessageAsRead(withUser: Principal, timestamp: Time): Promise<void>;
    rsvpToEvent(eventId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchMatches(): Promise<Array<UserProfile>>;
    sendMessage(recipient: Principal, content: string): Promise<void>;
    updateProfile(profile: UserProfile): Promise<void>;
}

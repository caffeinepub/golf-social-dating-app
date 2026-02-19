import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";


actor {
  type Gender = {
    #male;
    #female;
    #couple;
  };

  type Preference = {
    #business;
    #pleasure;
    #casual;
    #romantic;
  };

  type Coordinates = {
    lat : Float;
    long : Float;
  };

  type UserProfile = {
    handicap : Nat;
    age : Nat;
    gender : Gender;
    lookingFor : Gender;
    location : Coordinates;
    homeCourse : Text;
    bio : Text;
    avatar : ?Blob;
    preference : Preference;
    genderPreference : Gender;
    profilePhoto : ?Blob;
  };

  type Promise = {
    name : Text;
    website : Text;
    isLocal : Bool;
  };

  type Course = {
    details : Promise;
    members : Set.Set<Principal>;
  };

  type CourseWithProfiles = {
    details : Promise;
    memberProfiles : [UserProfile];
  };

  type Event = {
    creator : Principal;
    timestamp : Time.Time;
    courseName : Text;
    description : Text;
  };

  type EventWithRSVPs = {
    event : Event;
    rsvps : List.List<Principal>;
  };

  type Message = {
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let courseDirectory = Map.empty<Text, Course>();
  let events = Map.empty<Nat, EventWithRSVPs>();
  let messages = List.empty<(Principal, Message)>();
  let sponsors = List.empty<Text>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public query ({ caller }) func getCourseDirectory() : async [(Text, Promise)] {
    courseDirectory.toArray().map(func((name, course)) { (name, course.details) });
  };

  public query ({ caller }) func getSponsors() : async [Text] {
    sponsors.toArray();
  };

  public query ({ caller }) func getAllEvents() : async [(Event, [Principal])] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view events");
    };
    events.values().toArray().map(
      func(eventWithRsvps) {
        (eventWithRsvps.event, eventWithRsvps.rsvps.toArray());
      }
    );
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);

    let courseName = profile.homeCourse.trim(#char ' ');
    if (courseName.size() > 0) {
      let newCourseDetails = {
        name = courseName;
        website = "";
        isLocal = false;
      };
      let existingCourse = courseDirectory.get(courseName);
      let members = switch (existingCourse) {
        case (?course) { course.members };
        case (null) { Set.empty<Principal>() };
      };
      members.add(caller);
      let newCourse : Course = {
        details = newCourseDetails;
        members;
      };
      courseDirectory.add(courseName, newCourse);
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func searchMatches() : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can search for matches");
    };
    switch (userProfiles.get(caller)) {
      case (?callerProfile) {
        userProfiles.values().toArray().filter(
          func(profile) {
            profile.gender == callerProfile.genderPreference and profile.genderPreference == callerProfile.gender;
          }
        );
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };
    let msg : Message = {
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
      read = false;
    };
    messages.add((recipient, msg));
  };

  public query ({ caller }) func getMessages(withUser : Principal) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view messages");
    };
    messages.filter(
      func((recipient, msg)) {
        (msg.sender == withUser and msg.recipient == caller) or (msg.sender == caller and msg.recipient == withUser);
      }
    ).map<(Principal, Message), Message>(
      func((_, msg)) { msg }
    ).toArray();
  };

  public shared ({ caller }) func markMessageAsRead(withUser : Principal, timestamp : Time.Time) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can mark messages as read");
    };

    messages.forEach(
      func((_, msg)) {
        if (msg.recipient == caller and msg.sender == withUser and msg.timestamp == timestamp and not msg.read) {
        };
      }
    );
  };

  public shared ({ caller }) func createEvent(courseName : Text, description : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create events");
    };
    let event : Event = {
      creator = caller;
      timestamp = Time.now();
      courseName;
      description;
    };

    let eventWithRsvps : EventWithRSVPs = {
      event;
      rsvps = List.empty<Principal>();
    };

    events.add(events.size(), eventWithRsvps);
  };

  public shared ({ caller }) func rsvpToEvent(eventId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can RSVP to events");
    };

    switch (events.get(eventId)) {
      case (?eventWithRsvps) {
        let alreadyRsvpd = eventWithRsvps.rsvps.any(
          func(p : Principal) : Bool {
            p == caller;
          }
        );
        if (not alreadyRsvpd) {
          eventWithRsvps.rsvps.add(caller);
          events.add(eventId, eventWithRsvps);
        };
      };
      case (null) {
        Runtime.trap("Event not found");
      };
    };
  };

  public shared ({ caller }) func cancelRsvp(eventId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can cancel RSVPs");
    };

    switch (events.get(eventId)) {
      case (?eventWithRsvps) {
        let updatedRsvps = eventWithRsvps.rsvps.filter(
          func(p : Principal) : Bool {
            p != caller;
          }
        );
        events.add(eventId, { eventWithRsvps with rsvps = updatedRsvps });
      };
      case (null) {
        Runtime.trap("Event not found");
      };
    };
  };

  public shared ({ caller }) func addCourse(name : Text, website : Text, isLocal : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add courses");
    };
    let details : Promise = { name; website; isLocal };
    let members = Set.empty<Principal>();
    let newCourse : Course = {
      details;
      members;
    };
    courseDirectory.add(name, newCourse);
  };

  public query ({ caller }) func getCourseWithMembers(courseName : Text) : async ?CourseWithProfiles {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view course members");
    };
    switch (courseDirectory.get(courseName)) {
      case (?course) {
        let memberProfiles = course.members.values().toArray().map(
          func(p) {
            userProfiles.get(p);
          }
        ).filter(
          func(optProfile) {
            switch (optProfile) {
              case (?_profile) { true };
              case (null) { false };
            };
          }
        ).map(
          func(validOptProfile) {
            switch (validOptProfile) {
              case (?profile) { profile };
              case (null) {
                Runtime.trap("Unexpected null profile in memberProfiles filtering");
              };
            };
          }
        );
        ?{
          details = course.details;
          memberProfiles;
        };
      };
      case (null) { null };
    };
  };
};

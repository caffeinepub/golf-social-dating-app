import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  // Gender type for social preference profiles
  type Gender = {
    #male;
    #female;
    #couple;
  };

  // Social preference type for golfing
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
    gender : Gender;
    location : Coordinates;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    preference : Preference;
    genderPreference : Gender;
    lookingFor : Gender;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      let locComp = Float.compare(profile1.location.lat, profile2.location.lat);
      if (locComp != #equal) { return locComp };
      let longComp = Float.compare(profile1.location.long, profile2.location.long);
      if (longComp != #equal) { return longComp };

      Text.compare(profile1.bio, profile2.bio);
    };
  };

  // Course
  type Promise = {
    name : Text;
    website : Text;
    isLocal : Bool;
  };

  // Event record
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
  let courseDirectory = Map.empty<Text, Promise>();
  let events = Map.empty<Nat, EventWithRSVPs>();
  let messages = List.empty<(Principal, Message)>();
  let sponsors = List.empty<Text>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public query ({ caller }) func getCourseDirectory() : async [(Text, Promise)] {
    courseDirectory.toArray();
  };

  public query ({ caller }) func getSponsors() : async [Text] {
    sponsors.toArray();
  };

  public query ({ caller }) func getAllEvents() : async [(Event, [Principal])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view events");
    };
    events.values().toArray().map(
      func(eventWithRsvps) {
        (eventWithRsvps.event, eventWithRsvps.rsvps.toArray());
      }
    );
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func updateProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func searchMatches() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark messages as read");
    };

    messages.forEach(
      func((_, msg)) {
        if (msg.recipient == caller and msg.sender == withUser and msg.timestamp == timestamp and not msg.read) {
          // TODO: Mark as read in persistent store
        };
      }
    );
  };

  public shared ({ caller }) func createEvent(courseName : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can RSVP to events");
    };

    switch (events.get(eventId)) {
      case (?eventWithRsvps) {
        // Check if user already RSVP'd
        let alreadyRsvpd = eventWithRsvps.rsvps.any(func(p : Principal) : Bool { p == caller });
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can cancel RSVPs");
    };

    switch (events.get(eventId)) {
      case (?eventWithRsvps) {
        let updatedRsvps = eventWithRsvps.rsvps.filter(func(p : Principal) : Bool { p != caller });
        events.add(eventId, { eventWithRsvps with rsvps = updatedRsvps });
      };
      case (null) {
        Runtime.trap("Event not found");
      };
    };
  };

  public shared ({ caller }) func addCourse(name : Text, website : Text, isLocal : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add courses");
    };
    let details : Promise = { name; website; isLocal };
    courseDirectory.add(name, details);
  };
};


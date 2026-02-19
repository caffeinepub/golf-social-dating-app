import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Blob "mo:core/Blob";

module {
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

  // OLD persistent type from previous actor (do not change)
  type OldUserProfile = {
    handicap : Nat;
    gender : Gender;
    location : Coordinates;
    bio : Text;
    avatar : ?Blob;
    preference : Preference;
    genderPreference : Gender;
    lookingFor : Gender;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // Target new type (do not change)
  type NewUserProfile = {
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

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Migration function called by the main actor via the with-primitive
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal : Principal, oldProfile : OldUserProfile) : NewUserProfile {
        // Initialize new fields with default values
        {
          oldProfile with
          age = 0;
          homeCourse = "";
          profilePhoto = null;
        };
      }
    );
    { userProfiles = newUserProfiles };
  };
};

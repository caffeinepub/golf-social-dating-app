# Specification

## Summary
**Goal:** Create a comprehensive sign-up page where users can enter their profile information including age, handicap, gender, preferences, bio, location, home course, and upload a profile photo.

**Planned changes:**
- Create a new SignUpPage component with route navigation from the Get Started button
- Add form fields for age (numeric), handicap (golf range), gender (male/female/couple), seeking preference (male/female/couple), bio (textarea), location, home course, and profile photo upload
- Apply golf-themed styling consistent with existing design system
- Update backend UserProfile type to include age, lookingFor, homeCourse, and profilePhoto fields
- Create backend function to save complete user profile with all new fields
- Wire frontend form submission to backend with validation and error handling

**User-visible outcome:** Users can click Get Started on the landing page and complete a comprehensive sign-up form with their golf profile information, then submit to create their account and access the main application.

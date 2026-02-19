# Specification

## Summary
**Goal:** Make the Get Started button on the landing page functional by adding authentication flow.

**Planned changes:**
- Add click handler to the Get Started button that triggers Internet Identity authentication
- Redirect authenticated users to profile setup (new users) or MapView page (existing users)
- Use the existing useInternetIdentity hook and authentication pattern

**User-visible outcome:** Users can click the Get Started button to authenticate via Internet Identity and access the application.

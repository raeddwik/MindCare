# MindCare v0.3

Arabic RTL PWA prototype for mental-health session booking.

## New in v0.3
- Service selection
- Therapist selection
- Therapist-specific availability
- 30/60 minute session selection
- Therapist-aware conflict checking
- Booking summary with service + therapist
- PWA manifest and offline service worker
- Basic HTML escaping for user-entered data
- Migration of v0.2 availability into the first therapist profile

## Important
This remains a prototype. Data is stored in browser localStorage. Do NOT use it for real patient/clinical data until a secure backend, authentication/authorization, server-side validation, encryption, audit logging, privacy controls and backups are implemented.

## Run
Serve the folder through HTTP/HTTPS, e.g. `python3 -m http.server 8000`, then open `http://localhost:8000`.

# NorthBridge Career Portal

A consulting-style career portal website where:
- Admin users can post, edit, and delete jobs.
- Job seekers can browse and filter open positions.

## Pages
- `index.html`: Homepage
- `jobs.html`: Public job listings with search and filters
- `admin.html`: Admin dashboard to manage jobs
- `about.html`: About the firm
- `contact.html`: Careers contact details
- `register.html`: Account registration (frontend)
- `login.html`: Account login (frontend)

## Run
Open `index.html` in a browser.

## Job Data
Jobs are stored in browser `localStorage` under key `northbridge.jobs`.
Users/session are stored in browser `localStorage` under keys `northbridge.users` and `northbridge.currentUser`.

Note: this is a frontend-only implementation. For multi-user shared data across devices, connect this UI to a backend database/API.

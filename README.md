# Estatecraft — Angular Real Estate Platform

A full real-estate property listing, rental & management platform, built in
**Angular 21** (standalone components, signals, the new `@if`/`@for` control
flow) with a violet/coral design theme — fully responsive from mobile to
desktop, and backed by a real **Django REST Framework API** (see the
companion `estatecraft-backend` project).

## Run it

This app needs the Django backend running to load any real data (login,
properties, enquiries). Start the backend first:

```bash
# in the estatecraft-backend project
cd estatecraft
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

That serves the API at `http://127.0.0.1:8000/api/`. Then, in this project:

```bash
npm install
npm start
```

Open **http://localhost:4200**. The API base URL is hardcoded as a
class property in `src/app/services/api.service.ts` — change it there
if your backend runs somewhere else.

To build a production bundle:

```bash
npm run build
```

Output goes to `dist/estatecraft/browser`.

## Signing in

Create a new account on the **Sign Up** page, or use one of the backend's
seeded demo accounts (also available as one-click chips on the login
screen):

| Role            | Email               | Password |
|-----------------|---------------------|----------|
| Customer        | customer@demo.com   | demo123  |
| Owner / Agent   | agent@demo.com      | demo123  |
| Admin           | admin@demo.com      | demo123  |

The login page has a role dropdown — pick the role that matches the account
you're signing into (the backend checks this and returns a clear error if
it doesn't match). The signed-in session is kept in the browser's
`localStorage` so it survives a reload.

## What's inside

- **Auth** — `/login` and `/signup` call the backend's `auth_login`/
  `auth_signup` endpoints directly over HTTP. Route guards (`authGuard`,
  `roleGuard`) protect the app shell and role-specific dashboards.
- **Customer** — Home (hero search, categories, featured/recent listings),
  Listings (full filter sidebar), Property Details (gallery, specs,
  amenities, agent contact pulled straight from the property record,
  enquiry form), Favourites, My Enquiries.
- **Owner / Agent** — dashboard with stats, a properties table (toggle
  status, remove), an "Add Property" flow that POSTs to the backend and
  lands in the admin approval queue, and an enquiries inbox.
- **Admin** — platform-wide stats, a pending-approvals queue
  (approve/reject — calls the backend's update/delete endpoints), a
  category breakdown chart, all enquiries, and an agents directory
  (computed from each property's embedded owner info).
- **Shared** — a reusable property card, an inline-SVG icon component
  (`ui-icon`), a toast notification service, and an enquiry modal used
  across Home/Listings/Details.

`PropertyService` and `AuthService` talk to the Django API via
`HttpClient` and expose the results as Angular signals, so the rest of the
app (computed filters, dashboards, etc.) works exactly as it did with mock
data — only the two services' internals changed. Property photos are still
placeholder images from `picsum.photos`, keyed by each property's `seed`.

**Favourites remain client-side only** (a `Set<number>` in
`PropertyService`, not synced to the backend) — a deliberate scope cut so
the per-user favourites list doesn't need its own auth-aware API surface
for this stage of the project.

## Project structure

```
src/app/
  services/        api.service.ts — flat service, one method per backend
                   endpoint, hardcoded base URL (no environment file)
  auth/            login, signup — call AuthService (HTTP)
  layout/          shell (sidebar + header), sidebar, header
  core/            models, services (auth, property, toast — both call
                   ApiService internally), route guards
  shared/          property-card, enquiry-modal, ui-icon, toast
  customer/        home, listings, property-details, favorites, my-enquiries
  agent/           dashboard (properties table + add-property modal + enquiries)
  admin/           dashboard (approvals, category overview, enquiries, agents)
```

## Notes

- Angular's production build tries to inline Google Fonts at build time;
  this has been disabled (`optimization.fonts: false` in `angular.json`)
  so the build never depends on network access to fonts.googleapis.com.
  Fonts still load normally at runtime via the `<link>` tags in
  `src/index.html`.
- CORS is wide open on the backend (`CORS_ALLOW_ALL_ORIGINS = True`), so no
  extra proxy config is needed to call it from `localhost:4200`.

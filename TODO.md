# SimpleDex TODO

## Features

### Search & Filtering

- [ ] Add advanced filters (type, generation, habitat)

### PWA

- [x] Add "Add to Home Screen" install prompt
- [x] Implement background sync for offline actions

## Technical Debt

### TypeScript

- [ ] Review and reduce `any` type usage across codebase

### Testing

- [ ] Increase test coverage for edge cases
- [ ] Add E2E tests with Playwright

### Deployment

- [ ] Set up production deployment (Vercel/Cloudflare for web, Convex for backend)
- [ ] Configure environment variables for production
- [ ] Add CI/CD pipeline for automated testing and deployment

## Nice to Have

- [ ] Add favorites/watchlist feature (requires auth)
- [ ] Add Pokemon comparison feature
- [ ] Add advanced search filters (by stats, abilities)

## Admin

- [x] Hide /admin page - restrict access to only steve
- [ ] Add user management to admin (requires auth)

## UI/UX

- [x] Add page transitions so clicking through Pokemon maintains app scroll position
- [x] Add skeleton loading states for smoother loading experience
- [x] Implement virtual scrolling for large Pokemon lists

## Bugs

- [ ] Fix any remaining edge cases in evolution chain display

## Marketing

- [ ] Update copyright on marketing page to Stephen Cavender, current year, link to https://cavender.foo
- [ ] Add blog section for Pokemon research/articles

# SimpleDex TODO

## Features

### Error Handling
- [ ] Add error handling UI for failed PokeAPI fetches in fetchEvolutionChain and fetchEncounters actions
- [ ] Show user-friendly error messages when data fails to load
- [ ] Implement retry logic for transient failures

### Search & Filtering
- [ ] Debounce the search field input to avoid excessive queries
- [ ] Add loading state while search is being processed

### Pagination
- [ ] Implement proper pagination for Pokemon list (currently returns up to 1000)
- [ ] Add infinite scroll or "Load More" button

### PWA
- [ ] Test PWA offline functionality
- [ ] Verify service worker caches static assets properly

## Technical Debt

### TypeScript
- [ ] Remove `--typecheck disable` from convex dev script once Node.js version is updated
- [ ] Enable strict TypeScript mode and fix any resulting type errors

### Testing
- [ ] Add unit tests for Convex functions
- [ ] Add integration tests for web app

### Deployment
- [ ] Set up production deployment (Vercel/Cloudflare for web, Convex for backend)
- [ ] Configure environment variables for production

## Nice to Have
- [ ] Show Pokemon types with color-coded badges
- [ ] Add share functionality for Pokemon detail pages
- [ ] Add favorites/watchlist feature (requires auth)
- [ ] Support for more than Gen 1 Pokemon (currently 151)
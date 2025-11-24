# NovaFans Growth & Analytics Guide

This guide covers analytics setup, marketing funnel tracking, and growth optimization for NovaFans.

## Analytics Providers

NovaFans supports two analytics providers out of the box:

1. **Plausible** - Privacy-focused, lightweight analytics
2. **PostHog** - Product analytics with feature flags and session replay

### Configuration

Analytics is configured via environment variables in the web app:

```env
# Enable Plausible
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_ANALYTICS_SITE_ID=your-site-id

# OR Enable PostHog
NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # Optional, defaults to app.posthog.com
```

**Important:** If `NEXT_PUBLIC_ANALYTICS_PROVIDER` is not set, analytics is disabled (no-op). This is safe for development.

### Plausible Setup

1. **Sign up for Plausible:**
   - Go to https://plausible.io
   - Create an account and add your site

2. **Get your Site ID:**
   - In Plausible dashboard, your site ID is your domain (e.g., `novafans.com`)

3. **Configure Environment Variables:**
   ```env
   NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
   NEXT_PUBLIC_ANALYTICS_SITE_ID=novafans.com
   ```

4. **Deploy:**
   - Set these variables in Vercel (or your hosting platform)
   - Rebuild the web app
   - Analytics will start tracking automatically

### PostHog Setup

1. **Sign up for PostHog:**
   - Go to https://posthog.com
   - Create an account and project

2. **Get your Project API Key:**
   - In PostHog dashboard → Project Settings → Project API Key
   - Copy the key (starts with `phc_`)

3. **Configure Environment Variables:**
   ```env
   NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # Or your self-hosted URL
   ```

4. **Install PostHog Package:**
   ```bash
   cd apps/web
   pnpm add posthog-js
   ```

5. **Deploy:**
   - Set these variables in Vercel (or your hosting platform)
   - Rebuild the web app
   - Analytics will start tracking automatically

## Tracked Events

### Page Views

All pages automatically track page views via the `PageViewTracker` component in the root layout.

**Tracked Pages:**
- `/` (Landing)
- `/for-creators`
- `/for-fans`
- `/pricing`
- `/help`
- All other routes

### Conversion Events

**Landing Page:**
- `landing_cta_creator` - "Become a Creator" button clicked
- `landing_cta_fan` - "Browse Creators" button clicked

**For Creators Page:**
- `for_creators_cta_signup` - "Start as a Creator" button clicked

**Pricing Page:**
- `pricing_cta_signup` - "Start Earning Now" button clicked

**Registration:**
- `registration_complete` - User successfully registered (includes `role` property)
- `registration_failed` - Registration failed (includes `role` and `error` properties)

**Creator Onboarding:**
- `creator_onboarding_start` - Creator started onboarding flow
- `creator_onboarding_finished` - Creator completed onboarding (if hookable)

**Subscriptions:**
- `subscription_started` - Fan started subscription flow (frontend only, no API changes)

## Event Properties

Events can include properties for better segmentation:

```typescript
trackEvent("landing_cta_creator", {
  page: "/",
  section: "hero" | "bottom_cta",
});
```

## Development Mode

In development (`NODE_ENV=development`), all events are logged to the browser console:

```
[Analytics] landing_cta_creator { page: "/" }
[Analytics] Page View { path: "/for-creators" }
```

This helps verify analytics are working without needing a real provider configured.

## Production Deployment

1. **Choose a Provider:**
   - Plausible: Privacy-focused, simple, GDPR-compliant
   - PostHog: Feature-rich, includes session replay, feature flags

2. **Set Environment Variables:**
   - In Vercel: Project Settings → Environment Variables
   - Add all required variables for your chosen provider
   - Ensure variables are set for Production, Preview, and Development environments

3. **Rebuild:**
   - Vercel automatically rebuilds on env var changes
   - Or trigger manual rebuild

4. **Verify:**
   - Visit your site
   - Check analytics dashboard for events
   - Verify page views are tracking
   - Test CTA clicks and verify events appear

## Analytics Best Practices

1. **Don't Track PII:**
   - Never track email addresses, passwords, or personal information
   - Use hashed or anonymized identifiers when needed

2. **Respect Privacy:**
   - Plausible is privacy-focused by default
   - PostHog can be configured for privacy compliance
   - Consider adding cookie consent banner if required by law

3. **Monitor Key Metrics:**
   - Landing page → Registration conversion rate
   - Creator vs Fan signup ratio
   - Onboarding completion rate
   - Subscription start rate

4. **A/B Testing:**
   - Use analytics to measure CTA effectiveness
   - Test different copy, colors, layouts
   - Track which CTAs convert best

## Troubleshooting

### Events Not Appearing

1. **Check Environment Variables:**
   - Verify `NEXT_PUBLIC_ANALYTICS_PROVIDER` is set correctly
   - Verify provider-specific variables are set

2. **Check Browser Console:**
   - Look for `[Analytics]` logs in development
   - Check for any error messages

3. **Verify Provider Setup:**
   - Plausible: Check site ID is correct
   - PostHog: Verify API key and host URL

4. **Check Network Tab:**
   - Plausible: Look for requests to `plausible.io`
   - PostHog: Look for requests to your PostHog host

### PostHog Not Loading

1. **Install Package:**
   ```bash
   cd apps/web
   pnpm add posthog-js
   ```

2. **Check Import:**
   - Verify `posthog-js` is in `package.json`
   - Check for build errors

3. **Check Host URL:**
   - Verify `NEXT_PUBLIC_POSTHOG_HOST` is correct
   - For self-hosted PostHog, use your custom domain

## Future Enhancements

- [ ] Add Mixpanel support
- [ ] Add Google Analytics 4 support
- [ ] Add custom event properties for better segmentation
- [ ] Add conversion funnel tracking
- [ ] Add cohort analysis
- [ ] Add retention tracking

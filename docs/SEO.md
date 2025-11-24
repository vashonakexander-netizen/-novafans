# SEO & Discovery Pages

NovaFans includes several public-facing pages optimized for search engine discovery and social sharing.

## Pages

### Marketing & Landing Pages

**Routes:**
- `/` - Home/Landing page
- `/for-creators` - Creator acquisition page
- `/for-fans` - Fan acquisition page
- `/pricing` - Revenue share and pricing information
- `/help` - FAQ and support page

**Features:**
- SEO-optimized metadata (title, description, OG tags)
- Clear CTAs linking to registration and onboarding
- Internal linking between marketing pages
- Footer navigation for site structure
- Analytics hooks for tracking conversions

**SEO Strategy:**
- Target keywords: "creator subscription platform", "get paid by fans", "subscription content platform"
- Each page has unique, descriptive titles and meta descriptions
- Open Graph tags for social sharing
- Canonical URLs to prevent duplicate content

### Creator Profile Pages

**Route:** `/u/[username]`

**Features:**
- Dynamic metadata generation (title, description, OG tags)
- Creator bio and profile information
- Public posts preview
- Subscription call-to-action

**Metadata Generation:**
- Uses Next.js 14 `generateMetadata()` function
- Includes creator display name, username, and bio
- Open Graph images from creator header/avatar
- Twitter Card support

**Example:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const creator = await fetchCreator(params.username);
  return {
    title: `${creator.displayName} (@${creator.username}) | NovaFans`,
    description: creator.bio || `Subscribe to ${creator.displayName}...`,
    openGraph: { ... },
  };
}
```

### Category Discovery Pages

**Route:** `/best/[category]`

**Features:**
- Category-based creator discovery
- Auto-generated category pages
- ISR (Incremental Static Regeneration) with 1 hour revalidate

**Supported Categories:**
- `fitness`
- `lifestyle`
- `gaming`
- `music`
- `comedy`
- etc.

### Tag Discovery Pages

**Route:** `/tag/[keyword]`

**Features:**
- Keyword-based discovery
- Tag aggregation
- Dynamic content generation

### AI Chat Preview Pages

**Route:** `/ai-chat/[creatorslug]`

**Features:**
- Public preview of AI persona
- Teaser conversation
- Creator information
- Subscription CTA

## Metadata Strategy

### Static Metadata (Root Layout)

Set in `apps/web/src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "NovaFans - Creator Subscription Platform",
  description: "Subscribe to your favorite creators...",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NovaFans",
  },
};
```

### Dynamic Metadata (Route-specific)

Each page generates metadata based on fetched data:

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchPageData(params);
  
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      images: data.images,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: data.images,
    },
  };
}
```

## ISR (Incremental Static Regeneration)

Pages that benefit from periodic updates use ISR:

```tsx
export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
  // Pre-generate popular pages at build time
  return [{ category: 'fitness' }, { category: 'lifestyle' }];
}
```

## Canonical URLs

All pages include canonical URLs to prevent duplicate content:

```tsx
metadata: {
  alternates: {
    canonical: `https://novafans.com/u/${username}`,
  },
}
```

## Sitemap Generation

**Route:** `/sitemap.xml`

Automatically generated sitemap including:
- All creator profiles
- Category pages
- Tag pages
- Static pages (terms, privacy, etc.)

## Robots.txt

**Route:** `/robots.txt`

Controls search engine crawling:
- Allow all public pages
- Disallow admin/dashboard routes
- Include sitemap reference

## Open Graph Images

### Dynamic OG Images

Creator pages use:
1. Creator header image (if available)
2. Creator avatar (fallback)
3. Default NovaFans logo (last resort)

### Image Optimization

All images are optimized via Next.js Image component:
- Automatic format optimization (WebP)
- Responsive sizing
- Lazy loading

## Social Sharing

All pages include:
- Open Graph tags for Facebook/LinkedIn
- Twitter Card tags
- Proper image dimensions
- Descriptive titles and descriptions

## Environment Configuration

### Production

Set in environment variables:

```env
NEXT_PUBLIC_SITE_URL=https://novafans.com
NEXT_PUBLIC_API_BASE_URL=https://api.novafans.com
```

### Development

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Performance

### Static Generation

- Creator profile pages: Server-side rendering with ISR
- Category pages: Static generation with ISR
- Tag pages: Dynamic rendering with caching

### Caching Strategy

- API responses cached via Next.js fetch caching
- Static assets cached for 1 year
- ISR pages revalidate every hour

## Best Practices

1. **Unique Titles**: Each page has a unique, descriptive title
2. **Meta Descriptions**: 150-160 characters, compelling copy
3. **Image Alt Text**: All images include descriptive alt text
4. **Structured Data**: Consider adding JSON-LD schema markup
5. **Mobile-First**: All pages are mobile-responsive
6. **Fast Loading**: Optimize images and lazy-load content

## Marketing Funnel

### Landing → Conversion Flow

1. **Landing Page (`/`)**
   - Hero section with clear value proposition
   - CTAs: "Become a Creator" → `/register?role=CREATOR`
   - CTAs: "Browse Creators" → `/creators`
   - Feature highlights linking to `/for-creators` and `/for-fans`

2. **For Creators (`/for-creators`)**
   - Detailed creator benefits and earning potential
   - CTA: "Start as a Creator" → `/register?role=CREATOR`
   - Links to `/pricing` for revenue share details

3. **For Fans (`/for-fans`)**
   - Fan benefits and how to support creators
   - CTA: "Sign up as a Fan" → `/register?role=FAN`
   - Links to `/creators` for discovery

4. **Pricing (`/pricing`)**
   - Revenue share information
   - CTA: "Start Earning Now" → `/register?role=CREATOR`

5. **Help (`/help`)**
   - FAQ covering payouts, crypto, content policy, support
   - Links to legal pages (terms, privacy, acceptable use)

### Internal Linking Structure

- Footer navigation on all pages
- Cross-linking between marketing pages
- Links from marketing pages to product pages (`/creators`, `/dashboard`)
- Legal pages linked from footer and help page

## Future Enhancements

- [ ] JSON-LD structured data for rich snippets
- [ ] Automatic sitemap generation
- [ ] Dynamic OG image generation (using @vercel/og)
- [ ] Analytics integration for SEO metrics
- [ ] A/B testing for meta descriptions
- [ ] Blog/content marketing section for SEO

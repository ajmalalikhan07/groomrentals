# Design Guidelines: Premium Wedding Attire Rental Platform

## Design Approach
**Reference-Based**: Inspired by Airbnb's booking experience, Rent the Runway's luxury rental model, and Net-a-Porter's premium e-commerce aesthetic. Combines traditional Indian wedding elegance with modern minimalism for upscale Bengaluru clientele.

## Core Design Principles
1. **Sophisticated Luxury**: Rich, warm tones convey premium quality and wedding celebration
2. **Trust & Transparency**: Clear pricing, detailed product information, social validation
3. **Visual Primacy**: High-quality photography showcases intricate attire details
4. **Effortless Booking**: Streamlined rental flow optimized for mobile-first users

## Color Palette
- **Primary Burgundy**: #8B1538 (deep maroon for CTAs, accents, headers)
- **Gold Accent**: #D4AF37 (metallic touches, badges, highlights)
- **Cream Background**: #FAF7F2 (warm ivory for page backgrounds)
- **Soft Ivory**: #FFFEF9 (card backgrounds, modals)
- **Charcoal Text**: #2D2D2D (primary typography)
- **Warm Gray**: #6B5D5D (secondary text, borders)
- **Success Green**: #2D5F3F (availability indicators)

## Typography
- **Headings**: Playfair Display (elegant serif for wedding context)
  - H1: text-5xl lg:text-6xl, font-bold
  - H2: text-3xl lg:text-4xl, font-semibold
  - H3: text-2xl, font-medium
- **Body**: Inter (clean sans-serif for readability)
  - Product names: text-xl, font-semibold
  - Body: text-base, font-normal
  - Captions: text-sm, font-light
  - Pricing: text-lg, font-bold (burgundy color)

## Layout System
**Spacing Units**: 4, 6, 8, 12, 16, 24 (Tailwind)
- Cards: p-6 (mobile), p-8 (desktop)
- Sections: py-16 (mobile), py-24 lg:py-32 (desktop)
- Grid gaps: gap-6 (mobile), gap-8 lg:gap-12 (desktop)

## Component Library

### Navigation
Sticky header (cream background, subtle shadow): Logo left, centered search bar, cart/account icons right. Mobile: hamburger with full-screen overlay menu. Category pills below header with horizontal scroll.

### Hero Section
Full-width hero (85vh) with stunning image of groom in ornate burgundy sherwani at luxury Bengaluru palace venue. Dark gradient overlay (bottom to top). Centered content: "Elevate Your Wedding Presence" (Playfair Display, cream text), subheading "Premium Indian Attire for Every Celebration", dual CTAs with blurred burgundy/gold backgrounds ("Explore Collection", "How It Works").

### Product Catalog
Grid: 2 columns (mobile), 3 columns (tablet), 4 columns (desktop). Card design: Square product image with subtle hover lift, cream background, thin gold border. Overlay badge for "Trending" or "New Arrival". Below image: Product name, rental price/day in burgundy, size range in warm gray, availability status with green/amber dot.

### Product Detail Page
Desktop: 60/40 split (gallery/booking). Gallery: Large hero image with 4-5 thumbnails below (square grid). Zoom on click. Booking panel (ivory card with shadow): Calendar widget, size selector buttons, fabric details accordion, price breakdown table, burgundy "Reserve Now" button, delivery information with icon list.

### Booking Calendar
Custom design: Month grid with warm gray borders, burgundy for selected dates, gold outline for hover, disabled dates in light gray with diagonal stripe. Display rental duration and total as selection updates.

### Shopping Cart
Right slide-out panel (ivory background): Cart items with thumbnail, dates, subtotal. Sticky footer with total breakdown and burgundy checkout button. Empty state with gold illustration.

### Homepage Sections
1. **Featured Collections**: 3-column grid (Sangeet, Reception, Mehendi) with category imagery and gold "Shop Now" links
2. **How It Works**: 4-step process with numbered icons (gold), concise descriptions, timeline visual
3. **Premium Guarantees**: 3-column cards (Quality Assurance, Expert Fitting, Hassle-Free Returns) with icons
4. **Customer Stories**: Carousel of testimonials with customer wedding photos, 5-star ratings in gold
5. **Occasion Lookbook**: 2-column image grid showcasing complete outfit coordination
6. **Newsletter**: Cream section with "Join Our Community" heading, email input, burgundy subscribe button

### Footer
Rich burgundy background with gold text. 4-column layout: About/Contact, Quick Links, Customer Care, Payment/Social badges. Newsletter signup integrated. Trust indicators: secure payment icons, Bengaluru delivery badge.

### Admin Dashboard
Sidebar (burgundy background, gold active state), main content area with stats cards (ivory, gold accent borders), data tables with burgundy headers, action buttons, CRUD forms with two-column desktop layout.

## Images

**Hero**: Groom in intricate burgundy/gold sherwani at Bangalore Palace courtyard during golden hour, shallow depth of field

**Product Catalog**: Studio shots on seamless cream backdrop, consistent lighting, full-length and detail shots

**Category Banners**: Lifestyle images of sherwanis at outdoor venues, kurtas in wedding halls, suits at receptions

**Trust Section**: Real customer photos from Bengaluru weddings, diverse occasions, authentic celebrations

**Process Icons**: Illustrated steps for booking, delivery, fitting, return in gold line-art style

## Responsive Strategy
- Mobile (<640px): Single column, stacked layouts, hamburger navigation
- Tablet (640-1024px): 2-column grids, condensed calendar
- Desktop (>1024px): Multi-column layouts, side-by-side panels, expanded filters

## Premium Details
- Gold accent borders on hover states
- Subtle shadows for depth (never harsh)
- Rounded corners: 8px (cards), 4px (buttons)
- Micro-interactions: Smooth transitions (200ms), gentle scaling (1.02)
- Quality badges with gold foil effect
- Price displays with rupee symbol formatting (₹12,500/day)
- Size guide modal with detailed measurements table
- WhatsApp inquiry button (floating, bottom-right, gold)
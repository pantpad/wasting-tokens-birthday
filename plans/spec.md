# 🧠💀 BRAINROT BIRTHDAY: Michael Edition

## Project Overview

A mobile-first, TikTok/Reels-style brainrot website celebrating Michael's birthday. The site delivers escalating visual and audio chaos that intensifies over time, featuring white BMW references (Michael's favorite) and maximum sensory overload.

**Hosting:** Cloudflare Pages  
**Stack:** React + Vite + Howler.js for audio  
**Primary Target:** Mobile (touch-first, vertical orientation)

---

## User Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. BLACK VOID (1 seconds)                              │
│     - Pure black screen                                 │
│     - "TAP HERE" text (white, centered)                 │
│     - No hints, no loading indicators                   │
│     - Waiting for first user tap                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (user taps)
┌─────────────────────────────────────────────────────────┐
│  2. CHAOS BEGINS (0-10 seconds escalation)              │
│     - Videos load and start playing                     │
│     - Audio triggers on every interaction               │
│     - Chaos multipliers activate progressively          │
│     - Each second = more unhinged                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (after ~10 seconds)
┌─────────────────────────────────────────────────────────┐
│  3. MAXIMUM CHAOS (infinite)                            │
│     - All effects at full intensity                     │
│     - No ending, no mercy                               │
│     - Swiping changes video but keeps chaos level       │
│     - "Happy Birthday" appears randomly                 │
└─────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. The Black Void Entry

- **Duration:** 1 seconds of pure black
- **Content:** White "TAP HERE" text, centered, possibly pulsing subtly
- **Behavior:** Waits for first tap (required for mobile audio unlock)
- **No loading indicators** - should feel broken/empty

### 2. TikTok-Style Vertical Feed

- Full-screen vertical video container
- **Swipe up/down** to navigate to "next content"
- Each swipe shows a **different video** from the pool
- **Chaos level persists** across swipes (doesn't reset)
- Videos loop infinitely

### 3. Video Chaos System

**Base Behavior:**
- Videos duplicate and multiply on screen
- Random bouncing (DVD screensaver style, can clip edges)
- Random zoom pulses
- Random rotation/spinning

**Video Directory:** `/videos`

**Current Videos (auto-detected from folder):**
```
- Happy Birthday To You — Italian Brainrot Edition - Bernie Espo (720p, h264, youtube).mp4
- YTDown.com_Shorts_BRAINROT-BIRTHDAY-brainrot-tungtungtungs_Media_HvSRlRw9p-E_001_1080p.mp4
- YTDown.com_YouTube_Happy-Birthday-To-You-Italian-Brainrot-E_Media_yE4CdgogwC4_002_720p.mp4
```

**Extensible:** Adding more .mp4 files to `/videos` automatically increases chaos potential.

### 4. Audio Chaos System (Howler.js)

**Trigger:** EVERY user interaction
- Tap/click
- Scroll/swipe
- Touch move
- Any pointer event

**Behavior:**
- Random sound from pool plays on each interaction
- **Max 8 simultaneous sounds** (prevents audio blowout)
- Audio ducking when approaching limit (compress, don't clip)
- Sounds should be maximally annoying

**Audio Directory:** `/audios`

**Current Audio (auto-detected from folder):**
```
- Happy Birthday song.mp3
```

**Extensible:** Adding more .mp3 files to `/audios` automatically adds them to the sound pool.

### 5. Time-Based Escalation (The Rot)

Chaos multipliers activate progressively over ~10 seconds after first tap:

| Time | Chaos Level | Effects Active |
|------|-------------|----------------|
| 0-1s | 1 | Single video, basic audio |
| 1-2s | 2 | Video starts duplicating (2-3 clones) |
| 2-3s | 3 | Bouncing begins, slight screen shake |
| 3-4s | 4 | Rotation/spinning on videos |
| 4-5s | 5 | Color hue shifting begins |
| 5-6s | 6 | Zoom pulses, more video clones |
| 6-7s | 7 | Glitch overlays, playback speed changes |
| 7-8s | 8 | Fake UI elements (errors, spinners) |
| 8-9s | 9 | Random meme text spawning |
| 9-10s | 10 | MAXIMUM - all effects at full intensity |
| 10s+ | ∞ | Maintains max chaos, "Happy Birthday" starts appearing |

**After max chaos:** Level doesn't decrease. Swiping changes video content but chaos stays at maximum.

---

## Chaos Effects Catalog

### Visual Effects

1. **Video Clones**
   - Videos duplicate randomly on screen
   - Each clone can have different transform properties
   - Max clones: 10-15 (performance cap)

2. **Bouncing/Movement**
   - DVD screensaver physics
   - Can escape edges and return from unexpected places
   - Random velocity changes

3. **Rotation/Spinning**
   - Random rotation angles
   - Some videos spin continuously
   - Speed varies

4. **Screen Shake**
   - Intensity increases with chaos level
   - Uses CSS transform on body/container
   - Subtle at first, violent at max

5. **Color Manipulation**
   - Hue rotation (rainbow cycling)
   - Occasional inversion
   - Saturation spikes

6. **Zoom Pulses**
   - Everything "breathes" (scale 1.0 → 1.1 → 1.0)
   - Frequency increases with chaos
   - Individual elements can pulse independently

7. **Playback Speed**
   - Videos randomly speed up (2x, 3x)
   - Slow down (0.5x, 0.25x)
   - Occasional reverse (if supported)

8. **Glitch/Datamosh Overlays**
   - CSS filters: `contrast`, `brightness` spikes
   - Chromatic aberration effect (RGB split)
   - Scan lines
   - Random "corruption" rectangles

9. **Fake UI Breaking**
   - Fake error popups ("ERROR: Too much brainrot")
   - Loading spinners that go nowhere
   - Fake "buffering" indicators
   - "Your phone is overheating" fake warnings

10. **Random Text Spawns**
    - Meme phrases: "SKIBIDI", "OHIO", "SIGMA", "RIZZ", "GYATT"
    - Float across screen
    - Random sizes, rotations, colors
    - "Happy Birthday Michael" in white (increases frequency over time)

### BMW Integration (The Michael Touch)

**Escalation-based appearance:**

- **Level 3+:** White BMW images start appearing, bouncing around
- **Level 5+:** Text overlays: "BMW GRINDSET", "WHITE BMW ENERGY", "M POWER"
- **Level 7+:** BMW logo watermarks multiply
- **Level 10:** Background occasionally flashes to BMW dealership aesthetic (white/blue color scheme)
- **Easter egg:** One of the videos should ideally be BMW-related (user can provide)

---

## Technical Specifications

### File Structure

```
/meme-compleanno
├── index.html
├── style.css
├── main.js
├── /audios                    ← AUDIO FILES HERE
│   └── Happy Birthday song.mp3
├── /videos                    ← VIDEO FILES HERE
│   ├── Happy Birthday To You — Italian Brainrot Edition - Bernie Espo (720p, h264, youtube).mp4
│   ├── YTDown.com_Shorts_BRAINROT-BIRTHDAY-brainrot-tungtungtungs_Media_HvSRlRw9p-E_001_1080p.mp4
│   └── YTDown.com_YouTube_Happy-Birthday-To-You-Italian-Brainrot-E_Media_yE4CdgogwC4_002_720p.mp4
├── /images
│   ├── bmw-white.png
│   ├── bmw-logo.png
│   └── ... (BMW assets)
├── /plans
│   └── spec.md
└── package.json (for Howler.js)
```

### Dependencies

```json
{
  "dependencies": {
    "howler": "^2.2.4"
  }
}
```

### Performance Considerations

**Goal:** Maintain playable FPS while maximizing chaos

- **Video clone cap:** 15 max simultaneously
- **Sound cap:** 8 simultaneous sounds
- **Text element cap:** 20 floating texts max
- **Use CSS transforms** (GPU accelerated) over position changes
- **RequestAnimationFrame** for smooth animations
- **Lazy load videos** not currently in view
- **Consider reducing effects** if frame drops detected (optional fallback)

### Mobile Optimizations

- Touch events as primary interaction
- Prevent default scroll behavior (custom swipe handling)
- Full viewport (100dvh for mobile address bar)
- No pinch zoom (meta viewport)
- Audio context resume on tap (iOS requirement)

---

## Interaction Map

| User Action | Trigger |
|-------------|---------|
| Tap anywhere | Random sound plays |
| Swipe up | Next video, sound plays |
| Swipe down | Previous video, sound plays |
| Touch and drag | Continuous sounds while touching |
| Scroll (if any) | Sound per scroll event |
| Long press | Extra sounds? (optional) |
| Shake device | Bonus chaos (optional, uses DeviceMotion API) |

---

## Content Requirements (User Provides)

### Videos
- **Location:** `/videos` folder
- **Format:** MP4 (H.264 codec for compatibility)
- **Aspect ratio:** 9:16 (vertical) preferred
- **Length:** 5-15 second loops ideal
- **Content:** Brainrot memes, cursed content, funny clips
- **Bonus:** At least one white BMW video

### Audio
- **Location:** `/audios` folder
- **Format:** MP3 (best mobile compatibility)
- **Length:** Short clips (0.5-3 seconds) for interaction sounds, longer for background
- **Content:** Annoying sounds, meme audio, vine booms, bass boosts, random screams, brainrot audio clips

### Images
- White BMW photo (transparent PNG ideal)
- BMW logo
- Any other Michael-specific meme images

---

## Visual Style Guide

### Typography
- **"TAP HERE" / "Happy Birthday":** Bold, white, sans-serif (Impact or similar meme font)
- **Meme text:** Mixed fonts for chaos (Comic Sans, Impact, Arial Black)
- **Fake errors:** System font to look "real"

### Color Palette
- **Base:** Deep black (#000000)
- **Primary text:** Pure white (#FFFFFF)
- **Accent (BMW):** BMW Blue (#0066B1)
- **Chaos colors:** Full RGB spectrum (hue rotation)

### Animation Timing
- **Escalation:** Linear over 10 seconds
- **Bouncing:** Physics-based, random velocities
- **Pulses:** 0.3-0.8s intervals, eased
- **Screen shake:** 50-100ms intervals at max
- **Text spawns:** Every 0.5-2s at max chaos

---

## Edge Cases & Considerations

1. **Audio autoplay restriction:** Handled by "TAP HERE" entry gate
2. **User leaves and returns:** Chaos level could reset or persist (recommend: persist in sessionStorage)
3. **Very long sessions:** Memory management - remove oldest clones when at cap
4. **Slow devices:** CSS-only fallback effects if JS struggles
5. **Landscape mode:** Detect and show "ROTATE YOUR PHONE" message (optional)

---

## Success Criteria

- [ ] Black void → tap → chaos escalation works smoothly
- [ ] Videos load and display in vertical feed
- [ ] Swiping changes video content
- [ ] Every interaction triggers sound
- [ ] Chaos escalates over 10 seconds
- [ ] All visual effects functional
- [ ] "Happy Birthday Michael" appears randomly
- [ ] White BMW references present
- [ ] Maintains playable FPS on modern phones
- [ ] Deployable to Cloudflare Pages

---

## Future Enhancements (If Desired)

- Device shake detection for bonus chaos
- Confetti explosion at certain milestones
- "Congratulations you survived X seconds" counter
- Share button that screenshots current chaos
- Secret konami code for ultra-mega-chaos mode
- Custom sound upload feature

---

*This document serves as the complete specification for the Brainrot Birthday website. May Michael's FPS be high and his sanity be low.* 🎂💀🚗

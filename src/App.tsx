import { useState, useCallback, useRef, useEffect } from "react";
import { Howl, Howler } from "howler";
import "./App.css";

// Escalation system constants
const MAX_CHAOS_LEVEL = 10;
const ESCALATION_INTERVAL = 1000; // 1 second per level

// Screen shake constants
const SHAKE_START_LEVEL = 3; // Chaos level when shake begins
const SHAKE_MIN_INTERVAL = 50; // ms - interval at max chaos (violent)
const SHAKE_MAX_INTERVAL = 200; // ms - interval at start (subtle)
const SHAKE_MIN_INTENSITY = 2; // px - subtle shake at level 3
const SHAKE_MAX_INTENSITY = 15; // px - violent shake at max chaos

// Video clone constants
const MAX_VIDEO_CLONES = 15; // Maximum simultaneous video clones for performance
const CLONE_START_LEVEL = 2; // Chaos level when clones start appearing

// Bouncing physics constants
const BOUNCE_START_LEVEL = 3; // Chaos level when bouncing begins
const BASE_VELOCITY = 0.1; // Base velocity (percentage per frame)
const MAX_VELOCITY = 0.5; // Maximum velocity at max chaos
const VELOCITY_CHANGE_CHANCE = 0.01; // 1% chance per frame to change velocity randomly
const VELOCITY_CHANGE_MAGNITUDE = 0.2; // How much velocity can change randomly

// Rotation and spinning constants
const ROTATION_START_LEVEL = 4; // Chaos level when rotation/spinning begins
const MIN_SPIN_SPEED = 0.2; // Minimum spin speed (degrees per frame)
const MAX_SPIN_SPEED = 2.0; // Maximum spin speed (degrees per frame)

// Color manipulation constants
const COLOR_START_LEVEL = 5; // Chaos level when color effects begin
const HUE_ROTATION_MAX = 360; // Maximum hue rotation (degrees) - full spectrum
const HUE_ROTATION_SPEED = 1; // Degrees per frame for rainbow cycling
const SATURATION_SPIKE_CHANCE = 0.02; // 2% chance per frame for saturation spike
const SATURATION_SPIKE_INTENSITY = 200; // Saturation percentage for spikes (200% = double saturation)
const COLOR_INVERSION_CHANCE = 0.01; // 1% chance per frame for color inversion
const COLOR_INVERSION_DURATION = 200; // ms - how long inversion lasts

// Zoom pulse constants
const ZOOM_PULSE_START_LEVEL = 6; // Chaos level when zoom pulses begin
const PULSE_MIN_INTERVAL = 300; // ms - pulse interval at level 6 (slower)
const PULSE_MAX_INTERVAL = 800; // ms - pulse interval at level 6 (slower)
const PULSE_MIN_INTERVAL_MAX_CHAOS = 200; // ms - pulse interval at max chaos (faster)
const PULSE_SCALE_MIN = 1.0; // Minimum scale (normal size)
const PULSE_SCALE_MAX = 1.1; // Maximum scale (10% larger)

// Video playback speed constants
const PLAYBACK_SPEED_START_LEVEL = 7; // Chaos level when playback speed changes begin
const PLAYBACK_SPEED_CHANGE_INTERVAL = 2000; // ms - how often to change speeds
const PLAYBACK_SPEED_OPTIONS = [0.25, 0.5, 1.0, 2.0, 3.0]; // Available playback speeds

// Glitch and datamosh constants
const GLITCH_START_LEVEL = 7; // Chaos level when glitch effects begin
const CONTRAST_SPIKE_CHANCE = 0.03; // 3% chance per frame for contrast spike
const CONTRAST_SPIKE_MIN = 100; // Normal contrast
const CONTRAST_SPIKE_MAX = 200; // Maximum contrast spike (200% = double contrast)
const BRIGHTNESS_SPIKE_CHANCE = 0.03; // 3% chance per frame for brightness spike
const BRIGHTNESS_SPIKE_MIN = 100; // Normal brightness
const BRIGHTNESS_SPIKE_MAX = 150; // Maximum brightness spike (150% = 50% brighter)
const CHROMATIC_ABERRATION_MAX = 5; // Maximum RGB split in pixels
const CORRUPTION_RECTANGLE_CHANCE = 0.01; // 1% chance per frame to spawn corruption rectangle
const MAX_CORRUPTION_RECTANGLES = 5; // Maximum corruption rectangles on screen
const CORRUPTION_RECTANGLE_DURATION = 300; // ms - how long corruption rectangles last

// Fake UI breaking elements constants
const FAKE_UI_START_LEVEL = 8; // Chaos level when fake UI elements begin
const FAKE_UI_SPAWN_CHANCE = 0.02; // 2% chance per frame to spawn a fake UI element
const MAX_FAKE_UI_ELEMENTS = 5; // Maximum fake UI elements on screen simultaneously
const FAKE_UI_DURATION = 3000; // ms - how long fake UI elements last

// Floating meme text constants
const MEME_TEXT_START_LEVEL = 9; // Chaos level when meme text begins spawning
const MEME_TEXT_PHRASES = ["SKIBIDI", "OHIO", "SIGMA", "RIZZ", "GYATT"]; // Meme phrases to spawn
const MEME_TEXT_FONTS = [
  "Comic Sans MS", // Comic Sans for chaos
  'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif', // Impact (already used)
  "Arial Black, Arial, sans-serif", // Arial Black for bold chaos
]; // Mixed fonts for chaos as per spec
const MAX_FLOATING_TEXTS = 20; // Maximum floating texts on screen simultaneously
const MEME_TEXT_MIN_SPAWN_INTERVAL = 500; // ms - minimum spawn interval at max chaos
const MEME_TEXT_MAX_SPAWN_INTERVAL = 2000; // ms - maximum spawn interval at level 9
const MEME_TEXT_MIN_SPAWN_INTERVAL_MAX_CHAOS = 500; // ms - minimum spawn interval at max chaos
const MEME_TEXT_SPEED_MIN = 0.05; // % per frame - minimum movement speed
const MEME_TEXT_SPEED_MAX = 0.3; // % per frame - maximum movement speed
const MEME_TEXT_MIN_SIZE = 1.5; // rem - minimum font size
const MEME_TEXT_MAX_SIZE = 4.0; // rem - maximum font size

// Happy Birthday text constants
const BIRTHDAY_TEXT_START_LEVEL = 10; // Chaos level when birthday text begins spawning
const BIRTHDAY_TEXT_PHRASE = "Happy Birthday Michael"; // Birthday text phrase
const MAX_FLOATING_BIRTHDAY_TEXTS = 5; // Maximum floating birthday texts on screen simultaneously
const BIRTHDAY_TEXT_MIN_SPAWN_INTERVAL_AFTER_MAX = 500; // ms - minimum spawn interval after max chaos (increased frequency)
const BIRTHDAY_TEXT_MAX_SPAWN_INTERVAL_AFTER_MAX = 1500; // ms - maximum spawn interval after max chaos (increased frequency)
const BIRTHDAY_TEXT_SPEED_MIN = 0.03; // % per frame - minimum movement speed (slower than meme text)
const BIRTHDAY_TEXT_SPEED_MAX = 0.15; // % per frame - maximum movement speed (slower than meme text)
const BIRTHDAY_TEXT_MIN_SIZE = 2.5; // rem - minimum font size (larger than meme text)
const BIRTHDAY_TEXT_MAX_SIZE = 4.5; // rem - maximum font size (larger than meme text)

// BMW integration constants
const BMW_START_LEVEL = 3; // Chaos level when BMW images start bouncing (level 3+)
const BMW_TEXT_START_LEVEL = 5; // Chaos level when BMW text overlays appear (level 5+)
const BMW_LOGO_START_LEVEL = 7; // Chaos level when BMW logo watermarks multiply (level 7+)
const BMW_BACKGROUND_START_LEVEL = 10; // Chaos level when background flashes BMW aesthetic (level 10)
const MAX_BMW_IMAGES = 8; // Maximum BMW images bouncing simultaneously
const MAX_BMW_TEXTS = 10; // Maximum BMW text overlays on screen
const MAX_BMW_LOGOS = 15; // Maximum BMW logo watermarks on screen
const BMW_BLUE = "#0066B1"; // BMW Blue accent color
const BMW_TEXT_PHRASES = ["BMW GRINDSET", "WHITE BMW ENERGY", "M POWER"]; // BMW text phrases
const BMW_TEXT_MIN_SIZE = 1.8; // rem - minimum font size for BMW text
const BMW_TEXT_MAX_SIZE = 3.5; // rem - maximum font size for BMW text
const BMW_TEXT_SPEED_MIN = 0.04; // % per frame - minimum movement speed
const BMW_TEXT_SPEED_MAX = 0.2; // % per frame - maximum movement speed
const BMW_BACKGROUND_FLASH_INTERVAL = 300; // ms - background flash interval at max chaos

// Audio pool - available audio files in the public/audios folder
// Only include files that actually exist - lazy loaded when needed
const AUDIO_POOL = [
  "/audios/All Italian Brainrot Animals Sound Effect  2025.mp3",
  "/audios/Amogus - Sound effect.mp3",
  "/audios/Baba Booey - Sound Effect (HD).mp3",
  "/audios/Boy what the hell boy Sound Effect.mp3",
  "/audios/Guy Speaks Plants vs Zombies Victory Theme.mp3",
  "/audios/Happy Birthday song.mp3",
  "/audios/Taco Bell Bong SFX.mp3",
  "/audios/You Stupid - Sound Effect (HD).mp3",
];

// Audio system constants
const MAX_SIMULTANEOUS_SOUNDS = 8;
const DUCKING_THRESHOLD = 5; // Start ducking volume at this many sounds
const BASE_VOLUME = 0.5;
const DUCKED_VOLUME = 0.3; // Volume when ducking is active
const FADEOUT_DURATION = 200; // ms to fade out oldest sound
const AUDIO_THROTTLE_MS = 150; // Minimum milliseconds between sound plays to prevent audio overload

// Type for tracking active sounds
interface ActiveSound {
  howl: Howl;
  startTime: number;
}

// Type for video clone properties
interface VideoClone {
  id: string;
  x: number; // Position X (percentage)
  y: number; // Position Y (percentage)
  rotation: number; // Rotation in degrees
  scale: number; // Scale factor
  vx: number; // Velocity X (percentage per frame)
  vy: number; // Velocity Y (percentage per frame)
  spinSpeed: number; // Spin speed (degrees per frame, 0 if not spinning)
  playbackSpeed: number; // Playback speed multiplier (1.0 = normal, 2.0 = 2x, 0.5 = 0.5x)
}

// Type for fake UI breaking elements
type FakeUIType = "error" | "loading" | "buffering" | "overheating";

interface FakeUIElement {
  id: string;
  type: FakeUIType;
  x: number; // Position X (percentage)
  y: number; // Position Y (percentage)
}

// Type for floating meme text
interface FloatingText {
  id: string;
  text: string;
  x: number; // Position X (percentage)
  y: number; // Position Y (percentage)
  rotation: number; // Rotation in degrees
  size: number; // Font size in rem
  color: string; // Text color (hex)
  fontFamily: string; // Font family for typography variety
  vx: number; // Velocity X (percentage per frame)
  vy: number; // Velocity Y (percentage per frame)
  createdAt: number; // Timestamp for tracking oldest elements
}

// Type for BMW bouncing images
interface BMWImage {
  id: string;
  x: number; // Position X (percentage)
  y: number; // Position Y (percentage)
  rotation: number; // Rotation in degrees
  scale: number; // Scale factor
  vx: number; // Velocity X (percentage per frame)
  vy: number; // Velocity Y (percentage per frame)
  spinSpeed: number; // Spin speed (degrees per frame, 0 if not spinning)
}

// Type for BMW text overlays
interface BMWText {
  id: string;
  text: string;
  x: number; // Position X (percentage)
  y: number; // Position Y (percentage)
  rotation: number; // Rotation in degrees
  size: number; // Font size in rem
  vx: number; // Velocity X (percentage per frame)
  vy: number; // Velocity Y (percentage per frame)
  createdAt: number; // Timestamp for tracking oldest elements
}

// Type for BMW logo watermarks
interface BMWLogo {
  id: string;
  x: number; // Position X (percentage)
  y: number; // Position Y (percentage)
  rotation: number; // Rotation in degrees
  scale: number; // Scale factor
  opacity: number; // Opacity (0-1)
}

// Video pool - available videos in the public/videos folder
const VIDEO_POOL = [
  "/videos/Happy Birthday To You — Italian Brainrot Edition - Bernie Espo (720p, h264, youtube).mp4",
  "/videos/videoplayback.mp4",
  "/videos/YTDown.com_Shorts_BRAINROT-BIRTHDAY-brainrot-tungtungtungs_Media_HvSRlRw9p-E_001_1080p.mp4",
  "/videos/YTDown.com_YouTube_Happy-Birthday-To-You-Italian-Brainrot-E_Media_yE4CdgogwC4_002_720p.mp4",
];

// Image pool - BMW assets in the public/images folder
// Note: Image files (bmw-white.png, bmw-logo.png) should be added to public/images/
// This will be used by the BMW integration feature
export const IMAGE_POOL = {
  bmwWhite: "/images/bmw-white.png",
  bmwLogo: "/images/bmw-logo.png",
};

// Minimum swipe distance in pixels to trigger video change
const SWIPE_THRESHOLD = 50;

function App() {
  const [chaosStarted, setChaosStarted] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [chaosLevel, setChaosLevel] = useState(1);
  const [videoClones, setVideoClones] = useState<VideoClone[]>([]);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const clonesRef = useRef<VideoClone[]>([]); // Ref to track clones for animation loop

  // Touch tracking refs for swipe detection
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Track active sounds for limiting simultaneous playback
  const activeSoundsRef = useRef<ActiveSound[]>([]);

  // Throttle audio playback to prevent overwhelming mobile browsers
  const lastSoundPlayTimeRef = useRef<number>(0);

  // Escalation timer ref for cleanup
  const escalationTimerRef = useRef<number | null>(null);

  // Screen shake state
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const shakeTimerRef = useRef<number | null>(null);

  // Color manipulation state
  const [hueRotation, setHueRotation] = useState(0); // Current hue rotation in degrees
  const [saturation, setSaturation] = useState(100); // Saturation percentage (100% = normal)
  const [isInverted, setIsInverted] = useState(false); // Color inversion state
  const colorAnimationFrameRef = useRef<number | null>(null);
  const inversionTimerRef = useRef<number | null>(null);

  // Zoom pulse state - track pulse scale for base video and clones
  const [baseVideoPulseScale, setBaseVideoPulseScale] = useState(1.0); // Base video pulse scale
  const [clonePulseScales, setClonePulseScales] = useState<Map<string, number>>(
    new Map()
  ); // Clone pulse scales by ID
  const pulseTimersRef = useRef<Map<string, number>>(new Map()); // Track pulse timers for cleanup

  // Video playback speed state
  const [baseVideoPlaybackSpeed, setBaseVideoPlaybackSpeed] = useState(1.0); // Base video playback speed
  const playbackSpeedTimerRef = useRef<number | null>(null); // Timer for changing playback speeds

  // Glitch and datamosh state
  const [glitchContrast, setGlitchContrast] = useState(100); // Contrast percentage (100% = normal)
  const [glitchBrightness, setGlitchBrightness] = useState(100); // Brightness percentage (100% = normal)
  const [chromaticAberration, setChromaticAberration] = useState(0); // RGB split offset in pixels
  const [corruptionRectangles, setCorruptionRectangles] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      opacity: number;
    }>
  >([]);
  const glitchAnimationFrameRef = useRef<number | null>(null);
  const corruptionTimersRef = useRef<Map<string, number>>(new Map()); // Track corruption rectangle timers

  // Fake UI breaking elements state
  const [fakeUIElements, setFakeUIElements] = useState<FakeUIElement[]>([]);
  const fakeUIAnimationFrameRef = useRef<number | null>(null);
  const fakeUITimersRef = useRef<Map<string, number>>(new Map()); // Track fake UI element timers

  // Floating meme text state
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const memeTextAnimationFrameRef = useRef<number | null>(null);
  const memeTextSpawnTimerRef = useRef<number | null>(null);
  const memeTextCounterRef = useRef<number>(0); // Counter for unique IDs

  // Floating birthday text state
  const [floatingBirthdayTexts, setFloatingBirthdayTexts] = useState<
    FloatingText[]
  >([]);
  const birthdayTextAnimationFrameRef = useRef<number | null>(null);
  const birthdayTextSpawnTimerRef = useRef<number | null>(null);
  const birthdayTextCounterRef = useRef<number>(0); // Counter for unique IDs

  // BMW integration state
  const [bmwImages, setBmwImages] = useState<BMWImage[]>([]);
  const bmwImagesRef = useRef<BMWImage[]>([]); // Ref for animation loop
  const bmwImagesAnimationFrameRef = useRef<number | null>(null);
  const [bmwTexts, setBmwTexts] = useState<BMWText[]>([]);
  const bmwTextAnimationFrameRef = useRef<number | null>(null);
  const bmwTextSpawnTimerRef = useRef<number | null>(null);
  const bmwTextCounterRef = useRef<number>(0);
  const [bmwLogos, setBmwLogos] = useState<BMWLogo[]>([]);
  const bmwLogoAnimationFrameRef = useRef<number | null>(null);
  const [bmwBackgroundColor, setBmwBackgroundColor] =
    useState<string>("#000000"); // Black by default
  const bmwBackgroundFlashTimerRef = useRef<number | null>(null);

  // Ref to track the initial birthday song sound
  const initialBirthdaySoundRef = useRef<Howl | null>(null);

  /**
   * Creates the initial birthday song sound instance (but doesn't play it).
   * Will be played when user taps to start chaos (mobile autoplay restriction).
   */
  useEffect(() => {
    // Don't try to autoplay - mobile browsers will block it
    // Instead, create the sound instance ready to play when user interacts
    const birthdaySongSrc = "/audios/Happy Birthday song.mp3";

    // Create the sound instance (but don't autoplay - will fail on mobile)
    const sound = new Howl({
      src: [birthdaySongSrc],
      volume: BASE_VOLUME,
      html5: false, // Use Web Audio API for better mobile support
    });

    // Store reference for later playback
    initialBirthdaySoundRef.current = sound;

    // Cleanup on unmount
    return () => {
      if (initialBirthdaySoundRef.current) {
        initialBirthdaySoundRef.current.unload();
        initialBirthdaySoundRef.current = null;
      }
    };
  }, []); // Run once on mount

  /**
   * Time-based escalation system.
   * Increments chaos level every second from 1 to 10 over 10 seconds.
   * Once level 10 is reached, the timer stops and chaos stays at maximum.
   */
  useEffect(() => {
    if (!chaosStarted) return;

    // Start the escalation timer
    escalationTimerRef.current = window.setInterval(() => {
      setChaosLevel((prev) => {
        if (prev >= MAX_CHAOS_LEVEL) {
          // Reached maximum - clear the interval
          if (escalationTimerRef.current !== null) {
            clearInterval(escalationTimerRef.current);
            escalationTimerRef.current = null;
          }
          return MAX_CHAOS_LEVEL;
        }
        return prev + 1;
      });
    }, ESCALATION_INTERVAL);

    // Cleanup on unmount or when chaos stops
    return () => {
      if (escalationTimerRef.current !== null) {
        clearInterval(escalationTimerRef.current);
        escalationTimerRef.current = null;
      }
    };
  }, [chaosStarted]);

  /**
   * Video clone generation system.
   * Creates video clones based on chaos level, with random transforms.
   * Clones start appearing at level 2 and increase up to max (15).
   */
  useEffect(() => {
    if (!chaosStarted) {
      setVideoClones([]);
      return;
    }

    // Calculate number of clones based on chaos level
    // Level 1: 1 video (no clones)
    // Level 2: 2-3 total videos (1 base + 1-2 clones)
    // Level 3-10: Increasing clones up to MAX_VIDEO_CLONES total
    let totalVideoCount = 1; // Base video only at level 1

    if (chaosLevel >= CLONE_START_LEVEL) {
      // At level 2, we want 2-3 total (1 base + 1-2 clones)
      if (chaosLevel === CLONE_START_LEVEL) {
        totalVideoCount = 2 + Math.floor(Math.random() * 2); // 2 or 3 total
      } else {
        // For levels 3-10, scale from ~4 to MAX_VIDEO_CLONES total
        const levelProgress =
          (chaosLevel - CLONE_START_LEVEL) /
          (MAX_CHAOS_LEVEL - CLONE_START_LEVEL);
        const minTotal = 4;
        const maxTotal = MAX_VIDEO_CLONES;
        totalVideoCount = Math.floor(
          minTotal + levelProgress * (maxTotal - minTotal)
        );
        // Add some randomness
        totalVideoCount += Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        totalVideoCount = Math.min(totalVideoCount, MAX_VIDEO_CLONES);
      }
    }

    // Generate clones (totalVideoCount - 1, since 1 is the base video)
    const cloneCount = totalVideoCount - 1;
    const clones: VideoClone[] = [];
    for (let i = 0; i < cloneCount; i++) {
      // Calculate velocity based on chaos level
      const levelProgress =
        chaosLevel >= BOUNCE_START_LEVEL
          ? (chaosLevel - BOUNCE_START_LEVEL) /
            (MAX_CHAOS_LEVEL - BOUNCE_START_LEVEL)
          : 0;
      const velocity =
        BASE_VELOCITY + levelProgress * (MAX_VELOCITY - BASE_VELOCITY);

      // Random initial velocity direction
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      // Calculate spin speed if rotation is active (chaos level 4+)
      let spinSpeed = 0;
      if (chaosLevel >= ROTATION_START_LEVEL) {
        // Some videos spin continuously, some don't (70% chance to spin)
        if (Math.random() < 0.7) {
          // Spin speed varies per video (random between min and max)
          // Speed also scales with chaos level
          const levelProgress =
            (chaosLevel - ROTATION_START_LEVEL) /
            (MAX_CHAOS_LEVEL - ROTATION_START_LEVEL);
          const baseSpinSpeed =
            MIN_SPIN_SPEED + Math.random() * (MAX_SPIN_SPEED - MIN_SPIN_SPEED);
          spinSpeed = baseSpinSpeed * (1 + levelProgress); // Faster at higher chaos levels
          // Random direction (clockwise or counterclockwise)
          if (Math.random() < 0.5) {
            spinSpeed = -spinSpeed;
          }
        }
      }

      // Calculate playback speed if speed changes are active (chaos level 7+)
      let playbackSpeed = 1.0; // Default normal speed
      if (chaosLevel >= PLAYBACK_SPEED_START_LEVEL) {
        // Random playback speed from available options
        const randomIndex = Math.floor(
          Math.random() * PLAYBACK_SPEED_OPTIONS.length
        );
        playbackSpeed = PLAYBACK_SPEED_OPTIONS[randomIndex];
      }

      clones.push({
        id: `clone-${i}-${Date.now()}-${Math.random()}`,
        // Random position (0-100% for both axes, but keep some on screen)
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 80 + 10, // 10-90%
        // Random rotation (-180 to 180 degrees)
        rotation: (Math.random() - 0.5) * 360,
        // Random scale (0.5 to 1.5)
        scale: Math.random() * 1.0 + 0.5,
        // Initial velocity
        vx,
        vy,
        // Spin speed (0 if not spinning)
        spinSpeed,
        // Playback speed (1.0 = normal)
        playbackSpeed,
      });
    }

    setVideoClones(clones);
    clonesRef.current = clones; // Update ref for animation loop
  }, [chaosStarted, chaosLevel, currentVideoIndex]); // Regenerate when video changes too

  /**
   * DVD screensaver-style bouncing physics and rotation for video clones.
   * Videos bounce around screen with physics, can escape edges and return unexpectedly.
   * Bouncing intensity increases with chaos level.
   * Rotation/spinning activates at chaos level 4+.
   */
  useEffect(() => {
    // Animation loop runs if bouncing (level 3+) OR rotation (level 4+) is active
    const shouldAnimate =
      chaosStarted &&
      (chaosLevel >= BOUNCE_START_LEVEL || chaosLevel >= ROTATION_START_LEVEL);

    if (!shouldAnimate) {
      // Stop animation if neither bouncing nor rotation should be active
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Calculate velocity scale based on chaos level
    const levelProgress =
      (chaosLevel - BOUNCE_START_LEVEL) /
      (MAX_CHAOS_LEVEL - BOUNCE_START_LEVEL);
    const velocityScale = 1 + levelProgress; // 1x at level 3, 2x at level 10

    const animate = () => {
      setVideoClones((prevClones) => {
        // Update ref for next frame
        const updatedClones = prevClones.map((clone) => {
          let { x, y, vx, vy, rotation, spinSpeed } = clone;

          // Apply random velocity changes occasionally (DVD screensaver quirk)
          if (Math.random() < VELOCITY_CHANGE_CHANCE) {
            vx +=
              (Math.random() - 0.5) * VELOCITY_CHANGE_MAGNITUDE * velocityScale;
            vy +=
              (Math.random() - 0.5) * VELOCITY_CHANGE_MAGNITUDE * velocityScale;
          }

          // Scale velocity with chaos level
          const scaledVx = vx * velocityScale;
          const scaledVy = vy * velocityScale;

          // Update position
          x += scaledVx;
          y += scaledVy;

          // Update rotation if spinning (chaos level 4+)
          if (spinSpeed !== 0) {
            rotation += spinSpeed;
            // Keep rotation in reasonable range to prevent overflow
            rotation = rotation % 360;
          }

          // Handle edge collisions with bouncing
          // Videos can escape edges and return unexpectedly (DVD screensaver behavior)
          // We'll allow them to go slightly off-screen before bouncing
          const margin = 5; // Allow 5% off-screen before bouncing

          if (x < -margin) {
            x = -margin;
            vx = Math.abs(vx); // Bounce right
          } else if (x > 100 + margin) {
            x = 100 + margin;
            vx = -Math.abs(vx); // Bounce left
          }

          if (y < -margin) {
            y = -margin;
            vy = Math.abs(vy); // Bounce down
          } else if (y > 100 + margin) {
            y = 100 + margin;
            vy = -Math.abs(vy); // Bounce up
          }

          return {
            ...clone,
            x,
            y,
            vx,
            vy,
            rotation,
          };
        });

        // Update ref for next frame
        clonesRef.current = updatedClones;
        return updatedClones;
      });

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount or when bouncing stops
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel]); // Re-run when chaos state or level changes

  /**
   * Screen shake effect.
   * Activates at chaos level 3 and intensifies up to level 10.
   * Uses random offsets applied via CSS transform for GPU acceleration.
   */
  useEffect(() => {
    // Only shake if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < SHAKE_START_LEVEL) {
      // Reset shake offset if below threshold
      setShakeOffset({ x: 0, y: 0 });
      return;
    }

    // Calculate intensity based on chaos level (3-10 maps to min-max intensity)
    const levelProgress =
      (chaosLevel - SHAKE_START_LEVEL) / (MAX_CHAOS_LEVEL - SHAKE_START_LEVEL);
    const intensity =
      SHAKE_MIN_INTENSITY +
      levelProgress * (SHAKE_MAX_INTENSITY - SHAKE_MIN_INTENSITY);

    // Calculate interval - faster shake at higher levels
    const interval =
      SHAKE_MAX_INTERVAL -
      levelProgress * (SHAKE_MAX_INTERVAL - SHAKE_MIN_INTERVAL);

    // Start the shake timer
    const updateShake = () => {
      // Random offset within intensity range
      const x = (Math.random() - 0.5) * 2 * intensity;
      const y = (Math.random() - 0.5) * 2 * intensity;
      setShakeOffset({ x, y });
    };

    // Initial shake
    updateShake();

    // Set up interval for continuous shaking
    shakeTimerRef.current = window.setInterval(updateShake, interval);

    // Cleanup on unmount or when chaos level changes
    return () => {
      if (shakeTimerRef.current !== null) {
        clearInterval(shakeTimerRef.current);
        shakeTimerRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel]);

  /**
   * Color manipulation effects.
   * Activates at chaos level 5+ with hue rotation, saturation spikes, and color inversion.
   * Uses CSS filters for GPU-accelerated color effects.
   */
  useEffect(() => {
    // Only apply color effects if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < COLOR_START_LEVEL) {
      // Reset color effects if below threshold
      setHueRotation(0);
      setSaturation(100);
      setIsInverted(false);
      if (colorAnimationFrameRef.current !== null) {
        cancelAnimationFrame(colorAnimationFrameRef.current);
        colorAnimationFrameRef.current = null;
      }
      if (inversionTimerRef.current !== null) {
        clearTimeout(inversionTimerRef.current);
        inversionTimerRef.current = null;
      }
      return;
    }

    // Calculate level progress for intensity scaling (5-10 maps to 0-1)
    const levelProgress =
      (chaosLevel - COLOR_START_LEVEL) / (MAX_CHAOS_LEVEL - COLOR_START_LEVEL);

    // Animation loop for continuous color effects
    const animateColors = () => {
      // Continuous hue rotation for rainbow cycling effect
      setHueRotation((prev) => {
        const newHue =
          (prev + HUE_ROTATION_SPEED * (1 + levelProgress)) % HUE_ROTATION_MAX;
        return newHue;
      });

      // Random saturation spikes
      if (Math.random() < SATURATION_SPIKE_CHANCE * (1 + levelProgress)) {
        // Spike saturation to high value
        setSaturation(SATURATION_SPIKE_INTENSITY);
        // Return to normal after a short time
        setTimeout(() => {
          setSaturation(100);
        }, 100);
      } else {
        // Gradually return to normal saturation if not spiking
        setSaturation((prev) => {
          if (prev > 100) {
            return Math.max(100, prev - 5); // Decay back to 100%
          }
          return 100;
        });
      }

      // Random color inversion
      if (
        !isInverted &&
        Math.random() < COLOR_INVERSION_CHANCE * (1 + levelProgress)
      ) {
        setIsInverted(true);
        // Clear any existing inversion timer
        if (inversionTimerRef.current !== null) {
          clearTimeout(inversionTimerRef.current);
        }
        // Reset inversion after duration
        inversionTimerRef.current = window.setTimeout(() => {
          setIsInverted(false);
        }, COLOR_INVERSION_DURATION);
      }

      // Continue animation loop
      colorAnimationFrameRef.current = requestAnimationFrame(animateColors);
    };

    // Start animation loop
    colorAnimationFrameRef.current = requestAnimationFrame(animateColors);

    // Cleanup on unmount or when chaos level changes
    return () => {
      if (colorAnimationFrameRef.current !== null) {
        cancelAnimationFrame(colorAnimationFrameRef.current);
        colorAnimationFrameRef.current = null;
      }
      if (inversionTimerRef.current !== null) {
        clearTimeout(inversionTimerRef.current);
        inversionTimerRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel, isInverted]);

  /**
   * Video playback speed changes - videos randomly speed up or slow down.
   * Activates at chaos level 7+ with random speed changes.
   * Different clones can have different speeds.
   */
  useEffect(() => {
    // Only apply playback speed changes if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < PLAYBACK_SPEED_START_LEVEL) {
      // Reset playback speed to normal if below threshold
      setBaseVideoPlaybackSpeed(1.0);
      // Apply normal speed to base video
      const baseVideo = videoRefs.current.get("base");
      if (baseVideo) {
        baseVideo.playbackRate = 1.0;
      }
      // Apply normal speed to all clones
      videoClones.forEach((clone) => {
        const video = videoRefs.current.get(clone.id);
        if (video) {
          video.playbackRate = 1.0;
        }
      });
      // Clear playback speed timer
      if (playbackSpeedTimerRef.current !== null) {
        clearInterval(playbackSpeedTimerRef.current);
        playbackSpeedTimerRef.current = null;
      }
      return;
    }

    /**
     * Changes playback speeds randomly for base video and clones.
     */
    const changePlaybackSpeeds = () => {
      // Change base video speed randomly
      const randomIndex = Math.floor(
        Math.random() * PLAYBACK_SPEED_OPTIONS.length
      );
      const newSpeed = PLAYBACK_SPEED_OPTIONS[randomIndex];
      setBaseVideoPlaybackSpeed(newSpeed);
      const baseVideo = videoRefs.current.get("base");
      if (baseVideo) {
        baseVideo.playbackRate = newSpeed;
      }

      // Change clone speeds randomly (each clone independently)
      // We'll update the actual video elements directly
      videoRefs.current.forEach((video, id) => {
        if (id !== "base") {
          // This is a clone
          const cloneRandomIndex = Math.floor(
            Math.random() * PLAYBACK_SPEED_OPTIONS.length
          );
          const cloneSpeed = PLAYBACK_SPEED_OPTIONS[cloneRandomIndex];
          video.playbackRate = cloneSpeed;
        }
      });
    };

    // Initial speed change
    changePlaybackSpeeds();

    // Set up interval to change speeds periodically
    playbackSpeedTimerRef.current = window.setInterval(
      changePlaybackSpeeds,
      PLAYBACK_SPEED_CHANGE_INTERVAL
    );

    // Cleanup on unmount or when chaos level changes
    return () => {
      if (playbackSpeedTimerRef.current !== null) {
        clearInterval(playbackSpeedTimerRef.current);
        playbackSpeedTimerRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel, videoClones]);

  /**
   * Glitch and datamosh overlay effects.
   * Activates at chaos level 7+ with contrast/brightness spikes, chromatic aberration,
   * scan lines, and random corruption rectangles.
   */
  useEffect(() => {
    // Only apply glitch effects if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < GLITCH_START_LEVEL) {
      // Reset glitch effects if below threshold
      setGlitchContrast(100);
      setGlitchBrightness(100);
      setChromaticAberration(0);
      setCorruptionRectangles([]);
      if (glitchAnimationFrameRef.current !== null) {
        cancelAnimationFrame(glitchAnimationFrameRef.current);
        glitchAnimationFrameRef.current = null;
      }
      // Clear all corruption timers
      corruptionTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      corruptionTimersRef.current.clear();
      return;
    }

    // Calculate level progress for intensity scaling (7-10 maps to 0-1)
    const levelProgress =
      (chaosLevel - GLITCH_START_LEVEL) /
      (MAX_CHAOS_LEVEL - GLITCH_START_LEVEL);

    // Animation loop for continuous glitch effects
    const animateGlitch = () => {
      // Random contrast spikes
      if (Math.random() < CONTRAST_SPIKE_CHANCE * (1 + levelProgress)) {
        // Spike contrast to high value
        const spikeIntensity =
          CONTRAST_SPIKE_MIN +
          (CONTRAST_SPIKE_MAX - CONTRAST_SPIKE_MIN) *
            (0.5 + Math.random() * 0.5);
        setGlitchContrast(spikeIntensity);
        // Return to normal after a short time
        setTimeout(() => {
          setGlitchContrast(CONTRAST_SPIKE_MIN);
        }, 100);
      } else {
        // Gradually return to normal contrast if not spiking
        setGlitchContrast((prev) => {
          if (prev > CONTRAST_SPIKE_MIN) {
            return Math.max(CONTRAST_SPIKE_MIN, prev - 5); // Decay back to 100%
          }
          return CONTRAST_SPIKE_MIN;
        });
      }

      // Random brightness spikes
      if (Math.random() < BRIGHTNESS_SPIKE_CHANCE * (1 + levelProgress)) {
        // Spike brightness to high value
        const spikeIntensity =
          BRIGHTNESS_SPIKE_MIN +
          (BRIGHTNESS_SPIKE_MAX - BRIGHTNESS_SPIKE_MIN) *
            (0.5 + Math.random() * 0.5);
        setGlitchBrightness(spikeIntensity);
        // Return to normal after a short time
        setTimeout(() => {
          setGlitchBrightness(BRIGHTNESS_SPIKE_MIN);
        }, 100);
      } else {
        // Gradually return to normal brightness if not spiking
        setGlitchBrightness((prev) => {
          if (prev > BRIGHTNESS_SPIKE_MIN) {
            return Math.max(BRIGHTNESS_SPIKE_MIN, prev - 5); // Decay back to 100%
          }
          return BRIGHTNESS_SPIKE_MIN;
        });
      }

      // Chromatic aberration (RGB split) - continuous effect that intensifies
      const aberrationIntensity =
        CHROMATIC_ABERRATION_MAX * levelProgress * (0.5 + Math.random() * 0.5);
      setChromaticAberration(aberrationIntensity);

      // Random corruption rectangles
      setCorruptionRectangles((prev) => {
        if (
          prev.length < MAX_CORRUPTION_RECTANGLES &&
          Math.random() < CORRUPTION_RECTANGLE_CHANCE * (1 + levelProgress)
        ) {
          const newRect = {
            id: `corruption-${Date.now()}-${Math.random()}`,
            x: Math.random() * 80 + 10, // 10-90% of screen width
            y: Math.random() * 80 + 10, // 10-90% of screen height
            width: 50 + Math.random() * 150, // 50-200px width
            height: 50 + Math.random() * 150, // 50-200px height
            opacity: 0.8 + Math.random() * 0.2, // 0.8-1.0 opacity
          };

          // Remove corruption rectangle after duration
          const timerId = window.setTimeout(() => {
            setCorruptionRectangles((current) =>
              current.filter((rect) => rect.id !== newRect.id)
            );
            corruptionTimersRef.current.delete(newRect.id);
          }, CORRUPTION_RECTANGLE_DURATION);
          corruptionTimersRef.current.set(newRect.id, timerId);

          return [...prev, newRect];
        }
        return prev;
      });

      // Continue animation loop
      glitchAnimationFrameRef.current = requestAnimationFrame(animateGlitch);
    };

    // Start animation loop
    glitchAnimationFrameRef.current = requestAnimationFrame(animateGlitch);

    // Cleanup on unmount or when chaos level changes
    return () => {
      if (glitchAnimationFrameRef.current !== null) {
        cancelAnimationFrame(glitchAnimationFrameRef.current);
        glitchAnimationFrameRef.current = null;
      }
      corruptionTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      corruptionTimersRef.current.clear();
    };
  }, [chaosStarted, chaosLevel]);

  /**
   * Fake UI breaking elements system.
   * Spawns fake error popups, loading spinners, buffering indicators, and overheating warnings.
   * Activates at chaos level 8+.
   */
  useEffect(() => {
    // Only spawn fake UI elements if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < FAKE_UI_START_LEVEL) {
      // Clear all fake UI elements if below threshold
      setFakeUIElements([]);
      if (fakeUIAnimationFrameRef.current !== null) {
        cancelAnimationFrame(fakeUIAnimationFrameRef.current);
        fakeUIAnimationFrameRef.current = null;
      }
      // Clear all fake UI timers
      fakeUITimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      fakeUITimersRef.current.clear();
      return;
    }

    // Calculate level progress for spawn chance scaling (8-10 maps to 0-1)
    const levelProgress =
      (chaosLevel - FAKE_UI_START_LEVEL) /
      (MAX_CHAOS_LEVEL - FAKE_UI_START_LEVEL);

    // Animation loop for spawning fake UI elements
    const animateFakeUI = () => {
      setFakeUIElements((prev) => {
        // Spawn new fake UI element if under max limit and random chance
        if (
          prev.length < MAX_FAKE_UI_ELEMENTS &&
          Math.random() < FAKE_UI_SPAWN_CHANCE * (1 + levelProgress)
        ) {
          // Randomly select a fake UI type
          const types: FakeUIType[] = [
            "error",
            "loading",
            "buffering",
            "overheating",
          ];
          const randomType = types[Math.floor(Math.random() * types.length)];

          const newElement: FakeUIElement = {
            id: `fake-ui-${Date.now()}-${Math.random()}`,
            type: randomType,
            // Random position (10-90% for both axes to keep on screen)
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
          };

          // Remove fake UI element after duration
          const timerId = window.setTimeout(() => {
            setFakeUIElements((current) =>
              current.filter((el) => el.id !== newElement.id)
            );
            fakeUITimersRef.current.delete(newElement.id);
          }, FAKE_UI_DURATION);
          fakeUITimersRef.current.set(newElement.id, timerId);

          return [...prev, newElement];
        }
        return prev;
      });

      // Continue animation loop
      fakeUIAnimationFrameRef.current = requestAnimationFrame(animateFakeUI);
    };

    // Start animation loop
    fakeUIAnimationFrameRef.current = requestAnimationFrame(animateFakeUI);

    // Cleanup on unmount or when chaos level changes
    return () => {
      if (fakeUIAnimationFrameRef.current !== null) {
        cancelAnimationFrame(fakeUIAnimationFrameRef.current);
        fakeUIAnimationFrameRef.current = null;
      }
      fakeUITimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      fakeUITimersRef.current.clear();
    };
  }, [chaosStarted, chaosLevel]);

  /**
   * Floating birthday text system.
   * Spawns "Happy Birthday Michael" text that floats across screen like meme text.
   * Activates at chaos level 10 (max chaos) with random trajectories, sizes, rotations.
   * Frequency increases after reaching max chaos (level 10).
   * Uses white color and Impact font to be distinct from meme phrases.
   */
  useEffect(() => {
    // Only spawn floating birthday texts if chaos started and at max chaos
    if (!chaosStarted || chaosLevel < BIRTHDAY_TEXT_START_LEVEL) {
      // Clear all floating birthday texts if below threshold
      setFloatingBirthdayTexts([]);
      if (birthdayTextAnimationFrameRef.current !== null) {
        cancelAnimationFrame(birthdayTextAnimationFrameRef.current);
        birthdayTextAnimationFrameRef.current = null;
      }
      if (birthdayTextSpawnTimerRef.current !== null) {
        clearTimeout(birthdayTextSpawnTimerRef.current);
        birthdayTextSpawnTimerRef.current = null;
      }
      return;
    }

    // Calculate spawn interval - faster after max chaos (level 10+)
    // At level 10: 1-3s, after level 10: 0.5-1.5s (increased frequency)
    // Since we're already at max chaos, we use the "after max" intervals
    const minInterval = BIRTHDAY_TEXT_MIN_SPAWN_INTERVAL_AFTER_MAX;
    const maxInterval = BIRTHDAY_TEXT_MAX_SPAWN_INTERVAL_AFTER_MAX;

    /**
     * Spawns a new floating birthday text.
     */
    const spawnBirthdayText = () => {
      setFloatingBirthdayTexts((prev) => {
        // Remove oldest text if at max limit (oldest elements removed when cap reached)
        let updatedTexts = prev;
        if (prev.length >= MAX_FLOATING_BIRTHDAY_TEXTS) {
          // Sort by creation time to find oldest (fallback to 0 for texts without createdAt)
          const sorted = [...prev].sort(
            (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
          );
          const oldest = sorted[0];
          if (oldest) {
            // Remove oldest text
            updatedTexts = prev.filter((text) => text.id !== oldest.id);
          }
        }

        // Random starting position (spawn from edges of screen)
        const spawnEdge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let startX = 0;
        let startY = 0;

        if (spawnEdge === 0) {
          // Top edge
          startX = Math.random() * 100;
          startY = -10;
        } else if (spawnEdge === 1) {
          // Right edge
          startX = 110;
          startY = Math.random() * 100;
        } else if (spawnEdge === 2) {
          // Bottom edge
          startX = Math.random() * 100;
          startY = 110;
        } else {
          // Left edge
          startX = -10;
          startY = Math.random() * 100;
        }

        // Random target position (opposite side of screen)
        const targetX = Math.random() * 100;
        const targetY = Math.random() * 100;

        // Calculate velocity towards target
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed =
          BIRTHDAY_TEXT_SPEED_MIN +
          Math.random() * (BIRTHDAY_TEXT_SPEED_MAX - BIRTHDAY_TEXT_SPEED_MIN);
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;

        // Random properties
        const rotation = (Math.random() - 0.5) * 60; // -30 to 30 degrees
        const size =
          BIRTHDAY_TEXT_MIN_SIZE +
          Math.random() * (BIRTHDAY_TEXT_MAX_SIZE - BIRTHDAY_TEXT_MIN_SIZE);

        // White color (distinct from meme text colors)
        const color = "#FFFFFF";

        // Impact font for birthday text (as per spec)
        const fontFamily =
          'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';

        // Generate unique ID using counter
        birthdayTextCounterRef.current += 1;
        const now = Date.now();
        const newText: FloatingText = {
          id: `birthday-text-${now}-${
            birthdayTextCounterRef.current
          }-${Math.random()}`,
          text: BIRTHDAY_TEXT_PHRASE,
          x: startX,
          y: startY,
          rotation,
          size,
          color,
          fontFamily,
          vx,
          vy,
          createdAt: now,
        };

        return [...updatedTexts, newText];
      });
    };

    /**
     * Animation loop for moving floating birthday texts across screen.
     */
    const animateFloatingBirthdayTexts = () => {
      setFloatingBirthdayTexts((prev) => {
        return prev
          .map((text) => {
            // Update position
            let newX = text.x + text.vx;
            let newY = text.y + text.vy;

            // Remove text if it goes far off-screen
            if (newX < -20 || newX > 120 || newY < -20 || newY > 120) {
              return null; // Mark for removal
            }

            return {
              ...text,
              x: newX,
              y: newY,
            };
          })
          .filter((text): text is FloatingText => text !== null); // Remove nulls
      });

      // Continue animation loop
      birthdayTextAnimationFrameRef.current = requestAnimationFrame(
        animateFloatingBirthdayTexts
      );
    };

    // Start animation loop
    birthdayTextAnimationFrameRef.current = requestAnimationFrame(
      animateFloatingBirthdayTexts
    );

    /**
     * Spawns birthday texts periodically.
     */
    const scheduleNextSpawn = () => {
      const interval =
        minInterval + Math.random() * (maxInterval - minInterval);
      birthdayTextSpawnTimerRef.current = window.setTimeout(() => {
        spawnBirthdayText();
        scheduleNextSpawn();
      }, interval);
    };

    // Initial spawn
    spawnBirthdayText();
    scheduleNextSpawn();

    // Cleanup on unmount or when chaos level changes
    return () => {
      if (birthdayTextAnimationFrameRef.current !== null) {
        cancelAnimationFrame(birthdayTextAnimationFrameRef.current);
        birthdayTextAnimationFrameRef.current = null;
      }
      if (birthdayTextSpawnTimerRef.current !== null) {
        clearTimeout(birthdayTextSpawnTimerRef.current);
        birthdayTextSpawnTimerRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel]);

  /**
   * BMW bouncing images system.
   * White BMW images start bouncing around at chaos level 3+.
   * Uses DVD screensaver-style physics similar to video clones.
   */
  useEffect(() => {
    // Only spawn BMW images if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < BMW_START_LEVEL) {
      setBmwImages([]);
      bmwImagesRef.current = [];
      if (bmwImagesAnimationFrameRef.current !== null) {
        cancelAnimationFrame(bmwImagesAnimationFrameRef.current);
        bmwImagesAnimationFrameRef.current = null;
      }
      return;
    }

    // Calculate number of BMW images based on chaos level (3-10)
    const bmwLevelProgress =
      (chaosLevel - BMW_START_LEVEL) / (MAX_CHAOS_LEVEL - BMW_START_LEVEL);
    const imageCount = Math.floor(2 + bmwLevelProgress * (MAX_BMW_IMAGES - 2)); // 2-8 images

    // Generate BMW images if we don't have enough
    if (bmwImages.length < imageCount) {
      const newImages: BMWImage[] = [];
      for (let i = bmwImages.length; i < imageCount; i++) {
        // Calculate velocity based on chaos level
        const velocity =
          BASE_VELOCITY + bmwLevelProgress * (MAX_VELOCITY - BASE_VELOCITY);
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        // Calculate spin speed if rotation is active (chaos level 4+)
        let spinSpeed = 0;
        if (chaosLevel >= ROTATION_START_LEVEL) {
          if (Math.random() < 0.6) {
            // 60% chance to spin
            const spinLevelProgress =
              (chaosLevel - ROTATION_START_LEVEL) /
              (MAX_CHAOS_LEVEL - ROTATION_START_LEVEL);
            const baseSpinSpeed =
              MIN_SPIN_SPEED +
              Math.random() * (MAX_SPIN_SPEED - MIN_SPIN_SPEED);
            spinSpeed = baseSpinSpeed * (1 + spinLevelProgress);
            if (Math.random() < 0.5) {
              spinSpeed = -spinSpeed;
            }
          }
        }

        newImages.push({
          id: `bmw-image-${Date.now()}-${i}-${Math.random()}`,
          x: Math.random() * 80 + 10, // 10-90%
          y: Math.random() * 80 + 10, // 10-90%
          rotation: (Math.random() - 0.5) * 360,
          scale: 0.3 + Math.random() * 0.4, // 0.3-0.7 scale (smaller than videos)
          vx,
          vy,
          spinSpeed,
        });
      }
      setBmwImages((prev) => [...prev, ...newImages]);
      bmwImagesRef.current = [...bmwImages, ...newImages];
    } else if (bmwImages.length > imageCount) {
      // Remove excess images
      const toRemove = bmwImages.length - imageCount;
      setBmwImages((prev) => prev.slice(toRemove));
      bmwImagesRef.current = bmwImages.slice(toRemove);
    }

    // Animation loop for bouncing BMW images
    const shouldAnimate = chaosStarted && chaosLevel >= BMW_START_LEVEL;
    if (!shouldAnimate) {
      if (bmwImagesAnimationFrameRef.current !== null) {
        cancelAnimationFrame(bmwImagesAnimationFrameRef.current);
        bmwImagesAnimationFrameRef.current = null;
      }
      return;
    }

    const levelProgress =
      (chaosLevel - BOUNCE_START_LEVEL) /
      (MAX_CHAOS_LEVEL - BOUNCE_START_LEVEL);
    const velocityScale = 1 + levelProgress;

    const animate = () => {
      setBmwImages((prev) => {
        const updated = prev.map((img) => {
          let { x, y, vx, vy, rotation, spinSpeed } = img;

          // Random velocity changes
          if (Math.random() < VELOCITY_CHANGE_CHANCE) {
            vx +=
              (Math.random() - 0.5) * VELOCITY_CHANGE_MAGNITUDE * velocityScale;
            vy +=
              (Math.random() - 0.5) * VELOCITY_CHANGE_MAGNITUDE * velocityScale;
          }

          const scaledVx = vx * velocityScale;
          const scaledVy = vy * velocityScale;

          x += scaledVx;
          y += scaledVy;

          if (spinSpeed !== 0) {
            rotation += spinSpeed;
            rotation = rotation % 360;
          }

          // Edge collisions
          const margin = 5;
          if (x < -margin) {
            x = -margin;
            vx = Math.abs(vx);
          } else if (x > 100 + margin) {
            x = 100 + margin;
            vx = -Math.abs(vx);
          }

          if (y < -margin) {
            y = -margin;
            vy = Math.abs(vy);
          } else if (y > 100 + margin) {
            y = 100 + margin;
            vy = -Math.abs(vy);
          }

          return { ...img, x, y, vx, vy, rotation };
        });

        bmwImagesRef.current = updated;
        return updated;
      });

      bmwImagesAnimationFrameRef.current = requestAnimationFrame(animate);
    };

    bmwImagesAnimationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (bmwImagesAnimationFrameRef.current !== null) {
        cancelAnimationFrame(bmwImagesAnimationFrameRef.current);
        bmwImagesAnimationFrameRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel, bmwImages.length]);

  /**
   * BMW text overlays system.
   * Text overlays ('BMW GRINDSET', 'WHITE BMW ENERGY', 'M POWER') appear at chaos level 5+.
   * Similar to floating meme text but with BMW-specific styling.
   */
  useEffect(() => {
    if (!chaosStarted || chaosLevel < BMW_TEXT_START_LEVEL) {
      setBmwTexts([]);
      if (bmwTextAnimationFrameRef.current !== null) {
        cancelAnimationFrame(bmwTextAnimationFrameRef.current);
        bmwTextAnimationFrameRef.current = null;
      }
      if (bmwTextSpawnTimerRef.current !== null) {
        clearTimeout(bmwTextSpawnTimerRef.current);
        bmwTextSpawnTimerRef.current = null;
      }
      return;
    }

    const bmwTextLevelProgress =
      (chaosLevel - BMW_TEXT_START_LEVEL) /
      (MAX_CHAOS_LEVEL - BMW_TEXT_START_LEVEL);
    const spawnInterval = 1000 - bmwTextLevelProgress * 500; // 1000ms at level 5, 500ms at level 10

    const spawnBmwText = () => {
      setBmwTexts((prev) => {
        let updated = prev;
        if (prev.length >= MAX_BMW_TEXTS) {
          const sorted = [...prev].sort((a, b) => a.createdAt - b.createdAt);
          const oldest = sorted[0];
          if (oldest) {
            updated = prev.filter((text) => text.id !== oldest.id);
          }
        }

        const spawnEdge = Math.floor(Math.random() * 4);
        let startX = 0;
        let startY = 0;

        if (spawnEdge === 0) {
          startX = Math.random() * 100;
          startY = -10;
        } else if (spawnEdge === 1) {
          startX = 110;
          startY = Math.random() * 100;
        } else if (spawnEdge === 2) {
          startX = Math.random() * 100;
          startY = 110;
        } else {
          startX = -10;
          startY = Math.random() * 100;
        }

        const targetX = Math.random() * 100;
        const targetY = Math.random() * 100;
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed =
          BMW_TEXT_SPEED_MIN +
          Math.random() * (BMW_TEXT_SPEED_MAX - BMW_TEXT_SPEED_MIN);
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;

        const randomPhrase =
          BMW_TEXT_PHRASES[Math.floor(Math.random() * BMW_TEXT_PHRASES.length)];
        const rotation = (Math.random() - 0.5) * 60;
        const size =
          BMW_TEXT_MIN_SIZE +
          Math.random() * (BMW_TEXT_MAX_SIZE - BMW_TEXT_MIN_SIZE);

        bmwTextCounterRef.current += 1;
        const now = Date.now();
        const newText: BMWText = {
          id: `bmw-text-${now}-${bmwTextCounterRef.current}-${Math.random()}`,
          text: randomPhrase,
          x: startX,
          y: startY,
          rotation,
          size,
          vx,
          vy,
          createdAt: now,
        };

        return [...updated, newText];
      });
    };

    const animateBmwTexts = () => {
      setBmwTexts((prev) => {
        return prev
          .map((text) => {
            let newX = text.x + text.vx;
            let newY = text.y + text.vy;

            if (newX < -20 || newX > 120 || newY < -20 || newY > 120) {
              return null;
            }

            return { ...text, x: newX, y: newY };
          })
          .filter((text): text is BMWText => text !== null);
      });

      bmwTextAnimationFrameRef.current = requestAnimationFrame(animateBmwTexts);
    };

    bmwTextAnimationFrameRef.current = requestAnimationFrame(animateBmwTexts);

    const scheduleNextSpawn = () => {
      bmwTextSpawnTimerRef.current = window.setTimeout(() => {
        spawnBmwText();
        scheduleNextSpawn();
      }, spawnInterval);
    };

    spawnBmwText();
    scheduleNextSpawn();

    return () => {
      if (bmwTextAnimationFrameRef.current !== null) {
        cancelAnimationFrame(bmwTextAnimationFrameRef.current);
        bmwTextAnimationFrameRef.current = null;
      }
      if (bmwTextSpawnTimerRef.current !== null) {
        clearTimeout(bmwTextSpawnTimerRef.current);
        bmwTextSpawnTimerRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel]);

  /**
   * BMW logo watermarks system.
   * BMW logo watermarks multiply at chaos level 7+.
   * Smaller watermarks that appear across the screen.
   */
  useEffect(() => {
    if (!chaosStarted || chaosLevel < BMW_LOGO_START_LEVEL) {
      setBmwLogos([]);
      if (bmwLogoAnimationFrameRef.current !== null) {
        cancelAnimationFrame(bmwLogoAnimationFrameRef.current);
        bmwLogoAnimationFrameRef.current = null;
      }
      return;
    }

    const bmwLogoLevelProgress =
      (chaosLevel - BMW_LOGO_START_LEVEL) /
      (MAX_CHAOS_LEVEL - BMW_LOGO_START_LEVEL);
    const logoCount = Math.floor(
      3 + bmwLogoLevelProgress * (MAX_BMW_LOGOS - 3)
    ); // 3-15 logos

    // Generate logos if needed
    if (bmwLogos.length < logoCount) {
      const newLogos: BMWLogo[] = [];
      for (let i = bmwLogos.length; i < logoCount; i++) {
        newLogos.push({
          id: `bmw-logo-${Date.now()}-${i}-${Math.random()}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: (Math.random() - 0.5) * 360,
          scale: 0.1 + Math.random() * 0.2, // 0.1-0.3 scale (small watermarks)
          opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7 opacity
        });
      }
      setBmwLogos((prev) => [...prev, ...newLogos]);
    } else if (bmwLogos.length > logoCount) {
      setBmwLogos((prev) => prev.slice(0, logoCount));
    }

    // Subtle animation for logos (slow rotation)
    const animate = () => {
      setBmwLogos((prev) => {
        return prev.map((logo) => ({
          ...logo,
          rotation: (logo.rotation + 0.1) % 360, // Slow rotation
        }));
      });

      bmwLogoAnimationFrameRef.current = requestAnimationFrame(animate);
    };

    bmwLogoAnimationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (bmwLogoAnimationFrameRef.current !== null) {
        cancelAnimationFrame(bmwLogoAnimationFrameRef.current);
        bmwLogoAnimationFrameRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel, bmwLogos.length]);

  /**
   * BMW background color flashing.
   * Background flashes BMW dealership aesthetic (white/blue) at chaos level 10.
   */
  useEffect(() => {
    if (!chaosStarted || chaosLevel < BMW_BACKGROUND_START_LEVEL) {
      setBmwBackgroundColor("#000000");
      if (bmwBackgroundFlashTimerRef.current !== null) {
        clearInterval(bmwBackgroundFlashTimerRef.current);
        bmwBackgroundFlashTimerRef.current = null;
      }
      return;
    }

    let isWhite = false;
    const flash = () => {
      isWhite = !isWhite;
      setBmwBackgroundColor(isWhite ? "#FFFFFF" : BMW_BLUE);
    };

    // Initial flash
    flash();

    // Set up interval for flashing
    bmwBackgroundFlashTimerRef.current = window.setInterval(
      flash,
      BMW_BACKGROUND_FLASH_INTERVAL
    );

    return () => {
      if (bmwBackgroundFlashTimerRef.current !== null) {
        clearInterval(bmwBackgroundFlashTimerRef.current);
        bmwBackgroundFlashTimerRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel]);

  /**
   * Floating meme text system.
   * Spawns meme phrases (SKIBIDI, OHIO, SIGMA, RIZZ, GYATT) that float across screen.
   * Activates at chaos level 9+ with random trajectories, sizes, rotations, and colors.
   * Text spawns every 0.5-2s at max chaos, capped at 20 texts for performance.
   */
  useEffect(() => {
    // Only spawn floating texts if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < MEME_TEXT_START_LEVEL) {
      // Clear all floating texts if below threshold
      setFloatingTexts([]);
      if (memeTextAnimationFrameRef.current !== null) {
        cancelAnimationFrame(memeTextAnimationFrameRef.current);
        memeTextAnimationFrameRef.current = null;
      }
      if (memeTextSpawnTimerRef.current !== null) {
        clearTimeout(memeTextSpawnTimerRef.current);
        memeTextSpawnTimerRef.current = null;
      }
      return;
    }

    // Calculate level progress for spawn interval scaling (9-10 maps to 0-1)
    const levelProgress =
      (chaosLevel - MEME_TEXT_START_LEVEL) /
      (MAX_CHAOS_LEVEL - MEME_TEXT_START_LEVEL);

    // Calculate spawn interval - faster at higher chaos levels
    // At level 9: 0.5-2s, at level 10: 0.5-1s
    const minInterval =
      MEME_TEXT_MIN_SPAWN_INTERVAL_MAX_CHAOS +
      (MEME_TEXT_MIN_SPAWN_INTERVAL - MEME_TEXT_MIN_SPAWN_INTERVAL_MAX_CHAOS) *
        (1 - levelProgress);
    const maxInterval =
      MEME_TEXT_MAX_SPAWN_INTERVAL -
      (MEME_TEXT_MAX_SPAWN_INTERVAL - MEME_TEXT_MIN_SPAWN_INTERVAL_MAX_CHAOS) *
        levelProgress;

    /**
     * Spawns a new floating meme text.
     */
    const spawnMemeText = () => {
      setFloatingTexts((prev) => {
        // Remove oldest text if at max limit (oldest elements removed when cap reached)
        let updatedTexts = prev;
        if (prev.length >= MAX_FLOATING_TEXTS) {
          // Sort by creation time to find oldest (fallback to 0 for texts without createdAt)
          const sorted = [...prev].sort(
            (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
          );
          const oldest = sorted[0];
          if (oldest) {
            // Remove oldest text
            updatedTexts = prev.filter((text) => text.id !== oldest.id);
          }
        }

        // Random meme phrase
        const randomPhrase =
          MEME_TEXT_PHRASES[
            Math.floor(Math.random() * MEME_TEXT_PHRASES.length)
          ];

        // Random starting position (spawn from edges of screen)
        const spawnEdge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let startX = 0;
        let startY = 0;

        if (spawnEdge === 0) {
          // Top edge
          startX = Math.random() * 100;
          startY = -10;
        } else if (spawnEdge === 1) {
          // Right edge
          startX = 110;
          startY = Math.random() * 100;
        } else if (spawnEdge === 2) {
          // Bottom edge
          startX = Math.random() * 100;
          startY = 110;
        } else {
          // Left edge
          startX = -10;
          startY = Math.random() * 100;
        }

        // Random target position (opposite side of screen)
        const targetX = Math.random() * 100;
        const targetY = Math.random() * 100;

        // Calculate velocity towards target
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed =
          MEME_TEXT_SPEED_MIN +
          Math.random() * (MEME_TEXT_SPEED_MAX - MEME_TEXT_SPEED_MIN);
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;

        // Random properties
        const rotation = (Math.random() - 0.5) * 60; // -30 to 30 degrees
        const size =
          MEME_TEXT_MIN_SIZE +
          Math.random() * (MEME_TEXT_MAX_SIZE - MEME_TEXT_MIN_SIZE);

        // Random color (bright colors for visibility)
        const colors = [
          "#FF0000", // Red
          "#00FF00", // Green
          "#0000FF", // Blue
          "#FFFF00", // Yellow
          "#FF00FF", // Magenta
          "#00FFFF", // Cyan
          "#FFFFFF", // White
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Random font family (mixed fonts for chaos as per spec)
        const fontFamily =
          MEME_TEXT_FONTS[Math.floor(Math.random() * MEME_TEXT_FONTS.length)];

        // Generate unique ID using counter
        memeTextCounterRef.current += 1;
        const now = Date.now();
        const newText: FloatingText = {
          id: `meme-text-${now}-${memeTextCounterRef.current}-${Math.random()}`,
          text: randomPhrase,
          x: startX,
          y: startY,
          rotation,
          size,
          color,
          fontFamily,
          vx,
          vy,
          createdAt: now,
        };

        return [...updatedTexts, newText];
      });
    };

    /**
     * Animation loop for moving floating texts across screen.
     */
    const animateFloatingTexts = () => {
      setFloatingTexts((prev) => {
        return prev
          .map((text) => {
            // Update position
            let newX = text.x + text.vx;
            let newY = text.y + text.vy;

            // Remove text if it goes far off-screen
            if (newX < -20 || newX > 120 || newY < -20 || newY > 120) {
              return null; // Mark for removal
            }

            return {
              ...text,
              x: newX,
              y: newY,
            };
          })
          .filter((text): text is FloatingText => text !== null); // Remove nulls
      });

      // Continue animation loop
      memeTextAnimationFrameRef.current =
        requestAnimationFrame(animateFloatingTexts);
    };

    // Start animation loop
    memeTextAnimationFrameRef.current =
      requestAnimationFrame(animateFloatingTexts);

    /**
     * Spawns meme texts periodically.
     */
    const scheduleNextSpawn = () => {
      const interval =
        minInterval + Math.random() * (maxInterval - minInterval);
      memeTextSpawnTimerRef.current = window.setTimeout(() => {
        spawnMemeText();
        scheduleNextSpawn();
      }, interval);
    };

    // Initial spawn
    spawnMemeText();
    scheduleNextSpawn();

    // Cleanup on unmount or when chaos level changes
    return () => {
      if (memeTextAnimationFrameRef.current !== null) {
        cancelAnimationFrame(memeTextAnimationFrameRef.current);
        memeTextAnimationFrameRef.current = null;
      }
      if (memeTextSpawnTimerRef.current !== null) {
        clearTimeout(memeTextSpawnTimerRef.current);
        memeTextSpawnTimerRef.current = null;
      }
    };
  }, [chaosStarted, chaosLevel]);

  /**
   * Zoom pulse effects - elements "breathe" by scaling from 1.0 to 1.1 and back.
   * Activates at chaos level 6+ with frequency increasing with chaos level.
   * Individual elements can pulse independently.
   */
  useEffect(() => {
    // Only apply zoom pulses if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < ZOOM_PULSE_START_LEVEL) {
      // Reset pulse scales if below threshold
      setBaseVideoPulseScale(1.0);
      setClonePulseScales(new Map());
      // Clear all pulse timers
      pulseTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      pulseTimersRef.current.clear();
      return;
    }

    // Calculate level progress for frequency scaling (6-10 maps to 0-1)
    const levelProgress =
      (chaosLevel - ZOOM_PULSE_START_LEVEL) /
      (MAX_CHAOS_LEVEL - ZOOM_PULSE_START_LEVEL);

    // Calculate pulse interval - faster at higher chaos levels
    // At level 6: 300-800ms, at level 10: 200-400ms
    const minInterval =
      PULSE_MIN_INTERVAL_MAX_CHAOS +
      (PULSE_MIN_INTERVAL - PULSE_MIN_INTERVAL_MAX_CHAOS) * (1 - levelProgress);
    const maxInterval =
      (PULSE_MAX_INTERVAL - PULSE_MIN_INTERVAL_MAX_CHAOS) *
        (1 - levelProgress) +
      PULSE_MIN_INTERVAL_MAX_CHAOS;
    const intervalRange = maxInterval - minInterval;

    /**
     * Creates a pulse animation for a single element.
     * Scales from 1.0 → 1.1 → 1.0 with easing.
     */
    const createPulse = (
      elementId: string,
      setScale: (scale: number) => void
    ) => {
      // Random interval for this pulse (within range)
      const interval = minInterval + Math.random() * intervalRange;

      // Pulse duration is half the interval (up then down)
      const pulseDuration = interval / 2;

      // Start pulse up (1.0 → 1.1)
      const startTime = Date.now();
      const animateUp = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / pulseDuration, 1);
        // Ease-out cubic for smooth animation
        const eased = 1 - Math.pow(1 - progress, 3);
        const scale =
          PULSE_SCALE_MIN + (PULSE_SCALE_MAX - PULSE_SCALE_MIN) * eased;
        setScale(scale);

        if (progress < 1) {
          requestAnimationFrame(animateUp);
        } else {
          // Start pulse down (1.1 → 1.0)
          const downStartTime = Date.now();
          const animateDown = () => {
            const elapsed = Date.now() - downStartTime;
            const progress = Math.min(elapsed / pulseDuration, 1);
            // Ease-in cubic for smooth animation
            const eased = Math.pow(progress, 3);
            const scale =
              PULSE_SCALE_MAX - (PULSE_SCALE_MAX - PULSE_SCALE_MIN) * eased;
            setScale(scale);

            if (progress < 1) {
              requestAnimationFrame(animateDown);
            } else {
              // Schedule next pulse
              const timerId = window.setTimeout(() => {
                createPulse(elementId, setScale);
              }, interval);
              pulseTimersRef.current.set(elementId, timerId);
            }
          };
          requestAnimationFrame(animateDown);
        }
      };
      requestAnimationFrame(animateUp);
    };

    // Start pulse for base video
    if (!pulseTimersRef.current.has("base")) {
      createPulse("base", setBaseVideoPulseScale);
    }

    // Start pulses for all clones (independently)
    videoClones.forEach((clone) => {
      if (!pulseTimersRef.current.has(clone.id)) {
        createPulse(clone.id, (scale) => {
          setClonePulseScales((prev) => {
            const newMap = new Map(prev);
            newMap.set(clone.id, scale);
            return newMap;
          });
        });
      }
    });

    // Cleanup on unmount or when chaos level changes
    return () => {
      pulseTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      pulseTimersRef.current.clear();
    };
  }, [chaosStarted, chaosLevel, videoClones]);

  /**
   * Removes a sound from the active sounds tracking array.
   */
  const removeFromActiveSounds = useCallback((howl: Howl) => {
    activeSoundsRef.current = activeSoundsRef.current.filter(
      (s) => s.howl !== howl
    );
  }, []);

  /**
   * Applies volume ducking to all active sounds when approaching the limit.
   * This compresses the audio mix rather than clipping.
   */
  const applyVolumeDucking = useCallback(() => {
    const activeCount = activeSoundsRef.current.length;
    const shouldDuck = activeCount >= DUCKING_THRESHOLD;
    const targetVolume = shouldDuck ? DUCKED_VOLUME : BASE_VOLUME;

    // Apply ducked volume to all active sounds
    activeSoundsRef.current.forEach(({ howl }) => {
      howl.volume(targetVolume);
    });
  }, []);

  /**
   * Fades out and removes the oldest sound when at max capacity.
   */
  const fadeOutOldestSound = useCallback(() => {
    if (activeSoundsRef.current.length === 0) return;

    // Sort by start time to find oldest
    const sorted = [...activeSoundsRef.current].sort(
      (a, b) => a.startTime - b.startTime
    );
    const oldest = sorted[0];

    if (oldest) {
      // Fade out over FADEOUT_DURATION
      oldest.howl.fade(oldest.howl.volume(), 0, FADEOUT_DURATION);

      // Remove from tracking and unload after fade
      setTimeout(() => {
        oldest.howl.unload();
        removeFromActiveSounds(oldest.howl);
      }, FADEOUT_DURATION);
    }
  }, [removeFromActiveSounds]);

  /**
   * Plays a specific sound file.
   * Enforces maximum simultaneous sounds with ducking and fadeout.
   * Robust mobile audio playback with proper context handling.
   */
  const playSound = useCallback(
    async (audioSrc: string, requireChaosStarted: boolean = true) => {
      // Only play sounds after chaos has started (unless explicitly allowed)
      if (requireChaosStarted && !chaosStarted) return;

      // Ensure audio context is unlocked first (CRITICAL for mobile)
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        try {
          await Howler.ctx.resume();
        } catch (e) {
          console.warn("Failed to resume audio context:", e);
          return; // Can't play without audio context
        }
      }

      // Check if we're at the maximum limit
      if (activeSoundsRef.current.length >= MAX_SIMULTANEOUS_SOUNDS) {
        // Fade out oldest sound to make room
        fadeOutOldestSound();
      }

      // Determine initial volume based on current sound count
      const shouldDuck =
        activeSoundsRef.current.length >= DUCKING_THRESHOLD - 1;
      const initialVolume = shouldDuck ? DUCKED_VOLUME : BASE_VOLUME;

      // Create the Howl instance
      const sound = new Howl({
        src: [audioSrc],
        volume: initialVolume,
        html5: false, // Use Web Audio API for better mobile support
      });

      // Track this sound
      const activeSound: ActiveSound = {
        howl: sound,
        startTime: Date.now(),
      };
      activeSoundsRef.current.push(activeSound);

      // Apply ducking to all sounds now that we've added one
      applyVolumeDucking();

      // Auto-cleanup after playback ends
      sound.on("end", () => {
        removeFromActiveSounds(sound);
        sound.unload();
        // Re-apply volume levels after a sound ends
        applyVolumeDucking();
      });

      // Handle load errors
      sound.on("loaderror", (_id, error) => {
        console.warn("Sound load error:", audioSrc, error);
        removeFromActiveSounds(sound);
        sound.unload();
      });

      // Play the sound - Howler will load it automatically
      // Use a more reliable approach: try to play directly, handle loading internally
      const playId = sound.play();

      // If play() returns 0, it means the sound isn't loaded yet
      // In that case, wait for it to load
      if (playId === 0) {
        sound.once("load", () => {
          // Ensure context is still resumed
          if (Howler.ctx && Howler.ctx.state === "suspended") {
            Howler.ctx
              .resume()
              .then(() => {
                sound.play();
              })
              .catch((e) => {
                console.warn("Failed to resume context after load:", e);
              });
          } else {
            sound.play();
          }
        });
        // Trigger loading
        sound.load();
      } else if (playId > 0) {
        // Sound started playing successfully
        // Ensure context is resumed (in case it got suspended)
        if (Howler.ctx && Howler.ctx.state === "suspended") {
          Howler.ctx.resume().catch((e) => {
            console.warn("Failed to resume context:", e);
          });
        }
      }
    },
    [
      chaosStarted,
      fadeOutOldestSound,
      applyVolumeDucking,
      removeFromActiveSounds,
    ]
  );

  /**
   * Plays a random sound from the audio pool.
   * Enforces maximum simultaneous sounds with ducking and fadeout.
   * Throttled to prevent overwhelming mobile browsers.
   */
  const playRandomSound = useCallback(() => {
    // Only play sounds after chaos has started
    if (!chaosStarted) return;

    // Throttle: only play if enough time has passed since last sound
    const now = Date.now();
    const timeSinceLastSound = now - lastSoundPlayTimeRef.current;
    if (timeSinceLastSound < AUDIO_THROTTLE_MS) {
      return; // Skip this sound to prevent audio overload
    }

    // Update last play time
    lastSoundPlayTimeRef.current = now;

    // Pick a random audio file from the pool
    const randomIndex = Math.floor(Math.random() * AUDIO_POOL.length);
    const audioSrc = AUDIO_POOL[randomIndex];

    // Play the random sound
    playSound(audioSrc, true);
  }, [chaosStarted, playSound]);

  /**
   * Plays the Happy Birthday song immediately.
   * This is called when chaos starts to play the birthday song instantly.
   */
  const playHappyBirthdaySong = useCallback(async () => {
    const birthdaySongSrc = "/audios/Happy Birthday song.mp3";
    // Don't require chaosStarted since we're calling this right when starting chaos
    await playSound(birthdaySongSrc, false);
  }, [playSound]);

  /**
   * Unlocks the AudioContext (required for iOS) and initializes Howler.js.
   * Must be called from a user interaction event.
   * Returns a Promise that resolves when audio is ready.
   */
  const unlockAudio = useCallback(async () => {
    // Ensure Howler is initialized and not muted
    Howler.mute(false);

    // Resume the global Howler AudioContext (iOS requirement)
    // This is CRITICAL for mobile browsers
    if (Howler.ctx) {
      if (Howler.ctx.state === "suspended") {
        try {
          await Howler.ctx.resume();
          console.log("Audio context resumed successfully");
        } catch (e) {
          console.error("Failed to resume audio context:", e);
          // Don't throw - try to continue anyway
        }
      }
    } else {
      // If context doesn't exist yet, Howler will create it on first sound play
      console.log("Audio context will be created on first sound play");
    }

    // Play the initial birthday song now that context is unlocked
    if (initialBirthdaySoundRef.current) {
      const sound = initialBirthdaySoundRef.current;
      try {
        // Track this sound
        const activeSound: ActiveSound = {
          howl: sound,
          startTime: Date.now(),
        };
        activeSoundsRef.current.push(activeSound);

        // Auto-cleanup after playback ends
        sound.once("end", () => {
          removeFromActiveSounds(sound);
          sound.unload();
          initialBirthdaySoundRef.current = null;
        });

        // Play the sound
        const playId = sound.play();
        if (playId === 0) {
          // Sound not loaded yet, wait for load
          sound.once("load", () => {
            sound.play();
          });
          sound.load();
        }
      } catch (e) {
        console.error("Failed to play initial birthday song:", e);
      }
    }
  }, [removeFromActiveSounds]);

  /**
   * Handles the first tap on the entry screen.
   * Unlocks audio and transitions to chaos mode.
   */
  const handleEntryTap = useCallback(async () => {
    // Don't do anything if chaos already started
    if (chaosStarted) return;

    // Unlock audio context for iOS/Safari and wait for it to be ready
    await unlockAudio();

    // The initial birthday song should already be playing (or will start now)
    // Only play again if it's not already playing
    if (
      !initialBirthdaySoundRef.current ||
      !initialBirthdaySoundRef.current.playing()
    ) {
      await playHappyBirthdaySong();
    }

    // Pick a random starting video
    setCurrentVideoIndex(Math.floor(Math.random() * VIDEO_POOL.length));

    // Transition to chaos mode
    setChaosStarted(true);
  }, [chaosStarted, unlockAudio, playHappyBirthdaySong]);

  /**
   * Handles video loaded - ensures autoplay starts
   */
  const handleVideoCanPlay = useCallback((cloneId?: string) => {
    if (cloneId) {
      const video = videoRefs.current.get(cloneId);
      if (video) {
        video.play().catch(() => {
          // Autoplay blocked - will be handled by user interaction
        });
      }
    } else {
      // Handle base video (if we still have a ref for it)
      const baseVideo = videoRefs.current.get("base");
      if (baseVideo) {
        baseVideo.play().catch(() => {
          // Autoplay blocked - will be handled by user interaction
        });
      }
    }
  }, []);

  /**
   * Navigate to the next video in the pool
   */
  const goToNextVideo = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev + 1) % VIDEO_POOL.length);
  }, []);

  /**
   * Navigate to the previous video in the pool
   */
  const goToPreviousVideo = useCallback(() => {
    setCurrentVideoIndex(
      (prev) => (prev - 1 + VIDEO_POOL.length) % VIDEO_POOL.length
    );
  }, []);

  /**
   * Handle touch start - record the starting position
   */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!chaosStarted) return;
      const touch = e.touches[0];
      if (touch) {
        touchStartY.current = touch.clientY;
        touchStartX.current = touch.clientX;
      }
    },
    [chaosStarted]
  );

  /**
   * Handle touch move - prevent default to disable scrolling and play chaos sounds
   * Throttled to prevent audio overload on mobile browsers
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Only prevent default if we're in chaos mode and have started tracking
      if (chaosStarted && touchStartY.current !== null) {
        // Prevent default scroll behavior
        e.preventDefault();
        // Play sound on touch move for chaos effect (throttled internally)
        playRandomSound();
      }
    },
    [playRandomSound, chaosStarted]
  );

  /**
   * Handle touch end - determine swipe direction and navigate
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!chaosStarted || touchStartY.current === null) {
        // Reset touch tracking
        touchStartY.current = null;
        touchStartX.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) {
        touchStartY.current = null;
        touchStartX.current = null;
        return;
      }

      const deltaY = touchStartY.current - touch.clientY;
      const deltaX =
        touchStartX.current !== null
          ? Math.abs(touchStartX.current - touch.clientX)
          : 0;

      // Only trigger if vertical swipe is more significant than horizontal
      if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > deltaX) {
        if (deltaY > 0) {
          // Swiped up - go to next video
          goToNextVideo();
        } else {
          // Swiped down - go to previous video
          goToPreviousVideo();
        }
        // Play sound on successful swipe
        playRandomSound();
      }

      // Reset touch tracking
      touchStartY.current = null;
      touchStartX.current = null;
    },
    [goToNextVideo, goToPreviousVideo, playRandomSound, chaosStarted]
  );

  /**
   * Handle click/tap on chaos container - play random sound
   */
  const handleChaosClick = useCallback(() => {
    playRandomSound();
  }, [playRandomSound]);

  /**
   * Handle pointer move (for desktop mouse interactions)
   * Throttled to prevent audio overload
   */
  const handlePointerMove = useCallback(() => {
    // Throttled internally by playRandomSound
    playRandomSound();
  }, [playRandomSound]);

  // Entry screen - black void waiting for first tap
  if (!chaosStarted) {
    return (
      <div
        className="entry-screen"
        onClick={handleEntryTap}
        onTouchStart={(e) => {
          // Prevent default to avoid double-tap zoom and other mobile behaviors
          e.preventDefault();
          handleEntryTap();
        }}
        onTouchEnd={(e) => {
          // Also handle touchEnd as fallback
          e.preventDefault();
          handleEntryTap();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleEntryTap();
          }
        }}
      >
        <span className="tap-text">TAP HERE</span>
      </div>
    );
  }

  // Chaos mode with TikTok-style vertical video feed
  return (
    <div
      className="chaos-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleChaosClick}
      onPointerMove={handlePointerMove}
      data-testid="chaos-container"
      data-chaos-level={chaosLevel}
      style={{
        backgroundColor: bmwBackgroundColor,
      }}
    >
      <div
        className="chaos-active"
        style={{
          transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
        }}
        data-testid="chaos-content"
      >
        {/* Full-screen vertical video feed with clones */}
        <div
          className="video-feed"
          style={{
            filter: `
              hue-rotate(${hueRotation}deg)
              saturate(${saturation}%)
              ${isInverted ? "invert(1)" : "invert(0)"}
              contrast(${glitchContrast}%)
              brightness(${glitchBrightness}%)
            `.trim(),
          }}
          data-testid="video-feed"
        >
          {/* Chromatic aberration effect using multiple layers with RGB split */}
          {chaosLevel >= GLITCH_START_LEVEL && chromaticAberration > 0 && (
            <div
              className="chromatic-aberration-overlay"
              style={{
                background: `
                  linear-gradient(to right, 
                    rgba(255, 0, 0, 0.3) ${chromaticAberration}px,
                    transparent ${chromaticAberration}px,
                    transparent calc(100% - ${chromaticAberration}px),
                    rgba(0, 0, 255, 0.3) calc(100% - ${chromaticAberration}px)
                  )
                `,
                mixBlendMode: "screen",
              }}
            />
          )}

          {/* Scan lines overlay */}
          {chaosLevel >= GLITCH_START_LEVEL && (
            <div className="scan-lines-overlay" />
          )}
          {/* Base video (always rendered) */}
          <video
            ref={(el) => {
              if (el) {
                videoRefs.current.set("base", el);
                // Apply playback speed when ref is set
                if (chaosLevel >= PLAYBACK_SPEED_START_LEVEL) {
                  el.playbackRate = baseVideoPlaybackSpeed;
                }
                // Set mobile-specific attributes for inline playback
                el.setAttribute("webkit-playsinline", "true");
                el.setAttribute("x5-playsinline", "true");
                // Force play on mobile - some browsers need explicit play() call
                el.play().catch((err) => {
                  // Autoplay blocked or error - will be handled by user interaction
                  console.warn("Video autoplay blocked:", err);
                });
              } else {
                videoRefs.current.delete("base");
              }
            }}
            className="video-player video-base"
            src={VIDEO_POOL[currentVideoIndex]}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onCanPlay={() => {
              handleVideoCanPlay("base");
              // Ensure playback speed is applied after video loads
              const baseVideo = videoRefs.current.get("base");
              if (baseVideo && chaosLevel >= PLAYBACK_SPEED_START_LEVEL) {
                baseVideo.playbackRate = baseVideoPlaybackSpeed;
              }
              // Force play on mobile after canPlay
              if (baseVideo) {
                baseVideo.play().catch(() => {
                  // Autoplay blocked - will be handled by user interaction
                });
              }
            }}
            onError={(e) => {
              console.error("Video loading error:", e);
              // Try to load next video if current one fails
              const baseVideo = videoRefs.current.get("base");
              if (baseVideo) {
                // Try next video in pool
                const nextIndex = (currentVideoIndex + 1) % VIDEO_POOL.length;
                if (nextIndex !== currentVideoIndex) {
                  setCurrentVideoIndex(nextIndex);
                }
              }
            }}
            onLoadedData={() => {
              // Ensure video plays after data is loaded
              const baseVideo = videoRefs.current.get("base");
              if (baseVideo) {
                baseVideo.play().catch(() => {
                  // Autoplay blocked - will be handled by user interaction
                });
              }
            }}
            style={{
              transform: `scale(${baseVideoPulseScale})`,
            }}
            data-testid="chaos-video"
          />

          {/* Video clones */}
          {videoClones.map((clone) => {
            const pulseScale = clonePulseScales.get(clone.id) ?? 1.0;
            return (
              <video
                key={clone.id}
                ref={(el) => {
                  if (el) {
                    videoRefs.current.set(clone.id, el);
                    // Apply playback speed when ref is set
                    if (chaosLevel >= PLAYBACK_SPEED_START_LEVEL) {
                      el.playbackRate = clone.playbackSpeed;
                    }
                    // Set mobile-specific attributes for inline playback
                    el.setAttribute("webkit-playsinline", "true");
                    el.setAttribute("x5-playsinline", "true");
                    // Force play on mobile
                    el.play().catch(() => {
                      // Autoplay blocked - will be handled by user interaction
                    });
                  } else {
                    videoRefs.current.delete(clone.id);
                  }
                }}
                className="video-player video-clone"
                src={VIDEO_POOL[currentVideoIndex]}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                onCanPlay={() => {
                  handleVideoCanPlay(clone.id);
                  // Ensure playback speed is applied after video loads
                  const video = videoRefs.current.get(clone.id);
                  if (video && chaosLevel >= PLAYBACK_SPEED_START_LEVEL) {
                    video.playbackRate = clone.playbackSpeed;
                  }
                  // Force play on mobile after canPlay
                  if (video) {
                    video.play().catch(() => {
                      // Autoplay blocked - will be handled by user interaction
                    });
                  }
                }}
                onError={(e) => {
                  console.error("Video clone loading error:", e);
                }}
                onLoadedData={() => {
                  // Ensure video plays after data is loaded
                  const video = videoRefs.current.get(clone.id);
                  if (video) {
                    video.play().catch(() => {
                      // Autoplay blocked - will be handled by user interaction
                    });
                  }
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transform: `translate(calc(${clone.x}% - 50%), calc(${
                    clone.y
                  }% - 50%)) rotate(${clone.rotation}deg) scale(${
                    clone.scale * pulseScale
                  })`,
                  transformOrigin: "center center",
                }}
                data-testid={`video-clone-${clone.id}`}
              />
            );
          })}

          {/* Hidden preload video for next video in pool - improves swipe performance */}
          <video
            key={`preload-${(currentVideoIndex + 1) % VIDEO_POOL.length}`}
            src={VIDEO_POOL[(currentVideoIndex + 1) % VIDEO_POOL.length]}
            preload="metadata"
            muted
            playsInline
            style={{ display: "none" }}
            aria-hidden="true"
          />
        </div>

        {/* Corruption rectangles overlay */}
        {chaosLevel >= GLITCH_START_LEVEL &&
          corruptionRectangles.map((rect) => (
            <div
              key={rect.id}
              className="corruption-rectangle"
              style={{
                position: "absolute",
                left: `${rect.x}%`,
                top: `${rect.y}%`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: rect.opacity,
              }}
              data-testid={`corruption-rect-${rect.id}`}
            />
          ))}

        {/* Fake UI breaking elements - appear at chaos level 8+ */}
        {chaosLevel >= FAKE_UI_START_LEVEL &&
          fakeUIElements.map((element) => {
            if (element.type === "error") {
              return (
                <div
                  key={element.id}
                  className="fake-ui-element fake-error-popup"
                  style={{
                    position: "absolute",
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  data-testid={`fake-ui-${element.id}`}
                >
                  <div className="fake-error-title">ERROR</div>
                  <div className="fake-error-message">Too much brainrot</div>
                  <button className="fake-error-button">OK</button>
                </div>
              );
            } else if (element.type === "loading") {
              return (
                <div
                  key={element.id}
                  className="fake-ui-element fake-loading-spinner"
                  style={{
                    position: "absolute",
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  data-testid={`fake-ui-${element.id}`}
                >
                  <div className="fake-loading-spinner-circle"></div>
                  <div className="fake-loading-text">Loading...</div>
                </div>
              );
            } else if (element.type === "buffering") {
              return (
                <div
                  key={element.id}
                  className="fake-ui-element fake-buffering-indicator"
                  style={{
                    position: "absolute",
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  data-testid={`fake-ui-${element.id}`}
                >
                  <div className="fake-buffering-bar">
                    <div className="fake-buffering-progress"></div>
                  </div>
                  <div className="fake-buffering-text">Buffering...</div>
                </div>
              );
            } else if (element.type === "overheating") {
              return (
                <div
                  key={element.id}
                  className="fake-ui-element fake-overheating-warning"
                  style={{
                    position: "absolute",
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  data-testid={`fake-ui-${element.id}`}
                >
                  <div className="fake-warning-icon">⚠️</div>
                  <div className="fake-warning-title">Warning</div>
                  <div className="fake-warning-message">
                    Your phone is overheating
                  </div>
                  <button className="fake-warning-button">Dismiss</button>
                </div>
              );
            }
            return null;
          })}

        {/* Floating meme text - spawns at chaos level 9+ */}
        {chaosLevel >= MEME_TEXT_START_LEVEL &&
          floatingTexts.map((text) => (
            <div
              key={text.id}
              className="floating-meme-text"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(calc(${text.x}% - 50%), calc(${text.y}% - 50%)) rotate(${text.rotation}deg)`,
                fontSize: `${text.size}rem`,
                color: text.color,
                fontFamily: text.fontFamily,
              }}
              data-testid={`floating-text-${text.id}`}
            >
              {text.text}
            </div>
          ))}

        {/* Floating birthday text - spawns at max chaos level (10) */}
        {chaosLevel >= BIRTHDAY_TEXT_START_LEVEL &&
          floatingBirthdayTexts.map((text) => (
            <div
              key={text.id}
              className="floating-birthday-text"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(calc(${text.x}% - 50%), calc(${text.y}% - 50%)) rotate(${text.rotation}deg)`,
                fontSize: `${text.size}rem`,
                color: text.color,
                fontFamily: text.fontFamily,
              }}
              data-testid={`birthday-text-${text.id}`}
            >
              {text.text}
            </div>
          ))}

        {/* BMW bouncing images - appear at chaos level 3+ */}
        {chaosLevel >= BMW_START_LEVEL &&
          bmwImages.map((img) => (
            <img
              key={img.id}
              src={IMAGE_POOL.bmwWhite}
              alt="BMW"
              className="bmw-image"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(calc(${img.x}% - 50%), calc(${img.y}% - 50%)) rotate(${img.rotation}deg) scale(${img.scale})`,
                transformOrigin: "center center",
              }}
              data-testid={`bmw-image-${img.id}`}
              onError={(e) => {
                // Hide image if it fails to load (image file doesn't exist yet)
                e.currentTarget.style.display = "none";
              }}
            />
          ))}

        {/* BMW text overlays - appear at chaos level 5+ */}
        {chaosLevel >= BMW_TEXT_START_LEVEL &&
          bmwTexts.map((text) => (
            <div
              key={text.id}
              className="bmw-text-overlay"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(calc(${text.x}% - 50%), calc(${text.y}% - 50%)) rotate(${text.rotation}deg)`,
                fontSize: `${text.size}rem`,
              }}
              data-testid={`bmw-text-${text.id}`}
            >
              {text.text}
            </div>
          ))}

        {/* BMW logo watermarks - appear at chaos level 7+ */}
        {chaosLevel >= BMW_LOGO_START_LEVEL &&
          bmwLogos.map((logo) => (
            <img
              key={logo.id}
              src={IMAGE_POOL.bmwLogo}
              alt="BMW Logo"
              className="bmw-logo-watermark"
              style={{
                position: "absolute",
                left: `${logo.x}%`,
                top: `${logo.y}%`,
                transform: `translate(-50%, -50%) rotate(${logo.rotation}deg) scale(${logo.scale})`,
                transformOrigin: "center center",
                opacity: logo.opacity,
              }}
              data-testid={`bmw-logo-${logo.id}`}
              onError={(e) => {
                // Hide logo if it fails to load (image file doesn't exist yet)
                e.currentTarget.style.display = "none";
              }}
            />
          ))}
      </div>
    </div>
  );
}

export default App;

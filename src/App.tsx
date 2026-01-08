import { useState, useCallback, useRef, useEffect } from 'react'
import { Howl, Howler } from 'howler'
import './App.css'

// Escalation system constants
const MAX_CHAOS_LEVEL = 10
const ESCALATION_INTERVAL = 1000 // 1 second per level

// Screen shake constants
const SHAKE_START_LEVEL = 3 // Chaos level when shake begins
const SHAKE_MIN_INTERVAL = 50 // ms - interval at max chaos (violent)
const SHAKE_MAX_INTERVAL = 200 // ms - interval at start (subtle)
const SHAKE_MIN_INTENSITY = 2 // px - subtle shake at level 3
const SHAKE_MAX_INTENSITY = 15 // px - violent shake at max chaos

// Video clone constants
const MAX_VIDEO_CLONES = 15 // Maximum simultaneous video clones for performance
const CLONE_START_LEVEL = 2 // Chaos level when clones start appearing

// Bouncing physics constants
const BOUNCE_START_LEVEL = 3 // Chaos level when bouncing begins
const BASE_VELOCITY = 0.1 // Base velocity (percentage per frame)
const MAX_VELOCITY = 0.5 // Maximum velocity at max chaos
const VELOCITY_CHANGE_CHANCE = 0.01 // 1% chance per frame to change velocity randomly
const VELOCITY_CHANGE_MAGNITUDE = 0.2 // How much velocity can change randomly

// Rotation and spinning constants
const ROTATION_START_LEVEL = 4 // Chaos level when rotation/spinning begins
const MIN_SPIN_SPEED = 0.2 // Minimum spin speed (degrees per frame)
const MAX_SPIN_SPEED = 2.0 // Maximum spin speed (degrees per frame)

// Audio pool - available audio files in the public/audios folder
const AUDIO_POOL = [
  '/audios/30 Celebrities Fight For _1,000,000_ [QJI0an6irrA].mp3',
  '/audios/All Italian Brainrot Animals Sound Effect  2025.mp3',
  '/audios/Amogus - Sound effect.mp3',
  '/audios/Baba Booey - Sound Effect (HD).mp3',
  '/audios/Boy what the hell boy Sound Effect.mp3',
  '/audios/Guy Speaks Plants vs Zombies Victory Theme.mp3',
  '/audios/Happy Birthday song.mp3',
  '/audios/Taco Bell Bong SFX.mp3',
  '/audios/You Stupid - Sound Effect (HD).mp3',
]

// Audio system constants
const MAX_SIMULTANEOUS_SOUNDS = 8
const DUCKING_THRESHOLD = 5 // Start ducking volume at this many sounds
const BASE_VOLUME = 0.5
const DUCKED_VOLUME = 0.3 // Volume when ducking is active
const FADEOUT_DURATION = 200 // ms to fade out oldest sound

// Type for tracking active sounds
interface ActiveSound {
  howl: Howl
  startTime: number
}

// Type for video clone properties
interface VideoClone {
  id: string
  x: number // Position X (percentage)
  y: number // Position Y (percentage)
  rotation: number // Rotation in degrees
  scale: number // Scale factor
  vx: number // Velocity X (percentage per frame)
  vy: number // Velocity Y (percentage per frame)
  spinSpeed: number // Spin speed (degrees per frame, 0 if not spinning)
}

// Video pool - available videos in the public/videos folder
const VIDEO_POOL = [
  '/videos/Happy Birthday To You — Italian Brainrot Edition - Bernie Espo (720p, h264, youtube).mp4',
  '/videos/videoplayback.mp4',
  '/videos/YTDown.com_Shorts_BRAINROT-BIRTHDAY-brainrot-tungtungtungs_Media_HvSRlRw9p-E_001_1080p.mp4',
  '/videos/YTDown.com_YouTube_Happy-Birthday-To-You-Italian-Brainrot-E_Media_yE4CdgogwC4_002_720p.mp4',
]

// Image pool - BMW assets in the public/images folder
// Note: Image files (bmw-white.png, bmw-logo.png) should be added to public/images/
// This will be used by the BMW integration feature
export const IMAGE_POOL = {
  bmwWhite: '/images/bmw-white.png',
  bmwLogo: '/images/bmw-logo.png',
}

// Minimum swipe distance in pixels to trigger video change
const SWIPE_THRESHOLD = 50

function App() {
  const [chaosStarted, setChaosStarted] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [chaosLevel, setChaosLevel] = useState(1)
  const [videoClones, setVideoClones] = useState<VideoClone[]>([])
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const animationFrameRef = useRef<number | null>(null)
  const clonesRef = useRef<VideoClone[]>([]) // Ref to track clones for animation loop
  
  // Touch tracking refs for swipe detection
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  
  // Track active sounds for limiting simultaneous playback
  const activeSoundsRef = useRef<ActiveSound[]>([])
  
  // Escalation timer ref for cleanup
  const escalationTimerRef = useRef<number | null>(null)
  
  // Screen shake state
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 })
  const shakeTimerRef = useRef<number | null>(null)
  
  /**
   * Time-based escalation system.
   * Increments chaos level every second from 1 to 10 over 10 seconds.
   * Once level 10 is reached, the timer stops and chaos stays at maximum.
   */
  useEffect(() => {
    if (!chaosStarted) return
    
    // Start the escalation timer
    escalationTimerRef.current = window.setInterval(() => {
      setChaosLevel((prev) => {
        if (prev >= MAX_CHAOS_LEVEL) {
          // Reached maximum - clear the interval
          if (escalationTimerRef.current !== null) {
            clearInterval(escalationTimerRef.current)
            escalationTimerRef.current = null
          }
          return MAX_CHAOS_LEVEL
        }
        return prev + 1
      })
    }, ESCALATION_INTERVAL)
    
    // Cleanup on unmount or when chaos stops
    return () => {
      if (escalationTimerRef.current !== null) {
        clearInterval(escalationTimerRef.current)
        escalationTimerRef.current = null
      }
    }
  }, [chaosStarted])
  
  /**
   * Video clone generation system.
   * Creates video clones based on chaos level, with random transforms.
   * Clones start appearing at level 2 and increase up to max (15).
   */
  useEffect(() => {
    if (!chaosStarted) {
      setVideoClones([])
      return
    }

    // Calculate number of clones based on chaos level
    // Level 1: 1 video (no clones)
    // Level 2: 2-3 total videos (1 base + 1-2 clones)
    // Level 3-10: Increasing clones up to MAX_VIDEO_CLONES total
    let totalVideoCount = 1 // Base video only at level 1
    
    if (chaosLevel >= CLONE_START_LEVEL) {
      // At level 2, we want 2-3 total (1 base + 1-2 clones)
      if (chaosLevel === CLONE_START_LEVEL) {
        totalVideoCount = 2 + Math.floor(Math.random() * 2) // 2 or 3 total
      } else {
        // For levels 3-10, scale from ~4 to MAX_VIDEO_CLONES total
        const levelProgress = (chaosLevel - CLONE_START_LEVEL) / (MAX_CHAOS_LEVEL - CLONE_START_LEVEL)
        const minTotal = 4
        const maxTotal = MAX_VIDEO_CLONES
        totalVideoCount = Math.floor(minTotal + levelProgress * (maxTotal - minTotal))
        // Add some randomness
        totalVideoCount += Math.floor(Math.random() * 3) - 1 // -1, 0, or +1
        totalVideoCount = Math.min(totalVideoCount, MAX_VIDEO_CLONES)
      }
    }

    // Generate clones (totalVideoCount - 1, since 1 is the base video)
    const cloneCount = totalVideoCount - 1
    const clones: VideoClone[] = []
    for (let i = 0; i < cloneCount; i++) {
      // Calculate velocity based on chaos level
      const levelProgress = chaosLevel >= BOUNCE_START_LEVEL 
        ? (chaosLevel - BOUNCE_START_LEVEL) / (MAX_CHAOS_LEVEL - BOUNCE_START_LEVEL)
        : 0
      const velocity = BASE_VELOCITY + levelProgress * (MAX_VELOCITY - BASE_VELOCITY)
      
      // Random initial velocity direction
      const angle = Math.random() * Math.PI * 2
      const vx = Math.cos(angle) * velocity
      const vy = Math.sin(angle) * velocity
      
      // Calculate spin speed if rotation is active (chaos level 4+)
      let spinSpeed = 0
      if (chaosLevel >= ROTATION_START_LEVEL) {
        // Some videos spin continuously, some don't (70% chance to spin)
        if (Math.random() < 0.7) {
          // Spin speed varies per video (random between min and max)
          // Speed also scales with chaos level
          const levelProgress = (chaosLevel - ROTATION_START_LEVEL) / (MAX_CHAOS_LEVEL - ROTATION_START_LEVEL)
          const baseSpinSpeed = MIN_SPIN_SPEED + Math.random() * (MAX_SPIN_SPEED - MIN_SPIN_SPEED)
          spinSpeed = baseSpinSpeed * (1 + levelProgress) // Faster at higher chaos levels
          // Random direction (clockwise or counterclockwise)
          if (Math.random() < 0.5) {
            spinSpeed = -spinSpeed
          }
        }
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
      })
    }

    setVideoClones(clones)
    clonesRef.current = clones // Update ref for animation loop
  }, [chaosStarted, chaosLevel, currentVideoIndex]) // Regenerate when video changes too

  /**
   * DVD screensaver-style bouncing physics and rotation for video clones.
   * Videos bounce around screen with physics, can escape edges and return unexpectedly.
   * Bouncing intensity increases with chaos level.
   * Rotation/spinning activates at chaos level 4+.
   */
  useEffect(() => {
    // Animation loop runs if bouncing (level 3+) OR rotation (level 4+) is active
    const shouldAnimate = chaosStarted && (chaosLevel >= BOUNCE_START_LEVEL || chaosLevel >= ROTATION_START_LEVEL)
    
    if (!shouldAnimate) {
      // Stop animation if neither bouncing nor rotation should be active
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    // Calculate velocity scale based on chaos level
    const levelProgress = (chaosLevel - BOUNCE_START_LEVEL) / (MAX_CHAOS_LEVEL - BOUNCE_START_LEVEL)
    const velocityScale = 1 + levelProgress // 1x at level 3, 2x at level 10

    const animate = () => {
      setVideoClones((prevClones) => {
        // Update ref for next frame
        const updatedClones = prevClones.map((clone) => {
          let { x, y, vx, vy, rotation, spinSpeed } = clone

          // Apply random velocity changes occasionally (DVD screensaver quirk)
          if (Math.random() < VELOCITY_CHANGE_CHANCE) {
            vx += (Math.random() - 0.5) * VELOCITY_CHANGE_MAGNITUDE * velocityScale
            vy += (Math.random() - 0.5) * VELOCITY_CHANGE_MAGNITUDE * velocityScale
          }

          // Scale velocity with chaos level
          const scaledVx = vx * velocityScale
          const scaledVy = vy * velocityScale

          // Update position
          x += scaledVx
          y += scaledVy

          // Update rotation if spinning (chaos level 4+)
          if (spinSpeed !== 0) {
            rotation += spinSpeed
            // Keep rotation in reasonable range to prevent overflow
            rotation = rotation % 360
          }

          // Handle edge collisions with bouncing
          // Videos can escape edges and return unexpectedly (DVD screensaver behavior)
          // We'll allow them to go slightly off-screen before bouncing
          const margin = 5 // Allow 5% off-screen before bouncing
          
          if (x < -margin) {
            x = -margin
            vx = Math.abs(vx) // Bounce right
          } else if (x > 100 + margin) {
            x = 100 + margin
            vx = -Math.abs(vx) // Bounce left
          }

          if (y < -margin) {
            y = -margin
            vy = Math.abs(vy) // Bounce down
          } else if (y > 100 + margin) {
            y = 100 + margin
            vy = -Math.abs(vy) // Bounce up
          }

          return {
            ...clone,
            x,
            y,
            vx,
            vy,
            rotation,
          }
        })

        // Update ref for next frame
        clonesRef.current = updatedClones
        return updatedClones
      })

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate)

    // Cleanup on unmount or when bouncing stops
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [chaosStarted, chaosLevel]) // Re-run when chaos state or level changes

  /**
   * Screen shake effect.
   * Activates at chaos level 3 and intensifies up to level 10.
   * Uses random offsets applied via CSS transform for GPU acceleration.
   */
  useEffect(() => {
    // Only shake if chaos started and level is high enough
    if (!chaosStarted || chaosLevel < SHAKE_START_LEVEL) {
      // Reset shake offset if below threshold
      setShakeOffset({ x: 0, y: 0 })
      return
    }
    
    // Calculate intensity based on chaos level (3-10 maps to min-max intensity)
    const levelProgress = (chaosLevel - SHAKE_START_LEVEL) / (MAX_CHAOS_LEVEL - SHAKE_START_LEVEL)
    const intensity = SHAKE_MIN_INTENSITY + levelProgress * (SHAKE_MAX_INTENSITY - SHAKE_MIN_INTENSITY)
    
    // Calculate interval - faster shake at higher levels
    const interval = SHAKE_MAX_INTERVAL - levelProgress * (SHAKE_MAX_INTERVAL - SHAKE_MIN_INTERVAL)
    
    // Start the shake timer
    const updateShake = () => {
      // Random offset within intensity range
      const x = (Math.random() - 0.5) * 2 * intensity
      const y = (Math.random() - 0.5) * 2 * intensity
      setShakeOffset({ x, y })
    }
    
    // Initial shake
    updateShake()
    
    // Set up interval for continuous shaking
    shakeTimerRef.current = window.setInterval(updateShake, interval)
    
    // Cleanup on unmount or when chaos level changes
    return () => {
      if (shakeTimerRef.current !== null) {
        clearInterval(shakeTimerRef.current)
        shakeTimerRef.current = null
      }
    }
  }, [chaosStarted, chaosLevel])
  
  /**
   * Removes a sound from the active sounds tracking array.
   */
  const removeFromActiveSounds = useCallback((howl: Howl) => {
    activeSoundsRef.current = activeSoundsRef.current.filter(s => s.howl !== howl)
  }, [])
  
  /**
   * Applies volume ducking to all active sounds when approaching the limit.
   * This compresses the audio mix rather than clipping.
   */
  const applyVolumeDucking = useCallback(() => {
    const activeCount = activeSoundsRef.current.length
    const shouldDuck = activeCount >= DUCKING_THRESHOLD
    const targetVolume = shouldDuck ? DUCKED_VOLUME : BASE_VOLUME
    
    // Apply ducked volume to all active sounds
    activeSoundsRef.current.forEach(({ howl }) => {
      howl.volume(targetVolume)
    })
  }, [])
  
  /**
   * Fades out and removes the oldest sound when at max capacity.
   */
  const fadeOutOldestSound = useCallback(() => {
    if (activeSoundsRef.current.length === 0) return
    
    // Sort by start time to find oldest
    const sorted = [...activeSoundsRef.current].sort((a, b) => a.startTime - b.startTime)
    const oldest = sorted[0]
    
    if (oldest) {
      // Fade out over FADEOUT_DURATION
      oldest.howl.fade(oldest.howl.volume(), 0, FADEOUT_DURATION)
      
      // Remove from tracking and unload after fade
      setTimeout(() => {
        oldest.howl.unload()
        removeFromActiveSounds(oldest.howl)
      }, FADEOUT_DURATION)
    }
  }, [removeFromActiveSounds])
  
  /**
   * Plays a random sound from the audio pool.
   * Enforces maximum simultaneous sounds with ducking and fadeout.
   */
  const playRandomSound = useCallback(() => {
    // Only play sounds after chaos has started
    if (!chaosStarted) return
    
    // Check if we're at the maximum limit
    if (activeSoundsRef.current.length >= MAX_SIMULTANEOUS_SOUNDS) {
      // Fade out oldest sound to make room
      fadeOutOldestSound()
    }
    
    // Pick a random audio file from the pool
    const randomIndex = Math.floor(Math.random() * AUDIO_POOL.length)
    const audioSrc = AUDIO_POOL[randomIndex]
    
    // Determine initial volume based on current sound count
    const shouldDuck = activeSoundsRef.current.length >= DUCKING_THRESHOLD - 1
    const initialVolume = shouldDuck ? DUCKED_VOLUME : BASE_VOLUME
    
    // Create the Howl instance
    const sound = new Howl({
      src: [audioSrc],
      volume: initialVolume,
    })
    
    // Track this sound
    const activeSound: ActiveSound = {
      howl: sound,
      startTime: Date.now(),
    }
    activeSoundsRef.current.push(activeSound)
    
    // Apply ducking to all sounds now that we've added one
    applyVolumeDucking()
    
    // Auto-cleanup after playback ends
    sound.on('end', () => {
      removeFromActiveSounds(sound)
      sound.unload()
      // Re-apply volume levels after a sound ends
      applyVolumeDucking()
    })
    
    sound.play()
  }, [chaosStarted, fadeOutOldestSound, applyVolumeDucking, removeFromActiveSounds])

  /**
   * Unlocks the AudioContext (required for iOS) and initializes Howler.js.
   * Must be called from a user interaction event.
   */
  const unlockAudio = useCallback(() => {
    // Resume the global Howler AudioContext (iOS requirement)
    // Howler automatically creates an AudioContext, we just need to unlock it
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume()
    }
    
    // Ensure Howler is ready for playback
    // Setting mute to false and then unmuting forces initialization
    Howler.mute(false)
  }, [])

  /**
   * Handles the first tap on the entry screen.
   * Unlocks audio and transitions to chaos mode.
   */
  const handleEntryTap = useCallback(() => {
    // Don't do anything if chaos already started
    if (chaosStarted) return

    // Unlock audio context for iOS/Safari
    unlockAudio()

    // Pick a random starting video
    setCurrentVideoIndex(Math.floor(Math.random() * VIDEO_POOL.length))

    // Transition to chaos mode
    setChaosStarted(true)
  }, [chaosStarted, unlockAudio])

  /**
   * Handles video loaded - ensures autoplay starts
   */
  const handleVideoCanPlay = useCallback((cloneId?: string) => {
    if (cloneId) {
      const video = videoRefs.current.get(cloneId)
      if (video) {
        video.play().catch(() => {
          // Autoplay blocked - will be handled by user interaction
        })
      }
    } else {
      // Handle base video (if we still have a ref for it)
      const baseVideo = videoRefs.current.get('base')
      if (baseVideo) {
        baseVideo.play().catch(() => {
          // Autoplay blocked - will be handled by user interaction
        })
      }
    }
  }, [])

  /**
   * Navigate to the next video in the pool
   */
  const goToNextVideo = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev + 1) % VIDEO_POOL.length)
  }, [])

  /**
   * Navigate to the previous video in the pool
   */
  const goToPreviousVideo = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev - 1 + VIDEO_POOL.length) % VIDEO_POOL.length)
  }, [])

  /**
   * Handle touch start - record the starting position
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartY.current = touch.clientY
    touchStartX.current = touch.clientX
  }, [])

  /**
   * Handle touch move - prevent default to disable scrolling and play chaos sounds
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent default scroll behavior
    e.preventDefault()
    // Play sound on touch move for chaos effect
    playRandomSound()
  }, [playRandomSound])

  /**
   * Handle touch end - determine swipe direction and navigate
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touch = e.changedTouches[0]
    const deltaY = touchStartY.current - touch.clientY
    const deltaX = touchStartX.current !== null ? Math.abs(touchStartX.current - touch.clientX) : 0

    // Only trigger if vertical swipe is more significant than horizontal
    if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > deltaX) {
      if (deltaY > 0) {
        // Swiped up - go to next video
        goToNextVideo()
      } else {
        // Swiped down - go to previous video
        goToPreviousVideo()
      }
      // Play sound on successful swipe
      playRandomSound()
    }

    // Reset touch tracking
    touchStartY.current = null
    touchStartX.current = null
  }, [goToNextVideo, goToPreviousVideo, playRandomSound])
  
  /**
   * Handle click/tap on chaos container - play random sound
   */
  const handleChaosClick = useCallback(() => {
    playRandomSound()
  }, [playRandomSound])
  
  /**
   * Handle pointer move (for desktop mouse interactions)
   */
  const handlePointerMove = useCallback(() => {
    playRandomSound()
  }, [playRandomSound])

  // Entry screen - black void waiting for first tap
  if (!chaosStarted) {
    return (
      <div 
        className="entry-screen" 
        onClick={handleEntryTap}
        onTouchEnd={handleEntryTap}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleEntryTap()
          }
        }}
      >
        <span className="tap-text">TAP HERE</span>
      </div>
    )
  }

  // Check if we're at max chaos for "Happy Birthday" text
  const isMaxChaos = chaosLevel >= MAX_CHAOS_LEVEL

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
    >
      <div 
        className="chaos-active"
        style={{
          transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
        }}
        data-testid="chaos-content"
      >
        {/* Full-screen vertical video feed with clones */}
        <div className="video-feed">
          {/* Base video (always rendered) */}
          <video
            ref={(el) => {
              if (el) videoRefs.current.set('base', el)
              else videoRefs.current.delete('base')
            }}
            className="video-player video-base"
            src={VIDEO_POOL[currentVideoIndex]}
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={() => handleVideoCanPlay('base')}
            data-testid="chaos-video"
          />
          
          {/* Video clones */}
          {videoClones.map((clone) => (
            <video
              key={clone.id}
              ref={(el) => {
                if (el) videoRefs.current.set(clone.id, el)
                else videoRefs.current.delete(clone.id)
              }}
              className="video-player video-clone"
              src={VIDEO_POOL[currentVideoIndex]}
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={() => handleVideoCanPlay(clone.id)}
              style={{
                position: 'absolute',
                left: `${clone.x}%`,
                top: `${clone.y}%`,
                transform: `translate(-50%, -50%) rotate(${clone.rotation}deg) scale(${clone.scale})`,
                transformOrigin: 'center center',
              }}
              data-testid={`video-clone-${clone.id}`}
            />
          ))}
        </div>
        
        {/* Happy Birthday text appears at max chaos level */}
        {isMaxChaos && (
          <div className="happy-birthday-overlay" data-testid="happy-birthday">
            <span className="happy-birthday-text">Happy Birthday Michael</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

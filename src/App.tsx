import { useState, useCallback, useRef, useEffect } from 'react'
import { Howl, Howler } from 'howler'
import './App.css'

// Escalation system constants
const MAX_CHAOS_LEVEL = 10
const ESCALATION_INTERVAL = 1000 // 1 second per level

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

// Video pool - available videos in the public/videos folder
const VIDEO_POOL = [
  '/videos/Happy Birthday To You — Italian Brainrot Edition - Bernie Espo (720p, h264, youtube).mp4',
  '/videos/videoplayback.mp4',
  '/videos/YTDown.com_Shorts_BRAINROT-BIRTHDAY-brainrot-tungtungtungs_Media_HvSRlRw9p-E_001_1080p.mp4',
  '/videos/YTDown.com_YouTube_Happy-Birthday-To-You-Italian-Brainrot-E_Media_yE4CdgogwC4_002_720p.mp4',
]

// Minimum swipe distance in pixels to trigger video change
const SWIPE_THRESHOLD = 50

function App() {
  const [chaosStarted, setChaosStarted] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [chaosLevel, setChaosLevel] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Touch tracking refs for swipe detection
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  
  // Track active sounds for limiting simultaneous playback
  const activeSoundsRef = useRef<ActiveSound[]>([])
  
  // Escalation timer ref for cleanup
  const escalationTimerRef = useRef<number | null>(null)
  
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
  const handleVideoCanPlay = useCallback(() => {
    if (videoRef.current) {
      // Attempt to play (may fail silently if autoplay blocked)
      videoRef.current.play().catch(() => {
        // Autoplay blocked - will be handled by user interaction
      })
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
      <div className="chaos-active">
        {/* Full-screen vertical video feed */}
        <div className="video-feed">
          <video
            ref={videoRef}
            className="video-player"
            src={VIDEO_POOL[currentVideoIndex]}
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={handleVideoCanPlay}
            data-testid="chaos-video"
          />
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

import { useState, useCallback, useRef } from 'react'
import { Howler } from 'howler'
import './App.css'

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
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Touch tracking refs for swipe detection
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)

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
   * Handle touch move - prevent default to disable scrolling
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent default scroll behavior
    e.preventDefault()
  }, [])

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
    }

    // Reset touch tracking
    touchStartY.current = null
    touchStartX.current = null
  }, [goToNextVideo, goToPreviousVideo])

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

  // Chaos mode with TikTok-style vertical video feed
  return (
    <div 
      className="chaos-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid="chaos-container"
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
      </div>
    </div>
  )
}

export default App

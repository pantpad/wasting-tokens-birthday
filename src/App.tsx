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

function App() {
  const [chaosStarted, setChaosStarted] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

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
    <div className="chaos-container">
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

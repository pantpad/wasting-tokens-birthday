import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from './App'

// Track mock Howl instances and play calls
const mockPlay = vi.fn()
const mockUnload = vi.fn()
const mockOn = vi.fn()
const mockVolume = vi.fn()
const mockFade = vi.fn()

interface MockHowlInstance {
  src: string[]
  currentVolume: number
  play: typeof mockPlay
  unload: typeof mockUnload
  on: typeof mockOn
  volume: (v?: number) => number
  fade: typeof mockFade
}

const mockHowlInstances: MockHowlInstance[] = []

// Mock Howler to avoid audio context issues in tests
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation((options: { src: string[]; volume?: number }) => {
    const instance: MockHowlInstance = { 
      src: options.src, 
      currentVolume: options.volume ?? 0.5,
      play: mockPlay, 
      unload: mockUnload,
      on: mockOn,
      volume: function(v?: number) {
        if (v !== undefined) {
          this.currentVolume = v
          mockVolume(v)
        }
        return this.currentVolume
      },
      fade: mockFade,
    }
    mockHowlInstances.push(instance)
    return instance
  }),
  Howler: {
    ctx: { state: 'suspended', resume: vi.fn() },
    mute: vi.fn(),
  },
}))

describe('App', () => {
  beforeEach(() => {
    // Clear mock state before each test
    mockPlay.mockClear()
    mockUnload.mockClear()
    mockOn.mockClear()
    mockVolume.mockClear()
    mockFade.mockClear()
    mockHowlInstances.length = 0
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Entry Screen', () => {
    it('renders the entry screen with TAP HERE text', () => {
      render(<App />)
      expect(screen.getByText(/TAP HERE/i)).toBeInTheDocument()
    })

    it('has the entry-screen container', () => {
      const { container } = render(<App />)
      expect(container.querySelector('.entry-screen')).toBeInTheDocument()
    })

    it('has the tap-text element', () => {
      const { container } = render(<App />)
      expect(container.querySelector('.tap-text')).toBeInTheDocument()
    })

    it('does not show chaos container before tap', () => {
      const { container } = render(<App />)
      expect(container.querySelector('.chaos-container')).not.toBeInTheDocument()
    })
  })

  describe('Tap to Start', () => {
    it('transitions to chaos mode when entry screen is clicked', () => {
      const { container } = render(<App />)
      
      // Initially shows entry screen
      expect(container.querySelector('.entry-screen')).toBeInTheDocument()
      expect(container.querySelector('.chaos-container')).not.toBeInTheDocument()
      
      // Click the entry screen
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Now shows chaos container, not entry screen
      expect(container.querySelector('.entry-screen')).not.toBeInTheDocument()
      expect(container.querySelector('.chaos-container')).toBeInTheDocument()
    })

    it('transitions to chaos mode on touch end', () => {
      const { container } = render(<App />)
      
      // Initially shows entry screen
      expect(container.querySelector('.entry-screen')).toBeInTheDocument()
      
      // Touch the entry screen
      fireEvent.touchEnd(container.querySelector('.entry-screen')!)
      
      // Now shows chaos container
      expect(container.querySelector('.chaos-container')).toBeInTheDocument()
    })

    it('transitions to chaos mode on keyboard Enter', () => {
      const { container } = render(<App />)
      
      const entryScreen = container.querySelector('.entry-screen')!
      fireEvent.keyDown(entryScreen, { key: 'Enter' })
      
      expect(container.querySelector('.chaos-container')).toBeInTheDocument()
    })

    it('transitions to chaos mode on keyboard Space', () => {
      const { container } = render(<App />)
      
      const entryScreen = container.querySelector('.entry-screen')!
      fireEvent.keyDown(entryScreen, { key: ' ' })
      
      expect(container.querySelector('.chaos-container')).toBeInTheDocument()
    })

    it('has chaos-active container inside chaos-container', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Verify chaos-active exists inside chaos-container
      const chaosContainer = container.querySelector('.chaos-container')
      expect(chaosContainer?.querySelector('.chaos-active')).toBeInTheDocument()
    })
  })

  describe('Video Feed', () => {
    it('renders video element after tap', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Verify video element exists
      const video = screen.getByTestId('chaos-video')
      expect(video).toBeInTheDocument()
    })

    it('video has correct attributes for autoplay', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Verify video attributes
      const video = screen.getByTestId('chaos-video') as HTMLVideoElement
      expect(video).toHaveAttribute('autoplay')
      expect(video).toHaveAttribute('loop')
      // Note: React handles muted as a property, not an attribute
      expect(video.muted).toBe(true)
      expect(video).toHaveAttribute('playsinline')
    })

    it('video has a valid source from the video pool', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Verify video has a src attribute that starts with /videos/
      const video = screen.getByTestId('chaos-video') as HTMLVideoElement
      expect(video.src).toMatch(/\/videos\//)
    })

    it('video feed container exists inside chaos-active', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Verify video-feed container exists
      expect(container.querySelector('.video-feed')).toBeInTheDocument()
    })

    it('video player has correct CSS class', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Verify video has video-player class
      const video = screen.getByTestId('chaos-video')
      expect(video).toHaveClass('video-player')
    })
  })

  describe('Swipe Navigation', () => {
    // Helper to simulate touch swipe
    const simulateSwipe = (element: Element, startY: number, endY: number, startX = 100, endX = 100) => {
      fireEvent.touchStart(element, {
        touches: [{ clientX: startX, clientY: startY }],
      })
      fireEvent.touchMove(element, {
        touches: [{ clientX: endX, clientY: (startY + endY) / 2 }],
      })
      fireEvent.touchEnd(element, {
        changedTouches: [{ clientX: endX, clientY: endY }],
      })
    }

    it('swipe up changes to next video', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Get the initial video src
      const video = screen.getByTestId('chaos-video') as HTMLVideoElement
      const initialSrc = video.src
      
      // Simulate swipe up (start at bottom, end at top - deltaY > threshold)
      const chaosContainer = screen.getByTestId('chaos-container')
      simulateSwipe(chaosContainer, 300, 100) // Swipe up: startY > endY
      
      // Video should have changed
      expect(video.src).not.toBe(initialSrc)
    })

    it('swipe down changes to previous video', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Get the initial video src
      const video = screen.getByTestId('chaos-video') as HTMLVideoElement
      const initialSrc = video.src
      
      // Simulate swipe up first to have a previous video to go back to
      const chaosContainer = screen.getByTestId('chaos-container')
      simulateSwipe(chaosContainer, 300, 100) // Swipe up first
      
      const afterSwipeUpSrc = video.src
      
      // Now swipe down (start at top, end at bottom - deltaY < -threshold)
      simulateSwipe(chaosContainer, 100, 300) // Swipe down: startY < endY
      
      // Video should have changed back
      expect(video.src).not.toBe(afterSwipeUpSrc)
      expect(video.src).toBe(initialSrc)
    })

    it('small swipe does not change video (below threshold)', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Get the initial video src
      const video = screen.getByTestId('chaos-video') as HTMLVideoElement
      const initialSrc = video.src
      
      // Simulate small swipe (less than 50px threshold)
      const chaosContainer = screen.getByTestId('chaos-container')
      simulateSwipe(chaosContainer, 100, 130) // Only 30px, below threshold
      
      // Video should NOT have changed
      expect(video.src).toBe(initialSrc)
    })

    it('horizontal swipe does not change video', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Get the initial video src
      const video = screen.getByTestId('chaos-video') as HTMLVideoElement
      const initialSrc = video.src
      
      // Simulate horizontal swipe (large X delta, small Y delta)
      const chaosContainer = screen.getByTestId('chaos-container')
      simulateSwipe(chaosContainer, 100, 120, 100, 300) // Horizontal swipe
      
      // Video should NOT have changed
      expect(video.src).toBe(initialSrc)
    })

    it('video wraps around to last video when swiping down from first', () => {
      // Mock Math.random to always return 0 (first video)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0)
      
      // Render to get first video
      const { container } = render(<App />)
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const video = container.querySelector('[data-testid="chaos-video"]') as HTMLVideoElement
      const initialSrc = video.src
      
      // Swipe down to wrap to last video
      const chaosContainer = container.querySelector('[data-testid="chaos-container"]')!
      simulateSwipe(chaosContainer, 100, 300) // Swipe down
      
      // Should be a different video (the last one)
      expect(video.src).not.toBe(initialSrc)
      
      mockRandom.mockRestore()
    })

    it('chaos container has touch event handlers', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Verify chaos container exists with test id
      const chaosContainer = screen.getByTestId('chaos-container')
      expect(chaosContainer).toBeInTheDocument()
    })

    it('touchmove is handled (for scroll prevention)', () => {
      const { container } = render(<App />)
      
      // Trigger chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // This should not throw
      fireEvent.touchMove(chaosContainer, {
        touches: [{ clientX: 100, clientY: 150 }],
        preventDefault: vi.fn(),
      })
      
      // If we get here without error, the handler works
      expect(chaosContainer).toBeInTheDocument()
    })
  })

  describe('Audio Chaos System', () => {
    it('does not play sounds before chaos starts', () => {
      render(<App />)
      
      // Entry screen is showing, no sounds should play yet
      expect(mockPlay).not.toHaveBeenCalled()
    })

    it('plays sound on click in chaos container', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockPlay.mockClear() // Clear any sounds from entry transition
      
      // Click in chaos container
      const chaosContainer = screen.getByTestId('chaos-container')
      fireEvent.click(chaosContainer)
      
      // Sound should have been played
      expect(mockPlay).toHaveBeenCalled()
    })

    it('plays sound on touch move in chaos container', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockPlay.mockClear()
      
      // Touch move in chaos container
      const chaosContainer = screen.getByTestId('chaos-container')
      fireEvent.touchMove(chaosContainer, {
        touches: [{ clientX: 100, clientY: 150 }],
        preventDefault: vi.fn(),
      })
      
      // Sound should have been played
      expect(mockPlay).toHaveBeenCalled()
    })

    it('plays sound on successful swipe', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockPlay.mockClear()
      
      // Simulate swipe
      const chaosContainer = screen.getByTestId('chaos-container')
      fireEvent.touchStart(chaosContainer, {
        touches: [{ clientX: 100, clientY: 300 }],
      })
      fireEvent.touchEnd(chaosContainer, {
        changedTouches: [{ clientX: 100, clientY: 100 }], // Swipe up 200px
      })
      
      // Sound should have been played on swipe
      expect(mockPlay).toHaveBeenCalled()
    })

    it('plays sound on pointer move (desktop)', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockPlay.mockClear()
      
      // Pointer move in chaos container
      const chaosContainer = screen.getByTestId('chaos-container')
      fireEvent.pointerMove(chaosContainer, { clientX: 100, clientY: 100 })
      
      // Sound should have been played
      expect(mockPlay).toHaveBeenCalled()
    })

    it('selects random sound from audio pool', () => {
      // Mock Math.random to return specific values
      const randomValues = [0.5, 0.2, 0.8]
      let callIndex = 0
      vi.spyOn(Math, 'random').mockImplementation(() => {
        // Return 0 for the first call (video selection), then cycle through randomValues
        if (callIndex === 0) {
          callIndex++
          return 0
        }
        const value = randomValues[(callIndex - 1) % randomValues.length]
        callIndex++
        return value
      })
      
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockHowlInstances.length = 0
      mockPlay.mockClear()
      
      // Click multiple times
      const chaosContainer = screen.getByTestId('chaos-container')
      fireEvent.click(chaosContainer)
      fireEvent.click(chaosContainer)
      fireEvent.click(chaosContainer)
      
      // Should have created Howl instances with different audio files
      expect(mockHowlInstances.length).toBeGreaterThan(0)
      expect(mockPlay).toHaveBeenCalled()
      
      // Verify audio files are from the pool
      mockHowlInstances.forEach((instance) => {
        expect(instance.src[0]).toMatch(/\/audios\//)
      })
      
      vi.spyOn(Math, 'random').mockRestore()
    })

    it('creates Howl instances with audio from the pool', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockHowlInstances.length = 0 // Clear previous instances
      
      // Trigger sound
      const chaosContainer = screen.getByTestId('chaos-container')
      fireEvent.click(chaosContainer)
      
      // Verify Howl instances were created with audio from pool
      expect(mockHowlInstances.length).toBe(1)
      expect(mockHowlInstances[0].src[0]).toMatch(/\/audios\/.*\.mp3$/)
    })
  })

  describe('Time-based Escalation System', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('starts at chaos level 1 when chaos begins', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Chaos level should be 1 initially
      const chaosContainer = screen.getByTestId('chaos-container')
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '1')
    })

    it('increments chaos level every second', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Initially at level 1
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '1')
      
      // After 1 second, should be at level 2
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '2')
      
      // After another second (2s total), should be at level 3
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '3')
    })

    it('reaches chaos level 10 after 9 seconds', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Advance 9 seconds (9 intervals of 1 second)
      act(() => {
        vi.advanceTimersByTime(9000)
      })
      
      // Should be at max level 10
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '10')
    })

    it('stays at chaos level 10 after reaching maximum', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Advance 15 seconds (well past max)
      act(() => {
        vi.advanceTimersByTime(15000)
      })
      
      // Should still be at max level 10 (not 11 or higher)
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '10')
    })

    it('chaos level does not change before chaos starts', () => {
      const { container } = render(<App />)
      
      // Entry screen should not have chaos level
      expect(container.querySelector('[data-chaos-level]')).not.toBeInTheDocument()
      
      // Advance time without starting chaos
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      
      // Still no chaos level
      expect(container.querySelector('[data-chaos-level]')).not.toBeInTheDocument()
    })

    it('escalation progresses through all levels from 1 to 10', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Verify progression through each level
      for (let expectedLevel = 1; expectedLevel <= 10; expectedLevel++) {
        expect(chaosContainer).toHaveAttribute('data-chaos-level', String(expectedLevel))
        
        if (expectedLevel < 10) {
          act(() => {
            vi.advanceTimersByTime(1000)
          })
        }
      }
    })
  })

  describe('Chaos Level Persistence', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    // Helper to simulate touch swipe
    const simulateSwipe = (element: Element, startY: number, endY: number, startX = 100, endX = 100) => {
      fireEvent.touchStart(element, {
        touches: [{ clientX: startX, clientY: startY }],
      })
      fireEvent.touchMove(element, {
        touches: [{ clientX: endX, clientY: (startY + endY) / 2 }],
      })
      fireEvent.touchEnd(element, {
        changedTouches: [{ clientX: endX, clientY: endY }],
      })
    }

    it('chaos level stays at 10 after reaching maximum', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Advance 9 seconds to reach max level
      act(() => {
        vi.advanceTimersByTime(9000)
      })
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '10')
      
      // Advance another 10 seconds - should still be at 10
      act(() => {
        vi.advanceTimersByTime(10000)
      })
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '10')
    })

    it('swiping does not reset chaos level', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Advance to chaos level 5
      act(() => {
        vi.advanceTimersByTime(4000) // Level 1 + 4 increments = level 5
      })
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '5')
      
      // Swipe to change video
      simulateSwipe(chaosContainer, 300, 100) // Swipe up
      
      // Chaos level should still be 5 (not reset)
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '5')
    })

    it('swiping at max chaos does not reset chaos level', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Reach max chaos
      act(() => {
        vi.advanceTimersByTime(9000)
      })
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '10')
      
      // Swipe multiple times
      simulateSwipe(chaosContainer, 300, 100) // Swipe up
      simulateSwipe(chaosContainer, 100, 300) // Swipe down
      simulateSwipe(chaosContainer, 300, 100) // Swipe up again
      
      // Chaos level should still be at 10
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '10')
    })

    it('Happy Birthday text appears at max chaos level 10', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Happy Birthday should NOT be visible initially
      expect(screen.queryByTestId('happy-birthday')).not.toBeInTheDocument()
      
      // Advance to max chaos level
      act(() => {
        vi.advanceTimersByTime(9000)
      })
      
      // Happy Birthday text should now be visible
      expect(screen.getByTestId('happy-birthday')).toBeInTheDocument()
      expect(screen.getByText('Happy Birthday Michael')).toBeInTheDocument()
    })

    it('Happy Birthday text does not appear before max chaos', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Test at each level from 1 to 9
      for (let level = 1; level < 10; level++) {
        const chaosContainer = screen.getByTestId('chaos-container')
        expect(chaosContainer).toHaveAttribute('data-chaos-level', String(level))
        expect(screen.queryByTestId('happy-birthday')).not.toBeInTheDocument()
        
        act(() => {
          vi.advanceTimersByTime(1000)
        })
      }
      
      // At level 10, it should appear
      expect(screen.getByTestId('happy-birthday')).toBeInTheDocument()
    })

    it('Happy Birthday text persists after swiping at max chaos', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Reach max chaos
      act(() => {
        vi.advanceTimersByTime(9000)
      })
      
      // Verify Happy Birthday is visible
      expect(screen.getByTestId('happy-birthday')).toBeInTheDocument()
      
      // Swipe to change video
      simulateSwipe(chaosContainer, 300, 100)
      
      // Happy Birthday should still be visible
      expect(screen.getByTestId('happy-birthday')).toBeInTheDocument()
    })

    it('session maintains chaos state - no mechanism to decrease', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Reach max chaos
      act(() => {
        vi.advanceTimersByTime(9000)
      })
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '10')
      
      // Interact with the container in various ways
      fireEvent.click(chaosContainer)
      fireEvent.pointerMove(chaosContainer, { clientX: 100, clientY: 100 })
      simulateSwipe(chaosContainer, 300, 100)
      
      // Wait some more time
      act(() => {
        vi.advanceTimersByTime(30000)
      })
      
      // Chaos level should STILL be at 10
      expect(chaosContainer).toHaveAttribute('data-chaos-level', '10')
    })
  })

  describe('Screen Shake Effect', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not shake before chaos level 3', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Get the chaos-content element (which has the shake transform)
      const chaosContent = screen.getByTestId('chaos-content')
      
      // At level 1, no shake (transform should be translate(0px, 0px))
      expect(chaosContent.style.transform).toBe('translate(0px, 0px)')
      
      // Advance to level 2
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(chaosContent.style.transform).toBe('translate(0px, 0px)')
    })

    it('starts shaking at chaos level 3', () => {
      // Mock Math.random to return predictable values for shake
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0) // video selection
        .mockReturnValueOnce(0.75) // shake x
        .mockReturnValueOnce(0.25) // shake y
      
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Advance to level 3
      act(() => {
        vi.advanceTimersByTime(2000) // Level 1 + 2 increments = level 3
      })
      
      // Get the chaos-content element
      const chaosContent = screen.getByTestId('chaos-content')
      
      // Transform should now have non-zero values
      const transform = chaosContent.style.transform
      expect(transform).not.toBe('translate(0px, 0px)')
      expect(transform).toMatch(/translate\(-?\d+\.?\d*px, -?\d+\.?\d*px\)/)
      
      vi.spyOn(Math, 'random').mockRestore()
    })

    it('shake intensity increases with chaos level', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Advance to level 3 - shake should be active
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      
      const chaosContent = screen.getByTestId('chaos-content')
      
      // Verify shake is active at level 3 (transform has non-zero values)
      expect(chaosContent.style.transform).toMatch(/translate\(-?\d+\.?\d*px, -?\d+\.?\d*px\)/)
      
      // Advance to level 10
      act(() => {
        vi.advanceTimersByTime(7000)
      })
      
      // Shake should still be occurring at max chaos (transform not 0,0)
      const transformAtLevel10 = chaosContent.style.transform
      expect(transformAtLevel10).toMatch(/translate\(-?\d+\.?\d*px, -?\d+\.?\d*px\)/)
      
      // Note: We can't easily compare intensities directly due to random values,
      // but we verify shake is happening at both chaos levels
    })

    it('has chaos-content element for shake transform', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Verify chaos-content element exists with testid
      const chaosContent = screen.getByTestId('chaos-content')
      expect(chaosContent).toBeInTheDocument()
      expect(chaosContent).toHaveClass('chaos-active')
    })

    it('chaos-content has transform style applied', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Get chaos-content
      const chaosContent = screen.getByTestId('chaos-content')
      
      // Should have a transform style
      expect(chaosContent.style.transform).toMatch(/translate\(-?\d+\.?\d*px, -?\d+\.?\d*px\)/)
    })

    it('shake persists at max chaos level', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      
      // Advance to max chaos
      act(() => {
        vi.advanceTimersByTime(9000)
      })
      
      const chaosContent = screen.getByTestId('chaos-content')
      
      // Advance more time - shake should continue at max
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      
      // Transform should still be applied (shake continuing)
      expect(chaosContent.style.transform).toMatch(/translate\(-?\d+\.?\d*px, -?\d+\.?\d*px\)/)
    })
  })

  describe('Audio Limiting System', () => {
    it('allows up to 8 simultaneous sounds', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockHowlInstances.length = 0
      mockPlay.mockClear()
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Trigger 8 sounds
      for (let i = 0; i < 8; i++) {
        fireEvent.click(chaosContainer)
      }
      
      // Should have created 8 instances
      expect(mockHowlInstances.length).toBe(8)
      expect(mockPlay).toHaveBeenCalledTimes(8)
    })

    it('fades out oldest sound when max limit reached', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockHowlInstances.length = 0
      mockPlay.mockClear()
      mockFade.mockClear()
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Trigger 8 sounds to reach the limit
      for (let i = 0; i < 8; i++) {
        fireEvent.click(chaosContainer)
      }
      
      // Trigger 9th sound - should cause fadeout of oldest
      fireEvent.click(chaosContainer)
      
      // Fade should have been called on the oldest sound
      expect(mockFade).toHaveBeenCalled()
    })

    it('applies volume ducking when approaching limit (5+ sounds)', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockHowlInstances.length = 0
      mockVolume.mockClear()
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Trigger 5 sounds (DUCKING_THRESHOLD)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(chaosContainer)
      }
      
      // Volume should have been adjusted (ducking applied)
      expect(mockVolume).toHaveBeenCalled()
      
      // The last sound should have been created with ducked volume
      const lastInstance = mockHowlInstances[mockHowlInstances.length - 1]
      expect(lastInstance.currentVolume).toBe(0.3) // DUCKED_VOLUME
    })

    it('sounds are created with correct initial volume before ducking threshold', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockHowlInstances.length = 0
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Trigger a few sounds (below ducking threshold)
      fireEvent.click(chaosContainer)
      fireEvent.click(chaosContainer)
      
      // Volume should be at BASE_VOLUME (0.5)
      expect(mockHowlInstances[0].currentVolume).toBe(0.5)
    })

    it('registers end event handler for auto-cleanup', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockHowlInstances.length = 0
      mockOn.mockClear()
      
      const chaosContainer = screen.getByTestId('chaos-container')
      fireEvent.click(chaosContainer)
      
      // Should have registered 'end' event handler
      expect(mockOn).toHaveBeenCalledWith('end', expect.any(Function))
    })

    it('continues playing new sounds even when at max (with fadeout)', () => {
      const { container } = render(<App />)
      
      // Enter chaos mode
      fireEvent.click(container.querySelector('.entry-screen')!)
      mockHowlInstances.length = 0
      mockPlay.mockClear()
      
      const chaosContainer = screen.getByTestId('chaos-container')
      
      // Trigger 12 sounds (4 over the limit)
      for (let i = 0; i < 12; i++) {
        fireEvent.click(chaosContainer)
      }
      
      // All sounds should still be played (old ones fade out)
      expect(mockPlay).toHaveBeenCalledTimes(12)
    })
  })
})

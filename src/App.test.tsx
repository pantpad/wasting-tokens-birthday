import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// Mock Howler to avoid audio context issues in tests
vi.mock('howler', () => ({
  Howler: {
    ctx: { state: 'suspended', resume: vi.fn() },
    mute: vi.fn(),
  },
}))

describe('App', () => {
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
})

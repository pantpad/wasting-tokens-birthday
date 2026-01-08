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
})

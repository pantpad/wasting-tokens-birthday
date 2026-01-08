import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
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
})

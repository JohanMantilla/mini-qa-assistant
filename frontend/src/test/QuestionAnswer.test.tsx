/*
import { describe, expect, test, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionAnswer } from '../../../qa/components/QuestionAnswer'

vi.mock('../../../shared/services/api', () => ({
  askQuestion: vi.fn()
}))

describe('QuestionAnswer', () => {
  test('should render qa title', () => {
    const { container } = render(<QuestionAnswer />)
    
    const title = container.querySelector('h2')
    expect(title?.innerHTML).toContain('Preguntas y Respuestas')
  })

  test('should show question textarea', () => {
    render(<QuestionAnswer />)
    
    const textarea = screen.getByPlaceholderText(/Haz una pregunta sobre el contenido/i)
    expect(textarea).toBeInTheDocument()
  })

  test('should show ask button', () => {
    render(<QuestionAnswer />)
    
    const askButton = screen.getByText(/Preguntar/i)
    expect(askButton).toBeInTheDocument()
  })

  test('should show character counter', () => {
    render(<QuestionAnswer />)
    
    const counter = screen.getByText(/0\/500 caracteres/i)
    expect(counter).toBeInTheDocument()
  })

  test('should update character counter when typing', () => {
    render(<QuestionAnswer />)
    
    const textarea = screen.getByPlaceholderText(/Haz una pregunta sobre el contenido/i)
    fireEvent.change(textarea, { target: { value: 'test' } })
    
    const counter = screen.getByText(/4\/500 caracteres/i)
    expect(counter).toBeInTheDocument()
  })

  test('should disable ask button when textarea is empty', () => {
    render(<QuestionAnswer />)
    
    const askButton = screen.getByText(/Preguntar/i)
    expect(askButton).toBeDisabled()
  })

  test('should enable ask button when textarea has content', () => {
    render(<QuestionAnswer />)
    
    const textarea = screen.getByPlaceholderText(/Haz una pregunta sobre el contenido/i)
    const askButton = screen.getByText(/Preguntar/i)
    
    fireEvent.change(textarea, { target: { value: 'What is Python?' } })
    expect(askButton).not.toBeDisabled()
  })
})
*/
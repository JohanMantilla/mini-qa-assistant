/*
import { describe, expect, test, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DocumentSearch } from '../../../search/components/DocumentSearch'

describe('DocumentSearch', () => {
  test('should render search title', () => {
    const { container } = render(<DocumentSearch />)
    
    const title = container.querySelector('h2')
    expect(title?.innerHTML).toContain('Buscar en Documentos')
  })

  test('should show search input', () => {
    render(<DocumentSearch />)
    
    const searchInput = screen.getByPlaceholderText(/Busca palabras clave/i)
    expect(searchInput).toBeInTheDocument()
  })

  test('should show search button', () => {
    render(<DocumentSearch />)
    
    const searchButton = screen.getByRole('button', { name: /🔍/i })
    expect(searchButton).toBeInTheDocument()
  })

  test('should disable search button when input is empty', () => {
    render(<DocumentSearch />)
    
    const searchButton = screen.getByRole('button', { name: /🔍/i })
    expect(searchButton).toBeDisabled()
  })

  test('should enable search button when input has text', () => {
    render(<DocumentSearch />)
    
    const searchInput = screen.getByPlaceholderText(/Busca palabras clave/i)
    const searchButton = screen.getByRole('button', { name: /🔍/i })
    
    fireEvent.change(searchInput, { target: { value: 'python' } })
    expect(searchButton).not.toBeDisabled()
  })

  test('should update input value when typing', () => {
    render(<DocumentSearch />)
    
    const searchInput = screen.getByPlaceholderText(/Busca palabras clave/i) as HTMLInputElement
    
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    expect(searchInput.value).toBe('test query')
  })
})
*/
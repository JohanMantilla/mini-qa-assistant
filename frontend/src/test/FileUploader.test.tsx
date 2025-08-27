/*
import { describe, expect, test, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileUploader } from '../../../uploader/components/FileUploader'

const mockProps = {
  onDocumentsUploaded: vi.fn(),
  onClearDocuments: vi.fn(),
  indexedFiles: []
}

describe('FileUploader', () => {
  test('should render upload section title', () => {
    const { container } = render(<FileUploader {...mockProps} />)
    
    const title = container.querySelector('h2')
    expect(title?.innerHTML).toContain('Subir Documentos')
  })

  test('should call onClearDocuments when clear button clicked', () => {
    const propsWithFiles = {
      ...mockProps,
      indexedFiles: ['test1.pdf']
    }
    
    render(<FileUploader {...propsWithFiles} />)
    
    const clearButton = screen.getByText(/Limpiar y subir nuevos documentos/i)
    fireEvent.click(clearButton)
    
    expect(mockProps.onClearDocuments).toHaveBeenCalled()
  })
})
*/
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkillsGrid } from './skills-grid'

const mockSkills = [
  {
    slug: 'contract-reviewer',
    title: 'Проверка договоров',
    short_description: 'Проверяет договоры на риски',
    full_description: 'Полное описание',
    tags: ['договоры', 'документы'],
    search_aliases: ['контракты', 'соглашения'],
    source: { url: 'https://example.com', label: 'Example' },
    license: { id: 'MIT', url: '' },
    review: { status: 'reviewed', summary: '', reviewed_at: '' },
    guarantees: [],
    updated_at: ''
  },
  {
    slug: 'spreadsheet',
    title: 'Таблицы',
    short_description: 'Работа с Excel',
    full_description: 'Полное описание',
    tags: ['таблицы', 'excel'],
    search_aliases: ['xlsx', 'csv'],
    source: { url: 'https://example.com', label: 'Example' },
    license: { id: 'MIT', url: '' },
    review: { status: 'reviewed', summary: '', reviewed_at: '' },
    guarantees: [],
    updated_at: ''
  }
]

const mockTags = {
  'договоры': 1,
  'документы': 1,
  'таблицы': 1,
  'excel': 1
}

describe('SkillsGrid', () => {
  it('рендерит все скиллы без поиска', () => {
    render(<SkillsGrid skills={mockSkills} tags={mockTags} />)
    expect(screen.getByText('Проверка договоров')).toBeInTheDocument()
    expect(screen.getByText('Таблицы')).toBeInTheDocument()
  })

  it('ищет по title', () => {
    render(<SkillsGrid skills={mockSkills} tags={mockTags} />)
    const searchInput = screen.getByPlaceholderText(/Например/i)
    fireEvent.change(searchInput, { target: { value: 'договор' } })
    expect(screen.getByText('Проверка договоров')).toBeInTheDocument()
    expect(screen.queryByText('Таблицы')).not.toBeInTheDocument()
  })

  it('ищет по search_aliases', () => {
    render(<SkillsGrid skills={mockSkills} tags={mockTags} />)
    const searchInput = screen.getByPlaceholderText(/Например/i)
    fireEvent.change(searchInput, { target: { value: 'контракты' } })
    expect(screen.getByText('Проверка договоров')).toBeInTheDocument()
  })

  it('ищет по тегам', () => {
    render(<SkillsGrid skills={mockSkills} tags={mockTags} />)
    const searchInput = screen.getByPlaceholderText(/Например/i)
    fireEvent.change(searchInput, { target: { value: 'excel' } })
    expect(screen.getByText('Таблицы')).toBeInTheDocument()
    expect(screen.queryByText('Проверка договоров')).not.toBeInTheDocument()
  })

  it('показывает "Ничего не найдено" при пустом результате', () => {
    render(<SkillsGrid skills={mockSkills} tags={mockTags} />)
    const searchInput = screen.getByPlaceholderText(/Например/i)
    fireEvent.change(searchInput, { target: { value: 'несуществующий-запрос' } })
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
  })

  it('фильтрует по тегу при клике', () => {
    render(<SkillsGrid skills={mockSkills} tags={mockTags} />)
    const tagButtons = screen.getAllByText('договоры')
    fireEvent.click(tagButtons[0])
    expect(screen.getByText('Проверка договоров')).toBeInTheDocument()
  })

  it('показывает все скиллы после фильтрации', () => {
    render(<SkillsGrid skills={mockSkills} tags={mockTags} />)
    const searchInput = screen.getByPlaceholderText(/Например/i)
    fireEvent.change(searchInput, { target: { value: 'договор' } })
    expect(screen.queryByText('Таблицы')).not.toBeInTheDocument()
    fireEvent.change(searchInput, { target: { value: '' } })
    expect(screen.getByText('Таблицы')).toBeInTheDocument()
  })
})

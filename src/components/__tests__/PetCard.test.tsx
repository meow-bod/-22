import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { Pet } from '@/types';
import { PetCard } from '../PetCard';

// Mock pet data
const mockPet: Pet = {
  id: '1',
  name: '小白',
  pet_type: '狗',
  breed: '柴犬',
  age: 3,
  notes: '很活潑的小狗',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'user-1'
};

const mockPetWithoutNotes: Pet = {
  ...mockPet,
  id: '2',
  name: '小黑',
  notes: null
};

describe('PetCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pet information correctly', () => {
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('小白')).toBeInTheDocument();
    expect(screen.getByText('狗 • 柴犬')).toBeInTheDocument();
    expect(screen.getByText('3 歲')).toBeInTheDocument();
    expect(screen.getByText('很活潑的小狗')).toBeInTheDocument();
  });

  it('renders pet without notes', () => {
    render(<PetCard pet={mockPetWithoutNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('小黑')).toBeInTheDocument();
    expect(screen.queryByText('很活潑的小狗')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByLabelText(`編輯 ${mockPet.name}`);
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockPet);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByLabelText(`刪除 ${mockPet.name}`);
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockPet.id);
  });

  it('shows loading state when deleting', () => {
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} isDeleting={true} />);

    const deleteButton = screen.getByLabelText(`刪除 ${mockPet.name}`);
    expect(deleteButton).toHaveTextContent('刪除中...');
    expect(deleteButton).toBeDisabled();
  });

  it('disables buttons when deleting', () => {
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} isDeleting={true} />);

    const editButton = screen.getByLabelText(`編輯 ${mockPet.name}`);
    const deleteButton = screen.getByLabelText(`刪除 ${mockPet.name}`);

    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('applies custom className', () => {
    const customClass = 'custom-pet-card';
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} className={customClass} />);

    const card = screen.getByRole('article');
    expect(card).toHaveClass(customClass);
  });

  it('has correct accessibility attributes', () => {
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const card = screen.getByLabelText(`寵物卡片: ${mockPet.name}`);
    expect(card).toBeInTheDocument();

    const editButton = screen.getByLabelText(`編輯 ${mockPet.name}`);
    const deleteButton = screen.getByLabelText(`刪除 ${mockPet.name}`);

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByRole('button', { name: /編輯/i });
    const deleteButton = screen.getByRole('button', { name: /刪除/i });

    // Tab to edit button
    await user.tab();
    expect(editButton).toHaveFocus();

    // Tab to delete button
    await user.tab();
    expect(deleteButton).toHaveFocus();

    // Press Enter on delete button
    await user.keyboard('{Enter}');
    expect(mockOnDelete).toHaveBeenCalledWith(mockPet.id);
  });

  it('displays pet type icon correctly', () => {
    const dogPet = { ...mockPet, pet_type: '狗' };
    const catPet = { ...mockPet, pet_type: '貓' };
    const birdPet = { ...mockPet, pet_type: '鳥' };
    const otherPet = { ...mockPet, pet_type: '其他' };

    // Test dog icon
    const { rerender } = render(<PetCard pet={dogPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('🐕')).toBeInTheDocument();

    // Test cat icon
    rerender(<PetCard pet={catPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('🐱')).toBeInTheDocument();

    // Test bird icon
    rerender(<PetCard pet={birdPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('🐦')).toBeInTheDocument();

    // Test other icon
    rerender(<PetCard pet={otherPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('🐾')).toBeInTheDocument();
  });

  it('handles long pet names gracefully', () => {
    const longNamePet = {
      ...mockPet,
      name: '這是一個非常非常非常長的寵物名字用來測試文字溢出處理'
    };

    render(<PetCard pet={longNamePet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText(longNamePet.name)).toBeInTheDocument();
  });

  it('handles missing breed information', () => {
    const noBreedPet = {
      ...mockPet,
      breed: ''
    };

    render(<PetCard pet={noBreedPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('狗 •')).toBeInTheDocument();
  });

  it('formats age correctly', () => {
    const youngPet = { ...mockPet, age: 0 };
    const oldPet = { ...mockPet, age: 15 };

    const { rerender } = render(<PetCard pet={youngPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('0 歲')).toBeInTheDocument();

    rerender(<PetCard pet={oldPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText('15 歲')).toBeInTheDocument();
  });

  it('prevents double-click on delete button', async () => {
    const user = userEvent.setup();
    render(<PetCard pet={mockPet} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /刪除/i });

    // Double click quickly
    await user.dblClick(deleteButton);

    // Should only be called once
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SearchInput from '../SearchInput';

describe('SearchInput', () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', '搜尋...');
  });

  it('renders with custom placeholder', () => {
    const customPlaceholder = '搜尋寵物...';
    render(<SearchInput onSearch={mockOnSearch} placeholder={customPlaceholder} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });

  it('displays initial value', () => {
    const initialValue = '小狗';
    render(<SearchInput onSearch={mockOnSearch} value={initialValue} />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    expect(input.value).toBe(initialValue);
  });

  it('calls onSearch when typing', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, '貓咪');

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('貓咪');
    });
  });

  it('calls onSearch with debounced input', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} debounceMs={300} />);

    const input = screen.getByRole('searchbox');

    // Type quickly
    await user.type(input, 'abc');

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith('abc');
      },
      { timeout: 500 }
    );
  });

  it('shows clear button when there is text', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');

    // Initially no clear button
    expect(screen.queryByRole('button', { name: /清除/i })).not.toBeInTheDocument();

    // Type some text
    await user.type(input, '搜尋內容');

    // Clear button should appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /清除/i })).toBeInTheDocument();
    });
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} onClear={mockOnClear} />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;

    // Type some text
    await user.type(input, '測試文字');

    // Click clear button
    const clearButton = screen.getByRole('button', { name: /清除/i });
    await user.click(clearButton);

    // Input should be cleared
    expect(input.value).toBe('');
    expect(mockOnClear).toHaveBeenCalled();
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('handles Enter key press', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, '搜尋內容');
    await user.keyboard('{Enter}');

    expect(mockOnSearch).toHaveBeenCalledWith('搜尋內容');
  });

  it('applies custom className', () => {
    const customClass = 'custom-search';
    render(<SearchInput onSearch={mockOnSearch} className={customClass} />);

    const container = screen.getByRole('searchbox').closest('div');
    expect(container).toHaveClass(customClass);
  });

  it('can be disabled', () => {
    render(<SearchInput onSearch={mockOnSearch} disabled />);

    const input = screen.getByRole('searchbox');
    expect(input).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<SearchInput onSearch={mockOnSearch} loading />);

    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('type', 'search');
    expect(input).toHaveAttribute('aria-label', '搜尋輸入框');
  });

  it('handles controlled component behavior', async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      return <SearchInput onSearch={newValue => setValue(newValue)} value={value} />;
    };

    render(<TestComponent />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;

    await user.type(input, '控制元件測試');

    expect(input.value).toBe('控制元件測試');
  });

  it('prevents search when disabled', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} disabled />);

    const input = screen.getByRole('searchbox');

    // Try to type (should not work)
    await user.type(input, '測試');

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('handles special characters in search', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');
    const specialText = '特殊字符!@#$%^&*()';

    await user.type(input, specialText);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(specialText);
    });
  });

  it('maintains focus after clear', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('searchbox');

    await user.type(input, '測試');

    const clearButton = screen.getByRole('button', { name: /清除/i });
    await user.click(clearButton);

    expect(input).toHaveFocus();
  });
});

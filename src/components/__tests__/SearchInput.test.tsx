import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', '搜尋寵物...');
  });

  it('renders with custom placeholder', () => {
    const customPlaceholder = '搜尋保姆...';
    render(<SearchInput onSearch={mockOnSearch} placeholder={customPlaceholder} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });

  it('displays initial value', () => {
    const initialValue = '小狗';
    render(<SearchInput onSearch={mockOnSearch} value={initialValue} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe(initialValue);
  });

  it('calls onSearch when typing', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '貓咪');

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('貓咪');
    }, { timeout: 500 });
  });

  it('calls onSearch with debounced input', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} debounceMs={300} />);

    const input = screen.getByRole('textbox');

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

    const input = screen.getByRole('textbox');

    // Initially no clear button
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Type some text
    await user.type(input, '搜尋內容');

    // Clear button should appear
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('clears the input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '測試');

    const clearButton = screen.getByRole('button', { name: /清除/i });
    await user.click(clearButton);

    expect(mockOnSearch).toHaveBeenCalledWith('');
    expect(input).toHaveValue('');
  });

  it('handles Enter key press', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '搜尋內容');
    await user.keyboard('{Enter}');

    expect(mockOnSearch).toHaveBeenCalledWith('搜尋內容');
  });

  it('applies custom className', () => {
    const customClass = 'custom-search';
    render(<SearchInput onSearch={mockOnSearch} className={customClass} />);

    const container = screen.getByTestId('search-input-container');
    expect(container).toHaveClass(customClass);
  });

  it('can be disabled', () => {
    render(<SearchInput onSearch={mockOnSearch} disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<SearchInput onSearch={mockOnSearch} loading />);

    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Search');
  });

  it('handles controlled component behavior', async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      return <SearchInput onSearch={newValue => setValue(newValue)} value={value} />;
    };

    render(<TestComponent />);

    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, '控制元件測試');

    expect(input.value).toBe('控制元件測試');
  });

  it('prevents search when disabled', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} disabled />);

    const input = screen.getByRole('textbox');

    // Try to type (should not work)
    await user.type(input, '測試');

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('handles special characters in search', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    const specialText = '特殊字符!@#$%^&*()';

    await user.type(input, specialText);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(specialText);
    }, { timeout: 500 });
  });

  it('focuses the input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '測試');

    const clearButton = screen.getByRole('button', { name: /清除/i });
    await user.click(clearButton);

    expect(input).toHaveFocus();
  });
});

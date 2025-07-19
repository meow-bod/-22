import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', '載入中...');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size='lg' />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();

    // Check if large size classes are applied
    const spinnerElement = spinner.querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('w-12', 'h-12');
  });

  it('renders with custom text', () => {
    const customText = '處理中...';
    render(<LoadingSpinner text={customText} />);

    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('renders without text when showText is false', () => {
    const customText = '載入中...';
    render(<LoadingSpinner text={customText} showText={false} />);

    expect(screen.queryByText(customText)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-spinner';
    render(<LoadingSpinner className={customClass} />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(customClass);
  });

  it('renders with different colors', () => {
    const { rerender } = render(<LoadingSpinner color='blue' />);

    let spinnerElement = screen.getByRole('status').querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('text-blue-600');

    rerender(<LoadingSpinner color='gray' />);
    spinnerElement = screen.getByRole('status').querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('text-gray-600');

    rerender(<LoadingSpinner color='white' />);
    spinnerElement = screen.getByRole('status').querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('text-white');
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', '載入中...');
    expect(spinner).toHaveAttribute('role', 'status');
  });

  it('renders with all size variants', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach(size => {
      const { unmount } = render(<LoadingSpinner size={size} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();

      const spinnerElement = spinner.querySelector('.animate-spin');

      switch (size) {
        case 'sm':
          expect(spinnerElement).toHaveClass('w-4', 'h-4');
          break;
        case 'md':
          expect(spinnerElement).toHaveClass('w-8', 'h-8');
          break;
        case 'lg':
          expect(spinnerElement).toHaveClass('w-12', 'h-12');
          break;
      }

      unmount();
    });
  });

  it('maintains animation classes', () => {
    render(<LoadingSpinner />);

    const spinnerElement = screen.getByRole('status').querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('animate-spin');
  });

  it('renders correctly with combined props', () => {
    const props = {
      size: 'lg' as const,
      color: 'blue' as const,
      text: '資料載入中...',
      className: 'my-custom-class'
    };

    render(<LoadingSpinner {...props} />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('my-custom-class');
    expect(screen.getByText('資料載入中...')).toBeInTheDocument();

    const spinnerElement = spinner.querySelector('.animate-spin');
    expect(spinnerElement).toHaveClass('w-12', 'h-12', 'text-blue-600');
  });
});

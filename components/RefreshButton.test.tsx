import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RefreshButton from './RefreshButton';

describe('RefreshButton', () => {
  it('should render with an accessible label', () => {
    render(<RefreshButton onClick={jest.fn()} />);

    const button = screen.getByRole('button', { name: /refresh rates/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Refresh rates');
    expect(button).toHaveAttribute('title', 'Refresh rates');
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<RefreshButton onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: /refresh rates/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is enabled and not spinning by default', () => {
    const { container } = render(<RefreshButton onClick={jest.fn()} />);

    const button = screen.getByRole('button', { name: /refresh rates/i });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(container.querySelector('svg')).not.toHaveClass('animate-spin');
  });

  it('disables and spins while refreshing', () => {
    const { container } = render(
      <RefreshButton onClick={jest.fn()} refreshing />
    );

    const button = screen.getByRole('button', { name: /refresh rates/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('does not fire onClick while refreshing (disabled)', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<RefreshButton onClick={handleClick} refreshing />);

    await user.click(screen.getByRole('button', { name: /refresh rates/i }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});

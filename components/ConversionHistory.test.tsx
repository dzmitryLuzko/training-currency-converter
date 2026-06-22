import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversionHistory from './ConversionHistory';
import { ConversionResult } from '@/types';

const conv1: ConversionResult = {
  from: 'USD',
  to: 'EUR',
  amount: 100,
  result: 85,
  rate: 0.85,
  timestamp: new Date('2024-01-15T09:05:00').getTime(),
};

const conv2: ConversionResult = {
  from: 'GBP',
  to: 'JPY',
  amount: 50,
  result: 9000,
  rate: 180,
  timestamp: new Date('2024-01-15T14:30:00').getTime(),
};

// Compute the expected time string the same way the component does, so the
// assertion stays locale-independent.
const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const defaultProps = {
  history: [conv1, conv2],
  showHistory: true,
  onToggle: jest.fn(),
  onClear: jest.fn(),
  onLoadConversion: jest.fn(),
};

describe('ConversionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always renders the "Recent" heading', () => {
    render(<ConversionHistory {...defaultProps} history={[]} showHistory={false} />);

    expect(screen.getByRole('heading', { name: 'Recent' })).toBeInTheDocument();
  });

  // 1. Conditional rendering ------------------------------------------------

  it('hides the Clear button when history is empty', () => {
    render(<ConversionHistory {...defaultProps} history={[]} />);

    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('shows the Clear button when history has items', () => {
    render(<ConversionHistory {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('shows the empty state when expanded with no items', () => {
    render(<ConversionHistory {...defaultProps} history={[]} showHistory />);

    expect(
      screen.getByText('No conversions yet — your last 10 will appear here.')
    ).toBeInTheDocument();
  });

  it('renders a row per conversion when expanded with items', () => {
    render(<ConversionHistory {...defaultProps} showHistory />);

    expect(screen.getByRole('button', { name: /100\.00 USD/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /50\.00 GBP/ })).toBeInTheDocument();
    expect(
      screen.queryByText('No conversions yet — your last 10 will appear here.')
    ).not.toBeInTheDocument();
  });

  it('does not render the list (rows or empty state) when collapsed', () => {
    render(<ConversionHistory {...defaultProps} showHistory={false} />);

    expect(screen.queryByRole('button', { name: /100\.00 USD/ })).not.toBeInTheDocument();
    expect(
      screen.queryByText('No conversions yet — your last 10 will appear here.')
    ).not.toBeInTheDocument();
  });

  // 2. Dynamic content ------------------------------------------------------

  it('shows "Show (count)" when collapsed', () => {
    render(<ConversionHistory {...defaultProps} showHistory={false} />);

    expect(screen.getByRole('button', { name: 'Show (2)' })).toBeInTheDocument();
  });

  it('shows "Hide (count)" when expanded', () => {
    render(<ConversionHistory {...defaultProps} showHistory />);

    expect(screen.getByRole('button', { name: 'Hide (2)' })).toBeInTheDocument();
  });

  it('reflects the history count in the toggle, including zero', () => {
    render(<ConversionHistory {...defaultProps} history={[]} showHistory={false} />);

    expect(screen.getByRole('button', { name: 'Show (0)' })).toBeInTheDocument();
  });

  // 3. Interactions & callbacks --------------------------------------------

  it('calls onToggle when the toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConversionHistory {...defaultProps} showHistory={false} />);

    await user.click(screen.getByRole('button', { name: 'Show (2)' }));

    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when the Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConversionHistory {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  it('calls onLoadConversion with the clicked conversion', async () => {
    const user = userEvent.setup();
    render(<ConversionHistory {...defaultProps} showHistory />);

    await user.click(screen.getByRole('button', { name: /100\.00 USD/ }));

    expect(defaultProps.onLoadConversion).toHaveBeenCalledTimes(1);
    expect(defaultProps.onLoadConversion).toHaveBeenCalledWith(conv1);
  });

  // 4. Conversion data rendering -------------------------------------------

  it('renders amount, currency codes, rate and timestamp for a conversion', () => {
    render(<ConversionHistory {...defaultProps} history={[conv1]} showHistory />);

    const row = screen.getByRole('button', { name: /100\.00 USD/ });
    expect(row).toHaveTextContent('100.00 USD');
    expect(row).toHaveTextContent('85.00 EUR');
    expect(row).toHaveTextContent('1 USD = 0.8500 EUR');
    expect(row).toHaveTextContent(formatTime(conv1.timestamp));
  });

  // 5. Edge cases -----------------------------------------------------------

  it('renders multiple items, each with its own formatted time', () => {
    render(<ConversionHistory {...defaultProps} showHistory />);

    const rows = screen.getAllByRole('button', { name: /→|=/ }).filter((b) =>
      /USD|GBP/.test(b.textContent ?? '')
    );
    expect(rows).toHaveLength(2);

    const row1 = screen.getByRole('button', { name: /100\.00 USD/ });
    const row2 = screen.getByRole('button', { name: /50\.00 GBP/ });
    expect(row1).toHaveTextContent(formatTime(conv1.timestamp));
    expect(row2).toHaveTextContent(formatTime(conv2.timestamp));
    expect(formatTime(conv1.timestamp)).not.toBe(formatTime(conv2.timestamp));
  });
});

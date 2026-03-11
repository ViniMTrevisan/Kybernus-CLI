import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductFilters } from '../components/ProductFilters';

const categories = [
  { id: 'cat-1', name: 'Camisetas', slug: 'camisetas' },
  { id: 'cat-2', name: 'Calças', slug: 'calcas' },
];

describe('ProductFilters', () => {
  it('deve chamar onFilterChange ao selecionar categoria', async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();
    render(<ProductFilters categories={categories} onFilterChange={onFilterChange} />);

    await user.selectOptions(screen.getByRole('combobox', { name: /categoria/i }), 'camisetas');

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ categorySlug: 'camisetas' }),
    );
  });

  it('deve debounce a busca por texto (não dispara imediatamente)', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onFilterChange = jest.fn();
    render(<ProductFilters categories={categories} onFilterChange={onFilterChange} />);

    await user.type(screen.getByRole('textbox', { name: /buscar/i }), 'cam');

    // Should NOT have been called yet (debounce pending)
    expect(onFilterChange).not.toHaveBeenCalled();

    act(() => { jest.advanceTimersByTime(400); });

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'cam' }),
    );

    jest.useRealTimers();
  });

  it('deve limpar filtros ao clicar em "Limpar"', async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();
    render(<ProductFilters categories={categories} onFilterChange={onFilterChange} />);

    // Select a category first
    await user.selectOptions(screen.getByRole('combobox', { name: /categoria/i }), 'camisetas');
    onFilterChange.mockClear();

    await user.click(screen.getByRole('button', { name: /limpar/i }));

    expect(onFilterChange).toHaveBeenCalledWith({});
  });
});

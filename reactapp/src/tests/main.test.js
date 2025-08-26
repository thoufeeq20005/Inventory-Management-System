import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddProductForm from '../components/AddProductForm';
import ProductList from '../components/ProductList';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console warnings
const originalWarn = console.warn;
const originalError = console.error;
beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

describe('Product Management Components Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // AddProductForm Tests
  test('Form_AddProductForm renders all form fields correctly', () => {
    render(<AddProductForm onProductAdded={() => {}} />);
    
    expect(screen.getByRole('heading', { name: 'Add Product' })).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
    expect(screen.getByTestId('quantity-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  test('Form_AddProductForm accepts user input in all fields', () => {
    render(<AddProductForm onProductAdded={() => {}} />);
    
    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const quantityInput = screen.getByTestId('quantity-input');

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });

    expect(nameInput.value).toBe('Test Product');
    expect(descriptionInput.value).toBe('Test Description');
    expect(quantityInput.value).toBe('10');
  });



  test('Form_AddProductForm shows loading state during submission', async () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AddProductForm onProductAdded={() => {}} />);

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByTestId('quantity-input'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('add-button'));

    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeDisabled();
  });

  test('ErrorHandling_AddProductForm displays error message on API failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Product creation failed' })
    });

    render(<AddProductForm onProductAdded={() => {}} />);

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByTestId('quantity-input'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('add-button'));

    await waitFor(() => {
      expect(screen.getByText('Product creation failed')).toBeInTheDocument();
    });
  });

  test('State_AddProductForm clears form after successful submission', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Test Product', quantity: 10 })
    });

    render(<AddProductForm onProductAdded={() => {}} />);

    const nameInput = screen.getByTestId('name-input');
    const descriptionInput = screen.getByTestId('description-input');
    const quantityInput = screen.getByTestId('quantity-input');

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.click(screen.getByTestId('add-button'));

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
      expect(quantityInput.value).toBe('');
    });
  });

  // ProductList Tests
  test('State_ProductList shows loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ProductList />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  test('State_ProductList displays products when loaded successfully', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', description: 'Description 1', quantity: 5 },
      { id: 2, name: 'Product 2', description: 'Description 2', quantity: 10 }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts
    });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  test('State_ProductList shows empty state when no products available', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('No products available.')).toBeInTheDocument();
    });
  });

  test('Axios_ProductList shows error message when API fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to load products'));

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

 
});
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders pomodoro youtube timer', () => {
  render(<App />);
  const timerElement = screen.getByText(/time to work/i);
  expect(timerElement).toBeInTheDocument();
});

test('renders youtube player input', () => {
  render(<App />);
  const inputElement = screen.getByLabelText(/youtube url o id video/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders youtube load button', () => {
  render(<App />);
  const loadButton = screen.getByText(/carica/i);
  expect(loadButton).toBeInTheDocument();
});

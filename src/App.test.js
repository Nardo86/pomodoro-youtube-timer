import { render, screen } from '@testing-library/react';
import App from './App';

test('renders pomodoro timer', () => {
  render(<App />);
  const timerElement = screen.getByText(/work time/i);
  expect(timerElement).toBeInTheDocument();
});

test('renders youtube player input', () => {
  render(<App />);
  const inputElement = screen.getByLabelText(/youtube video url/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders youtube search button', () => {
  render(<App />);
  const searchButton = screen.getByLabelText(/search/i);
  expect(searchButton).toBeInTheDocument();
});

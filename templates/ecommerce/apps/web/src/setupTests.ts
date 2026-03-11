import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// React Router v7 requires TextEncoder/TextDecoder which jsdom doesn't provide
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

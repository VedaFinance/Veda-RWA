// Shim for react-dom/test-utils removed in React 19
// @testing-library/react@16 still imports it; re-export act from react
export { act } from 'react'

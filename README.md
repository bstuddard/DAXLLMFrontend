# DAX LLM Frontend

A Vue.js-based frontend application for DAX LLM interactions.

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
This will start the development server at `http://127.0.0.1:5173`

### Building for Production
```bash
npm run build
```

### Running Production Build Preview
```bash
npm run preview
```

## Project Structure

- `src/`: Main source code directory
  - `assets/`: Static assets including sample PBIT file (contoso.pbit)
  - `components/`: Vue components with core application logic
  - `composables/`: Utility functions for API calls (streaming and standard), local caching, and PBIT parsing
  - `views/`: Full page components used in routing
  - `router/`: Vue Router configuration
  - `types/`: TypeScript type definitions
  - `devlogger/`: Development logging utilities

## Key Features

- Built with Vue 3 + TypeScript
- Tailwind CSS for styling
- Markdown rendering with syntax highlighting
- File upload handling for PBIT files
- Streaming API integration
- Local caching support

## Security Notes

- Basic Content Security Policy (CSP) implemented in index.html
- No authentication implemented (sample app only)
  - **Note**: Implement proper authentication for production use

## Development Tools

- Vue 3 with Composition API
- TypeScript for type safety
- Vite for fast development experience
- ESLint for code quality
- Tailwind CSS for styling

## Testing

A sample PBIT file (contoso.pbit) is provided in `src/assets/` for testing file upload functionality.

## Important Notes

- This is a sample application and should be enhanced with proper authentication and security measures for production use
- The CSP in index.html can be further restricted based on specific requirements 
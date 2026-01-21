# Zustand Color App

This project is a simple React application that utilizes Zustand for state management to fetch and configure colors from an API.

## Project Structure

```
zustand-color-app
├── src
│   ├── store
│   │   └── colorStore.ts        # Zustand store for managing color state
│   ├── api
│   │   └── fetchColors.ts       # API call to fetch color data
│   ├── components
│   │   └── ColorConfigurator.tsx # Component for displaying and configuring colors
│   ├── App.tsx                  # Main entry point of the application
│   └── types
│       └── color.ts             # TypeScript interface for color objects
├── package.json                  # npm configuration file
├── tsconfig.json                 # TypeScript configuration file
└── README.md                     # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd zustand-color-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

## Usage

- The application fetches color data from an API and displays it using the `ColorConfigurator` component.
- Users can select and apply different colors, which are managed by the Zustand store.

## Technologies Used

- React
- Zustand
- TypeScript

## License

This project is licensed under the MIT License.
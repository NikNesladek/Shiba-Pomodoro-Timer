# My React App

This is a simple React application that serves as a starting point for building web applications. 

## Live Deployment

This project is configured for GitHub Pages deployment at:

https://niknesladek.github.io/Shiba-Pomodoro-Timer

## Getting Started

To get a copy of this project up and running on your local machine, follow these steps:

### Prerequisites

Make sure you have the following installed:

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/NikNesladek/Shiba-Pomodoro-Timer.git
   ```

2. Navigate to the project directory:
   ```
   cd Shiba-Pomodoro-Timer
   ```

3. Install the dependencies:
   ```
   npm install
   ```

### Running the Application

To start the development server, run:
```
npm start
```

This will open the application in your default web browser at `http://localhost:3000`.

### Building for Production

To create a production build of the application, run:
```
npm run build
```

This will generate a `build` folder containing the optimized application.

### Deploying to GitHub Pages

This project uses the `gh-pages` package for deployment.

To publish the latest version:

```
npm run deploy
```

This command will:

1. Build the app
2. Publish the `build` directory to the `gh-pages` branch

After the first deploy, make sure GitHub Pages is configured in the repository settings to serve from the `gh-pages` branch.

### Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
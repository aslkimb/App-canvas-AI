# App Canvas AI

App Canvas AI is an intelligent application planning tool that helps you design, architect, and document software applications using AI-powered assistance. It guides you through a structured process to refine your app idea, define modules, features, user actions, pages, database schema, and more.

## Features

- **AI-Powered Planning**: Leverage Google's Gemini AI to generate comprehensive application designs
- **Step-by-Step Guidance**: Structured 8-step process from idea to implementation
- **Visual Mind Mapping**: Interactive mind map visualization of your application structure
- **Detailed Documentation**: Automatically generates technical specifications for each component
- **Export Functionality**: Export your app plan in multiple formats (JSON, Markdown, PNG)
- **Design System Generation**: Automatically creates design guidelines for consistent UI/UX
- **Long Text Input Support**: Handle detailed app ideas of any length

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173` to access the application

## How It Works

App Canvas AI guides you through 8 structured steps:

1. **Refine Idea & Define Modules** - Clarify your app concept and break it into logical modules
2. **Define Features** - Identify key features within each module
3. **Detail User Actions** - Break down features into specific user actions
4. **Design Pages & User Flow** - Create page layouts and navigation flows
5. **Define Database Schema** - Design data models and relationships
6. **Plan Feature Implementation** - Detail technical implementation approaches
7. **Define Backend Logic** - Outline API endpoints and scheduled tasks
8. **Establish Design System** - Create consistent design guidelines

## Export Options

You can export your completed app plan in multiple formats:
- **JSON** - Structured data for programmatic use
- **Markdown** - Human-readable documentation
- **PNG** - Visual diagram of your app structure

## Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API
- **Styling**: Tailwind CSS
- **Visualization**: Custom React components

## Handling Long Text Inputs

App Canvas AI now supports detailed app idea descriptions of any length. Simply describe your app idea in as much detail as you'd like in the text area when starting the brainstorming process. The AI will process your detailed input and generate a comprehensive application plan.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve App Canvas AI.

## License

This project is licensed under the MIT License.
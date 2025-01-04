# Recipe Project

This project allows you to manage recipes, including adding, editing, deleting, and filtering by tags. Follow the steps below to set up and run the application.

## Prerequisites

- Ensure that **Node.js** is installed on your machine. You can download it from [Node.js official website](https://nodejs.org/).

## Installation and Setup

1. **Download the Repository**  
   Download the zip folder from the project's GitHub repository.

2. **Extract the Files**  
   Extract all files into a folder of your choice.

3. **Open the Terminal**  
   Navigate to the extracted folder and open the terminal (or command prompt) in that directory.

4. **Install Dependencies**  
   Run the following command to install the necessary packages:  
   ```bash
   npm install

5. **Start the Development Server**  
   Run the following command to start the application:  
   ```bash
   npm run dev
   
6. **Start the JSON Server**  
   Open a new terminal on the same directory leaving previous command in execution. Ensure you are in the same directory as the database.json file, then run the following command:  
   ```bash
   npx json-server database.json
   
7. **Access the Application**  
   Open your browser and visit the application at:  
   http://localhost:5173/

## Notes
  - Make sure Node.js is installed before starting the setup process.
  - Ensure the database.json file is in the correct directory before starting the JSON Server.

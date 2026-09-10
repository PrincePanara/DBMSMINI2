# 📊 Data Explorer & SQL Querying in Browser

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A powerful, entirely client-side web application built to analyze, filter, and query CSV datasets directly in your browser. Say goodbye to uploading your sensitive data to remote servers! This tool leverages the power of **AlaSQL** and **PapaParse** to bring a complete data exploration experience to your local machine.

## ✨ Key Features

- **📂 Local CSV Uploads**: Instantly upload and parse CSV files directly in the browser (zero server interactions).
- **🔍 Visual Data Explorer**: View your data in a beautiful, responsive data table.
- **🎯 Dynamic Filtering**: Apply multiple visual filters to your dataset without writing any code.
- **💻 SQL Workspace**: Write and execute raw SQL queries against your dataset. Includes a dropdown of automatically generated, ready-made queries based on your data!
- **⚡ In-Memory Engine**: Powered by AlaSQL, enabling fast SQL `SELECT` operations entirely in-memory.
- **🎨 Beautiful UI**: Built with Tailwind CSS and Lucide React icons for a modern, sleek, and responsive design.

## 🛠️ Technology Stack

- **Framework**: [React 18](https://reactjs.org/) & [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Parsing**: [PapaParse](https://www.papaparse.com/)
- **SQL Engine**: [AlaSQL](https://github.com/agershun/alasql)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 🚀 Getting Started

Follow these steps to get the project running locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/PrincePanara/DBMSMINI2.git
   cd DBMSMINI2
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to the local URL provided in your terminal (usually `http://localhost:5173/`).

## 💡 Usage Guide

1. **Upload**: Start by uploading a valid `.csv` file.
2. **Explore**: Navigate to the Data Explorer tab to view your data. Use the filter builder to narrow down results.
3. **Query**: Jump over to the SQL Query tab. You can either type your own `SELECT` statements or use the **"Load a ready-made query..."** dropdown to instantly populate the editor.
4. **Export**: Export your filtered or queried results back to a CSV file.

## 🔒 Privacy & Security

This application is **100% client-side**. Your CSV files and data are never uploaded, stored, or sent to any external servers. All parsing and querying happen directly within your browser's memory.

---
*Built with ❤️ for seamless data exploration.*

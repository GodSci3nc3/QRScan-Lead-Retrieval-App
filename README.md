# QRScanLDA - Lead Data Acquisition System

<div align="center">
  <p align="center">
    <strong>A comprehensive mobile application for event lead management through QR code scanning and manual prospect registration.</strong>
  </p>
  
  <p align="center">
    <strong>Built for exhibitors, event organizers, and sales teams to streamline lead capture and management.</strong>
  </p>
</div>

---

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Key Workflows](#key-workflows)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development](#development)

## Features

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>QR Code Scanning</h3>
          <p>High-performance QR code scanner with real-time detection and automatic prospect data extraction</p>
        </div>
      </td>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Prospect Management</h3>
          <p>Complete lead management system with detailed prospect profiles and categorization</p>
        </div>
      </td>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Manual Entry</h3>
          <p>Flexible manual prospect registration for non-QR situations with comprehensive form fields</p>
        </div>
      </td>
    </tr>
    <tr>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Data Export</h3>
          <p>Multiple export formats including Excel spreadsheets for seamless CRM integration</p>
        </div>
      </td>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Advanced Filtering</h3>
          <p>Sophisticated search and filter system by registration type, date, and custom criteria</p>
        </div>
      </td>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; border-radius: 10px; color: #333; margin: 10px;">
          <h3>Offline Capability</h3>
          <p>Full offline functionality with local data storage and synchronization capabilities</p>
        </div>
      </td>
    </tr>
  </table>
</div>

## Technology Stack

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/Expo_Camera-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Camera">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Async_Storage-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="AsyncStorage">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/File_System-FFA500?style=for-the-badge&logo=files&logoColor=white" alt="File System">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Excel_Export-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white" alt="Excel Export">
      </td>
    </tr>
  </table>
</div>

## Key Workflows

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #007bff;">

### Event Setup & Authentication
1. **User Login** → Secure authentication with user credentials and role management
2. **Event Configuration** → Set up event details, exhibitor information, and scanning preferences
3. **Database Initialization** → Prepare local storage for prospect data and sync settings

### Lead Capture Process  
1. **QR Code Scanning** → Point camera at prospect badges for instant data extraction
2. **Manual Entry** → Alternative registration form for prospects without QR codes
3. **Data Validation** → Automatic verification and duplicate detection
4. **Local Storage** → Immediate save to device with backup capabilities

### Data Management & Export
1. **Prospect Review** → Browse, search, and filter captured leads
2. **Detail Editing** → Modify prospect information and add custom notes
3. **Export Generation** → Create Excel files with complete prospect data
4. **Data Sharing** → Send reports via email or cloud storage integration

</div>

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI globally installed
- iOS Simulator or Android Emulator
- Physical device for camera testing

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/GodSci3nc3/QRScanLDA.git
   cd QRScanLDA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npx expo start --offline
   ```

4. **Run on specific platforms**
   ```bash
   # iOS Simulator
   npx expo start --ios --offline
   
   # Android Emulator
   npx expo start --android --offline
   
   # Web Browser
   npx expo start --web --offline
   ```

## Usage

### Getting Started
1. Launch the application on your mobile device
2. Complete user authentication process
3. Configure event settings and exhibitor details
4. Begin scanning prospect QR codes or manual entry
5. Review captured leads and export data as needed

### Core Features
- **QR Scanner**: Point camera at badges for instant prospect capture
- **Manual Registration**: Complete form-based prospect entry
- **Prospect List**: View, search, and manage all captured leads
- **Export Functions**: Generate Excel reports for CRM integration
- **Offline Mode**: Full functionality without internet connection

## Project Structure

```
QRScanLDA/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── LoginScreen.tsx    # User authentication
│   ├── QRScannerScreen.tsx # QR code scanning functionality
│   ├── ProspectsListScreen.tsx # Lead management interface
│   └── ProspectDetailScreen.tsx # Individual prospect details
├── services/              # Data management services
│   └── prospectDatabase.ts # SQLite database operations
├── types/                 # TypeScript type definitions
│   └── prospect.ts        # Prospect data models
├── utils/                 # Utility functions
├── test-qr-data/         # Test QR codes for development
└── assets/               # Images and static resources
```

## Development

### Code Standards
- TypeScript for type safety and better development experience
- ESLint configuration for code quality and consistency
- Expo development workflow for cross-platform compatibility
- Modular component architecture for maintainability

### Testing
- Physical device testing for camera functionality
- QR code validation with test data sets
- Cross-platform compatibility testing
- Performance optimization for scanning speed

### Database Management
- SQLite for local data storage
- AsyncStorage for user preferences
- Data migration strategies for app updates
- Backup and restore functionality

---

<div align="center">
  <strong>Developed by Arturo Rosales V</strong><br>
  <a href="https://github.com/GodSci3nc3">GitHub</a> | 
  <a href="mailto:rosalesvelazquezarturo@email.com">Email</a>
  
  <p>For questions, issues, or collaboration opportunities, please reach out through GitHub or email.</p>
</div>

# Rayshree Ayurveda - Health Management System

![Version](https://img.shields.io/badge/version-1.3.6-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)
![Material-UI](https://img.shields.io/badge/Material--UI-6.2.1-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

A comprehensive healthcare management system built for Rayshree Ayurveda clinic, providing complete patient management, prescription handling, medicine inventory, and administrative features.

## 🏥 Overview

The Rayshree Ayurveda Health Management System is a modern web-based application designed to streamline healthcare operations for Ayurvedic clinics. It provides a complete solution for patient registration, medical consultations, prescription management, medicine inventory control, and administrative oversight.

## ✨ Key Features

### 👥 Patient Management
- **Patient Registration & Profiles**: Complete patient information management with unique ID generation
- **Patient Search & Filtering**: Advanced search capabilities across multiple patient attributes
- **Patient Status Tracking**: Manage patient states (enquiry, active, inactive, patient, rejected)
- **Medical History**: Comprehensive tracking of patient medical records and visit history

### 🩺 Prescription System
- **Dual Department Support**: 
  - Spine/General Medicine Prescriptions
  - Piles (Specialized) Prescriptions
- **Digital Prescription Creation**: Rich form-based prescription interface
- **Medicine Prescription**: Auto-complete medicine selection with dosage and instructions
- **Panchakarma Treatments**: Specialized Ayurvedic treatment prescriptions
- **Vitals Recording**: Complete vital signs capture and validation
- **Care Plans**: Detailed care plan management with preventive and curative care

### 💊 Medicine Management
- **Inventory Control**: Real-time stock tracking and management
- **Purchase Management**: Medicine procurement with batch tracking, expiry dates, and tax calculations
- **Sales Management**: Point-of-sale system with invoice generation and patient billing
- **Stock Medicine Views**: Current stock levels with detailed medicine information
- **Batch Management**: Track medicine batches, expiry dates, and procurement details

### 🏢 Administrative Features
- **Department Management**: Multi-department clinic support
- **User Management**: Role-based access control with different user privileges
- **Settings Management**: System configuration and customization options
- **Search & Reporting**: Advanced search across prescriptions and patient data

### 🖨️ Print & Documentation
- **Professional Prescription Printing**: Letterhead-based prescription generation
- **Invoice Generation**: Professional medicine sale invoices with letterhead
- **Care Plan Documents**: Detailed care plan printouts
- **Patient Records**: Comprehensive patient history reports

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.3.1** - Modern UI library with hooks and functional components
- **TypeScript 5.7.2** - Type-safe JavaScript for better development experience
- **Vite 5.4.10** - Fast build tool and development server

### UI & Styling
- **Material-UI v6** - Comprehensive React component library
  - `@mui/material` - Core components
  - `@mui/x-data-grid` - Advanced data grid components
  - `@mui/x-date-pickers` - Date and time picker components
- **Emotion** - CSS-in-JS styling solution
- **Lucide React** - Beautiful icon library

### State Management & Forms
- **Redux Toolkit** - Predictable state container
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation
- **React Router DOM** - Declarative routing

### Data & API
- **Axios** - HTTP client for API communication
- **Day.js** - Modern date manipulation library

### Specialized Libraries
- **react-to-print** - Print functionality for prescriptions and invoices
- **react-dropzone** - File upload handling
- **Recharts** - Chart and data visualization components
- **xlsx** - Excel file processing

## 🏗️ Project Structure

```
health-web/
├── public/                     # Static assets
│   ├── images/                # Public images and logos
│   └── vite.svg              # Vite logo
├── src/
│   ├── assets/               # Application assets
│   │   ├── care-plan.jpg     # Care plan background
│   │   ├── letter-pad.jpg    # Letterhead images
│   │   └── ...               # Other medical assets
│   ├── components/           # Reusable components
│   │   ├── auth-pages/       # Authentication components
│   │   ├── create-prescription/ # Prescription creation
│   │   ├── department-management/ # Department admin
│   │   ├── layouts/          # Layout components
│   │   ├── medicine-management/ # Medicine inventory
│   │   ├── patientslist/     # Patient management
│   │   ├── piles-prescription/ # Specialized prescriptions
│   │   ├── prescription/     # General prescriptions
│   │   ├── services/         # API service layer
│   │   ├── settings/         # Application settings
│   │   ├── ui/              # Reusable UI components
│   │   └── user-management/  # User administration
│   ├── constants/           # Application constants
│   ├── context/            # React Context providers
│   ├── pages/              # Page components
│   ├── redux/              # Redux store and slices
│   ├── routes/             # Application routing
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Bun** (preferred package manager)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-web
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   ```bash
   # Create environment file
   cp .env.example .env
   
   # Configure your environment variables
   # VITE_BACKEND_URL=https://your-api-server.com
   ```

4. **Start development server**
   ```bash
   bun dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## 🌐 API Integration

The application connects to a backend API server:
- **Production API**: `https://dj.rayshreeayurveda.com`
- **Development**: Configurable via environment variables

### API Endpoints Overview
- `/patient` - Patient management
- `/prescription` - General prescriptions
- `/prescription-piles` - Specialized piles prescriptions
- `/medicine` - Medicine catalog
- `/purchase` - Medicine purchases
- `/sale` - Medicine sales
- `/stock` - Inventory management
- `/department` - Department management
- `/user` - User management

## 📱 Core Workflows

### Patient Registration & Management
1. **New Patient Registration** - Complete patient information capture
2. **Patient Search** - Multi-criteria search and filtering
3. **Status Management** - Track patient journey from enquiry to active patient
4. **Medical History** - Access complete patient medical records

### Prescription Creation
1. **Patient Selection** - Choose existing patient or register new
2. **Department Selection** - Spine/General or Piles specialization
3. **Vitals Recording** - Blood pressure, pulse, weight, height, etc.
4. **Diagnosis Entry** - Complaints, examination findings, diagnosis
5. **Medicine Prescription** - Select medicines with dosage and instructions
6. **Panchakarma Selection** - Ayurvedic treatment procedures
7. **Care Plan Creation** - Preventive and curative care instructions
8. **Print & Save** - Generate professional prescription documents

### Medicine Inventory Management
1. **Stock Monitoring** - Real-time inventory levels
2. **Purchase Entry** - Record new medicine purchases with batch tracking
3. **Sales Processing** - Point-of-sale with invoice generation
4. **Expiry Tracking** - Monitor medicine expiration dates
5. **Batch Management** - Complete traceability from purchase to sale

### Administrative Functions
1. **User Management** - Create and manage user accounts with roles
2. **Department Setup** - Configure clinical departments
3. **System Settings** - Customize application behavior
4. **Search & Reports** - Advanced data analysis and reporting

## 🔒 Security Features

- **Role-based Access Control** - Different permission levels for users
- **Authentication System** - Secure login and session management
- **Data Validation** - Comprehensive input validation using Zod schemas
- **API Security** - Secure communication with backend services

## 🖨️ Printing & Documentation

### Professional Document Generation
- **Prescription Letterheads** - Clinic-branded prescription documents
- **Medicine Invoices** - Professional sales invoices with tax calculations
- **Care Plans** - Detailed treatment and care instructions
- **Patient Reports** - Comprehensive medical history documents

### Print Features
- **High-quality Output** - Optimized for medical document standards
- **Customizable Templates** - Clinic-specific letterhead and branding
- **Multi-format Support** - PDF generation and direct printing

## 📊 Data Management

### Patient Data
- Personal information and demographics
- Medical history and visit records
- Prescription and treatment history
- Care plan and follow-up instructions

### Medicine Data
- Comprehensive medicine catalog
- Real-time inventory tracking
- Purchase and sales transaction records
- Batch and expiry date management

### Clinical Data
- Prescription records with complete medicine details
- Vital signs and examination findings
- Diagnosis and treatment plans
- Panchakarma and specialized treatments

## 🛡️ Quality Assurance

### Code Quality
- **TypeScript** - Type safety and better developer experience
- **ESLint** - Code linting and style enforcement
- **Zod Validation** - Runtime type checking and data validation

### Performance
- **Vite Build System** - Fast development and optimized production builds
- **Lazy Loading** - Component-level code splitting
- **Optimized Rendering** - React best practices for performance

## 🤝 Contributing

This is a private healthcare system. For internal development:

1. Follow the established code structure and patterns
2. Use TypeScript for all new code
3. Follow Material-UI design guidelines
4. Write comprehensive Zod validation schemas
5. Test changes thoroughly before committing

## 📞 Support & Maintenance

For technical support and maintenance issues:
- Review application logs and error messages
- Check API connectivity and backend service status
- Verify database integrity and backup procedures
- Monitor system performance and user access patterns

## 📋 Version History

- **v1.3.6** - Current version with comprehensive medicine management
- Enhanced prescription system with dual department support
- Advanced inventory management with batch tracking
- Professional document generation and printing
- Improved user interface and experience

## 🔮 Future Enhancements

### Planned Features
- **Mobile Application** - Native mobile app for healthcare providers
- **Telemedicine Integration** - Video consultation capabilities
- **Advanced Analytics** - Business intelligence and reporting dashboards
- **Integration APIs** - Third-party healthcare system integrations
- **Multi-language Support** - Localization for different regions

### Technical Improvements
- **Progressive Web App** - Offline capability and mobile optimization
- **Real-time Updates** - WebSocket integration for live data updates
- **Advanced Search** - Elasticsearch integration for complex queries
- **Automated Backups** - Scheduled data backup and recovery systems

---

## 📄 License

This is a private healthcare management system developed for Rayshree Ayurveda. All rights reserved.

---

**Rayshree Ayurveda Health Management System** - Modernizing traditional healthcare with digital solutions.

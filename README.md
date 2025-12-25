# 🏥 **MediFlow Hospital Management System**

<div align="center">

![MediFlow Banner](https://img.shields.io/badge/MediFlow-Hospital_Management_System-blue?style=for-the-badge&logo=hospital&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

*A comprehensive desktop application for managing hospital patient flow, treatments, and medical records*

[Features](#-features) • [Screenshots](#-screenshots) • [Installation](#-installation) • [Usage](#-usage) • [Development](#-development) • [Database](#-database) • [Contributing](#-contributing)

</div>

---

## 📋 **Table of Contents**
- [✨ Features](#-features)
- [🖼️ Screenshots](#-screenshots)
- [🚀 Installation](#-installation)
- [💻 Usage](#-usage)
- [🛠️ Development](#️-development)
- [🗄️ Database](#️-database)
- [📁 Project Structure](#-project-structure)
- [🔧 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ **Features**

### **🎯 Core Functionality**
- **Patient Registration & Queue Management**
- **Real-time Treatment Room Assignment**
- **Doctor Treatment Interface**
- **Waiting Room Public Display (Kiosk)**
- **Complete Medical Records System**
- **Priority-based Triage System**

### **📊 Dashboard Features**
- ✅ **Reception Dashboard** - Patient registration and queue management
- ✅ **Doctor View** - Treatment room management and patient care
- ✅ **Kiosk Display** - Public waiting room information screen
- ✅ **Patient History** - Complete medical records and visit history
- ✅ **Real-time Updates** - Live queue status and room assignments
- ✅ **Priority Management** - Normal/Urgent/Critical priority levels

### **💾 Database Features**
- **SQLite Database** with Prisma ORM
- **Complete Patient Medical History**
- **Treatment Records & Prescriptions**
- **Appointment Scheduling**
- **Billing & Inventory Management**
- **Laboratory Test Tracking**

### **🎨 User Experience**
- **Modern, Clean UI** with Tailwind CSS
- **Responsive Design** for different screen sizes
- **Intuitive Navigation** with sidebar layout
- **Real-time Status Indicators**
- **Patient Announcement System** (Text-to-Speech)
- **Multi-language Support Ready**

---

## 🖼️ **Screenshots**


### **Reception Dashboard**
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3c9944b6-c47d-4b01-b7a0-1b5a82f3e0e0" />
<img width="573" height="734" alt="image" src="https://github.com/user-attachments/assets/19770628-08b1-46fd-957f-afeba40439f8" />


### **Doctor Treatment View**
<img width="1900" height="1002" alt="image" src="https://github.com/user-attachments/assets/ab62b355-c6b4-47e6-a1bb-5d8dc7ede765" />
<img width="1277" height="961" alt="image" src="https://github.com/user-attachments/assets/6c22bf80-6f11-4c05-a649-cac08955bf93" />




### **Kiosk Display**
<img width="1904" height="1007" alt="image" src="https://github.com/user-attachments/assets/e20fff85-38fa-4926-8838-dcbe03f1b0d3" />
<img width="1477" height="882" alt="image" src="https://github.com/user-attachments/assets/770d3e94-ec09-4c52-9581-58c773e0ab76" />


### **Patient History**
<img width="1421" height="741" alt="image" src="https://github.com/user-attachments/assets/aa097e8e-3b89-43bb-9271-40e9814584c9" />
<img width="1294" height="879" alt="image" src="https://github.com/user-attachments/assets/6416e5c4-7a04-4d9c-bc68-ab5245d3f3a8" />




---

## 🚀 **Installation**

### **Prerequisites**
- Node.js 18.x or higher
- npm or yarn
- Git

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/yourusername/medical-flow-app.git
cd medical-flow-app

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev

# Build for production
npm run build
```

### **Environment Setup**
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./prisma/dev.db"
```

---

## 💻 **Usage**

### **Starting the Application**
```bash
# Development mode
npm run dev

# Production build
npm run build
# Then run the executable from dist folder
```

### **Application Navigation**
1. **Reception Dashboard** (`/`) - Register new patients, manage queue
2. **Doctor View** (`/doctor`) - Treat patients, manage rooms
3. **Kiosk Display** (`/kiosk`) - Public waiting room information
4. **Patient History** (`/patients`) - View medical records

### **Workflow Examples**

#### **Registering a New Patient**
1. Go to Reception dashboard
2. Click "Create New Ticket"
3. Select "New Patient" or "Existing Patient"
4. Fill patient details and service required
5. Set priority level (Normal/Urgent/Critical)
6. Submit to add to queue

#### **Treating a Patient**
1. Go to Doctor View
2. Select an available treatment room
3. Click "Call Next Patient" or assign specific patient
4. Add treatment notes, prescriptions, or lab referrals
5. Click "Complete Treatment" when done

---

## 🛠️ **Development**

### **Technology Stack**
| Technology | Purpose | Version |
|------------|---------|---------|
| **Electron** | Desktop App Framework | ^28.0.0 |
| **React** | Frontend Library | ^18.2.0 |
| **TypeScript** | Type Safety | ^5.3.0 |
| **Prisma** | Database ORM | ^5.10.0 |
| **SQLite** | Local Database | Built-in |
| **Tailwind CSS** | Styling | ^3.4.0 |
| **React Router** | Navigation | ^6.20.0 |

### **Development Scripts**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production

# Database
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open database GUI
npx prisma migrate   # Run migrations

# Code Quality
npm run lint         # Check code style
npm run format       # Format code
```

### **File Structure**
```
medical-flow-app/
├── src/
│   ├── main/           # Electron main process
│   │   └── index.ts    # Main process with IPC handlers
│   ├── preload/        # Electron preload scripts
│   └── renderer/       # React frontend
│       └── src/
│           ├── assets/     # Styles and images
│           ├── components/ # Reusable components
│           ├── pages/      # Application pages
│           └── stores/     # State management
├── prisma/             # Database configuration
│   ├── schema.prisma   # Database schema
│   └── dev.db          # SQLite database
├── public/             # Static assets
└── package.json        # Dependencies
```

---

## 🗄️ **Database**

### **Schema Overview**
```prisma
// Core Models
model Patient           # Patient information
model Ticket            # Patient visits/tickets
model Appointment       # Scheduled appointments
model MedicalRecord     # Medical history
model Bill              # Billing information
model InventoryItem     # Medicine and supplies
model LabOrder          # Laboratory tests
model EmergencyCase     # Emergency room cases
model Prescription      # Medication records
```

### **Database Commands**
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name "add_feature"

# Reset database (caution: deletes data)
npx prisma migrate reset

# Open database GUI
npx prisma studio
```

### **Sample Queries**
```typescript
// Get all patients with their tickets
const patients = await prisma.patient.findMany({
  include: {
    tickets: {
      orderBy: { createdAt: 'desc' }
    }
  }
});

// Search patients by name
const results = await prisma.patient.findMany({
  where: {
    name: {
      contains: searchQuery,
      mode: 'insensitive'
    }
  }
});
```

---

## 📁 **Project Structure**

### **Main Directories**
- **`src/main/`** - Electron main process with IPC handlers
- **`src/preload/`** - Bridge between main and renderer processes
- **`src/renderer/`** - React frontend application
- **`prisma/`** - Database schema and migrations
- **`public/`** - Static assets and icons

### **Key Files**
| File | Purpose |
|------|---------|
| `src/main/index.ts` | Electron main process with all API endpoints |
| `src/renderer/src/App.tsx` | Main React application with routing |
| `src/renderer/src/pages/Reception.tsx` | Reception dashboard |
| `src/renderer/src/pages/DoctorView.tsx` | Doctor treatment interface |
| `prisma/schema.prisma` | Complete database schema |
| `package.json` | Dependencies and scripts |

---

## 🔧 **API Documentation**

### **IPC Endpoints (Main Process)**
```typescript
// Ticket Management
createTicket(data)        // Create new ticket
getTickets()              // Get all tickets
updateTicketStatus(ticketId, status, roomId) // Update status

// Patient Management
searchPatients(query)     // Search patients by name
getPatient(patientId)     // Get patient details

// Doctor View
getActiveTreatments()     // Get treatments in progress
getTodaysCompleted()      // Today's completed treatments
```

### **Frontend API Access**
```typescript
// All APIs are available via window.api
const tickets = await window.api.getTickets();
await window.api.createTicket(patientData);
await window.api.updateTicketStatus(ticketId, 'COMPLETED');
```

### **Status Codes**
- `WAITING` - Patient in queue
- `IN_TREATMENT` - Currently being treated
- `COMPLETED` - Treatment finished
- `CANCELLED` - Visit cancelled

### **Priority Levels**
- `0` = **Normal** (Green)
- `1` = **Urgent** (Orange)
- `2` = **Critical** (Red)

---

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Coding Standards**
- Use TypeScript for all new code
- Follow existing component patterns
- Add comments for complex logic
- Update documentation when changing APIs
- Test changes thoroughly

### **Feature Requests**
We welcome feature requests! Please:
1. Check if the feature already exists
2. Describe the use case clearly
3. Suggest implementation approach
4. Consider edge cases

### **Bug Reports**
When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Environment details

---


## 🙏 **Acknowledgments**

- Built with [Electron](https://www.electronjs.org/) and [React](https://reactjs.org/)
- Database powered by [Prisma](https://www.prisma.io/) and [SQLite](https://www.sqlite.org/)
- Icons by [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

### **🌟 Star this repository if you find it useful!**

*Last Updated: December 2024*  
*Version: 1.0.0*

</div>

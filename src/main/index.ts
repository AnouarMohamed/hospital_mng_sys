import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    // --- DATABASE HANDLERS ---

    // 1. Create a New Ticket (Updated version)
    ipcMain.handle('create-ticket', async (_, data) => {
      try {
        let patient;
        
        // Check if we have a patientId (existing patient) or need to create new
        if (data.patientId) {
          // Use existing patient
          patient = await prisma.patient.findUnique({
            where: { id: data.patientId }
          });
          
          if (!patient) {
            throw new Error('Patient not found');
          }
        } else {
          // Create new patient
          patient = await prisma.patient.create({
            data: { 
              name: data.name,
              createdAt: new Date()
            }
          });
        }

        // Generate Ticket Number
        const count = await prisma.ticket.count();
        const ticketNumber = `A-${String(count + 1).padStart(3, '0')}`;

        // Map priority text to number
        const priorityMap: Record<string, number> = {
          'Normal': 0,
          'Urgent': 1,
          'Critical': 2
        };

        const priorityNumber = priorityMap[data.priority] || 0;

        // Create Ticket
        const ticket = await prisma.ticket.create({
          data: {
            number: ticketNumber,
            status: 'WAITING',
            type: data.service || 'General Consultation',
            priority: priorityNumber,
            notes: data.notes || null,
            patientId: patient.id,
            createdAt: new Date()
          },
          include: {
            patient: true
          }
        });

        return ticket;
      } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
      }
    });

    // 2. Get All Tickets
    ipcMain.handle('get-tickets', async () => {
      return await prisma.ticket.findMany({
        include: { patient: true },
        orderBy: { createdAt: 'desc' }
      });
    });

    // 3. Search Patients by name or ID
    ipcMain.handle('search-patients', async (_, query: string) => {
      if (!query.trim()) return [];
      
      return await prisma.patient.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
          ]
        },
        take: 10,
        orderBy: { name: 'asc' }
      });
    });

    // 4. Get Patient by ID
    ipcMain.handle('get-patient', async (_, patientId: string) => {
      return await prisma.patient.findUnique({
        where: { id: patientId }
      });
    });

    // 5. Update Ticket Status
    ipcMain.handle('update-ticket-status', async (_, ticketId: string, status: string, roomId?: number) => {
      try {
        const updateData: any = { 
          status: status.toUpperCase(),
          updatedAt: new Date()
        };
        
        if (roomId) {
          updateData.roomId = roomId;
        }
        
        if (status.toUpperCase() === 'COMPLETED') {
          updateData.completedAt = new Date();
          updateData.roomId = null;
        }
        
        const ticket = await prisma.ticket.update({
          where: { id: ticketId },
          data: updateData,
          include: { patient: true }
        });
        
        return ticket;
      } catch (error) {
        console.error('Error updating ticket status:', error);
        throw error;
      }
    });

    // 6. Get Active Treatments
    ipcMain.handle('get-active-treatments', async () => {
      return await prisma.ticket.findMany({
        where: {
          status: 'IN_TREATMENT'
        },
        include: { patient: true },
        orderBy: { updatedAt: 'desc' }
      });
    });

    // 7. Get Today's Completed Treatments
    ipcMain.handle('get-todays-completed', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return await prisma.ticket.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: today
          }
        },
        include: { patient: true }
      });
    });

    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
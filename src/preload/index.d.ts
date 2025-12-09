import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      createTicket: (data: any) => Promise<any>
      getTickets: () => Promise<any>
      searchPatients: (query: string) => Promise<any[]>
      getPatient: (patientId: string) => Promise<any>
      updateTicketStatus: (ticketId: string, status: string, roomId?: number) => Promise<any>
      getActiveTreatments: () => Promise<any[]>
      getTodaysCompleted: () => Promise<any[]>
    }
  }
}
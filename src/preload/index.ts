import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  createTicket: (data: any) => {
    console.log('Preload: createTicket called with', data)
    return ipcRenderer.invoke('create-ticket', data)
  },
  getTickets: () => {
    console.log('Preload: getTickets called')
    return ipcRenderer.invoke('get-tickets')
  },
  searchPatients: (query: string) => {
    console.log('Preload: searchPatients called with', query)
    return ipcRenderer.invoke('search-patients', query)
  },
  getPatient: (patientId: string) => {
    console.log('Preload: getPatient called with', patientId)
    return ipcRenderer.invoke('get-patient', patientId)
  },
  updateTicketStatus: (ticketId: string, status: string, roomId?: number) => {
    console.log('Preload: updateTicketStatus called', { ticketId, status, roomId })
    return ipcRenderer.invoke('update-ticket-status', ticketId, status, roomId)
  },
  getActiveTreatments: () => {
    console.log('Preload: getActiveTreatments called')
    return ipcRenderer.invoke('get-active-treatments')
  },
  getTodaysCompleted: () => {
    console.log('Preload: getTodaysCompleted called')
    return ipcRenderer.invoke('get-todays-completed')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    console.log('Preload: APIs exposed successfully')
  } catch (error) {
    console.error('Preload: Failed to expose APIs', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  console.log('Preload: APIs added to window global')
}
import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, Plus } from 'lucide-react';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import NewPatientForm from '../components/NewPatientForm';

export default function Reception() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    try {
      // @ts-ignore
      const data = await window.api.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  const handleCreateTicket = async (formData: any) => {
    try {
      // @ts-ignore
      await window.api.createTicket(formData);
      await loadTickets();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Error creating ticket. Check console for details.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Header onCreateTicket={() => setIsModalOpen(true)} />
      <Stats ticketsCount={tickets.length} />
      <TicketTable tickets={tickets} />
      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}

// Header Component
function Header({ onCreateTicket }: { onCreateTicket: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reception Overview</h1>
        <p className="text-slate-500 mt-1">Manage patient flow and registration.</p>
      </div>
      <button
        onClick={onCreateTicket}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
      >
        <Plus size={20} />
        <span>Create New Ticket</span>
      </button>
    </div>
  );
}

// Stats Component
function Stats({ ticketsCount }: { ticketsCount: number }) {
  const stats = [
    { label: "Patients Waiting", value: ticketsCount, icon: Users, color: "orange" },
    { label: "In Consultation", value: "0", icon: Clock, color: "blue" },
    { label: "Total Served", value: "0", icon: CheckCircle, color: "emerald" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

// Ticket Table Component
function TicketTable({ tickets }: { tickets: any[] }) {
  const getPriorityColor = (priority: number) => {
    if (priority === 2) return 'red';
    if (priority === 1) return 'orange';
    return 'emerald';
  };

  const getPriorityText = (priority: number) => {
    if (priority === 2) return 'Critical';
    if (priority === 1) return 'Urgent';
    return 'Normal';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Live Queue</h2>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
          Real-time Data
        </span>
      </div>
      
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-6 py-3 font-medium">Ticket #</th>
            <th className="px-6 py-3 font-medium">Patient Name</th>
            <th className="px-6 py-3 font-medium">Service</th>
            <th className="px-6 py-3 font-medium">Priority</th>
            <th className="px-6 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4 font-bold text-slate-800">{ticket.number}</td>
              <td className="px-6 py-4 text-slate-600">{ticket.patient?.name || 'Unknown'}</td>
              <td className="px-6 py-4 text-slate-500">{ticket.type}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  ticket.priority === 2 
                    ? 'bg-red-100 text-red-800' 
                    : ticket.priority === 1
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {getPriorityText(ticket.priority)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {ticket.status || 'WAITING'}
                </span>
              </td>
            </tr>
          ))}
          {tickets.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                No tickets in queue. Click "Create New Ticket" to add one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Modal Wrapper
function TicketModal({ isOpen, onClose, onSubmit }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket">
      <NewPatientForm onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
}
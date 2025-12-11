import { useState, useEffect } from 'react';
import { 
  Search, User, Calendar, FileText, Pill, 
  Activity, Download, Filter, Eye, Printer,
  ChevronRight, Clock, AlertCircle, Stethoscope,
  Database, RefreshCw, AlertTriangle
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  createdAt: string;
  tickets?: any[];
}

interface Ticket {
  id: string;
  number: string;
  status: string;
  type: string;
  priority: number;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  createdAt: string;
  completedAt?: string;
}

export default function PatientHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientTickets, setPatientTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    visitsToday: 0,
    activeCases: 0
  });

  // Load patients from database
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all tickets to extract patient data
      const tickets = await window.api.getTickets();
      
      // Extract unique patients from tickets
      const patientMap = new Map();
      
      tickets.forEach((ticket: any) => {
        if (ticket.patient) {
          if (!patientMap.has(ticket.patient.id)) {
            patientMap.set(ticket.patient.id, {
              id: ticket.patient.id,
              name: ticket.patient.name,
              createdAt: ticket.patient.createdAt,
              tickets: []
            });
          }
          patientMap.get(ticket.patient.id).tickets.push(ticket);
        }
      });
      
      const patientList = Array.from(patientMap.values());
      setPatients(patientList);
      
      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const visitsToday = tickets.filter((t: any) => {
        const ticketDate = new Date(t.createdAt);
        return ticketDate >= today;
      }).length;
      
      const activeCases = tickets.filter((t: any) => 
        t.status === 'WAITING' || t.status === 'IN_TREATMENT'
      ).length;
      
      setStats({
        totalPatients: patientList.length,
        visitsToday,
        activeCases
      });
      
    } catch (error) {
      console.error('Failed to load patients:', error);
      setError('Failed to load patient data from database.');
    } finally {
      setLoading(false);
    }
  };

  // Load patient's tickets from database
  const loadPatientTickets = async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const tickets = await window.api.getTickets();
      const patientTickets = tickets.filter((t: any) => 
        t.patient?.id === patientId
      ).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setPatientTickets(patientTickets);
    } catch (error) {
      console.error('Failed to load patient tickets:', error);
      setError('Failed to load patient medical history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    loadPatientTickets(patient.id);
    setViewMode('detail');
  };

  const getPriorityText = (priority: number) => {
    if (priority === 2) return 'Critical';
    if (priority === 1) return 'Urgent';
    return 'Normal';
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 2) return 'bg-red-100 text-red-800';
    if (priority === 1) return 'bg-orange-100 text-orange-800';
    return 'bg-emerald-100 text-emerald-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVisitCount = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.tickets?.length || 0;
  };

  const getLastVisit = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    const tickets = patient?.tickets || [];
    if (tickets.length === 0) return null;
    
    return tickets.reduce((latest: any, ticket: any) => {
      const ticketDate = new Date(ticket.createdAt);
      const latestDate = new Date(latest.createdAt);
      return ticketDate > latestDate ? ticket : latest;
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient History & Medical Records</h1>
          <p className="text-slate-600">
            View real patient data from database • {stats.totalPatients} patients found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPatients}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
            <Database size={16} />
            <span className="text-sm font-medium">Live Database</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        /* Patient List View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Search Patients</h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-2">Database Status</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Total Patients</span>
                      <span className="font-semibold">{stats.totalPatients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Visits Today</span>
                      <span className="font-semibold">{stats.visitsToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Active Cases</span>
                      <span className="font-semibold">{stats.activeCases}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-sm text-slate-600 mb-2">Data Source</div>
                  <div className="text-sm text-slate-700">
                    Showing real patient data from your MediFlow database. 
                    All registered patients appear here automatically.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">Patient Directory</h2>
                  <span className="text-sm text-slate-500">
                    {filteredPatients.length} of {patients.length} patients
                  </span>
                </div>
              </div>
              
              {filteredPatients.length === 0 ? (
                <div className="p-12 text-center">
                  <User className="mx-auto text-slate-300 mb-4" size={48} />
                  <div className="text-lg font-medium text-slate-700 mb-2">
                    {searchQuery ? 'No patients found' : 'No patients in database'}
                  </div>
                  <div className="text-slate-500">
                    {searchQuery 
                      ? 'Try a different search term'
                      : 'Patients will appear here after they register at Reception'
                    }
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => {
                    const lastVisit = getLastVisit(patient.id);
                    const visitCount = getVisitCount(patient.id);
                    
                    return (
                      <div 
                        key={patient.id} 
                        className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="text-emerald-600" size={24} />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-lg">{patient.name}</div>
                              <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                                <span>ID: {patient.id.substring(0, 8)}...</span>
                                <span>•</span>
                                <span>Visits: {visitCount}</span>
                                {lastVisit && (
                                  <>
                                    <span>•</span>
                                    <span>Last: {formatDate(lastVisit.createdAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-slate-500">Registered</div>
                              <div className="font-semibold text-slate-800">
                                {formatDate(patient.createdAt)}
                              </div>
                            </div>
                            <ChevronRight className="text-slate-300 group-hover:text-slate-400" />
                          </div>
                        </div>
                        
                        {/* Show latest ticket info */}
                        {lastVisit && (
                          <div className="mt-4 ml-16">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lastVisit.priority)}`}>
                                {getPriorityText(lastVisit.priority)}
                              </span>
                              <span className="text-sm text-slate-600">{lastVisit.type}</span>
                              <span className="text-sm text-slate-500">• Ticket: {lastVisit.number}</span>
                              <span className="text-sm text-slate-500">• Status: {lastVisit.status}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Patient Detail View */
        <div className="space-y-6">
          {/* Patient Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                >
                  ← Back to Patients
                </button>
              </div>
              <div className="text-sm text-slate-500">
                Patient ID: {selectedPatient?.id}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="text-emerald-600" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedPatient?.name}</h2>
                    <div className="flex items-center gap-4 text-slate-600 mt-1">
                      <span>Registered: {selectedPatient && formatDate(selectedPatient.createdAt)}</span>
                      <span>•</span>
                      <span>Total Visits: {patientTickets.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-slate-500 mb-3">Visit Statistics</div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Completed Treatments</span>
                        <span className="font-semibold">
                          {patientTickets.filter(t => t.status === 'COMPLETED').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Urgent/Critical Cases</span>
                        <span className="font-semibold">
                          {patientTickets.filter(t => t.priority >= 1).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Last Visit</span>
                        <span className="font-semibold">
                          {patientTickets.length > 0 
                            ? formatDate(patientTickets[0].createdAt)
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-500 mb-3">Service Breakdown</div>
                    <div className="space-y-3">
                      {Array.from(new Set(patientTickets.map(t => t.type))).map(type => (
                        <div key={type} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                          <span className="text-emerald-700">{type}</span>
                          <span className="font-semibold text-emerald-700">
                            {patientTickets.filter(t => t.type === type).length} visits
                          </span>
                        </div>
                      ))}
                      {patientTickets.length === 0 && (
                        <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-center">
                          No service history
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-3">Quick Actions</div>
                <div className="space-y-2">
                  <button 
                    onClick={() => window.location.hash = '/'}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <div className="font-medium text-slate-800">Create New Ticket</div>
                    <div className="text-sm text-slate-500">Register new visit at Reception</div>
                  </button>
                  <button 
                    onClick={loadPatients}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <div className="font-medium text-slate-800">Refresh Data</div>
                    <div className="text-sm text-slate-500">Update with latest visits</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Visit History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Visit History</h2>
              <p className="text-slate-600 text-sm mt-1">
                All visits for {selectedPatient?.name} ({patientTickets.length} total)
              </p>
            </div>
            
            <div className="divide-y divide-slate-100">
              {patientTickets.map((ticket) => (
                <div key={ticket.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="text-slate-400" size={18} />
                        <span className="font-semibold text-slate-800">
                          {formatDateTime(ticket.createdAt)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {getPriorityText(ticket.priority)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-slate-800">Ticket #{ticket.number}</h3>
                        <span className="text-slate-600">{ticket.type}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          ticket.status === 'IN_TREATMENT' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    {ticket.completedAt && (
                      <div className="text-right">
                        <div className="text-sm text-slate-500">Completed</div>
                        <div className="font-medium text-slate-700">{formatDate(ticket.completedAt)}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-slate-600 mb-2">Diagnosis & Notes</div>
                      <div className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[60px]">
                        {ticket.diagnosis || ticket.notes || 'No diagnosis recorded'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-slate-600 mb-2">Prescription</div>
                      <div className="text-slate-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100 min-h-[60px]">
                        {ticket.prescription || 'No prescription recorded'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {patientTickets.length === 0 && (
                <div className="p-12 text-center">
                  <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                  <div className="text-lg font-medium text-slate-700 mb-2">No Visit History</div>
                  <div className="text-slate-500">
                    This patient has no recorded visits yet.
                  </div>
                  <button 
                    onClick={() => window.location.hash = '/'}
                    className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Create First Visit at Reception
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading patient data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
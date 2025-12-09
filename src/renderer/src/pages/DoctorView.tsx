import { useState, useEffect } from 'react';
import { 
  Users, Clock, CheckCircle, AlertCircle, 
  Stethoscope, MessageSquare, FileText, 
  ChevronRight, Search, Activity, Eye,
  Pill, TrendingUp, Calendar, Bell, 
  Zap, Shield, Clipboard, TestTube,
  PhoneCall, UserPlus
} from 'lucide-react';

export default function DoctorView() {
  const [currentTreatment, setCurrentTreatment] = useState<any>(null);
  const [waitingQueue, setWaitingQueue] = useState<any[]>([]);
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Examination 1', doctor: 'Dr. Smith', status: 'empty', currentPatient: null },
    { id: 2, name: 'Examination 2', doctor: 'Dr. Johnson', status: 'empty', currentPatient: null },
    { id: 3, name: 'Emergency', doctor: 'Dr. Williams', status: 'empty', currentPatient: null },
    { id: 4, name: 'Consultation', doctor: 'Dr. Brown', status: 'empty', currentPatient: null },
  ]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [patientNotes, setPatientNotes] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabReferralModal, setShowLabReferralModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    service: 'General Consultation',
    priority: 'Normal',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadDoctorData();
    const interval = setInterval(loadDoctorData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDoctorData = async () => {
    try {
      setError(null);
      if (!window.api || !window.api.getTickets) {
        throw new Error('API not available. Please restart the app.');
      }
      
      const tickets = await window.api.getTickets();
      const waiting = tickets.filter((t: any) => t.status === 'WAITING');
      setWaitingQueue(waiting);

      // Load active treatments
      const activeTickets = tickets.filter((t: any) => t.status === 'IN_TREATMENT');
      
      // Update rooms with active treatments
      const updatedRooms = rooms.map(room => {
        const activeTicket = activeTickets.find((t: any) => t.roomId === room.id);
        return {
          ...room,
          status: activeTicket ? 'active' : 'empty',
          currentPatient: activeTicket || null
        };
      });
      setRooms(updatedRooms);

      // Set current treatment if a room is selected
      if (selectedRoom !== null) {
        const room = updatedRooms.find(r => r.id === selectedRoom);
        setCurrentTreatment(room?.currentPatient || null);
      }
    } catch (error) {
      console.error('Failed to load doctor data:', error);
      setError('Failed to load data. Check console for details.');
    }
  };

  // ===== ROOM & PATIENT MANAGEMENT =====
  const startTreatment = async (ticketId: string, roomId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.api || !window.api.updateTicketStatus) {
        throw new Error('API not available');
      }
      
      await window.api.updateTicketStatus(ticketId, 'IN_TREATMENT', roomId);
      await loadDoctorData();
      setSelectedRoom(roomId);
      
      // Find and set the current treatment
      const tickets = await window.api.getTickets();
      const startedTicket = tickets.find((t: any) => t.id === ticketId);
      if (startedTicket) {
        setCurrentTreatment(startedTicket);
      }
      
      alert(`Patient assigned to room ${rooms.find(r => r.id === roomId)?.name}`);
    } catch (error) {
      console.error('Failed to start treatment:', error);
      setError('Error starting treatment. Check console for details.');
      alert('Failed to start treatment. Please check console.');
    } finally {
      setLoading(false);
    }
  };

  const assignPatientToRoom = async (ticketId: string, roomId: number) => {
    if (!roomId) {
      alert('Please select a room first');
      return;
    }
    
    if (!ticketId) {
      alert('No patient selected');
      return;
    }
    
    await startTreatment(ticketId, roomId);
  };

  const completeTreatment = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.api || !window.api.updateTicketStatus) {
        throw new Error('API not available');
      }
      
      await window.api.updateTicketStatus(ticketId, 'COMPLETED');
      await loadDoctorData();
      setCurrentTreatment(null);
      setSelectedRoom(null);
      setPatientNotes('');
      
      alert('Treatment completed successfully!');
    } catch (error) {
      console.error('Failed to complete treatment:', error);
      setError('Error completing treatment. Check console for details.');
      alert('Failed to complete treatment. Please check console.');
    } finally {
      setLoading(false);
    }
  };

  const callNextPatient = async (roomId: number) => {
    if (waitingQueue.length === 0) {
      alert('No patients in waiting queue');
      return;
    }

    const nextPatient = waitingQueue[0];
    await startTreatment(nextPatient.id, roomId);
  };

  const callSpecificPatient = (patientName: string, roomId: number) => {
    const roomName = rooms.find(r => r.id === roomId)?.name || 'treatment room';
    alert(`📢 Calling ${patientName} to ${roomName}...\n\nPlease proceed to the treatment room.`);
  };

  // ===== NEW PATIENT FROM DOCTOR VIEW =====
  const handleCreateNewPatient = async () => {
    if (!newPatientForm.name.trim()) {
      alert('Please enter patient name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!window.api || !window.api.createTicket) {
        throw new Error('API not available');
      }
      
      // Create ticket for new patient
      await window.api.createTicket({
        name: newPatientForm.name,
        service: newPatientForm.service,
        priority: newPatientForm.priority,
        notes: newPatientForm.notes
      });
      
      alert(`✅ New patient "${newPatientForm.name}" added to waiting queue!`);
      setShowNewPatientModal(false);
      setNewPatientForm({
        name: '',
        service: 'General Consultation',
        priority: 'Normal',
        notes: ''
      });
      await loadDoctorData();
    } catch (error) {
      console.error('Failed to create new patient:', error);
      setError('Error creating new patient. Check console for details.');
      alert('Failed to create new patient. Please check console.');
    } finally {
      setLoading(false);
    }
  };

  // ===== TREATMENT ACTIONS =====
  const handleAddNotes = () => {
    if (!patientNotes.trim()) {
      alert('Please enter notes before saving.');
      return;
    }
    
    // In a real app, you'd save notes to the database
    alert(`Notes added: "${patientNotes}"`);
    setPatientNotes('');
  };

  const handlePrescribe = () => {
    setShowPrescriptionModal(true);
  };

  const handleLabReferral = () => {
    setShowLabReferralModal(true);
  };

  const handleEmergencyProtocol = () => {
    alert('🚨 EMERGENCY PROTOCOL ACTIVATED!\n\n1. Call emergency team\n2. Prepare crash cart\n3. Clear treatment area\n4. Notify senior doctor');
    
    // Auto-select emergency room if available
    const emergencyRoom = rooms.find(r => r.name.toLowerCase().includes('emergency'));
    if (emergencyRoom && !emergencyRoom.currentPatient) {
      setSelectedRoom(emergencyRoom.id);
    }
  };

  const handleViewLabResults = () => {
    alert('Opening lab results dashboard...\n\nPending tests: 3\nCompleted today: 12\nAbnormal results: 1');
  };

  const handleQuickPrescription = () => {
    const prescriptions = [
      'Paracetamol 500mg - 1 tab every 6 hours',
      'Ibuprofen 400mg - 1 tab every 8 hours',
      'Amoxicillin 500mg - 1 tab three times daily',
      'Cetirizine 10mg - 1 tab daily'
    ];
    
    const randomPrescription = prescriptions[Math.floor(Math.random() * prescriptions.length)];
    alert(`Prescription generated:\n\n${randomPrescription}\n\nDuration: 7 days\nRefills: 0`);
  };

  // ===== MODAL FUNCTIONS =====
  const handleSendPrescription = () => {
    alert('✅ Prescription sent to pharmacy!\nPatient can collect medication in 30 minutes.');
    setShowPrescriptionModal(false);
  };

  const handleSendLabRequest = () => {
    alert('✅ Lab referral sent!\nTests scheduled for today.\nResults expected in 2-4 hours.');
    setShowLabReferralModal(false);
  };

  // ===== STATS CALCULATION =====
  const calculateStats = () => {
    // Simple mock stats
    return {
      treatedToday: waitingQueue.length > 0 ? Math.floor(waitingQueue.length * 0.3) : 0,
      avgWaitTime: waitingQueue.length > 0 ? Math.floor(waitingQueue.length * 8) : 0,
      avgTreatmentTime: 25
    };
  };

  const stats = calculateStats();
  const calculateWaitTime = (index: number) => (index + 1) * 15;

  return (
    <div className="space-y-6 p-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-2 text-slate-600">Processing...</p>
          </div>
        </div>
      )}

      {/* Header with Call New Patient button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
          <p className="text-slate-500">Manage patient treatments and consultations.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNewPatientModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-emerald-500/20"
            disabled={loading}
          >
            <UserPlus size={20} />
            <span>New Patient</span>
          </button>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Patients Waiting</div>
            <div className="text-2xl font-bold text-slate-800">{waitingQueue.length}</div>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="text-right">
            <div className="text-sm text-slate-500">In Treatment</div>
            <div className="text-2xl font-bold text-slate-800">
              {rooms.filter(r => r.status === 'active').length}
            </div>
          </div>
        </div>
      </div>

      {/* Room Selection Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Treatment Rooms</h2>
            <p className="text-sm text-slate-500">
              {selectedRoom 
                ? `Selected: ${rooms.find(r => r.id === selectedRoom)?.name} - Click a room to select`
                : 'Click a room to select it for patient assignment'}
            </p>
          </div>
          {selectedRoom && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-600">
                Room selected: <span className="font-semibold text-emerald-600">
                  {rooms.find(r => r.id === selectedRoom)?.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-sm text-slate-500 hover:text-slate-700"
                disabled={loading}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Treatment Rooms */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`border rounded-xl p-4 transition-all cursor-pointer ${
              selectedRoom === room.id
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                : room.status === 'active'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            onClick={() => {
              if (!loading) {
                setSelectedRoom(room.id);
                setCurrentTreatment(room.currentPatient);
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-800">{room.name}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                room.status === 'active'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {room.status === 'active' ? 'In Use' : 'Available'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{room.doctor}</p>
            
            {room.status === 'active' && room.currentPatient ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-800">
                  {room.currentPatient.patient?.name || 'Unknown Patient'}
                </div>
                <div className="text-xs text-slate-500">
                  Ticket: {room.currentPatient.number}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      callSpecificPatient(room.currentPatient.patient?.name || 'Patient', room.id);
                    }}
                    className="flex-1 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-1"
                    disabled={loading}
                  >
                    <PhoneCall size={12} />
                    Call
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTreatment(room.currentPatient.id);
                    }}
                    className="flex-1 py-1.5 text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Complete
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  callNextPatient(room.id);
                }}
                className="w-full mt-2 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                disabled={waitingQueue.length === 0 || loading}
              >
                Call Next Patient
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Patient Details */}
        <div className="lg:col-span-2 space-y-6">
          {currentTreatment ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Current Treatment</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => callSpecificPatient(currentTreatment.patient?.name || 'Patient', selectedRoom!)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2"
                    disabled={loading || !selectedRoom}
                  >
                    <PhoneCall size={14} />
                    Call Patient
                  </button>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentTreatment.priority === 2
                      ? 'bg-red-100 text-red-800'
                      : currentTreatment.priority === 1
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentTreatment.priority === 2 ? 'Critical' : 
                     currentTreatment.priority === 1 ? 'Urgent' : 'Normal'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500">Patient</div>
                  <div className="text-xl font-bold text-slate-800">
                    {currentTreatment.patient?.name || 'Unknown Patient'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Ticket Number</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {currentTreatment.number}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Service</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {currentTreatment.type}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-500 mb-2">Treatment Notes</div>
                  <textarea
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    className="w-full h-32 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Enter treatment notes, observations, or instructions..."
                    disabled={loading}
                  />
                  <button
                    onClick={handleAddNotes}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Save Notes
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-sm text-slate-500 mb-3">Treatment Actions</div>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={handleAddNotes}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      disabled={loading}
                    >
                      <MessageSquare size={16} />
                      Add Notes
                    </button>
                    <button 
                      onClick={handlePrescribe}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      disabled={loading}
                    >
                      <FileText size={16} />
                      Prescribe
                    </button>
                    <button 
                      onClick={handleLabReferral}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      disabled={loading}
                    >
                      <Stethoscope size={16} />
                      Refer to Lab
                    </button>
                    <button
                      onClick={() => completeTreatment(currentTreatment.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      disabled={loading}
                    >
                      <CheckCircle size={16} />
                      Complete Treatment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <Stethoscope className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No Active Treatment</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {selectedRoom 
                  ? `Select a patient from the waiting queue to assign to ${rooms.find(r => r.id === selectedRoom)?.name}`
                  : 'Select a treatment room or call the next patient to begin a consultation.'}
              </p>
            </div>
          )}

          {/* Waiting Queue */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">Waiting Queue</h2>
                  <p className="text-sm text-slate-500">
                    {selectedRoom 
                      ? `Select a patient to assign to ${rooms.find(r => r.id === selectedRoom)?.name}`
                      : 'Patients waiting for consultation'}
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  {waitingQueue.length} patient{waitingQueue.length !== 1 ? 's' : ''} waiting
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {waitingQueue.map((ticket, index) => (
                <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800">{ticket.number}</div>
                        <div className="text-xs text-slate-500">Ticket</div>
                      </div>
                      <ChevronRight className="text-slate-300" />
                      <div>
                        <div className="font-medium text-slate-800">{ticket.patient?.name || 'Unknown Patient'}</div>
                        <div className="text-sm text-slate-500">{ticket.type}</div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => callSpecificPatient(ticket.patient?.name || 'Patient', selectedRoom || 1)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            disabled={loading}
                          >
                            <PhoneCall size={10} className="inline mr-1" />
                            Call
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-800">
                          ~{calculateWaitTime(index)} min
                        </div>
                        <div className="text-xs text-slate-500">Est. wait</div>
                      </div>
                      <button
                        onClick={() => assignPatientToRoom(ticket.id, selectedRoom || 1)}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                        disabled={!selectedRoom || loading}
                      >
                        {selectedRoom ? `Assign to Room` : 'Select Room First'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {waitingQueue.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <Clock className="mx-auto mb-3" size={32} />
                  <p>No patients waiting for consultation.</p>
                  <button
                    onClick={() => setShowNewPatientModal(true)}
                    className="mt-3 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    + Add New Patient
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} />
              Today's Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Patients Treated</span>
                <span className="font-bold text-slate-800">{stats.treatedToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Avg. Wait Time</span>
                <span className="font-bold text-slate-800">{stats.avgWaitTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Avg. Treatment Time</span>
                <span className="font-bold text-slate-800">{stats.avgTreatmentTime} min</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Zap size={18} />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={handleEmergencyProtocol}
                className="w-full text-left p-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors group"
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-red-500" />
                  <div className="font-medium text-slate-800">Emergency Protocol</div>
                </div>
                <div className="text-sm text-slate-500">Critical patient procedures</div>
              </button>
              
              <button 
                onClick={handleViewLabResults}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TestTube size={16} className="text-blue-500" />
                  <div className="font-medium text-slate-800">Lab Results</div>
                </div>
                <div className="text-sm text-slate-500">View pending tests</div>
              </button>
              
              <button 
                onClick={handleQuickPrescription}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Pill size={16} className="text-emerald-500" />
                  <div className="font-medium text-slate-800">Prescription Pad</div>
                </div>
                <div className="text-sm text-slate-500">Quick prescriptions</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Patient from Doctor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({...newPatientForm, name: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  placeholder="Enter patient name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Required</label>
                <select
                  value={newPatientForm.service}
                  onChange={(e) => setNewPatientForm({...newPatientForm, service: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  disabled={loading}
                >
                  <option>General Consultation</option>
                  <option>Follow-up</option>
                  <option>Emergency</option>
                  <option>Lab Test</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <div className="flex gap-2">
                  {['Normal', 'Urgent', 'Critical'].map(level => (
                    <button
                      key={level}
                      onClick={() => setNewPatientForm({...newPatientForm, priority: level})}
                      className={`flex-1 py-2 rounded-lg border ${
                        newPatientForm.priority === level
                          ? level === 'Normal' ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : level === 'Urgent' ? 'border-orange-200 bg-orange-50 text-orange-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      disabled={loading}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={newPatientForm.notes}
                  onChange={(e) => setNewPatientForm({...newPatientForm, notes: e.target.value})}
                  className="w-full h-20 p-2 border border-slate-200 rounded-lg"
                  placeholder="Any additional notes..."
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowNewPatientModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNewPatient}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add to Queue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Write Prescription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medication</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg" disabled={loading}>
                  <option>Paracetamol 500mg</option>
                  <option>Ibuprofen 400mg</option>
                  <option>Amoxicillin 500mg</option>
                  <option>Cetirizine 10mg</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="e.g., 1 tab every 6 hours" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded-lg" placeholder="e.g., 7 days" disabled={loading} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendPrescription}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                disabled={loading}
              >
                Send to Pharmacy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Referral Modal */}
      {showLabReferralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Lab Referral</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Type</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg" disabled={loading}>
                  <option>Blood Test (CBC)</option>
                  <option>Urine Analysis</option>
                  <option>X-Ray Chest</option>
                  <option>ECG</option>
                  <option>Ultrasound</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea className="w-full h-24 p-2 border border-slate-200 rounded-lg" placeholder="Specific instructions or concerns..." disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 border border-slate-200 rounded-lg" disabled={loading}>Routine</button>
                  <button className="flex-1 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg" disabled={loading}>Urgent</button>
                  <button className="flex-1 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg" disabled={loading}>Stat</button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowLabReferralModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendLabRequest}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                disabled={loading}
              >
                Send Lab Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
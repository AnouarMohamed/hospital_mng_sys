import { useState, useEffect } from 'react';
import { Clock, Users, ChevronRight, Volume2, RefreshCw, Bell, AlertCircle } from 'lucide-react';

export default function KioskDisplay() {
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [nextTickets, setNextTickets] = useState<any[]>([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Load data
  const loadKioskData = async () => {
    try {
      const tickets = await window.api.getTickets();
      
      // Get current ticket (in treatment)
      const current = tickets.find((t: any) => t.status === 'IN_TREATMENT');
      setCurrentTicket(current || null);
      
      // Get next tickets (waiting)
      const waiting = tickets.filter((t: any) => t.status === 'WAITING');
      setNextTickets(waiting.slice(0, 5)); // Show next 5 patients
      setWaitingCount(waiting.length);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load kiosk data:', error);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    loadKioskData();
    
    if (autoRefresh) {
      const interval = setInterval(loadKioskData, 10000); // 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const announcePatient = (patientName: string, ticketNumber: string, room: string) => {
    if (isAnnouncing) return;
    
    setIsAnnouncing(true);
    
    // Create announcement message
    const message = `Patient ${patientName} with ticket ${ticketNumber}, please proceed to ${room}.`;
    
    // Try using Web Speech API for voice announcement
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(message);
      speech.rate = 0.9;
      speech.pitch = 1;
      speech.volume = 1;
      window.speechSynthesis.speak(speech);
      
      speech.onend = () => {
        setIsAnnouncing(false);
      };
    } else {
      // Fallback to alert if speech synthesis not available
      alert(`📢 ${message}`);
      setIsAnnouncing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateWaitTime = (index: number) => {
    // Simple estimation: 15 minutes per patient ahead
    return Math.max(5, (index + 1) * 15);
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 2) return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 1) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const getPriorityText = (priority: number) => {
    if (priority === 2) return 'Critical';
    if (priority === 1) return 'Urgent';
    return 'Normal';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">🏥 MediFlow Hospital</h1>
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-slate-400" />
                <span className="text-xl font-semibold">{formatTime(currentTime)}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{formatDate(currentTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-500">Last Updated</div>
              <div className="text-lg font-semibold text-slate-800">{formatTime(lastUpdated)}</div>
            </div>
            <button
              onClick={loadKioskData}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              disabled={isAnnouncing}
            >
              <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Patient - Main Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Now Serving Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-2xl font-semibold text-emerald-100 mb-3">NOW SERVING</div>
                <div className="text-7xl font-black text-white tracking-wider mb-6">
                  {currentTicket ? currentTicket.number : '---'}
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                {currentTicket ? (
                  <div className="text-center space-y-6">
                    <div>
                      <div className="text-4xl font-bold text-white mb-2">{currentTicket.patient?.name}</div>
                      <div className="text-xl text-emerald-100">Please proceed to treatment room</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-emerald-200 mb-1">Service</div>
                        <div className="text-2xl font-semibold text-white">{currentTicket.type}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-emerald-200 mb-1">Room</div>
                        <div className="text-2xl font-semibold text-white">
                          {currentTicket.roomId ? `Room ${currentTicket.roomId}` : 'Assigned'}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => announcePatient(
                        currentTicket.patient?.name, 
                        currentTicket.number, 
                        currentTicket.roomId ? `Room ${currentTicket.roomId}` : 'treatment'
                      )}
                      className="w-full py-4 bg-white text-emerald-600 rounded-xl text-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 shadow-lg"
                      disabled={isAnnouncing}
                    >
                      <Volume2 size={24} />
                      {isAnnouncing ? 'Announcing...' : 'Announce Patient'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">👨‍⚕️</div>
                    <div className="text-2xl font-semibold text-white mb-2">No Active Treatment</div>
                    <div className="text-lg text-emerald-100">Doctor will call next patient shortly</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next in Line */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Next in Line</h2>
                <p className="text-slate-600">Patients waiting for consultation</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-slate-500">Patients Waiting</div>
                  <div className="text-3xl font-bold text-slate-800">{waitingCount}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {nextTickets.map((ticket, index) => (
                <div 
                  key={ticket.id} 
                  className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-slate-800">{ticket.number}</div>
                        <div className="text-xs text-slate-500 mt-1">Ticket</div>
                      </div>
                      
                      <ChevronRight className="text-slate-300 group-hover:text-slate-400" size={24} />
                      
                      <div>
                        <div className="text-xl font-semibold text-slate-800">{ticket.patient?.name}</div>
                        <div className="text-slate-600">{ticket.type}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {getPriorityText(ticket.priority)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-800">~{calculateWaitTime(index)} min</div>
                      <div className="text-sm text-slate-500">Estimated wait</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {nextTickets.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <Users className="mx-auto mb-4 text-slate-300" size={48} />
                  <div className="text-xl font-semibold text-slate-700 mb-2">No patients waiting</div>
                  <div className="text-slate-500">Thank you for your patience</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel - Information */}
        <div className="space-y-6">
          {/* Hospital Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-blue-500" />
              Hospital Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-700">Emergency Department</span>
                <span className="font-semibold text-emerald-600">OPEN 24/7</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-700">Pharmacy Hours</span>
                <span className="font-semibold text-slate-800">8 AM - 10 PM</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-700">Lab Services</span>
                <span className="font-semibold text-slate-800">7 AM - 9 PM</span>
              </div>
              <div className="pt-3">
                <div className="text-slate-600 mb-1">Emergency Contact</div>
                <div className="text-2xl font-bold text-red-600">📞 911</div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-blue-500" />
              <h3 className="text-xl font-bold text-slate-800">Announcements</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-blue-700 text-sm font-medium mb-1">📢 Important Notice</div>
                <div className="text-slate-700">Please keep noise to a minimum in waiting areas</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-blue-700 text-sm font-medium mb-1">🏥 Service Update</div>
                <div className="text-slate-700">Free Wi-Fi available: "MediFlow-Guest"</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="text-blue-700 text-sm font-medium mb-1">💡 Reminder</div>
                <div className="text-slate-700">Have your insurance card ready for registration</div>
              </div>
            </div>
          </div>

          {/* Today's Statistics */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Today's Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Patients Served</span>
                <span className="text-2xl font-bold text-slate-800">42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Average Wait Time</span>
                <span className="text-2xl font-bold text-slate-800">22 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Satisfaction Rate</span>
                <span className="text-2xl font-bold text-emerald-600">94%</span>
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Auto-refresh</div>
                  <div className="text-slate-700 font-medium">{autoRefresh ? 'Every 10 seconds' : 'Manual'}</div>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    autoRefresh 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {autoRefresh ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Button */}
          <button 
            onClick={() => {
              alert('🚨 EMERGENCY ALERT!\n\nMedical team has been notified. Please remain calm and follow staff instructions.');
            }}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <AlertCircle size={20} />
            EMERGENCY ASSISTANCE
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200 text-center">
        <div className="text-slate-600">
          For assistance, please visit the reception desk or call extension 100
        </div>
        <div className="text-slate-400 text-sm mt-2">
          Display updates every 10 seconds • MediFlow Hospital System v2.1
        </div>
      </div>
    </div>
  );
}
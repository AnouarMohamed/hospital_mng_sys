import { User, FileText, Search, Clock, Phone, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface FormData {
  name: string;
  service: string;
  priority: string;
  notes: string;
  patientId?: string;
}

interface Props {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

const SERVICES = [
  'General Consultation',
  'Laboratory',
  'Radiology', 
  'Emergency',
  'Pharmacy',
  'Follow-up'
];

export default function NewPatientForm({ onSubmit, onCancel }: Props) {
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const [form, setForm] = useState<FormData>({
    name: '',
    service: SERVICES[0],
    priority: 'Normal',
    notes: ''
  });

  // Debounced search
  useEffect(() => {
    if (!isNewPatient && searchQuery.trim().length >= 2) {
      setIsSearching(true);
      
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await window.api.searchPatients(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setSelectedPatient(null);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, isNewPatient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNewPatient) {
      // New patient validation
      if (!form.name.trim()) {
        alert('Please enter patient name');
        return;
      }
      
      onSubmit(form);
    } else {
      // Existing patient validation
      if (!selectedPatient) {
        alert('Please select a patient from search results');
        return;
      }
      
      onSubmit({
        ...form,
        patientId: selectedPatient.id,
        name: selectedPatient.name
      });
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchQuery(patient.name);
    setSearchResults([]);
  };

  const clearSelection = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ===== PATIENT TYPE SELECTION ===== */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-slate-700 mb-3">Patient Type</label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`cursor-pointer border rounded-lg p-4 transition-all ${isNewPatient ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input 
              type="radio" 
              name="patientType"
              checked={isNewPatient} 
              onChange={() => {
                setIsNewPatient(true);
                clearSelection();
              }} 
              className="sr-only"
            />
            <div className="flex flex-col items-center">
              <User className="mb-2 text-slate-600" size={24} />
              <span className="font-medium text-slate-700">New Patient</span>
              <span className="text-xs text-slate-500 mt-1">First time visit</span>
            </div>
          </label>
          
          <label className={`cursor-pointer border rounded-lg p-4 transition-all ${!isNewPatient ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input 
              type="radio" 
              name="patientType"
              checked={!isNewPatient} 
              onChange={() => setIsNewPatient(false)} 
              className="sr-only"
            />
            <div className="flex flex-col items-center">
              <Search className="mb-2 text-slate-600" size={24} />
              <span className="font-medium text-slate-700">Existing Patient</span>
              <span className="text-xs text-slate-500 mt-1">Returning visit</span>
            </div>
          </label>
        </div>
      </div>

      {/* Full Name - Show for new patients */}
      {isNewPatient && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="e.g. John Doe"
              required
            />
          </div>
        </div>
      )}

      {/* Patient Search - Show for existing patients */}
      {!isNewPatient && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Search Patient *
            {selectedPatient && (
              <span className="ml-2 text-xs font-normal text-emerald-600">
                ✓ {selectedPatient.name} selected
              </span>
            )}
          </label>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="Type patient name (min. 2 characters)..."
              disabled={!!selectedPatient}
            />
            
            {selectedPatient && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results */}
          {!selectedPatient && searchQuery.length >= 2 && (
            <div className="mt-2 border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-slate-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500 mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {searchResults.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full text-left p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-slate-800">{patient.name}</div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {patient.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Last visit: {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500">
                  No patients found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Service Required</label>
        <div className="relative">
          <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select
            value={form.service}
            onChange={(e) => updateField('service', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white appearance-none"
          >
            {SERVICES.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority Level */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Priority Level</label>
        <div className="grid grid-cols-3 gap-3">
          {['Normal', 'Urgent', 'Critical'].map((level) => {
            const isSelected = form.priority === level;
            const colorClass = isSelected 
              ? level === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : level === 'Urgent' ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-red-50 text-red-700 border-red-200'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50';
            
            return (
              <label key={level} className="cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  className="peer sr-only"
                  checked={isSelected}
                  onChange={() => updateField('priority', level)}
                />
                <div className={`text-center py-2 rounded-lg border text-sm font-medium transition-all ${colorClass}`}>
                  {level}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          placeholder="e.g. Cannot generate trust, specific requirements, etc."
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-lg shadow-brand-500/20 transition-all"
          disabled={!isNewPatient && !selectedPatient}
        >
          {isNewPatient ? 'Create Ticket' : `Add Ticket for ${selectedPatient?.name || 'Patient'}`}
        </button>
      </div>
    </form>
  );
}
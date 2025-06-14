import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, Mail, Calendar } from 'lucide-react';

const PatientsListModal = ({ isOpen, onClose }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadPatients();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = patients.filter(patient =>
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone.includes(searchTerm)
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    const loadPatients = async () => {
        setLoading(true);
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock patient data (this would come from your API service)
        const mockPatients = [
            {
                id: '1',
                name: 'John Smith',
                email: 'john.smith@email.com',
                phone: '(555) 123-4567',
                dob: '1985-06-15',
                address: '123 Main St, Anytown, ST 12345',
                emergencyContact: 'Jane Smith',
                emergencyPhone: '(555) 987-6543',
                insurance: 'Blue Cross Blue Shield',
                allergies: 'None known',
                medications: 'Lisinopril 10mg daily',
                createdAt: '2024-12-01T10:00:00Z',
                lastVisit: '2024-12-10',
                status: 'Active'
            },
            {
                id: '2',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                phone: '(555) 234-5678',
                dob: '1990-03-22',
                address: '456 Oak Ave, Somewhere, ST 67890',
                emergencyContact: 'Mike Johnson',
                emergencyPhone: '(555) 876-5432',
                insurance: 'Aetna',
                allergies: 'Penicillin',
                medications: 'Birth control',
                createdAt: '2024-12-02T14:30:00Z',
                lastVisit: '2024-12-08',
                status: 'Active'
            },
            {
                id: '3',
                name: 'Michael Brown',
                email: 'michael.brown@email.com',
                phone: '(555) 345-6789',
                dob: '1978-11-08',
                address: '789 Pine Dr, Elsewhere, ST 13579',
                emergencyContact: 'Lisa Brown',
                emergencyPhone: '(555) 765-4321',
                insurance: 'UnitedHealth',
                allergies: 'Shellfish',
                medications: 'Metformin 500mg twice daily',
                createdAt: '2024-12-03T09:15:00Z',
                lastVisit: '2024-12-05',
                status: 'Active'
            },
            {
                id: '4',
                name: 'Emily Davis',
                email: 'emily.davis@email.com',
                phone: '(555) 456-7890',
                dob: '1992-09-14',
                address: '321 Elm St, Anywhere, ST 24680',
                emergencyContact: 'Tom Davis',
                emergencyPhone: '(555) 654-3210',
                insurance: 'Cigna',
                allergies: 'Latex',
                medications: 'Synthroid 50mcg daily',
                createdAt: '2024-12-04T11:20:00Z',
                lastVisit: '2024-12-12',
                status: 'Active'
            },
            {
                id: '5',
                name: 'Robert Wilson',
                email: 'robert.wilson@email.com',
                phone: '(555) 567-8901',
                dob: '1975-01-30',
                address: '654 Maple Ave, Somewhere, ST 97531',
                emergencyContact: 'Carol Wilson',
                emergencyPhone: '(555) 543-2109',
                insurance: 'Medicare',
                allergies: 'Aspirin',
                medications: 'Atorvastatin 20mg daily',
                createdAt: '2024-12-05T16:45:00Z',
                lastVisit: '2024-12-11',
                status: 'Active'
            }
        ];

        setPatients(mockPatients);
        setLoading(false);
    };

    const calculateAge = (dob) => {
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Current Patients</h2>
                            <p className="text-blue-100 text-sm">
                                {loading ? 'Loading...' : `${filteredPatients.length} patients found`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search patients by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'Try adjusting your search terms' : 'No patients in the system yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">{patient.name}</h3>
                                                <p className="text-gray-500 text-sm">Age {calculateAge(patient.dob)}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                                            {patient.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 text-sm">{patient.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 text-sm">{patient.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 text-sm">Last visit: {formatDate(patient.lastVisit)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Insurance</p>
                                                <p className="text-sm font-medium text-gray-900">{patient.insurance}</p>
                                            </div>
                                            <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredPatients.length} of {patients.length} patients
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Add New Patient
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientsListModal;
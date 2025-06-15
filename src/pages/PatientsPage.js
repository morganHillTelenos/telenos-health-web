import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, User, Mail, Phone, Calendar, Edit, Eye } from 'lucide-react';

const PatientsPage = ({ onNavigateToPatient, onNavigateToNewPatient }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadPatients();
    }, []);

    useEffect(() => {
        let filtered = patients;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(patient =>
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone.includes(searchTerm)
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(patient =>
                patient.status.toLowerCase() === filterStatus.toLowerCase()
            );
        }

        // Sort patients
        filtered = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'lastVisit':
                    return new Date(b.lastVisit) - new Date(a.lastVisit);
                case 'dateAdded':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        setFilteredPatients(filtered);
    }, [searchTerm, patients, sortBy, filterStatus]);

    const loadPatients = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

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
            },
            {
                id: '6',
                name: 'Lisa Anderson',
                email: 'lisa.anderson@email.com',
                phone: '(555) 678-9012',
                dob: '1988-07-25',
                address: '987 Cedar Ln, Newtown, ST 86420',
                emergencyContact: 'Paul Anderson',
                emergencyPhone: '(555) 432-1098',
                insurance: 'Humana',
                allergies: 'Peanuts',
                medications: 'None',
                createdAt: '2024-11-28T13:45:00Z',
                lastVisit: '2024-11-30',
                status: 'Inactive'
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
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const handlePatientClick = (patientId) => {
        onNavigateToPatient(patientId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg font-semibold text-gray-900">Loading Patients...</div>
                    <div className="text-sm text-gray-500">Please wait while we fetch patient data</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-6 py-8 pt-20">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Management</h1>
                            <p className="text-gray-600 text-lg">Manage and view all patient records</p>
                        </div>
                        <button
                            onClick={onNavigateToNewPatient}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Patient
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{patients.length}</div>
                        <div className="text-gray-600 text-sm">Total Patients</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <User className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {patients.filter(p => p.status === 'Active').length}
                        </div>
                        <div className="text-gray-600 text-sm">Active Patients</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {patients.filter(p => {
                                const lastVisit = new Date(p.lastVisit);
                                const oneWeekAgo = new Date();
                                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                                return lastVisit >= oneWeekAgo;
                            }).length}
                        </div>
                        <div className="text-gray-600 text-sm">Recent Visits</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Plus className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {patients.filter(p => {
                                const created = new Date(p.createdAt);
                                const oneMonthAgo = new Date();
                                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                                return created >= oneMonthAgo;
                            }).length}
                        </div>
                        <div className="text-gray-600 text-sm">New This Month</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
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

                        {/* Sort */}
                        <div className="flex gap-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="lastVisit">Sort by Last Visit</option>
                                <option value="dateAdded">Sort by Date Added</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Patients List */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Patient Records ({filteredPatients.length})
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Filter className="w-4 h-4" />
                                {searchTerm && `Filtered by "${searchTerm}"`}
                                {filterStatus !== 'all' && ` • ${filterStatus} patients`}
                            </div>
                        </div>
                    </div>

                    {filteredPatients.length === 0 ? (
                        <div className="p-12 text-center">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                            <p className="text-gray-500">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Start by adding your first patient'
                                }
                            </p>
                            {!searchTerm && filterStatus === 'all' && (
                                <button
                                    onClick={onNavigateToNewPatient}
                                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add First Patient
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="p-6 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => handlePatientClick(patient.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">{patient.name}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        Age {calculateAge(patient.dob)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-4 h-4" />
                                                        {patient.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-4 h-4" />
                                                        {patient.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    Last Visit: {formatDate(patient.lastVisit)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Insurance: {patient.insurance}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                                                {patient.status}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePatientClick(patient.id);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        alert('Edit patient functionality would go here');
                                                    }}
                                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                    title="Edit Patient"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientsPage;
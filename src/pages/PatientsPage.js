import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, User, Mail, Phone, Calendar, Edit, Eye } from 'lucide-react';
import { apiService } from '../services/api';

const PatientsPage = ({ onNavigateToPatient, onNavigateToNewPatient }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [sortBy, setSortBy] = useState('firstName'); // Changed from 'name' to 'firstName'
    const [filterStatus, setFilterStatus] = useState('all');
    const [error, setError] = useState('');

    useEffect(() => {
        loadPatients();
    }, []);

    useEffect(() => {
        let filtered = patients;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(patient =>
                `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (patient.phone && patient.phone.includes(searchTerm))
            );
        }

        // Filter by status (for now, all patients are considered 'active')
        if (filterStatus !== 'all') {
            // We can add status logic later when we add status field to the schema
            filtered = filtered.filter(patient => true); // All patients for now
        }

        // Sort patients
        filtered = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'firstName':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'email':
                    return a.email.localeCompare(b.email);
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
        setError('');

        try {
            console.log('Loading patients from AWS...');
            const result = await apiService.getPatients();
            console.log('Patients loaded:', result);

            // Handle the AWS GraphQL response format
            const patientsData = result?.data || [];
            setPatients(patientsData);

            if (patientsData.length === 0) {
                console.log('No patients found - this is normal for a new account');
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            setError('Failed to load patients. Please try again.');

            // For development, you can uncomment this to use mock data as fallback
            // setPatients(getMockPatients());
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format patient display name
    const getPatientDisplayName = (patient) => {
        return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient';
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Helper function to get status styling
    const getStatusStyle = (status = 'active') => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
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
                    <div className="text-sm text-gray-500">Fetching data from AWS backend...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-6 py-8 pt-20">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Management</h1>
                        <p className="text-gray-600 text-lg">Manage and view all patient records</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadPatients}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            🔄 Refresh
                        </button>
                        <button
                            onClick={onNavigateToNewPatient}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Patient
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                            <button
                                onClick={loadPatients}
                                className="ml-auto text-red-600 hover:text-red-800 underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Total Patients</div>
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{patients.length}</div>
                        <div className="text-sm text-gray-500">
                            {patients.length === 0 ? 'No patients yet' : 'Active records'}
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">New This Month</div>
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {patients.filter(p => {
                                const created = new Date(p.createdAt);
                                const now = new Date();
                                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                            }).length}
                        </div>
                        <div className="text-sm text-gray-500">This month</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Active Patients</div>
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{patients.length}</div>
                        <div className="text-sm text-gray-500">Currently active</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Database</div>
                            <div className="w-5 h-5 text-green-600">🔗</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">AWS Connected</div>
                        <div className="text-sm text-gray-500">Real-time data</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search patients by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="firstName">Sort by Name</option>
                                <option value="email">Sort by Email</option>
                                <option value="dateAdded">Sort by Date Added</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Patients</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Patients List */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {patients.length === 0 ? 'No Patients Yet' : 'No Patients Found'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {patients.length === 0
                                    ? 'Start by adding your first patient to the system.'
                                    : 'Try adjusting your search terms or filters.'
                                }
                            </p>
                            {patients.length === 0 && (
                                <button
                                    onClick={onNavigateToNewPatient}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Patient
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date of Birth</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Added</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPatients.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            onClick={() => handlePatientClick(patient.id)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {getPatientDisplayName(patient)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {patient.id.slice(-8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        {patient.email}
                                                    </div>
                                                    {patient.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="w-4 h-4 text-gray-400" />
                                                            {patient.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(patient.dateOfBirth)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(patient.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle('active')}`}>
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePatientClick(patient.id);
                                                        }}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePatientClick(patient.id); // This will now open the real patient detail page
                                                        }}
                                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Edit Patient"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Debug Info (remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                        <h4 className="font-semibold mb-2">Debug Info:</h4>
                        <p>Total patients loaded: {patients.length}</p>
                        <p>Filtered patients: {filteredPatients.length}</p>
                        <p>Search term: "{searchTerm}"</p>
                        <p>Sort by: {sortBy}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientsPage;
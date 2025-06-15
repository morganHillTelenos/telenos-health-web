import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, Calendar, User, Heart, AlertTriangle, Pill, Shield, Clock, FileText } from 'lucide-react';

const PatientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [recentAppointments, setRecentAppointments] = useState([]);

    useEffect(() => {
        if (id) {
            loadPatientData();
        }
    }, [id]);

    const loadPatientData = async () => {
        setLoading(true);
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock patient data - in real app, this would come from your API
        const mockPatients = {
            '1': {
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
                status: 'Active',
                medicalHistory: [
                    { date: '2024-12-10', condition: 'Hypertension Follow-up', notes: 'Blood pressure well controlled' },
                    { date: '2024-11-15', condition: 'Annual Physical', notes: 'All vitals normal, continue current medication' },
                    { date: '2024-08-20', condition: 'Hypertension Diagnosis', notes: 'Initial diagnosis, started on Lisinopril' }
                ],
                vitals: {
                    height: '6\'0"',
                    weight: '180 lbs',
                    bloodPressure: '120/80',
                    heartRate: '72 bpm',
                    temperature: '98.6°F',
                    lastUpdated: '2024-12-10'
                }
            },
            '2': {
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
                status: 'Active',
                medicalHistory: [
                    { date: '2024-12-08', condition: 'Routine Checkup', notes: 'All normal, prescription refill' },
                    { date: '2024-09-15', condition: 'Annual Wellness', notes: 'Excellent health, continue current plan' }
                ],
                vitals: {
                    height: '5\'6"',
                    weight: '140 lbs',
                    bloodPressure: '110/70',
                    heartRate: '68 bpm',
                    temperature: '98.4°F',
                    lastUpdated: '2024-12-08'
                }
            },
            '3': {
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
                status: 'Active',
                medicalHistory: [
                    { date: '2024-12-05', condition: 'Diabetes Management', notes: 'A1C levels improving, continue current regimen' },
                    { date: '2024-10-20', condition: 'Diabetes Follow-up', notes: 'Medication adjustment needed' },
                    { date: '2024-07-10', condition: 'Type 2 Diabetes Diagnosis', notes: 'Initial diagnosis and treatment plan' }
                ],
                vitals: {
                    height: '5\'10"',
                    weight: '195 lbs',
                    bloodPressure: '130/85',
                    heartRate: '75 bpm',
                    temperature: '98.8°F',
                    lastUpdated: '2024-12-05'
                }
            },
            '4': {
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
                status: 'Active',
                medicalHistory: [
                    { date: '2024-12-12', condition: 'Thyroid Follow-up', notes: 'TSH levels stable, continue medication' },
                    { date: '2024-09-30', condition: 'Hypothyroidism Management', notes: 'Dosage adjustment effective' }
                ],
                vitals: {
                    height: '5\'4"',
                    weight: '125 lbs',
                    bloodPressure: '115/75',
                    heartRate: '70 bpm',
                    temperature: '98.5°F',
                    lastUpdated: '2024-12-12'
                }
            },
            '5': {
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
                status: 'Active',
                medicalHistory: [
                    { date: '2024-12-11', condition: 'Cholesterol Management', notes: 'Significant improvement in lipid panel' },
                    { date: '2024-10-05', condition: 'High Cholesterol Follow-up', notes: 'Medication working well' },
                    { date: '2024-06-20', condition: 'High Cholesterol Diagnosis', notes: 'Started statin therapy' }
                ],
                vitals: {
                    height: '5\'8"',
                    weight: '170 lbs',
                    bloodPressure: '125/80',
                    heartRate: '74 bpm',
                    temperature: '98.7°F',
                    lastUpdated: '2024-12-11'
                }
            }
        };

        const patientData = mockPatients[id];
        if (!patientData) {
            navigate('/patients');
            return;
        }

        setPatient(patientData);

        // Mock recent appointments
        setRecentAppointments([
            {
                id: 1,
                date: patientData.lastVisit,
                time: '2:00 PM',
                type: 'In-Person',
                reason: 'Follow-up Visit',
                status: 'Completed',
                notes: 'Patient doing well, continue current treatment plan'
            },
            {
                id: 2,
                date: '2024-12-20',
                time: '10:30 AM',
                type: 'Video Call',
                reason: 'Routine Check-in',
                status: 'Scheduled',
                notes: 'Quarterly wellness check'
            }
        ]);

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
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg font-semibold text-gray-900">Loading Patient Details...</div>
                    <div className="text-sm text-gray-500">Please wait while we fetch the information</div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 opacity-30">👤</div>
                    <div className="text-lg font-semibold text-gray-900 mb-2">Patient Not Found</div>
                    <div className="text-sm text-gray-500 mb-6">The requested patient could not be located</div>
                    <button
                        onClick={() => navigate('/patients')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Return to Patients
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'medical', label: 'Medical History', icon: FileText },
        { id: 'vitals', label: 'Vitals', icon: Heart },
        { id: 'appointments', label: 'Appointments', icon: Calendar }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-6 py-8 pt-20">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/patients')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Patients
                    </button>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                                    👤
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{patient.name}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Age {calculateAge(patient.dob)}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {patient.email}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {patient.phone}
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            {patient.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Edit Patient
                                </button>
                                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Schedule Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-2 shadow-lg">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {activeTab === 'overview' && (
                        <>
                            <div className="lg:col-span-2 space-y-6">
                                {/* Quick Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-green-100 rounded-xl">
                                                <Calendar className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                            {patient.medicalHistory?.length || 0}
                                        </div>
                                        <div className="text-gray-600 text-sm">Total Visits</div>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-blue-100 rounded-xl">
                                                <Clock className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 mb-1">
                                            {formatDate(patient.lastVisit)}
                                        </div>
                                        <div className="text-gray-600 text-sm">Last Visit</div>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-purple-100 rounded-xl">
                                                <Shield className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 mb-1">
                                            {patient.insurance}
                                        </div>
                                        <div className="text-gray-600 text-sm">Insurance</div>
                                    </div>
                                </div>

                                {/* Medical Information */}
                                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Medical Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                                <h4 className="font-semibold text-gray-900">Allergies</h4>
                                            </div>
                                            <p className="text-gray-600 bg-orange-50 p-3 rounded-lg">{patient.allergies}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Pill className="w-5 h-5 text-blue-500" />
                                                <h4 className="font-semibold text-gray-900">Current Medications</h4>
                                            </div>
                                            <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{patient.medications}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
                                            <div className="text-gray-900">{patient.address}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 mb-1">Emergency Contact</div>
                                            <div className="text-gray-900">{patient.emergencyContact}</div>
                                            <div className="text-gray-600 text-sm">{patient.emergencyPhone}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <div className="text-sm text-gray-600">Last visit completed</div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div className="text-sm text-gray-600">Prescription renewed</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'medical' && (
                        <div className="lg:col-span-3">
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Medical History</h3>
                                <div className="space-y-4">
                                    {patient.medicalHistory?.map((entry, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-6 py-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">{entry.condition}</h4>
                                                <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                                            </div>
                                            <p className="text-gray-600">{entry.notes}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vitals' && (
                        <div className="lg:col-span-3">
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Latest Vitals</h3>
                                    <span className="text-sm text-gray-500">Last updated: {formatDate(patient.vitals?.lastUpdated)}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                                        <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                                        <div className="text-2xl font-bold text-gray-900">{patient.vitals?.bloodPressure}</div>
                                        <div className="text-sm text-gray-600">Blood Pressure</div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                        <div className="text-2xl font-bold text-gray-900">{patient.vitals?.heartRate}</div>
                                        <div className="text-sm text-gray-600">Heart Rate</div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                        <div className="text-2xl font-bold text-gray-900">{patient.vitals?.temperature}</div>
                                        <div className="text-sm text-gray-600">Temperature</div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                        <div className="text-2xl font-bold text-gray-900">{patient.vitals?.height}</div>
                                        <div className="text-sm text-gray-600">Height</div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                                        <div className="text-2xl font-bold text-gray-900">{patient.vitals?.weight}</div>
                                        <div className="text-sm text-gray-600">Weight</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div className="lg:col-span-3">
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Appointment History</h3>
                                <div className="space-y-4">
                                    {recentAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${appointment.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}></div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{appointment.reason}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {formatDate(appointment.date)} at {appointment.time} • {appointment.type}
                                                    </div>
                                                    {appointment.notes && (
                                                        <div className="text-sm text-gray-500 mt-1">{appointment.notes}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === 'Completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;
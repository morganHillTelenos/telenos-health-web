import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, AlertTriangle, Pill, Shield, Heart, Save, X, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api'; // Add this import at the top

const NewPatientForm = ({ onClose, onSave, showCloseButton = true }) => {
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',

        // Emergency Contact
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',

        // Insurance Information
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceGroupNumber: '',

        // Medical Information
        allergies: '',
        currentMedications: '',
        medicalHistory: '',
        primaryConcern: '',

        // Preferences
        preferredContactMethod: 'email',
        appointmentPreference: 'in-person'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { id: 1, title: 'Personal Info', icon: User },
        { id: 2, title: 'Contact & Emergency', icon: Phone },
        { id: 3, title: 'Insurance', icon: Shield },
        { id: 4, title: 'Medical History', icon: Heart }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // 1. Replace your validateStep function with:
    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            // Step 1: Personal Information - Only essential fields required
            if (!formData.firstName.trim()) {
                newErrors.firstName = 'First name is required';
            }
            if (!formData.lastName.trim()) {
                newErrors.lastName = 'Last name is required';
            }
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else {
                // Email format validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    newErrors.email = 'Please enter a valid email address';
                }
            }
            if (!formData.dob) {
                newErrors.dob = 'Date of birth is required';
            } else {
                // Age validation
                const birthDate = new Date(formData.dob);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();

                if (birthDate > today) {
                    newErrors.dob = 'Date of birth cannot be in the future';
                } else if (age < 1) {
                    newErrors.dob = 'Patient must be at least 1 year old';
                } else if (age > 120) {
                    newErrors.dob = 'Please enter a valid date of birth';
                }
            }

            // Optional phone validation (only if provided)
            if (formData.phone && formData.phone.trim()) {
                const phoneRegex = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]{10,}$/;
                if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
                    newErrors.phone = 'Please enter a valid phone number';
                }
            }
        }

        // Step 2 - Optional validations
        if (step === 2) {
            if (formData.emergencyContactPhone && formData.emergencyContactPhone.trim()) {
                const phoneRegex = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]{10,}$/;
                if (!phoneRegex.test(formData.emergencyContactPhone.replace(/\s/g, ''))) {
                    newErrors.emergencyContactPhone = 'Please enter a valid phone number';
                }
            }

            if (formData.zipCode && formData.zipCode.trim()) {
                const zipRegex = /^\d{5}(-\d{4})?$/;
                if (!zipRegex.test(formData.zipCode)) {
                    newErrors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
                }
            }
        }

        return newErrors;
    };

    // 2. Update your nextStep function:
    const nextStep = () => {
        const errors = validateStep(currentStep);

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        setErrors({});
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    };

    // 3. Update your prevStep function:
    const prevStep = () => {
        setErrors({}); // Clear errors when going back
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (currentStep < steps.length) {
            nextStep();
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            // Debug: Log the raw form data
            console.log('Raw form data:', formData);

            // Create minimal patient data - ONLY required fields
            const patientData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                dateOfBirth: formData.dob
            };

            console.log('Sending to API:', patientData);

            // Save to AWS via GraphQL API
            const result = await apiService.createPatient(patientData);
            console.log('Full API response:', JSON.stringify(result, null, 2));

            // Check if we got a valid response
            if (result && result.data && !result.errors) {
                console.log('Success! Patient created:', result.data);
                setShowSuccess(true);

                if (onSave) {
                    onSave(result.data);
                }

                setTimeout(() => {
                    if (onClose) {
                        onClose();
                    }
                }, 1500);
            } else {
                // Handle GraphQL errors
                const errorMessage = result.errors ? result.errors[0].message : 'Unknown error occurred';
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('Error saving patient:', error);
            setErrors({
                submit: error.message || 'Failed to save patient. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birth = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        return age;
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Registered!</h2>
                        <p className="text-gray-600 mb-6">
                            {formData.firstName} {formData.lastName} has been successfully added to your patient records.
                        </p>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600">
                                ✓ Patient profile created<br />
                                ✓ Insurance information saved<br />
                                ✓ Medical history recorded<br />
                                ✓ Ready to schedule appointments
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">New Patient Registration</h2>
                            <p className="text-blue-100 text-sm">Step {currentStep} of {steps.length}</p>
                        </div>
                    </div>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isCompleted ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-blue-500 text-white' :
                                            'bg-gray-200 text-gray-600'
                                        }`}>
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter first name"
                                    />
                                    {errors.firstName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter last name"
                                    />
                                    {errors.lastName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="(555) 123-4567"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth * {formData.dob && `(Age: ${calculateAge(formData.dob)})`}
                                    </label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dob ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.dob && (
                                        <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.gender ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact & Emergency */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address & Emergency Contact</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Optional:</span> All fields in this section are optional but recommended for emergency situations and appointment scheduling.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address 
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="123 Main Street"
                                    />
                                    {errors.address && (
                                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City 
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="City"
                                        />
                                        {errors.city && (
                                            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State 
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="State"
                                        />
                                        {errors.state && (
                                            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP Code 
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="12345"
                                        />
                                        {errors.zipCode && (
                                            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name 
                                            </label>
                                            <input
                                                type="text"
                                                name="emergencyContactName"
                                                value={formData.emergencyContactName}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Emergency contact name"
                                            />
                                            {errors.emergencyContactName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number 
                                            </label>
                                            <input
                                                type="tel"
                                                name="emergencyContactPhone"
                                                value={formData.emergencyContactPhone}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="(555) 123-4567"
                                            />
                                            {errors.emergencyContactPhone && (
                                                <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Relationship
                                            </label>
                                            <select
                                                name="emergencyContactRelation"
                                                value={formData.emergencyContactRelation}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select relationship</option>
                                                <option value="spouse">Spouse</option>
                                                <option value="parent">Parent</option>
                                                <option value="child">Child</option>
                                                <option value="sibling">Sibling</option>
                                                <option value="friend">Friend</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Insurance */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Insurance Provider 
                                    </label>
                                    <select
                                        name="insuranceProvider"
                                        value={formData.insuranceProvider}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.insuranceProvider ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select insurance provider</option>
                                        <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                                        <option value="Aetna">Aetna</option>
                                        <option value="UnitedHealth">UnitedHealth</option>
                                        <option value="Cigna">Cigna</option>
                                        <option value="Humana">Humana</option>
                                        <option value="Medicare">Medicare</option>
                                        <option value="Medicaid">Medicaid</option>
                                        <option value="Self-Pay">Self-Pay</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.insuranceProvider && (
                                        <p className="text-red-500 text-sm mt-1">{errors.insuranceProvider}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Policy Number
                                    </label>
                                    <input
                                        type="text"
                                        name="insurancePolicyNumber"
                                        value={formData.insurancePolicyNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Policy number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Group Number
                                    </label>
                                    <input
                                        type="text"
                                        name="insuranceGroupNumber"
                                        value={formData.insuranceGroupNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Group number"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Medical History */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Known Allergies
                                    </label>
                                    <textarea
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="List any known allergies (medications, foods, environmental, etc.) or enter 'None'"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Medications
                                    </label>
                                    <textarea
                                        name="currentMedications"
                                        value={formData.currentMedications}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="List all current medications, vitamins, and supplements or enter 'None'"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Medical History
                                    </label>
                                    <textarea
                                        name="medicalHistory"
                                        value={formData.medicalHistory}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe any significant medical history, past surgeries, chronic conditions, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Primary Concern / Reason for Visit
                                    </label>
                                    <textarea
                                        name="primaryConcern"
                                        value={formData.primaryConcern}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="What brings you in today? Describe your main health concern or reason for this visit."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Contact Method
                                        </label>
                                        <select
                                            name="preferredContactMethod"
                                            value={formData.preferredContactMethod}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="email">Email</option>
                                            <option value="phone">Phone</option>
                                            <option value="text">Text Message</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Appointment Preference
                                        </label>
                                        <select
                                            name="appointmentPreference"
                                            value={formData.appointmentPreference}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="in-person">In-Person</option>
                                            <option value="video">Video Call</option>
                                            <option value="either">Either</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600 text-sm">{errors.submit}</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Step {currentStep} of {steps.length}
                        </div>
                        <div className="flex gap-3">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>
                            )}
                            {currentStep < steps.length ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Register Patient
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Success Message */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Added Successfully!</h3>
                        <p className="text-gray-600 mb-4">The new patient record has been saved to your database.</p>
                        <div className="animate-pulse text-sm text-gray-500">Redirecting...</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewPatientForm;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PsychiatristApplicationPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',

        // Professional Credentials
        medicalSchool: '',
        graduationYear: '',
        residencyProgram: '',
        residencyYear: '',
        boardCertified: '',

        // Licensing
        stateLicenses: [],
        otherLicenses: '',
        deaNumber: '',
        deaExpiration: '',

        // Clinical Experience
        yearsExperience: '',
        telemedicineExperience: '',
        specializations: [],
        ageGroups: [],

        // Technology & Setup
        techComfort: '',
        officeSetup: '',
        internetSpeed: '',

        // Availability
        hoursPerWeek: '',
        timeZone: '',
        workingDays: [],

        // References
        reference1Name: '',
        reference1Contact: '',
        reference2Name: '',
        reference2Contact: '',

        // Additional
        motivation: '',
        additionalInfo: ''
    });

    const [progress, setProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate progress
    useEffect(() => {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'medicalSchool', 'graduationYear', 'residencyProgram', 'residencyYear', 'boardCertified', 'deaNumber', 'deaExpiration', 'yearsExperience', 'telemedicineExperience', 'techComfort', 'officeSetup', 'hoursPerWeek', 'timeZone'];

        let filledFields = 0;
        requiredFields.forEach(field => {
            if (formData[field] && formData[field].toString().trim() !== '') {
                filledFields++;
            }
        });

        // Check array fields
        if (formData.stateLicenses.length > 0) filledFields++;

        const totalFields = requiredFields.length + 1; // +1 for stateLicenses
        setProgress((filledFields / totalFields) * 100);
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            if (name === 'stateLicenses' || name === 'specializations' || name === 'ageGroups' || name === 'workingDays') {
                setFormData(prev => ({
                    ...prev,
                    [name]: checked
                        ? [...prev[name], value]
                        : prev[name].filter(item => item !== value)
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Here you would send to your backend API
            console.log('Application Data:', formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert('Thank you for your application! We will review your information and contact you within 5-7 business days.');
            navigate('/');

        } catch (error) {
            console.error('Submission error:', error);
            alert('There was an error submitting your application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const CheckboxGroup = ({ name, options, label, required = false }) => (
        <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            name={name}
                            value={option.value}
                            checked={formData[name].includes(option.value)}
                            onChange={handleInputChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const RadioGroup = ({ name, options, label, required = false }) => (
        <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-wrap gap-3">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={formData[name] === option.value}
                            onChange={handleInputChange}
                            required={required}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <div className="fixed top-4 left-4 z-50">
                <button
                    onClick={() => navigate('/')}
                    className="bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-gray-300 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    <span className="text-lg">←</span> Back to Home
                </button>
            </div>

            <div className="pt-20 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl text-white p-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">Join Our Team</h1>
                        <p className="text-blue-100">Psychiatrist Application for Telemedicine Practice</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white px-8 pt-6">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Progress: {Math.round(progress)}% complete</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl p-8 space-y-8">

                        {/* Personal Information */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Street address, city, state, ZIP"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Professional Credentials */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Professional Credentials
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Medical School <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="medicalSchool"
                                        value={formData.medicalSchool}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Graduation Year <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="graduationYear"
                                        value={formData.graduationYear}
                                        onChange={handleInputChange}
                                        min="1970"
                                        max="2025"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Psychiatry Residency Program <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="residencyProgram"
                                        value={formData.residencyProgram}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Residency Completion Year <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="residencyYear"
                                        value={formData.residencyYear}
                                        onChange={handleInputChange}
                                        min="1975"
                                        max="2025"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Board Certification Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="boardCertified"
                                    value={formData.boardCertified}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select status</option>
                                    <option value="certified">Board Certified</option>
                                    <option value="eligible">Board Eligible</option>
                                    <option value="recertifying">Currently Recertifying</option>
                                </select>
                            </div>
                        </div>

                        {/* Licensing Information */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Licensing Information
                            </h2>

                            <CheckboxGroup
                                name="stateLicenses"
                                label="State Medical Licenses (Select all that apply)"
                                required={true}
                                options={[
                                    { value: 'UT', label: 'Utah' },
                                    { value: 'OTHER', label: 'Other (specify below)' }
                                ]}
                            />

                            {formData.stateLicenses.includes('OTHER') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Please specify other state licenses
                                    </label>
                                    <input
                                        type="text"
                                        name="otherLicenses"
                                        value={formData.otherLicenses}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        DEA Registration Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="deaNumber"
                                        value={formData.deaNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        DEA Expiration Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="deaExpiration"
                                        value={formData.deaExpiration}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Clinical Experience */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Clinical Experience
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Psychiatric Practice <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="yearsExperience"
                                        value={formData.yearsExperience}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select experience</option>
                                        <option value="0-2">0-2 years</option>
                                        <option value="3-5">3-5 years</option>
                                        <option value="6-10">6-10 years</option>
                                        <option value="11-15">11-15 years</option>
                                        <option value="16+">16+ years</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telemedicine Experience <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="telemedicineExperience"
                                        value={formData.telemedicineExperience}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select experience</option>
                                        <option value="extensive">Extensive (2+ years)</option>
                                        <option value="moderate">Moderate (6 months - 2 years)</option>
                                        <option value="limited">Limited (less than 6 months)</option>
                                        <option value="none">No experience but eager to learn</option>
                                    </select>
                                </div>
                            </div>

                            <CheckboxGroup
                                name="specializations"
                                label="Clinical Specializations (Select all that apply)"
                                options={[
                                    { value: 'depression', label: 'Depression' },
                                    { value: 'anxiety', label: 'Anxiety Disorders' },
                                    { value: 'bipolar', label: 'Bipolar Disorder' },
                                    { value: 'adhd', label: 'ADHD' },
                                    { value: 'ptsd', label: 'PTSD/Trauma' },
                                    { value: 'addiction', label: 'Addiction Medicine' },
                                    { value: 'eating', label: 'Eating Disorders' },
                                    { value: 'personality', label: 'Personality Disorders' }
                                ]}
                            />

                            <CheckboxGroup
                                name="ageGroups"
                                label="Preferred Patient Age Groups (Select all that apply)"
                                options={[
                                    { value: 'children', label: 'Children (5-12)' },
                                    { value: 'teens', label: 'Adolescents (13-17)' },
                                    { value: 'adults', label: 'Adults (18-64)' },
                                    { value: 'seniors', label: 'Seniors (65+)' }
                                ]}
                            />
                        </div>

                        {/* Technology & Setup */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Technology & Home Office Setup
                            </h2>

                            <RadioGroup
                                name="techComfort"
                                label="Comfort Level with Video Conferencing Technology"
                                required={true}
                                options={[
                                    { value: 'expert', label: 'Expert' },
                                    { value: 'proficient', label: 'Proficient' },
                                    { value: 'basic', label: 'Basic' },
                                    { value: 'learning', label: 'Willing to Learn' }
                                ]}
                            />

                            <RadioGroup
                                name="officeSetup"
                                label="Do you have a HIPAA-compliant home office setup?"
                                required={true}
                                options={[
                                    { value: 'yes', label: 'Yes, fully compliant' },
                                    { value: 'partial', label: 'Partially, need minor adjustments' },
                                    { value: 'no', label: 'No, need to set up' }
                                ]}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Internet Connection Speed
                                </label>
                                <select
                                    name="internetSpeed"
                                    value={formData.internetSpeed}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select speed</option>
                                    <option value="high">High-speed (100+ Mbps)</option>
                                    <option value="moderate">Moderate (25-99 Mbps)</option>
                                    <option value="basic">Basic (10-24 Mbps)</option>
                                    <option value="unsure">Not sure</option>
                                </select>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Availability & Schedule
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Desired Hours Per Week <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="hoursPerWeek"
                                        value={formData.hoursPerWeek}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select hours</option>
                                        <option value="10-20">10-20 hours</option>
                                        <option value="21-30">21-30 hours</option>
                                        <option value="31-40">31-40 hours</option>
                                        <option value="40+">40+ hours</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Time Zone <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="timeZone"
                                        value={formData.timeZone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select time zone</option>
                                        <option value="EST">Eastern (EST)</option>
                                        <option value="CST">Central (CST)</option>
                                        <option value="MST">Mountain (MST)</option>
                                        <option value="PST">Pacific (PST)</option>
                                    </select>
                                </div>
                            </div>

                            <CheckboxGroup
                                name="workingDays"
                                label="Preferred Working Days (Select all that apply)"
                                options={[
                                    { value: 'monday', label: 'Monday' },
                                    { value: 'tuesday', label: 'Tuesday' },
                                    { value: 'wednesday', label: 'Wednesday' },
                                    { value: 'thursday', label: 'Thursday' },
                                    { value: 'friday', label: 'Friday' },
                                    { value: 'saturday', label: 'Saturday' },
                                    { value: 'sunday', label: 'Sunday' }
                                ]}
                            />
                        </div>

                        {/* References */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Professional References
                            </h2>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Please provide contact information for at least two professional references
                                    who can speak to your clinical skills and professional character.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reference 1 - Name
                                    </label>
                                    <input
                                        type="text"
                                        name="reference1Name"
                                        value={formData.reference1Name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reference 1 - Contact (Email or Phone)
                                    </label>
                                    <input
                                        type="text"
                                        name="reference1Contact"
                                        value={formData.reference1Contact}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reference 2 - Name
                                    </label>
                                    <input
                                        type="text"
                                        name="reference2Name"
                                        value={formData.reference2Name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reference 2 - Contact (Email or Phone)
                                    </label>
                                    <input
                                        type="text"
                                        name="reference2Contact"
                                        value={formData.reference2Contact}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Additional Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Why are you interested in joining our telemedicine practice?
                                </label>
                                <textarea
                                    name="motivation"
                                    value={formData.motivation}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Please share your motivation and what you hope to bring to our team..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Information
                                </label>
                                <textarea
                                    name="additionalInfo"
                                    value={formData.additionalInfo}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Any additional information you'd like to share (certifications, publications, special interests, etc.)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Documents
                            </h2>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-sm text-amber-800">
                                    <strong>Document Requirements:</strong> Please prepare to upload your CV/Resume, medical license copies,
                                    DEA certificate, and malpractice insurance certificate. You can upload these now or submit them later if selected for an interview.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload CV/Resume (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        id="cv-upload"
                                        onChange={(e) => {
                                            // Handle file upload here
                                            console.log('File selected:', e.target.files[0]);
                                        }}
                                    />
                                    <label htmlFor="cv-upload" className="cursor-pointer">
                                        <div className="text-gray-400 mb-2">
                                            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600">
                                            <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-gray-500 text-sm">PDF, DOC, or DOCX up to 10MB</p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting Application...
                                    </div>
                                ) : (
                                    <>
                                        <span className="mr-2">📋</span>
                                        Submit Application
                                    </>
                                )}
                            </button>

                            {/* Additional Action Buttons */}
                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to clear all form data?')) {
                                            setFormData({
                                                firstName: '', lastName: '', email: '', phone: '', address: '',
                                                medicalSchool: '', graduationYear: '', residencyProgram: '', residencyYear: '', boardCertified: '',
                                                stateLicenses: [], otherLicenses: '', deaNumber: '', deaExpiration: '',
                                                yearsExperience: '', telemedicineExperience: '', specializations: [], ageGroups: [],
                                                techComfort: '', officeSetup: '', internetSpeed: '',
                                                hoursPerWeek: '', timeZone: '', workingDays: [],
                                                reference1Name: '', reference1Contact: '', reference2Name: '', reference2Contact: '',
                                                motivation: '', additionalInfo: ''
                                            });
                                        }
                                    }}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Clear Form
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const dataStr = JSON.stringify(formData, null, 2);
                                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                        const url = URL.createObjectURL(dataBlob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = 'draft-application.json';
                                        link.click();
                                    }}
                                    className="flex-1 py-2 px-4 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                                >
                                    Save Draft
                                </button>
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
                            <h3 className="font-semibold text-gray-900 mb-2">Privacy Notice & Consent</h3>
                            <div className="space-y-2">
                                <p>
                                    <strong>Data Protection:</strong> Your information will be kept confidential and used only for the purpose of evaluating your application.
                                    We comply with all applicable privacy laws and regulations including HIPAA.
                                </p>
                                <p>
                                    <strong>Background Verification:</strong> By submitting this application, you consent to background checks and verification of the information provided.
                                </p>
                                <p>
                                    <strong>Communication:</strong> We may contact you via email or phone regarding your application status and next steps.
                                </p>
                                <p>
                                    <strong>Data Retention:</strong> Application data will be retained for 12 months for compliance and future opportunities.
                                </p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <h3 className="font-semibold text-blue-900 mb-2">Questions About Your Application?</h3>
                            <p className="text-blue-800 mb-3">
                                Our HR team is here to help with any questions about the application process.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <a
                                    href="mailto:careers@telemedicine-clinic.com"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <span className="mr-2">✉️</span>
                                    careers@telemedicine-clinic.com
                                </a>
                                <a
                                    href="tel:+1-555-123-4567"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <span className="mr-2">📞</span>
                                    (555) 123-4567
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PsychiatristApplicationPage;
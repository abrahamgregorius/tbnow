import { useState } from 'react';
import MobileNav from '../components/MobileNav';

export default function Records() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Sample patient records data
    const [records] = useState([
        {
            id: 1,
            patientName: 'Ahmad S.',
            patientId: 'TB-2025-001',
            date: '2025-12-15',
            type: 'Symptom Analysis',
            status: 'completed',
            result: 'High Risk - TB Suspected',
            symptoms: ['Persistent cough', 'Weight loss', 'Night sweats'],
            recommendation: 'Refer for sputum test and chest X-ray'
        },
        {
            id: 2,
            patientName: 'Siti R.',
            patientId: 'TB-2025-002',
            date: '2025-12-14',
            type: 'X-ray Analysis',
            status: 'follow-up',
            result: 'Abnormal findings detected',
            symptoms: ['Chest pain', 'Shortness of breath'],
            recommendation: 'Schedule follow-up in 2 weeks'
        },
        {
            id: 3,
            patientName: 'Budi K.',
            patientId: 'TB-2025-003',
            date: '2025-12-13',
            type: 'Symptom Analysis',
            status: 'normal',
            result: 'Low Risk - No TB indicators',
            symptoms: ['Mild cough', 'Fatigue'],
            recommendation: 'Monitor symptoms, return if worsen'
        },
        {
            id: 4,
            patientName: 'Maya L.',
            patientId: 'TB-2025-004',
            date: '2025-12-12',
            type: 'Combined Analysis',
            status: 'treatment',
            result: 'TB Confirmed - Drug Sensitive',
            symptoms: ['Chronic cough', 'Blood in sputum', 'Fever'],
            recommendation: 'Start standard TB treatment regimen'
        },
        {
            id: 5,
            patientName: 'Rudi P.',
            patientId: 'TB-2025-005',
            date: '2025-12-11',
            type: 'X-ray Analysis',
            status: 'pending',
            result: 'Analysis in progress',
            symptoms: ['Cough > 2 weeks', 'Chest pain'],
            recommendation: 'Awaiting AI analysis completion'
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-900 border-green-600';
            case 'follow-up': return 'text-yellow-400 bg-yellow-900 border-yellow-600';
            case 'normal': return 'text-blue-400 bg-blue-900 border-blue-600';
            case 'treatment': return 'text-red-400 bg-red-900 border-red-600';
            case 'pending': return 'text-gray-400 bg-gray-700 border-gray-500';
            default: return 'text-gray-400 bg-gray-700 border-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✅';
            case 'follow-up': return '⏰';
            case 'normal': return 'ℹ️';
            case 'treatment': return '🏥';
            case 'pending': return '⏳';
            default: return '📋';
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.patientId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 flex justify-center pb-20">
            <div className="w-full max-w-sm">
                {/* Header */}
                <header className="bg-gradient-to-r from-purple-800 to-purple-900 text-white p-6 rounded-2xl shadow-2xl mb-6 text-center border border-purple-700">
                    <h1 className="text-3xl font-bold mb-2 text-purple-300">Patient Records</h1>
                    <p className="text-sm text-gray-300">View and manage patient screening history</p>
                </header>

                {/* Search and Filter */}
                <div className="bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-700 mb-6">
                    <div className="space-y-3">
                        {/* Search */}
                        <div className="relative">
                            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-200 placeholder-gray-400"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'follow-up', label: 'Follow-up' },
                                { value: 'treatment', label: 'Treatment' }
                            ].map(filter => (
                                <button
                                    key={filter.value}
                                    onClick={() => setFilterStatus(filter.value)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        filterStatus === filter.value
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Records List */}
                <main className="space-y-4">
                    {filteredRecords.length === 0 ? (
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 text-center">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            <p className="text-gray-300">No records found.</p>
                            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria.</p>
                        </div>
                    ) : (
                        filteredRecords.map(record => (
                            <div key={record.id} className="bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
                                {/* Record Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-purple-300">{record.patientName}</h3>
                                        <p className="text-sm text-gray-400">{record.patientId}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                                        {getStatusIcon(record.status)} {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </div>
                                </div>

                                {/* Record Details */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Date:</span>
                                        <span className="text-gray-200">{record.date}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Type:</span>
                                        <span className="text-gray-200">{record.type}</span>
                                    </div>
                                </div>

                                {/* Result */}
                                <div className="bg-gray-700 p-3 rounded-lg mb-3">
                                    <p className="text-sm font-medium text-purple-300 mb-1">Result:</p>
                                    <p className="text-sm text-gray-200">{record.result}</p>
                                </div>

                                {/* Symptoms */}
                                {record.symptoms && record.symptoms.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-purple-300 mb-2">Symptoms:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {record.symptoms.map((symptom, index) => (
                                                <span key={index} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">
                                                    {symptom}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendation */}
                                <div className="bg-gray-700 p-3 rounded-lg mb-3">
                                    <p className="text-sm font-medium text-purple-300 mb-1">Recommendation:</p>
                                    <p className="text-sm text-gray-200">{record.recommendation}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                                        View Details
                                    </button>
                                    <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                                        Update
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </main>

                {/* Summary Stats */}
                <div className="mt-6 bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3 text-center">Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-green-900 p-3 rounded-lg border border-green-600">
                            <span className="text-2xl font-bold text-green-300 block">{records.filter(r => r.status === 'completed').length}</span>
                            <span className="text-sm text-green-400">Completed</span>
                        </div>
                        <div className="bg-yellow-900 p-3 rounded-lg border border-yellow-600">
                            <span className="text-2xl font-bold text-yellow-300 block">{records.filter(r => r.status === 'follow-up').length}</span>
                            <span className="text-sm text-yellow-400">Follow-up</span>
                        </div>
                        <div className="bg-red-900 p-3 rounded-lg border border-red-600">
                            <span className="text-2xl font-bold text-red-300 block">{records.filter(r => r.status === 'treatment').length}</span>
                            <span className="text-sm text-red-400">Treatment</span>
                        </div>
                        <div className="bg-blue-900 p-3 rounded-lg border border-blue-600">
                            <span className="text-2xl font-bold text-blue-300 block">{records.filter(r => r.status === 'normal').length}</span>
                            <span className="text-sm text-blue-400">Normal</span>
                        </div>
                    </div>
                </div>
            </div>

            <MobileNav />
        </div>
    );
}
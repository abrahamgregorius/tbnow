import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNav from '../components/MobileNav';

export default function Records() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/records`);
            if (response.ok) {
                const data = await response.json();
                setRecords(data.records);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const openChat = (record) => {
        setSelectedRecord(record);
        setChatHistory(record.chatHistory || []);
    };

    const closeChat = () => {
        setSelectedRecord(null);
        setChatMessage('');
        setChatHistory([]);
    };

    const sendChatMessage = async () => {
        if (!chatMessage.trim() || !selectedRecord) return;

        setChatLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/records/${selectedRecord.id}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: chatMessage,
                    query_type: 'quick'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setChatHistory(prev => [...prev, data.chat]);
                setChatMessage('');
                
                // Update the record in the list
                setRecords(prev => prev.map(r => 
                    r.id === selectedRecord.id ? data.record : r
                ));
                setSelectedRecord(data.record);
            }
        } catch (error) {
            console.error('Error sending chat:', error);
        } finally {
            setChatLoading(false);
        }
    };

    const updateRecordStatus = async (recordId, newStatus) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/records/${recordId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: ''
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setRecords(prev => prev.map(r => 
                    r.id === recordId ? data.record : r
                ));
            }
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

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
        const matchesSearch = record.patientId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 flex justify-center pb-20">
            <div className="w-full max-w-md">
                {/* Header */}
                <header className="bg-gradient-to-r from-purple-800 to-purple-900 text-white p-6 rounded-2xl shadow-2xl mb-6 text-center border border-purple-700">
                    <h1 className="text-3xl font-bold mb-2 text-purple-300">Rekam Medis Pasien</h1>
                    <p className="text-sm text-gray-300">Lihat dan kelola riwayat screening pasien</p>
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
                                placeholder="Cari berdasarkan ID pasien..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-200 placeholder-gray-400"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex flex-wrap gap-2">
                            {[  
                                { value: 'all', label: 'Semua' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'completed', label: 'Selesai' },
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
                    {loading ? (
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-300">Loading records...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
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
                                        <h3 className="text-lg font-semibold text-purple-300">
                                            Pasien {record.patientId}
                                        </h3>
                                        <p className="text-sm text-gray-400">{record.date}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                                        {getStatusIcon(record.status)} {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </div>
                                </div>

                                {/* Patient Info Summary */}
                                {record.patientInfo && (
                                    <div className="mb-3 p-3 bg-gray-700 rounded-lg">
                                        <p className="text-sm text-purple-300 mb-1">Info Pasien:</p>
                                        <div className="text-xs text-gray-300 space-y-1">
                                            {record.patientInfo.age && <p>Usia: {record.patientInfo.age}</p>}
                                            {record.patientInfo.gender && <p>Jenis Kelamin: {record.patientInfo.gender}</p>}
                                            {record.patientInfo.symptoms && <p>Gejala: {record.patientInfo.symptoms}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Diagnosis Result */}
                                <div className="bg-blue-900 p-3 rounded-lg mb-3 border border-blue-600">
                                    <p className="text-sm font-medium text-blue-300 mb-1">Hasil Diagnosis Klinis:</p>
                                    <div 
                                        className="text-sm text-blue-200"
                                        dangerouslySetInnerHTML={{ 
                                            __html: record.result ? record.result
                                                .replace(/^## (.*$)/gm, '<h3 class="text-blue-100 text-2xl block mt-2">$1</h3>')
                                                .replace(/^### (.*$)/gm, '<h4 class="text-blue-300 text-xl block mt-1">$1</h4>')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br>') : '' 
                                        }}
                                    />
                                </div>

                                {/* X-ray Result */}
                                {record.xrayResult && (
                                    <div className="bg-red-900 p-3 rounded-lg mb-3 border border-red-600">
                                        <p className="text-sm font-medium text-red-300 mb-1">Hasil Analisis X-ray:</p>
                                        <p className="text-sm text-red-200 mb-2">
                                            Risiko: <span className="font-semibold">{record.xrayResult.risk_level}</span> 
                                            ({(record.xrayResult.confidence * 100).toFixed(1)}% confidence)
                                        </p>
                                        {record.xrayResult.heatmap_url && (
                                            <div className="mt-2">
                                                <p className="text-xs text-red-300 mb-1">Heatmap Analisis:</p>
                                                <img 
                                                    src={`${import.meta.env.VITE_API_URL}${record.xrayResult.heatmap_url}`} 
                                                    alt="X-ray Heatmap" 
                                                    className="w-full max-w-xs rounded border border-red-600"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Chat History Count */}
                                {record.chatHistory && record.chatHistory.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm text-purple-300">
                                            💬 {record.chatHistory.length} pesan chat
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openChat(record)}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        💬 Chat
                                    </button>
                                    <select
                                        value={record.status}
                                        onChange={(e) => updateRecordStatus(record.id, e.target.value)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="follow-up">Follow-up</option>
                                        <option value="completed">Completed</option>
                                        <option value="treatment">Treatment</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    )}
                </main>

                {/* Chat Modal */}
                {selectedRecord && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-purple-300">
                                        Chat - {selectedRecord.patientId}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {selectedRecord.patientInfo?.age && `${selectedRecord.patientInfo.age} tahun`}
                                        {selectedRecord.patientInfo?.gender && `, ${selectedRecord.patientInfo.gender}`}
                                    </p>
                                </div>
                                <button
                                    onClick={closeChat}
                                    className="text-gray-400 hover:text-white p-1"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                                {chatHistory.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        <p>Belum ada pesan chat.</p>
                                        <p className="text-sm mt-2">Mulai percakapan tentang pasien ini.</p>
                                    </div>
                                ) : (
                                    chatHistory.map((chat, index) => (
                                        <div key={chat.id || index} className="space-y-2">
                                            {/* User Question */}
                                            <div className="flex justify-end">
                                                <div className="bg-purple-600 text-white p-3 rounded-lg max-w-[80%]">
                                                    <p className="text-sm">{chat.question}</p>
                                                </div>
                                            </div>
                                            {/* AI Response */}
                                            <div className="flex justify-start">
                                                <div className="bg-gray-700 text-gray-200 p-3 rounded-lg max-w-[80%]">
                                                    <div 
                                                        className="text-sm"
                                                        dangerouslySetInnerHTML={{ 
                                                            __html: chat.response ? chat.response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : '' 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-gray-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                        placeholder="Tanyakan tentang pasien ini..."
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        disabled={chatLoading}
                                    />
                                    <button
                                        onClick={sendChatMessage}
                                        disabled={chatLoading || !chatMessage.trim()}
                                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                                    >
                                        {chatLoading ? (
                                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        ) : (
                                            'Kirim'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="mt-6 bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3 text-center">Ringkasan</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-green-900 p-3 rounded-lg border border-green-600">
                            <span className="text-2xl font-bold text-green-300 block">{records.filter(r => r.status === 'completed').length}</span>
                            <span className="text-sm text-green-400">Selesai</span>
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
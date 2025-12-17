import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNav from '../components/MobileNav';

export default function Chat() {
    const [activeTab, setActiveTab] = useState('quick');
    const [symptoms, setSymptoms] = useState('');
    const [patientInfo, setPatientInfo] = useState({
        name: '',
        age: '',
        gender: '',
        symptoms: '',
        duration: '',
        contactHistory: '',
        comorbidities: '',
        otherComorbidities: '',
        vitalSigns: '',
        physicalExam: ''
    });
    const [reasoningResult, setReasoningResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Function to render markdown bold text
    const renderFormattedText = (text) => {
        if (!text) return '';
        
        // Replace **text** with <strong>text</strong>
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert line breaks to <br> tags
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        return formattedText;
    };

    const handleQuickSubmit = async (e) => {
        e.preventDefault();
        if (!symptoms.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/rag/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: symptoms,
                    query_type: 'quick'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();
            setReasoningResult(data.answer);
        } catch (error) {
            console.error('Error:', error);
            setReasoningResult('Error: Unable to connect to AI service. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiagnosisSubmit = async (e) => {
        e.preventDefault();
        
        // Combine all comorbidities
        const allComorbidities = [];
        if (patientInfo.comorbidities) {
            allComorbidities.push(...patientInfo.comorbidities.split(', ').filter(c => c));
        }
        if (patientInfo.otherComorbidities && patientInfo.otherComorbidities.trim()) {
            allComorbidities.push(patientInfo.otherComorbidities.trim());
        }
        const combinedComorbidities = allComorbidities.join(', ');
        
        // Build comprehensive patient query
        const patientQuery = `
INFORMASI PASIEN:
- Nama: ${patientInfo.name}
- Usia: ${patientInfo.age}
- Jenis Kelamin: ${patientInfo.gender}
- Gejala: ${patientInfo.symptoms}
- Lama gejala: ${patientInfo.duration}
- Riwayat kontak: ${patientInfo.contactHistory}
- Komorbiditas: ${combinedComorbidities || 'Tidak ada'}
- Tanda vital: ${patientInfo.vitalSigns}
- Pemeriksaan fisik: ${patientInfo.physicalExam}

Berikan penilaian risiko TB dan rekomendasi diagnosis.
        `.trim();

        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/rag/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: patientQuery,
                    query_type: 'diagnosis'
                }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            
            // Check if this is an error response from our backend
            if (data.answer && data.answer.includes('⚠️ **Layanan AI sementara tidak tersedia**')) {
                setReasoningResult(data.answer);
            } else if (data.answer && data.answer.includes('⚠️ **Batas permintaan tercapai**')) {
                setReasoningResult(data.answer);
            } else if (data.answer && data.answer.includes('⚠️ **Kesalahan sistem**')) {
                setReasoningResult(data.answer);
            } else {
                setReasoningResult(data.answer);
                
                // Save to records only for successful diagnosis
                if (activeTab === 'diagnosis') {
                    await savePatientRecord(data.answer);
                }
            }
            
        } catch (error) {
            console.error('Diagnosis error:', error);
            setReasoningResult('Error: Unable to connect to AI service. Please check your internet connection and try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const savePatientRecord = async (assessment) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientInfo: patientInfo,
                    assessment: assessment
                }),
            });

            if (!response.ok) {
                console.error('Failed to save record - status:', response.status);
                return;
            }

            const result = await response.json();
            console.log('Record saved:', result);
        } catch (error) {
            console.error('Error saving record:', error);
            // Don't show error to user for record saving failures
        }
    };

    const handlePatientInfoChange = (field, value) => {
        setPatientInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 flex justify-center pb-20">
            <div className="w-full max-w-md">
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-2xl shadow-2xl mb-6 text-center border border-blue-700">
                    <h1 className="text-3xl font-bold mb-2 text-blue-300">Chat Klinis</h1>
                    <p className="text-sm text-gray-300">Dukungan reasoning berbantuan AI</p>
                </header>

                {/* Tab Navigation */}
                <div className="flex mb-6 bg-gray-800 rounded-xl p-1 border border-gray-700">
                    <button
                        onClick={() => setActiveTab('quick')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === 'quick'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Bimbingan Cepat
                    </button>
                    <button
                        onClick={() => setActiveTab('diagnosis')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === 'diagnosis'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Diagnosis Pasien
                    </button>
                </div>

                {/* Main Content */}
                <main className="space-y-6">
                    {activeTab === 'quick' ? (
                        /* Quick Guidance Form */
                        <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                    <svg className="w-8 h-8 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-blue-300">Bimbingan Klinis Cepat</h2>
                            </div>
                            <form onSubmit={handleQuickSubmit} className="space-y-4">
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Tanyakan pertanyaan klinis tentang TB..."
                                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-gray-200 placeholder-gray-400"
                                    rows="4"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                            </svg>
                                            Get Guidance
                                        </div>
                                    )}
                                </button>
                            </form>
                        </section>
                    ) : (
                        /* Patient Diagnosis Form */
                        <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                    <svg className="w-8 h-8 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-green-300">Asisten Diagnosis Pasien</h2>
                            </div>
                            <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Nama Pasien"
                                    value={patientInfo.name}
                                    onChange={(e) => handlePatientInfoChange('name', e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-200 placeholder-gray-400"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Usia"
                                        value={patientInfo.age}
                                        onChange={(e) => handlePatientInfoChange('age', e.target.value)}
                                        className="p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-200 placeholder-gray-400"
                                        min="1"
                                        max="120"
                                    />
                                    <select
                                        value={patientInfo.gender}
                                        onChange={(e) => handlePatientInfoChange('gender', e.target.value)}
                                        className="p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-200"
                                    >
                                        <option value="">Jenis Kelamin</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                
                                <textarea
                                    placeholder="Gejala (batuk, demam, penurunan berat badan, dll.)"
                                    value={patientInfo.symptoms}
                                    onChange={(e) => handlePatientInfoChange('symptoms', e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none text-gray-200 placeholder-gray-400"
                                    rows="2"
                                />
                                
                                <select
                                    value={patientInfo.duration}
                                    onChange={(e) => handlePatientInfoChange('duration', e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-200"
                                >
                                    <option value="">Lama gejala</option>
                                    <option value="1-3 hari">1-3 hari</option>
                                    <option value="1 minggu">1 minggu</option>
                                    <option value="2-3 minggu">2-3 minggu</option>
                                    <option value="1 bulan">1 bulan</option>
                                    <option value="2-3 bulan">2-3 bulan</option>
                                    <option value=">3 bulan">Lebih dari 3 bulan</option>
                                </select>
                                
                                <div className="space-y-2">
                                    <select
                                        value={patientInfo.contactHistory.startsWith('Ya') ? 'Ya' : patientInfo.contactHistory.startsWith('Tidak') ? 'Tidak' : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === 'Ya') {
                                                handlePatientInfoChange('contactHistory', 'Ya');
                                            } else if (value === 'Tidak') {
                                                handlePatientInfoChange('contactHistory', 'Tidak');
                                            } else {
                                                handlePatientInfoChange('contactHistory', '');
                                            }
                                        }}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-200"
                                    >
                                        <option value="">Riwayat kontak dengan pasien TB</option>
                                        <option value="Ya">Ya</option>
                                        <option value="Tidak">Tidak</option>
                                    </select>
                                    {patientInfo.contactHistory.startsWith('Ya') && (
                                        <textarea
                                            placeholder="Detail kontak (siapa, kapan, dll.)"
                                            value={patientInfo.contactHistory.length > 2 ? patientInfo.contactHistory.substring(2).trim() : ''}
                                            onChange={(e) => handlePatientInfoChange('contactHistory', 'Ya' + e.target.value)}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none text-gray-200 placeholder-gray-400"
                                            rows="2"
                                        />
                                    )}
                                </div>
                                
                                <div className="space-y-3 mb-3">
                                    <label className="block text-sm text-gray-300">Komorbiditas:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'HIV', label: 'HIV' },
                                            { value: 'Diabetes', label: 'Diabetes' },
                                            { value: 'Hipertensi', label: 'Hipertensi' },
                                            { value: 'Asma', label: 'Asma' },
                                            { value: 'Kanker', label: 'Kanker' },
                                            { value: 'Gagal ginjal', label: 'Gagal ginjal' }
                                        ].map(comorbidity => (
                                            <label key={comorbidity.value} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={patientInfo.comorbidities.includes(comorbidity.value)}
                                                    onChange={(e) => {
                                                        const current = patientInfo.comorbidities ? patientInfo.comorbidities.split(', ').filter(c => c && !['HIV', 'Diabetes', 'Hipertensi', 'Asma', 'Kanker', 'Gagal ginjal'].includes(c)) : [];
                                                        const checkboxValues = patientInfo.comorbidities.split(', ').filter(c => ['HIV', 'Diabetes', 'Hipertensi', 'Asma', 'Kanker', 'Gagal ginjal'].includes(c));
                                                        
                                                        if (e.target.checked) {
                                                            checkboxValues.push(comorbidity.value);
                                                        } else {
                                                            const index = checkboxValues.indexOf(comorbidity.value);
                                                            if (index > -1) checkboxValues.splice(index, 1);
                                                        }
                                                        
                                                        const combined = [...checkboxValues, ...current].filter(c => c).join(', ');
                                                        handlePatientInfoChange('comorbidities', combined);
                                                    }}
                                                    className="rounded border-gray-600 text-green-600 focus:ring-green-500"
                                                />
                                                <span className="text-sm text-gray-300">{comorbidity.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Komorbiditas lain (jika ada)"
                                        value={patientInfo.otherComorbidities || ''}
                                        onChange={(e) => handlePatientInfoChange('otherComorbidities', e.target.value)}
                                        className="w-full p-3 mt-2 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-200 placeholder-gray-400"
                                    />
                                </div>
                                
                                <textarea
                                    placeholder="Tanda vital (TD, suhu, RR, dll.)"
                                    value={patientInfo.vitalSigns}
                                    onChange={(e) => handlePatientInfoChange('vitalSigns', e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none text-gray-200 placeholder-gray-400"
                                    rows="2"
                                />
                                
                                <textarea
                                    placeholder="Temuan pemeriksaan fisik"
                                    value={patientInfo.physicalExam}
                                    onChange={(e) => handlePatientInfoChange('physicalExam', e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none text-gray-200 placeholder-gray-400"
                                    rows="2"
                                />
                                
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing Patient...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            Analyze Patient
                                        </div>
                                    )}
                                </button>
                            </form>
                        </section>
                    )}
                    {reasoningResult && (
                        <div className={`p-4 border rounded-xl shadow-lg ${activeTab === 'quick' ? 'bg-blue-900 border-blue-600' : 'bg-green-900 border-green-600'}`}>
                            <div className="flex items-center mb-2">
                                <svg className={`w-5 h-5 mr-2 ${activeTab === 'quick' ? 'text-blue-300' : 'text-green-300'}`} fill="currentColor" viewBox="0 0 24 24">
                                    {activeTab === 'quick' ? (
                                        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                                    ) : (
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    )}
                                </svg>
                                <h3 className={`font-semibold ${activeTab === 'quick' ? 'text-blue-300' : 'text-green-300'}`}>
                                    {activeTab === 'quick' ? 'Bimbingan Klinis AI' : 'Penilaian Klinis AI'}
                                </h3>
                            </div>
                            <div 
                                className={`text-sm leading-relaxed ${activeTab === 'quick' ? 'text-blue-200' : 'text-green-200'}`}
                                dangerouslySetInnerHTML={{ __html: renderFormattedText(reasoningResult) }}
                            />
                            <div className={`text-xs mt-3 pt-3 border-t ${activeTab === 'quick' ? 'text-blue-300 border-blue-700' : 'text-green-300 border-green-700'}`}>
                                <p><strong>Sumber:</strong> Pedoman TB WHO / SOP Kementerian Kesehatan RI</p>
                                <p className="text-yellow-300 mt-1"><em>⚠️ Ini adalah dukungan pengambilan keputusan klinis berbantuan AI, bukan diagnosis definitif. Selalu konsultasikan dengan tenaga kesehatan profesional yang berkualifikasi{activeTab === 'diagnosis' ? ' dan lakukan pemeriksaan konfirmasi' : ''}.</em></p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <MobileNav />
        </div>
    );
}
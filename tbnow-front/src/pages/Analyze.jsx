import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNav from '../components/MobileNav';

export default function Analyze() {
    const [xrayFile, setXrayFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState('');
    const [xrayData, setXrayData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [patientInfo, setPatientInfo] = useState({
        age: '',
        gender: '',
        symptoms: '',
        duration: '',
        contactHistory: '',
        comorbidities: '',
        vitalSigns: '',
        physicalExam: ''
    });
    const [showPatientForm, setShowPatientForm] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!xrayFile) return;
        
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', xrayFile);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/xray/analyze`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            setXrayData(result);
            
            // Set analysis result without the note in main text
            let analysisText = `Risiko TB: ${result.risk_level}\n`;
            analysisText += `Tingkat Kepercayaan: ${(result.confidence * 100).toFixed(1)}%`;
            
            setAnalysisResult(analysisText);
        } catch (error) {
            setAnalysisResult('Error analyzing image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToRecords = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientInfo: patientInfo,
                    assessment: `Analisis X-ray: ${analysisResult}`,
                    xrayResult: xrayData,
                }),
            });
            const data = await response.json();
            alert('Hasil analisis berhasil disimpan ke rekam medis');
            navigate('/records');
        } catch (error) {
            alert('Gagal menyimpan ke rekam medis');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 flex justify-center pb-20">
            <div className="w-full max-w-md">
                {/* Header */}
                <header className="bg-gradient-to-r from-green-800 to-green-900 text-white p-6 rounded-2xl shadow-2xl mb-6 text-center border border-green-700">
                    <h1 className="text-3xl font-bold mb-2 text-green-300">X-ray Analysis</h1>
                    <p className="text-sm text-gray-300">Quick TB detection from images</p>
                </header>

                {/* Main Content */}
                <main className="space-y-6">
                    <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                <svg className="w-8 h-8 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-green-300">Chest X-ray Analysis</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-green-400 transition duration-300 bg-gray-700">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setXrayFile(e.target.files[0])}
                                    className="hidden"
                                    id="xray-upload"
                                />
                                <label htmlFor="xray-upload" className="cursor-pointer">
                                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                    </svg>
                                    <span className="text-gray-400">Click to upload X-ray image</span>
                                    {xrayFile && <p className="text-green-300 mt-2 font-semibold">{xrayFile.name}</p>}
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={!xrayFile || isLoading}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                        Analyze X-ray
                                    </div>
                                )}
                            </button>
                        </form>
                        {analysisResult && (
                            <div className="mt-4 p-4 bg-red-900 border border-red-600 rounded-xl shadow-lg">
                                <p className="text-red-200 font-medium whitespace-pre-line mb-2">{analysisResult}</p>
                                {xrayData && xrayData.note && (
                                    <p className="text-xs text-red-300 italic">{xrayData.note}</p>
                                )}
                                {xrayData && xrayData.heatmap_url && (
                                    <div className="mt-3">
                                        <p className="text-sm text-red-300 mb-2">Heatmap Analisis:</p>
                                        <img 
                                            src={`${import.meta.env.VITE_API_URL}${xrayData.heatmap_url}`} 
                                            alt="X-ray Heatmap" 
                                            className="w-full max-w-sm rounded border border-red-600 mx-auto block"
                                        />
                                    </div>
                                )}
                                <button
                                    onClick={handleSaveToRecords}
                                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                                >
                                    Simpan ke Rekam Medis
                                </button>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <MobileNav />
        </div>
    );
}
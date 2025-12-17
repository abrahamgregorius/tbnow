import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNav from '../components/MobileNav';

export default function Chat() {
    const [symptoms, setSymptoms] = useState('');
    const [reasoningResult, setReasoningResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setReasoningResult('AI analysis based on symptoms: Possible TB indicators detected. Recommend further testing.');
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 flex justify-center pb-20">
            <div className="w-full max-w-sm">
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-2xl shadow-2xl mb-6 text-center border border-blue-700">
                    <h1 className="text-3xl font-bold mb-2 text-blue-300">Clinical Chat</h1>
                    <p className="text-sm text-gray-300">AI-powered reasoning support</p>
                </header>

                {/* Main Content */}
                <main className="space-y-6">
                    <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                <svg className="w-8 h-8 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-blue-300">Symptom Analysis</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="Describe patient symptoms..."
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
                                        Analyze Symptoms
                                    </div>
                                )}
                            </button>
                        </form>
                        {reasoningResult && (
                            <div className="mt-4 p-4 bg-green-900 border border-green-600 rounded-xl shadow-lg">
                                <p className="text-green-200 font-medium">{reasoningResult}</p>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <MobileNav />
        </div>
    );
}
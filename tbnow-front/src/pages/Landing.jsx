import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Hero Section */}
            <section className="flex items-center justify-center h-80 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-green-900/20 animate-pulse"></div>
                <div className="text-center max-w-md mx-auto relative z-10">
                    <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-blue-400 mb-3">TBNow</h1>
                    <p className="text-base text-gray-300 mb-4 leading-relaxed">
                        AI-Powered Clinical Decision Support System for Faster and Consistent TB Screening
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                        Empowering healthcare workers in limited-resource facilities
                    </p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-6 rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300 text-sm font-semibold shadow-lg transform hover:scale-105"
                    >
                        Enter App
                    </button>
                </div>
            </section>

            {/* About Section */}
            <section className="py-8 px-4 bg-gray-800">
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-4">
                        <svg className="w-10 h-10 mx-auto text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-blue-400 mb-4">Apa itu TBNow?</h2>
                    <p className="text-gray-300 text-base leading-relaxed mb-6">
                        TBNow adalah aplikasi berbasis kecerdasan buatan yang dirancang untuk membantu tenaga kesehatan dalam melakukan screening tuberkulosis (TB) dengan lebih cepat, akurat, dan konsisten. Sistem ini menggunakan teknologi AI canggih untuk mendukung pengambilan keputusan klinis, terutama di daerah dengan keterbatasan akses ke spesialis.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-8 px-4 bg-gray-900">
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-blue-400 mb-8 text-center">Fitur Utama</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center mb-2">
                                <svg className="w-6 h-6 mr-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                                </svg>
                                <h3 className="text-lg font-semibold text-green-400">RAG-based Clinical Reasoning</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Dukungan reasoning klinis berbasis Retrieval-Augmented Generation (RAG) untuk analisis gejala dan pertanyaan klinis secara real-time dengan akurasi tinggi.
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center mb-2">
                                <svg className="w-6 h-6 mr-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                                <h3 className="text-lg font-semibold text-green-400">TB X-ray Scan Analysis</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Analisis cepat gambar X-ray TB menggunakan AI untuk mendeteksi indikasi tuberkulosis dengan probabilitas yang akurat dan rekomendasi tindakan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="py-8 px-4 bg-gray-800">
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-4">
                        <svg className="w-10 h-10 mx-auto text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63C19.68 7.55 18.92 7 18.09 7h-.16l-1.29.39c-.16.05-.32.13-.46.24l-1.35 1.35-1.21-.39c-.32-.11-.65-.11-.97 0l-1.21.39-1.35-1.35c-.14-.11-.3-.19-.46-.24L8.07 7h-.16c-.83 0-1.59.55-1.85 1.37L3.5 16H6v6h12zM5.5 6c.69 0 1.25-.56 1.25-1.25S6.19 3.5 5.5 3.5 4.25 4.06 4.25 4.75 4.81 6 5.5 6zm13.5 0c.69 0 1.25-.56 1.25-1.25S19.69 3.5 19.5 3.5s-1.25.56-1.25 1.25.56 1.25 1.25 1.25z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-blue-400 mb-4">Ditujukan untuk Siapa?</h2>
                    <p className="text-gray-300 text-base leading-relaxed mb-6">
                        TBNow dirancang khusus untuk tenaga kesehatan di fasilitas kesehatan primer, puskesmas, dan daerah terpencil yang sering menghadapi keterbatasan spesialis TB. Aplikasi ini membantu dokter umum, perawat, dan bidan dalam membuat keputusan screening TB yang lebih baik dan konsisten.
                    </p>
                    <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                        <p className="text-blue-300 font-semibold text-base mb-3">Manfaat Utama:</p>
                        <ul className="text-gray-300 space-y-1 text-left text-sm">
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Mengurangi waktu diagnosis
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Meningkatkan akurasi screening
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Mendukung pengambilan keputusan di daerah terpencil
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-8 px-4 bg-gradient-to-r from-blue-900 to-green-900 text-white text-center">
                <div className="max-w-md mx-auto">
                    <div className="mb-4">
                        <svg className="w-10 h-10 mx-auto text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Mulai Gunakan TBNow Sekarang</h2>
                    <p className="text-base mb-6 text-gray-200">Bantu tingkatkan kualitas layanan kesehatan TB di fasilitas Anda.</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-white text-gray-900 py-2 px-6 rounded-full hover:bg-gray-100 transition-all duration-300 text-sm font-semibold shadow-lg transform hover:scale-105"
                    >
                        Masuk ke Aplikasi
                    </button>
                </div>
            </section>
        </div>
    );
}
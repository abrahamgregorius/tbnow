import MobileNav from '../components/MobileNav';

export default function Home() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 flex justify-center pb-20">
            <div className="w-full max-w-md">
                {/* Header */}
                <header className="bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900 text-white p-8 rounded-3xl shadow-2xl mb-6 text-center border border-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                    <div className="relative z-10">
                        <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" opacity="0.3"/>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                            TBNow
                        </h1>
                        <p className="text-lg text-gray-200 mb-2">AI-Powered TB Screening Assistant</p>
                        <p className="text-sm text-gray-400">Empowering Healthcare Workers Worldwide</p>
                    </div>
                </header>

                {/* Main Features */}
                <main className="space-y-6">
                    {/* Quick Access */}
                    <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <h2 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                            </svg>
                            Quick Access
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href="https://www.who.int/health-topics/tuberculosis"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-900 p-3 rounded-lg text-center hover:bg-blue-800 transition duration-200"
                            >
                                <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <span className="text-xs text-blue-200">WHO TB Info</span>
                            </a>
                            <a
                                href="https://www.kemkes.go.id/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-900 p-3 rounded-lg text-center hover:bg-red-800 transition duration-200"
                            >
                                <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                                </svg>
                                <span className="text-xs text-red-200">Kemenkes RI</span>
                            </a>
                            <button className="bg-green-900 p-3 rounded-lg text-center hover:bg-green-800 transition duration-200">
                                <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                </svg>
                                <span className="text-xs text-green-200">Emergency</span>
                            </button>
                            <button className="bg-purple-900 p-3 rounded-lg text-center hover:bg-purple-800 transition duration-200">
                                <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                                </svg>
                                <span className="text-xs text-purple-200">Guidelines</span>
                            </button>
                        </div>
                    </section>

                    {/* App Description */}
                    <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <h2 className="text-xl font-semibold text-blue-300 mb-4">About TBNow</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            TBNow is an AI-powered clinical decision-support tool designed to assist healthcare workers in screening tuberculosis (TB) more efficiently and consistently, especially in facilities with limited access to specialists.
                        </p>
                    </section>

                    {/* Disclaimer */}
                    <section className="bg-red-900 p-6 rounded-2xl shadow-2xl border border-red-700">
                        <h2 className="text-xl font-semibold text-red-300 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                            </svg>
                            Disclaimer
                        </h2>
                        <p className="text-red-200 text-sm leading-relaxed">
                            This application is not a substitute for professional medical diagnosis or treatment. All AI recommendations should be reviewed and confirmed by qualified healthcare providers. Always prioritize patient safety and clinical judgment.
                        </p>
                    </section>

                    {/* Sources */}
                    <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <h2 className="text-xl font-semibold text-green-300 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                            </svg>
                            Guidelines & Sources
                        </h2>
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">
                            This application follows screening protocols and guidelines from:
                        </p>
                        <ul className="text-gray-300 text-sm space-y-1">
                            <li>• World Health Organization (WHO) TB Guidelines</li>
                            <li>• Kementerian Kesehatan Republik Indonesia (Kemenkes RI)</li>
                        </ul>
                    </section>

                    {/* TB Articles */}
                    <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            TB Articles
                        </h2>
                        <div className="space-y-3">
                            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                <h3 className="text-lg font-medium text-cyan-200 mb-2">Understanding TB Symptoms</h3>
                                <p className="text-gray-300 text-sm">Learn to recognize early signs of tuberculosis for timely intervention.</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                <h3 className="text-lg font-medium text-cyan-200 mb-2">TB Prevention Tips</h3>
                                <p className="text-gray-300 text-sm">Simple steps to reduce TB transmission risk in communities.</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                <h3 className="text-lg font-medium text-cyan-200 mb-2">Treatment Journey</h3>
                                <p className="text-gray-300 text-sm">What to expect during TB treatment and recovery process.</p>
                            </div>
                        </div>
                    </section>

                    {/* TB Stats in Indonesia */}
                    <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <h2 className="text-xl font-semibold text-orange-300 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                            </svg>
                            TB Statistics in Indonesia
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-900 p-4 rounded-lg text-center border border-orange-700">
                                <span className="text-3xl font-bold text-orange-200 block">845K</span>
                                <span className="text-sm text-orange-300">Cases Reported (2023)</span>
                            </div>
                            <div className="bg-red-900 p-4 rounded-lg text-center border border-red-700">
                                <span className="text-3xl font-bold text-red-200 block">98K</span>
                                <span className="text-sm text-red-300">Deaths Annually</span>
                            </div>
                            <div className="bg-green-900 p-4 rounded-lg text-center border border-green-700">
                                <span className="text-3xl font-bold text-green-200 block">85%</span>
                                <span className="text-sm text-green-300">Treatment Success Rate</span>
                            </div>
                            <div className="bg-blue-900 p-4 rounded-lg text-center border border-blue-700">
                                <span className="text-3xl font-bold text-blue-200 block">320</span>
                                <span className="text-sm text-blue-300">Cases per 100K People</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-4 text-center">Data source: WHO & Kemenkes RI (2023)</p>
                    </section>

                    {/* Health Tips */}
                    <section className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <h2 className="text-xl font-semibold text-pink-300 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
                            </svg>
                            Health Tips
                        </h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li className="flex items-start">
                                <span className="text-pink-400 mr-2">•</span>
                                <span>Maintain good ventilation in living spaces to reduce TB transmission.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-pink-400 mr-2">•</span>
                                <span>Cover mouth and nose when coughing or sneezing.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-pink-400 mr-2">•</span>
                                <span>Complete full course of TB treatment to prevent drug resistance.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-pink-400 mr-2">•</span>
                                <span>Regular health check-ups for early detection.</span>
                            </li>
                        </ul>
                    </section>
                </main>

                {/* Footer */}
                <footer className="mt-8 text-center text-gray-500 text-sm">
                    <p className="text-gray-400">Empowering healthcare in limited-resource settings</p>
                </footer>
            </div>

            <MobileNav />
        </div>
    );
}
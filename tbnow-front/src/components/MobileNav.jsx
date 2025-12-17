import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-2 flex justify-around max-w-sm mx-auto rounded-t-2xl shadow-2xl">
            <button
                onClick={() => navigate('/home')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/home' ? 'text-blue-400 bg-gray-800' : 'text-gray-400'
                }`}
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span className="text-xs mt-1">Home</span>
            </button>
            <button
                onClick={() => navigate('/chat')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/chat' ? 'text-blue-400 bg-gray-800' : 'text-gray-400'
                }`}
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.05 1.05 4.42L2 22l5.58-1.05C8.95 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-8h2v6h-2V8z"/>
                </svg>
                <span className="text-xs mt-1">Chat</span>
            </button>
            <button
                onClick={() => navigate('/analyze')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/analyze' ? 'text-green-400 bg-gray-800' : 'text-gray-400'
                }`}
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span className="text-xs mt-1">Analyze</span>
            </button>
            <button
                onClick={() => navigate('/records')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/records' ? 'text-purple-400 bg-gray-800' : 'text-gray-400'
                }`}
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <span className="text-xs mt-1">Records</span>
            </button>
        </nav>
    );
}
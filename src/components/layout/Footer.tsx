import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        {/* Logo & Brand */}
        <div className="flex items-center mb-6 md:mb-0">
          <span className="font-bold text-xl tracking-wide text-white">ThenaAir</span>
        </div>
        {/* Links */}
        <nav className="flex flex-col items-center space-y-2 text-sm">
          <a href="/" className="hover:text-blue-400 transition">Home</a>
          <a href="/dashboard" className="hover:text-blue-400 transition">Dashboard</a>
          <a href="/bookings" className="hover:text-blue-400 transition">My Bookings</a>
          <a href="/profile" className="hover:text-blue-400 transition">Profile</a>
          <a href="/about" className="hover:text-blue-400 transition">About</a>
        </nav>
        {/* Contact & Social */}
        <div className="flex flex-col items-center md:items-end space-y-2 text-sm">
          <a href="mailto:support@thenaair.com" className="hover:text-blue-400 transition">support@thenaair.com</a>
          <div className="flex space-x-4 mt-2">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-blue-400 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.93c-.8.36-1.67.61-2.58.72a4.48 4.48 0 0 0 1.97-2.48 8.94 8.94 0 0 1-2.83 1.08 4.48 4.48 0 0 0-7.64 4.08A12.74 12.74 0 0 1 3.1 4.87a4.48 4.48 0 0 0 1.39 5.98c-.73-.02-1.42-.22-2.02-.56v.06a4.48 4.48 0 0 0 3.6 4.39c-.34.09-.7.14-1.07.14-.26 0-.51-.02-.76-.07a4.48 4.48 0 0 0 4.18 3.11A9 9 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.2 0-.39-.01-.58.88-.64 1.65-1.44 2.26-2.35z" /></svg>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-blue-400 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" /></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-4 pb-2 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} ThenaAir. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 
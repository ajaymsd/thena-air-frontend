import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/react.svg'; // Use your logo path

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <img src={logo} alt="ThenaAir Logo" className="h-16 w-16 mb-6 animate-bounce" />
      <h1 className="text-5xl font-extrabold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.<br />
        Please check the URL or return to the homepage.
      </p>
      <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage; 
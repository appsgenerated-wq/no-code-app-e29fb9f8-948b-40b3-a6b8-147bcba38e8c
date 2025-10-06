import React from 'react';
import config from '../constants.js';
import { BuildingStorefrontIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const LandingPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">FlavorFleet</span>
            </a>
          </div>
          <div className="lg:flex lg:flex-1 lg:justify-end">
            <a href={`${config.BACKEND_URL}/admin`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">
              Admin Panel <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
      </header>

      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Discover and Manage Restaurants
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              FlavorFleet is your one-stop solution for browsing local eateries and managing your own restaurant listings. Powered by a robust Manifest backend.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => onLogin('owner@demo.com', 'password')}
                className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                <BuildingStorefrontIcon className="h-5 w-5" />
                Login as Demo Owner
              </button>
              <button
                onClick={() => onLogin('customer@demo.com', 'password')}
                className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors"
              >
                <UserCircleIcon className="h-5 w-5" />
                 Login as Demo Customer
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;

import React from 'react';
import { Users, Settings, Laptop, Globe } from 'lucide-react';

const WorkfromVirtualAd = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl overflow-hidden text-gray-100">
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-teal-400">
          Workfrom Virtual Rooms
        </h3>
        <p className="text-gray-300 mb-6">
          Empower your team with customizable virtual workspaces. Designed for your community's unique collaborative needs.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-sm">
            <div className="bg-teal-500 bg-opacity-20 p-2 rounded-full mr-3">
              <Settings size={18} className="text-teal-400" />
            </div>
            <span>Fully Customizable</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="bg-teal-500 bg-opacity-20 p-2 rounded-full mr-3">
              <Users size={18} className="text-teal-400" />
            </div>
            <span>Team-Centric Design</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="bg-teal-500 bg-opacity-20 p-2 rounded-full mr-3">
              <Laptop size={18} className="text-teal-400" />
            </div>
            <span>Seamless Integration</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="bg-teal-500 bg-opacity-20 p-2 rounded-full mr-3">
              <Globe size={18} className="text-teal-400" />
            </div>
            <span>Global Accessibility</span>
          </div>
        </div>
        <a 
          href="https://www.workfrom.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full text-center py-3 px-4 bg-teal-500 text-white rounded-md font-medium hover:bg-teal-600 transition-colors duration-300"
        >
          Create Your Virtual Room
        </a>
      </div>
    </div>
  );
};

export default WorkfromVirtualAd;
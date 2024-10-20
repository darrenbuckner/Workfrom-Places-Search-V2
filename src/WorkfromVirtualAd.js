import React from 'react';
import { Users } from 'lucide-react';

const WorkfromVirtualAd = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg shadow-md text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">Instant Community Coworking Space</h3>
          <p className="text-sm mb-3">Connect, Collaborate, Co-work - Anywhere!</p>
          <ul className="text-xs space-y-1">
            <li>• 24/7 Access for Your Community</li>
            <li>• Customizable Virtual Meeting Rooms</li>
            <li>• Productivity Tools</li>
          </ul>
          <a 
            href="https://www.workfrom.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block mt-3 px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors"
          >
            Create Your Space
          </a>
        </div>
        <div className="hidden sm:block">
          <Users size={64} className="text-white opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default WorkfromVirtualAd;
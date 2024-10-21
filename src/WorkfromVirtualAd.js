import React from 'react';
import { Users, Zap, Globe, ArrowRight } from 'lucide-react';

const WorkfromVirtualAd = () => {
  return (
    <div className="bg-[#160040] rounded-lg shadow-xl overflow-hidden text-white">
      <div className="p-6">
        <h3 className="text-3xl font-bold mb-2 text-[#ffffff]">
          Boost Your Remote Work with Virtual Co-Working Rooms
        </h3>
        <p className="text-gray-300 mb-6 font-light">
          Join the remote work revolution: Stay connected, focused, and productive with your team.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-sm">
            <div className="bg-[#1441ff] bg-opacity-20 p-2 rounded-full mr-3">
              <Users size={18} className="text-[#ffffff]" />
            </div>
            <span className="font-light">Build Stronger Teams</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="bg-[#1441ff] bg-opacity-20 p-2 rounded-full mr-3">
              <Zap size={18} className="text-[#ffffff]" />
            </div>
            <span className="font-light">Boost Motivation & Productivity</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="bg-[#1441ff] bg-opacity-20 p-2 rounded-full mr-3">
              <Globe size={18} className="text-[#ffffff]" />
            </div>
            <span className="font-light">Seamless Integration into Your Workflow</span>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-4">Join 10,000+ professionals already thriving in virtual co-working spaces</p>
        <a 
          href="https://www.workfrom.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[#1441ff] text-white rounded-full font-medium hover:bg-opacity-90 transition-all duration-300"
        >
          Start Collaborating Now
          <ArrowRight size={18} className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
};

export default WorkfromVirtualAd;
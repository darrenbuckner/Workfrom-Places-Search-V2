import React from 'react';
import { Users, Zap, Globe, ArrowRight, Layout } from 'lucide-react';

const WorkfromVirtualAd = () => {
  return (
    <div className="bg-[#1a1f2c] border rounded shadow-sm hover:shadow-md transition-shadow shadow-xl overflow-hidden text-white">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1 text-[#ffffff]">
              Create Branded Virtual Spaces for Your Community
            </h3>
            <p className="text-gray-300 text-sm">
              Transform your online presence into an immersive workspace
            </p>
          </div>
          <a 
            href="https://www.workfrom.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group inline-flex items-center justify-center whitespace-nowrap px-4 py-2 
              bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] 
              text-white text-sm rounded-full font-medium transition-all duration-300"
          >
            Start Building
            <ArrowRight size={16} className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <div className="flex items-center text-xs">
            <div className="bg-[#1441ff] bg-opacity-20 p-1.5 rounded-full mr-2">
              <Layout size={14} className="text-[#ffffff]" />
            </div>
            <span className="font-light">Branded Spaces</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="bg-[#1441ff] bg-opacity-20 p-1.5 rounded-full mr-2">
              <Users size={14} className="text-[#ffffff]" />
            </div>
            <span className="font-light">Engagement Tools</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="bg-[#1441ff] bg-opacity-20 p-1.5 rounded-full mr-2">
              <Globe size={14} className="text-[#ffffff]" />
            </div>
            <span className="font-light">Analytics & Insights</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="bg-[#1441ff] bg-opacity-20 p-1.5 rounded-full mr-2">
              <Zap size={14} className="text-[#ffffff]" />
            </div>
            <span className="font-light">Automation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkfromVirtualAd;
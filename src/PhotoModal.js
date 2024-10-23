import React, { useState } from 'react';
import { 
  X, 
  Loader, 
  ImageIcon, 
  User, 
  Navigation, 
  AlertCircle,
  Quote,
  ExternalLink 
} from 'lucide-react';
import WorkabilityScore from './WorkabilityScore';

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  const sanitizedDescription = selectedPlace?.description ? stripHtml(selectedPlace.description) : '';
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowPhotoModal(false)}>
      <div 
        className="bg-white rounded-xl w-full max-h-[90vh] overflow-hidden flex flex-col max-w-[1200px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{selectedPlace?.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedPlace?.street}, {selectedPlace?.city}
            </p>
          </div>
          <button 
            onClick={() => setShowPhotoModal(false)}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Section - Full Width */}
          <div className="relative w-full bg-gray-100">
            <div className="relative aspect-[21/9] w-full">
              {isPhotoLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader size={48} className="text-gray-400 animate-spin" />
                </div>
              ) : fullImg ? (
                <img
                  src={fullImg}
                  alt={`${selectedPlace?.title}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/1200x600/e5e7eb/e5e7eb?text=Image not available&font=raleway";
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ImageIcon size={48} className="text-gray-400 mb-2" />
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {/* WorkabilityScore */}
            <WorkabilityScore place={selectedPlace} variant="full" />

            {/* Description */}
            {sanitizedDescription && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <Quote size={20} className="mr-2 text-blue-500" />
                    A Closer Look
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 italic font-medium leading-relaxed">
                      {sanitizedDescription}
                    </p>
                  </div>
                </div>
                {selectedPlace?.os && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                    <div className="flex items-center text-sm text-gray-500">
                      <User size={14} className="mr-2 text-gray-400" />
                      <p>Added by {selectedPlace.os}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${selectedPlace?.street}, ${selectedPlace?.city}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <Navigation size={18} className="mr-2" />
                Get Directions
                <ExternalLink size={16} className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
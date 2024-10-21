import React from 'react';
import { X, Loader, ImageIcon, User, Check } from 'lucide-react';

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const Amenity = ({ name, value }) => (
  <div className="flex items-center mb-2">
    <Check size={16} className={`mr-2 ${value ? 'text-green-500' : 'text-gray-300'}`} />
    <span className={value ? 'text-gray-800' : 'text-gray-500'}>{name}</span>
  </div>
);

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  const sanitizedDescription = selectedPlace?.description ? stripHtml(selectedPlace.description) : '';

  const amenities = [
    { name: 'Fast WiFi', value: selectedPlace?.download >= 10 },
    { name: 'Power Outlets', value: selectedPlace?.power === 'range2' || selectedPlace?.power === 'range3' },
    { name: 'Quiet Space', value: selectedPlace?.mappedNoise === 'below average' },
    { name: 'Coffee Available', value: selectedPlace?.type?.toLowerCase().includes('coffee') },
    { name: 'Food Available', value: selectedPlace?.food === '1' },
    { name: 'Alcohol Available', value: selectedPlace?.alcohol === '1' },
    { name: 'Outdoor Seating', value: selectedPlace?.outdoor_seating === '1' },
    { name: 'Pet Friendly', value: selectedPlace?.pet_friendly === '1' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{selectedPlace?.title}</h2>
          <button onClick={() => setShowPhotoModal(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative mb-4">
            {isPhotoLoading ? (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
                <Loader size={48} className="text-gray-400 animate-spin" />
              </div>
            ) : fullImg ? (
              <img
                src={fullImg}
                alt={`${selectedPlace?.title} - Full Image`}
                className="w-full h-64 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x300/e5e7eb/e5e7eb?text=Image not available&font=raleway";
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex flex-col items-center justify-center rounded">
                <ImageIcon size={48} className="text-gray-400 mb-2" />
                <p className="text-gray-500">No image available for this place</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Amenities</h3>
            <div className="grid grid-cols-2 gap-x-4">
              {amenities.map((amenity, index) => (
                <Amenity key={index} name={amenity.name} value={amenity.value} />
              ))}
            </div>
          </div>
        </div>
        {sanitizedDescription && (
          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">A Closer Look</h3>
            <p className="text-gray-700 leading-relaxed italic">
              "{sanitizedDescription}"
            </p>
            {selectedPlace?.os && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <User size={14} className="mr-1" />
                <p>Added by {selectedPlace.os}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoModal;
import { useFavorites } from '../hooks/useFavorites';
import { useState, useMemo } from 'react';
import PhotoModal from '../PhotoModal';
import { MapPin } from 'lucide-react';

export const FavoritesList = () => {
  const { favorites, removeFavorite } = useFavorites();
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Group favorites by city
  const groupedFavorites = useMemo(() => {
    return favorites.reduce((acc, place) => {
      const city = place.city || 'Other';
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(place);
      return acc;
    }, {});
  }, [favorites]);

  if (favorites.length === 0) {
    return (
      <div className="p-6 text-center text-[var(--text-secondary)]">
        <p>No favorites yet! Add some places to see them here.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-8">
        {Object.entries(groupedFavorites).map(([city, places]) => (
          <div key={city}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-[var(--accent-primary)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {city}
              </h3>
              <span className="text-sm text-[var(--text-secondary)]">
                ({places.length})
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {places.map(place => (
                <div 
                  key={place.id}
                  className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-colors"
                >
                  {place.images?.thumbnail ? (
                    <img
                      src={place.images.thumbnail}
                      alt={place.name}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[var(--text-secondary)]" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--text-primary)] truncate">
                      {place.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setSelectedPlace(place)}
                        className="text-xs font-medium text-[var(--accent-primary)]"
                      >
                        View Details
                      </button>
                      <span className="text-[var(--text-tertiary)]">•</span>
                      <button
                        onClick={() => removeFavorite(place.id)}
                        className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPlace && (
        <PhotoModal
          selectedPlace={selectedPlace}
          fullImg={selectedPlace.images?.full || selectedPlace.full_img}
          isPhotoLoading={false}
          setShowPhotoModal={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
};

export default FavoritesList; 
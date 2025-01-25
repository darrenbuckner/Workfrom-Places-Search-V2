import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Loader, MapPin, Navigation, Star, Clock, AlertCircle, ImageIcon, 
  Coffee, Wifi, WifiOff, Volume2, Users, Sparkles, Building, ChevronRight, Loader2 
} from 'lucide-react';
import API_CONFIG from '../config';
import StarRating from '../components/StarRating';
import ImageFallback from '../components/ImageFallback';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useGuideGeneration } from '../hooks/useGuideGeneration';

const LoadingState = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messages = [
    "Analyzing workspace amenities and features...",
    "Processing community insights and reviews...",
    "Calculating optimal matches for your needs...",
    "Creating personalized recommendations...",
    "Almost ready with your custom guide..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-3 mb-2">
          <Loader className="w-5 h-5 text-[var(--accent-primary)] animate-spin" />
          <span className="text-[var(--text-primary)] font-medium">
            {messages[currentMessage]}
          </span>
        </div>
        
        <div className="text-sm text-[var(--text-secondary)] max-w-md">
          Our AI is analyzing workspace data, community reviews, and amenities to create 
          your personalized guide. This typically takes 5-10 seconds.
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-2">
          {[
            { icon: Wifi, label: "WiFi Analysis" },
            { icon: Users, label: "Community Data" },
            { icon: Building, label: "Space Features" }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3
              rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
              <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
              <span className="text-xs text-[var(--text-secondary)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlaceInsight = ({ place, recommendation, onViewDetails }) => {
  // Add null checks and default values
  const images = place?.images || {
    thumbnail: place?.thumbnail_img || null,
    full: place?.full_img || null
  };

  const location = place?.location || {
    street: place?.street || '',
    city: place?.city || ''
  };

  return (
    <article 
      className="group cursor-pointer"
      onClick={() => onViewDetails(place?.ID || recommendation.id)}
    >
      <div className="flex gap-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-secondary)]">
          <ImageFallback
            src={images.thumbnail}
            fallback={<ImageIcon className="w-6 h-6 text-[var(--text-tertiary)]" />}
            alt={recommendation.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--text-primary)] mb-1">
            {recommendation.name}
          </h3>
          
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            {recommendation.highlight}
          </p>

          <div className="text-sm text-[var(--text-secondary)]">
            {recommendation.description}
          </div>

          <div className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-sm font-medium 
            text-[var(--accent-primary)] group-hover:text-[var(--accent-secondary)] transition-colors">
            View details
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </article>
  );
};

const WorkspaceGuide = ({ places, location, onViewDetails }) => {
  const { generateGuide, isLoading, error } = useGuideGeneration();
  const [guide, setGuide] = useState(null);
  const isGenerating = useRef(false);

  useEffect(() => {
    // Only generate if we have places and aren't already generating
    if (places?.length > 0 && !isGenerating.current && !guide) {  // Add !guide check
      isGenerating.current = true;
      
      generateGuide(places)
        .then(guideData => {
          console.log('Guide data received:', guideData);
          setGuide(guideData);
        })
        .catch(err => {
          console.error('Guide generation error:', err);
        })
        .finally(() => {
          isGenerating.current = false;
        });
    }
  }, [places, generateGuide, guide]); // Add guide to dependencies

  // Show loading state only when generating for the first time
  if (isLoading && !guide) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-500">Guide Generation Failed</h3>
            <p className="text-sm text-red-500/90 mt-1">{error}</p>
            <button 
              onClick={() => {
                setGuide(null);  // Clear existing guide
                generateGuide(places);
              }}
              className="mt-3 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
      <div className="p-4 sm:p-6 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mb-2 sm:mb-3">
          <Building size={16} className="text-[var(--accent-primary)]" />
          <span>Local Workspace Guide</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">
          {guide.title}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          {guide.introduction}
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid gap-6">
          {guide.recommendations.map((recommendation) => {
            // Find matching place by ID or name
            const matchingPlace = places.find(p => 
              p.ID === recommendation.id || 
              p.title?.toLowerCase() === recommendation.name?.toLowerCase()
            );

            return (
              <PlaceInsight
                key={recommendation.id}
                recommendation={recommendation}
                place={matchingPlace}
                onViewDetails={onViewDetails}
              />
            );
          })}
        </div>

        {guide.tips && guide.tips.length > 0 && (
          <div className="mt-8 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
            <h3 className="font-medium text-[var(--text-primary)] mb-3">Local Tips</h3>
            <ul className="space-y-2">
              {guide.tips.map((tip, index) => (
                <li key={index} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-primary)]">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceGuide;
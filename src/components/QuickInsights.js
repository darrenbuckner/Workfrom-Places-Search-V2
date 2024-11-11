import React, { useState, useEffect } from 'react';
import { Brain, Coffee, Users, Wifi, Battery, Volume2, ArrowRight, Clock, Map } from 'lucide-react';

const QuickInsights = ({
  places,
  onPlaceClick,
  currentTime = new Date(),
  userPreferences = {}
}) => {
  const [insights, setInsights] = useState(null);
  const [activeInsight, setActiveInsight] = useState(0);
  
  // Get time-contextual greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  // Dynamic card that adapts based on category
  const InsightCard = ({ category, title, description, places, mainMetric }) => {
    const CategoryIcon = {
      wifi: Wifi,
      power: Battery,
      noise: Volume2,
      coffee: Coffee,
      time: Clock,
      location: Map
    }[category] || Brain;

    return (
      <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 
            flex items-center justify-center flex-shrink-0">
            <CategoryIcon className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-[var--text-primary] mb-1">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">{description}</p>
            {places && (
              <div className="space-y-2">
                {places.map((place, index) => (
                  <button
                    key={place.ID}
                    onClick={() => onPlaceClick(place)}
                    className="w-full p-3 rounded border border-[var(--border-primary)] 
                      hover:border-[var(--accent-primary)] transition-colors text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {place.title}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          {place.distance} miles away
                        </div>
                      </div>
                      {mainMetric && (
                        <div className="px-2 py-1 rounded bg-[var(--accent-primary)]/10 
                          text-[var(--accent-primary)] text-sm font-medium">
                          {mainMetric(place)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Get recommendations based on current context
  const generateInsights = () => {
    const timeOfDay = getGreeting();
    const insights = [];
    
    // Best nearby options
    const nearbyPlaces = places
      .filter(p => p.distance <= 1)
      .sort((a, b) => b.workabilityScore - a.workabilityScore)
      .slice(0, 3);
    
    if (nearbyPlaces.length) {
      insights.push({
        category: 'location',
        title: 'Closest High-Rated Spaces',
        description: 'Top workspaces within a mile of you',
        places: nearbyPlaces,
        mainMetric: (place) => `${place.workabilityScore}/10`
      });
    }

    // Time-based recommendations
    const currentHour = currentTime.getHours();
    let timeFocused = [];
    
    if (currentHour < 11) {
      // Morning focus on coffee and quiet
      timeFocused = places
        .filter(p => p.coffee === "1" && !p.noise?.toLowerCase().includes('noisy'))
        .sort((a, b) => b.workabilityScore - a.workabilityScore)
        .slice(0, 3);
      
      insights.push({
        category: 'time',
        title: 'Perfect for Morning Work',
        description: 'Quiet spaces with great coffee to start your day',
        places: timeFocused,
        mainMetric: (place) => place.coffee === "1" ? "Has Coffee" : "No Coffee"
      });
    } else if (currentHour < 14) {
      // Lunch time focus
      timeFocused = places
        .filter(p => p.food === "1")
        .sort((a, b) => b.workabilityScore - a.workabilityScore)
        .slice(0, 3);
      
      insights.push({
        category: 'time',
        title: 'Work Through Lunch',
        description: 'Spaces with food options and good workability',
        places: timeFocused,
        mainMetric: (place) => place.food === "1" ? "Food Available" : "No Food"
      });
    } else {
      // Afternoon/Evening focus on productivity
      timeFocused = places
        .filter(p => p.workabilityScore >= 7)
        .sort((a, b) => b.download - a.download)
        .slice(0, 3);
      
      insights.push({
        category: 'time',
        title: `Best for ${timeOfDay} Productivity`,
        description: 'High-performing spaces with fast WiFi',
        places: timeFocused,
        mainMetric: (place) => `${Math.round(place.download || 0)} Mbps`
      });
    }

    // Focus-optimized spaces
    const quietSpaces = places
      .filter(p => p.noise?.toLowerCase().includes('quiet'))
      .sort((a, b) => b.workabilityScore - a.workabilityScore)
      .slice(0, 3);

    if (quietSpaces.length) {
      insights.push({
        category: 'noise',
        title: 'Best for Deep Focus',
        description: 'Quieter spaces perfect for concentrated work',
        places: quietSpaces,
        mainMetric: (place) => place.noise || 'Unknown'
      });
    }

    // Team-friendly spaces
    const teamSpaces = places
      .filter(p => 
        p.download >= 25 && // Good WiFi
        !p.noise?.toLowerCase().includes('quiet') && // Not too quiet
        p.food === "1" // Has food
      )
      .sort((a, b) => b.workabilityScore - a.workabilityScore)
      .slice(0, 3);

    if (teamSpaces.length) {
      insights.push({
        category: 'users',
        title: 'Great for Teams',
        description: 'Spacious venues with amenities for group work',
        places: teamSpaces,
        mainMetric: (place) => `${place.workabilityScore}/10`
      });
    }

    return insights;
  };

  useEffect(() => {
    if (places?.length) {
      setInsights(generateInsights());
    }
  }, [places]);

  if (!insights?.length) return null;

  return (
    <div className="space-y-4">
      {/* Navigation dots */}
      {insights.length > 1 && (
        <div className="flex justify-center gap-2 mb-4">
          {insights.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveInsight(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeInsight
                  ? 'bg-[var(--accent-primary)] w-4'
                  : 'bg-[var(--accent-primary)]/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Current insight */}
      <InsightCard {...insights[activeInsight]} />
    </div>
  );
};

export default QuickInsights;
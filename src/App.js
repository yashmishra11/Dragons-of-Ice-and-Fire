import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './App.css';

const App = () => {
  const [dragons, setDragons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDragon, setSelectedDragon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDragons = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/dragon_data.json');
        if (!response.ok) {
          throw new Error('Failed to load dragon data');
        }
        const data = await response.json();
        setDragons(data);
      } catch (error) {
        console.error('Error loading dragon data:', error);
        setError('Failed to load dragons. Please try again later.');
        setDragons([]);
      } finally {
        setLoading(false);
      }
    };
    loadDragons();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % dragons.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + dragons.length) % dragons.length);
  };

  const handleCardClick = (dragon) => {
    setSelectedDragon(dragon);
  };

  const closeDetails = () => {
    setSelectedDragon(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Dragons...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="loading-container">
        <div className="error-text">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="medieval-button"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (dragons.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-text">No dragons found</div>
      </div>
    );
  }

  // Detail view
  if (selectedDragon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="detail-container">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <button
                  onClick={closeDetails}
                  className="back-button-medieval-button"
                  aria-label="Go back"
                >
                  ←
                </button>
                <div className="dragon-image-framef">
                  <img
                    src={selectedDragon.image}
                    alt={selectedDragon.name}
                    className="dragon-imagef"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=Dragon+Image+Not+Available';
                      e.target.onerror = null; // Prevent infinite loop
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
              <div>
                <h1 className="detail-title">{selectedDragon.name}</h1>
                
                <div className="detail-section">
                  <h3>Hatched</h3>
                  <p>{selectedDragon.hatched || "Unknown"}</p>
                </div>

                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedDragon.description || "No description available."}</p>
                </div>

                <div className="detail-section">
                  <h3>Rider</h3>
                  <p>{selectedDragon.rider || "Unknown"}</p>
                </div>

                <div className="detail-section">
                  <h3>Colors</h3>
                  <p>{selectedDragon.colors || "Unknown"}</p>
                </div>

                <div className="detail-section">
                  <h3>Died</h3>
                  <p>{selectedDragon.died || "Unknown"}</p>
                </div>

                <div className="detail-section">
                  <h3>History</h3>
                  <p>{selectedDragon.history || "No history available."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Carousel logic: always show 3 dragons, wrap around
  const getVisibleDragons = () => {
    const prev = (currentIndex - 1 + dragons.length) % dragons.length;
    const next = (currentIndex + 1) % dragons.length;
    return [
      { ...dragons[prev], position: 'side' },
      { ...dragons[currentIndex], position: 'center' },
      { ...dragons[next], position: 'side' }
    ];
  };

  const visibleDragons = getVisibleDragons();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="container">
        <h1 className="main-title medieval-text">Dragons of Ice and Fire</h1>
        <div className="relative">
          <div className="carousel-cards">
            <button
              onClick={prevSlide}
              className="nav-button"
              aria-label="Previous dragon"
            >
              <ChevronLeft size={32} />
            </button>

            {visibleDragons.map((dragon, idx) => (
              <div
                key={dragon.name || idx}
                className={`dragon-card ${dragon.position === 'center' ? 'carousel-card center' : 'carousel-card side'}`}
                onClick={() => dragon.position === 'center' && handleCardClick(dragon)}
                style={{ cursor: dragon.position === 'center' ? 'pointer' : 'default' }}
              >
                <div className="dragon-image-frame">
                  <img
                    src={dragon.image}
                    alt={dragon.name}
                    className="dragon-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Dragon';
                      e.target.onerror = null;
                    }}
                    loading="lazy"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-3">{dragon.name}</h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {dragon.description
                      ? dragon.description.substring(0, 100) + (dragon.description.length > 100 ? "..." : "")
                      : "A legendary dragon from the world of Ice and Fire."}
                  </p>
                  {dragon.position === 'center' && (
                    <button className="medieval-button">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={nextSlide}
              className="nav-button"
              aria-label="Next dragon"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
        
        <div className="card-count" style={{ display: 'none' }}>
          Showing {currentIndex + 1} of {dragons.length} dragons
        </div>
      </div>
    </div>
  );
};

export default App;
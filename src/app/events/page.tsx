'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Events() {
  // Sample sports categories
  const sportCategories = [
    { id: "soccer", name: "Soccer" },
    { id: "basketball", name: "Basketball" },
    { id: "tennis", name: "Tennis" },
    { id: "rugby", name: "Rugby" },
    { id: "cricket", name: "Cricket" },
    { id: "boxing", name: "Boxing" },
    { id: "mma", name: "MMA" },
    { id: "american-football", name: "American Football" },
    { id: "baseball", name: "Baseball" },
  ];

  // Sample events data
  const events = [
    {
      id: 1,
      title: "Premier League: Manchester United vs Liverpool",
      date: "March 16, 2025",
      time: "15:00 GMT",
      category: "soccer",
      markets: 45,
      featured: true
    },
    {
      id: 2,
      title: "NBA: LA Lakers vs Golden State Warriors",
      date: "March 12, 2025",
      time: "19:30 ET",
      category: "basketball",
      markets: 38,
      featured: true
    },
    {
      id: 3,
      title: "UFC 300: Championship Fight",
      date: "March 20, 2025",
      time: "22:00 ET",
      category: "mma",
      markets: 25,
      featured: true
    },
    {
      id: 4,
      title: "Tennis Grand Slam: Quarterfinals",
      date: "March 18, 2025",
      time: "12:00 GMT",
      category: "tennis",
      markets: 20,
      featured: false
    },
    {
      id: 5,
      title: "Champions League: Real Madrid vs Bayern Munich",
      date: "March 14, 2025",
      time: "20:00 GMT",
      category: "soccer",
      markets: 42,
      featured: false
    },
    {
      id: 6,
      title: "Wimbledon Final: Men's Singles",
      date: "March 22, 2025",
      time: "14:00 GMT",
      category: "tennis",
      markets: 18,
      featured: false
    },
    {
      id: 7,
      title: "NFL: Kansas City Chiefs vs San Francisco 49ers",
      date: "March 21, 2025",
      time: "16:25 ET",
      category: "american-football",
      markets: 35,
      featured: false
    },
    {
      id: 8,
      title: "IPL: Mumbai Indians vs Chennai Super Kings",
      date: "March 19, 2025",
      time: "18:00 IST",
      category: "cricket",
      markets: 28,
      featured: false
    }
  ];

  // State for active filters
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter events based on category and search query
  const filteredEvents = events.filter(event => {
    const matchesCategory = activeCategory === "all" || event.category === activeCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Upcoming Events</h1>
          
          {/* Search input */}
          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sport category filters */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === "all" 
                  ? "bg-green-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Events
            </button>
            
            {sportCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeCategory === category.id 
                    ? "bg-green-600 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Events list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <div 
                key={event.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  event.featured ? "ring-2 ring-green-500" : ""
                }`}
              >
                {event.featured && (
                  <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 text-center">
                    Featured Event
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">{event.title}</h3>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{event.date} • {event.time}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">{event.markets} betting markets</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                      {event.category.replace('-', ' ')}
                    </span>
                  </div>
                  
                  {/* Sample odds display (just for UI) */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-xs text-gray-500 mb-1">1</div>
                      <div className="font-semibold">2.10</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-xs text-gray-500 mb-1">X</div>
                      <div className="font-semibold">3.50</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-xs text-gray-500 mb-1">2</div>
                      <div className="font-semibold">3.20</div>
                    </div>
                  </div>
                  
                  <Link
                    href={`/events/${event.id}`}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded transition"
                  >
                    View All Markets
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-gray-500 text-lg">No events match your search criteria.</p>
              <button 
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 text-green-600 hover:text-green-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

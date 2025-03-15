'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EventDetail() {
  const params = useParams();
  const eventId = params.id;

  // Sample event data (in a real app, this would be fetched based on the eventId)
  const event = {
    id: eventId,
    title: "Premier League: Manchester United vs Liverpool",
    date: "March 16, 2025",
    time: "15:00 GMT",
    description: "One of the biggest rivalries in English football continues as Manchester United hosts Liverpool at Old Trafford.",
    location: "Old Trafford, Manchester",
    status: "Upcoming",
    teams: {
      home: "Manchester United",
      away: "Liverpool"
    }
  };

  // Sample market categories and betting markets
  const marketCategories = [
    { id: "main", name: "Main Markets" },
    { id: "goals", name: "Goals" },
    { id: "corners", name: "Corners & Cards" },
    { id: "players", name: "Player Markets" },
    { id: "specials", name: "Specials" }
  ];

  const bettingMarkets = {
    main: [
      {
        id: "m1",
        name: "Match Result",
        selections: [
          { id: "s1", name: event.teams.home, odds: 3.10 },
          { id: "s2", name: "Draw", odds: 3.50 },
          { id: "s3", name: event.teams.away, odds: 2.20 }
        ]
      },
      {
        id: "m2",
        name: "Double Chance",
        selections: [
          { id: "s4", name: `${event.teams.home} or Draw`, odds: 1.60 },
          { id: "s5", name: `${event.teams.home} or ${event.teams.away}`, odds: 1.35 },
          { id: "s6", name: `Draw or ${event.teams.away}`, odds: 1.40 }
        ]
      },
      {
        id: "m3",
        name: "Both Teams to Score",
        selections: [
          { id: "s7", name: "Yes", odds: 1.75 },
          { id: "s8", name: "No", odds: 2.05 }
        ]
      }
    ],
    goals: [
      {
        id: "m4",
        name: "Total Goals",
        selections: [
          { id: "s9", name: "Over 2.5", odds: 1.85 },
          { id: "s10", name: "Under 2.5", odds: 1.95 }
        ]
      },
      {
        id: "m5",
        name: "Total Goals - First Half",
        selections: [
          { id: "s11", name: "Over 1.5", odds: 2.25 },
          { id: "s12", name: "Under 1.5", odds: 1.65 }
        ]
      }
    ],
    corners: [
      {
        id: "m6",
        name: "Total Corners",
        selections: [
          { id: "s13", name: "Over 9.5", odds: 1.80 },
          { id: "s14", name: "Under 9.5", odds: 2.00 }
        ]
      },
      {
        id: "m7",
        name: "Total Cards",
        selections: [
          { id: "s15", name: "Over 3.5", odds: 1.70 },
          { id: "s16", name: "Under 3.5", odds: 2.10 }
        ]
      }
    ],
    players: [
      {
        id: "m8",
        name: "First Goalscorer",
        selections: [
          { id: "s17", name: "M. Salah", odds: 5.00 },
          { id: "s18", name: "B. Fernandes", odds: 6.50 },
          { id: "s19", name: "R. Rashford", odds: 7.00 }
        ]
      }
    ],
    specials: [
      {
        id: "m9",
        name: "Team to Score First",
        selections: [
          { id: "s20", name: event.teams.home, odds: 2.20 },
          { id: "s21", name: event.teams.away, odds: 1.80 },
          { id: "s22", name: "No Goal", odds: 12.00 }
        ]
      }
    ]
  };

  // State for active market category and selections
  const [activeCategory, setActiveCategory] = useState("main");
  const [selectedBets, setSelectedBets] = useState<{[key: string]: any}>({});

  // Toggle bet selection
  const toggleBetSelection = (marketId: string, selectionId: string, selectionName: string, odds: number) => {
    setSelectedBets(prev => {
      // If this selection is already selected, remove it
      if (prev[marketId] && prev[marketId].selectionId === selectionId) {
        const { [marketId]: _, ...rest } = prev;
        return rest;
      }
      
      // Otherwise add/update it
      return {
        ...prev,
        [marketId]: {
          selectionId,
          selectionName,
          odds
        }
      };
    });
  };

  // Calculate total odds and potential return
  const [stake, setStake] = useState<string>("");
  
  const calculateTotalOdds = () => {
    if (Object.keys(selectedBets).length === 0) return 0;
    
    return Object.values(selectedBets).reduce((acc: number, bet: any) => acc * bet.odds, 1);
  };
  
  const calculatePotentialReturn = () => {
    const totalOdds = calculateTotalOdds();
    const stakeValue = parseFloat(stake) || 0;
    return (totalOdds * stakeValue).toFixed(2);
  };

  // Add selections to betslip
  const addToBetslip = () => {
    // In a real app, this would save the betslip to state/localStorage or make an API call
    console.log("Added to betslip:", selectedBets);
    alert("Selections added to betslip!");
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <div>
              <div className="flex items-center mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm text-gray-500">{event.status}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{event.title}</h1>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                href="/events" 
                className="text-green-600 hover:text-green-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Events
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-gray-600 mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{event.date} • {event.time}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
            </div>
            <div>
              <p className="text-gray-700">{event.description}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market categories and markets */}
          <div className="lg:col-span-2">
            {/* Market categories tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {marketCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                        activeCategory === category.id
                          ? "border-b-2 border-green-500 text-green-600"
                          : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Betting markets */}
            <div className="space-y-6">
              {bettingMarkets[activeCategory as keyof typeof bettingMarkets]?.map(market => (
                <div key={market.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">{market.name}</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {market.selections.map(selection => (
                        <button
                          key={selection.id}
                          onClick={() => toggleBetSelection(market.id, selection.id, selection.name, selection.odds)}
                          className={`p-4 rounded-lg border ${
                            selectedBets[market.id] && selectedBets[market.id].selectionId === selection.id
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{selection.name}</span>
                            <span className="text-lg font-bold text-green-600">{selection.odds.toFixed(2)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Betslip */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-4">
              <div className="px-6 py-4 bg-green-600 text-white rounded-t-lg">
                <h3 className="text-lg font-semibold">Betslip</h3>
              </div>
              <div className="p-6">
                {Object.keys(selectedBets).length > 0 ? (
                  <>
                    <div className="space-y-4 mb-6">
                      {Object.entries(selectedBets).map(([marketId, bet]: [string, any]) => (
                        <div key={marketId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{bet.selectionName}</p>
                            <p className="text-xs text-gray-500">
                              {bettingMarkets[activeCategory as keyof typeof bettingMarkets].find(m => m.id === marketId)?.name}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold text-green-600 mr-2">{bet.odds.toFixed(2)}</span>
                            <button
                              onClick={() => {
                                setSelectedBets(prev => {
                                  const { [marketId]: _, ...rest } = prev;
                                  return rest;
                                });
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="stake" className="block text-sm font-medium text-gray-700 mb-1">Your Stake ($)</label>
                      <input
                        type="number"
                        id="stake"
                        min="0"
                        step="0.01"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span>Number of Selections:</span>
                        <span className="font-semibold">{Object.keys(selectedBets).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Odds:</span>
                        <span className="font-semibold">{calculateTotalOdds().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Potential Return:</span>
                        <span>${calculatePotentialReturn()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={addToBetslip}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
                      >
                        Add to Betslip
                      </button>
                      <Link
                        href="/betslip"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-md text-center transition"
                      >
                        View Betslip
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 mb-4">Your betslip is empty</p>
                    <p className="text-sm text-gray-400">Select odds from the markets to add selections to your betslip.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

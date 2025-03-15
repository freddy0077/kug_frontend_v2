'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Betslip() {
  // Sample betslip data (in a real app, this would come from a global state or API)
  const [betSlipItems, setBetSlipItems] = useState([
    {
      id: 1,
      event: "Manchester United vs Liverpool",
      market: "Match Result",
      selection: "Liverpool",
      odds: 2.20,
      stake: 50
    },
    {
      id: 2,
      event: "Lakers vs Warriors",
      market: "Total Points",
      selection: "Over 220.5",
      odds: 1.90,
      stake: 30
    },
    {
      id: 3,
      event: "UFC 300: Championship Fight",
      market: "Method of Victory",
      selection: "KO/TKO",
      odds: 2.50,
      stake: 20
    }
  ]);

  // State for bet type and calculations
  const [betType, setBetType] = useState('single'); // 'single', 'multiple', 'system'
  const [totalStake, setTotalStake] = useState(0);

  // Calculate the total stake based on individual stakes
  const calculateTotalStake = () => {
    if (betType === 'single') {
      return betSlipItems.reduce((total, item) => total + item.stake, 0);
    } else if (betType === 'multiple') {
      // For multiple bets, total stake is what user enters manually
      return totalStake;
    }
    return 0;
  };

  // Calculate potential returns
  const calculatePotentialReturns = () => {
    if (betType === 'single') {
      // For singles, calculate each bet's return separately
      return betSlipItems.map(item => ({
        id: item.id,
        returns: (item.odds * item.stake).toFixed(2)
      }));
    } else if (betType === 'multiple') {
      // For multiples, multiply all odds together
      const totalOdds = betSlipItems.reduce((total, item) => total * item.odds, 1);
      return [{ id: 'multiple', returns: (totalOdds * totalStake).toFixed(2) }];
    }
    return [];
  };

  // Update stake for a specific bet
  const updateStake = (id: number, stake: number) => {
    setBetSlipItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, stake } : item
      )
    );
  };

  // Remove item from betslip
  const removeItem = (id: number) => {
    setBetSlipItems(prev => prev.filter(item => item.id !== id));
  };

  // Clear entire betslip
  const clearBetslip = () => {
    setBetSlipItems([]);
  };

  // Place bet action
  const placeBet = () => {
    // In a real app, this would make an API call to place the bet
    alert('Your bet has been placed successfully!');
    // Then clear the betslip or redirect
    clearBetslip();
  };

  // Calculate the total potential returns (for UI display)
  const potentialReturns = calculatePotentialReturns();
  const totalPotentialReturn = potentialReturns.reduce(
    (total, item) => total + parseFloat(item.returns), 
    0
  ).toFixed(2);

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Bet Slip</h1>
        
        {betSlipItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bet selections */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Selections</h2>
                  <button 
                    onClick={clearBetslip}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {betSlipItems.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">{item.event}</h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>{item.market}: <span className="font-medium">{item.selection}</span></p>
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Stake ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={item.stake}
                            onChange={(e) => updateStake(item.id, parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Odds</p>
                          <p className="font-bold text-green-600">{item.odds.toFixed(2)}</p>
                        </div>
                        
                        {betType === 'single' && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Potential Return</p>
                            <p className="font-bold text-green-600">
                              ${potentialReturns.find(r => r.id === item.id)?.returns || '0.00'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Betting tips */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Betting Tips</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Always bet responsibly and only wager what you can afford to lose.
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Consider researching events before placing bets to make informed decisions.
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Multiple bets offer higher returns but come with increased risk.
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Bet summary and actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md sticky top-4">
                <div className="px-6 py-4 bg-green-600 text-white rounded-t-lg">
                  <h3 className="text-lg font-semibold">Bet Summary</h3>
                </div>
                
                <div className="p-6">
                  {/* Bet type selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bet Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBetType('single')}
                        className={`py-2 text-sm font-medium rounded-md ${
                          betType === 'single'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Single Bets
                      </button>
                      <button
                        onClick={() => setBetType('multiple')}
                        className={`py-2 text-sm font-medium rounded-md ${
                          betType === 'multiple'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Multiple Bet
                      </button>
                    </div>
                  </div>
                  
                  {/* Multiple bet stake input */}
                  {betType === 'multiple' && (
                    <div className="mb-6">
                      <label htmlFor="multiple-stake" className="block text-sm font-medium text-gray-700 mb-1">
                        Stake for Multiple ($)
                      </label>
                      <input
                        type="number"
                        id="multiple-stake"
                        min="0"
                        step="0.01"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={totalStake}
                        onChange={(e) => setTotalStake(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}
                  
                  {/* Bet calculations */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Number of Selections:</span>
                      <span className="font-medium">{betSlipItems.length}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Stake:</span>
                      <span className="font-medium">${calculateTotalStake().toFixed(2)}</span>
                    </div>
                    
                    {betType === 'multiple' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Odds:</span>
                        <span className="font-medium">
                          {betSlipItems.reduce((total, item) => total * item.odds, 1).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-green-600 font-bold pt-2 border-t border-gray-100">
                      <span>Potential Return:</span>
                      <span>${totalPotentialReturn}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={placeBet}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium transition"
                    >
                      Place Bet
                    </button>
                    
                    <Link
                      href="/events"
                      className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-md font-medium text-center transition"
                    >
                      Add More Bets
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">Your Bet Slip is Empty</h2>
            <p className="text-gray-500 mb-8">Browse events and add selections to your bet slip.</p>
            <Link
              href="/events"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

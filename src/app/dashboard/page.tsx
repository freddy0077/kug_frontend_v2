import Link from 'next/link';

export default function Dashboard() {
  // Sample active bets data
  const activeBets = [
    {
      id: 1,
      event: "Man Utd vs Liverpool",
      betOn: "Liverpool to win",
      amount: "$50",
      potentialWin: "$137.50",
      odds: "2.75",
      status: "active"
    },
    {
      id: 2,
      event: "Lakers vs Warriors",
      betOn: "Total points over 220.5",
      amount: "$75",
      potentialWin: "$142.50",
      odds: "1.90",
      status: "active"
    },
    {
      id: 3,
      event: "UFC 300: Main Event",
      betOn: "Fight to end by KO/TKO",
      amount: "$40",
      potentialWin: "$100",
      odds: "2.50",
      status: "active"
    }
  ];

  // Sample bet history
  const betHistory = [
    {
      id: 101,
      event: "Arsenal vs Chelsea",
      betOn: "Draw",
      amount: "$30",
      result: "Lost",
      date: "March 1, 2025"
    },
    {
      id: 102,
      event: "Boston Celtics vs Miami Heat",
      betOn: "Celtics -4.5",
      amount: "$60",
      result: "Won",
      date: "February 28, 2025"
    },
    {
      id: 103,
      event: "F1 Bahrain GP",
      betOn: "Hamilton to Podium",
      amount: "$25",
      result: "Won",
      date: "February 27, 2025"
    }
  ];

  // Account summary data
  const accountSummary = {
    balance: "$325.00",
    totalBets: 27,
    winRate: "62%",
    pendingWithdrawals: "$0.00"
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>
        
        {/* Account Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">{accountSummary.balance}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Bets</p>
              <p className="text-2xl font-bold">{accountSummary.totalBets}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold">{accountSummary.winRate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Pending Withdrawals</p>
              <p className="text-2xl font-bold">{accountSummary.pendingWithdrawals}</p>
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <Link 
              href="/profile" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
              View Profile
            </Link>
            <Link 
              href="/transactions" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition">
              Transaction History
            </Link>
          </div>
        </div>
        
        {/* Active Bets */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Bets</h2>
            <Link 
              href="/betslip" 
              className="text-green-600 hover:text-green-800 text-sm font-medium">
              View Bet Slip
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stake</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Win</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeBets.map(bet => (
                  <tr key={bet.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bet.event}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bet.betOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bet.odds}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bet.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{bet.potentialWin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/betslip/${bet.id}`}
                        className="text-green-600 hover:text-green-900 mr-3">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Bet History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Bet History</h2>
            <Link 
              href="/profile/history" 
              className="text-green-600 hover:text-green-800 text-sm font-medium">
              View All History
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stake</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {betHistory.map(bet => (
                  <tr key={bet.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bet.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bet.event}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bet.betOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bet.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bet.result === 'Won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bet.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

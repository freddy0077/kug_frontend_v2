'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const competitionCategories = [
  {
    id: "conformation",
    name: "Conformation Shows",
    description: "Rules and guidelines for breed conformation competitions.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Conformation Show Rules</h3>
      <p class="mb-4">Conformation shows evaluate dogs against their breed standards. These guidelines explain the rules and procedures for participating in and judging conformation events:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Classes and Divisions</h4>
      <p class="mb-4">Conformation shows typically include the following classes:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Puppy Class:</strong> 6-12 months of age</li>
        <li class="mb-2"><strong>Junior Class:</strong> 12-18 months of age</li>
        <li class="mb-2"><strong>Open Class:</strong> Any age over 6 months</li>
        <li class="mb-2"><strong>Champion Class:</strong> For dogs that have already earned their championship</li>
        <li class="mb-2"><strong>Veteran Class:</strong> For dogs 7 years and older</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Judging Criteria</h4>
      <p class="mb-4">Dogs are evaluated based on the following elements:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Type:</strong> The essence of breed characteristics</li>
        <li class="mb-2"><strong>Structure:</strong> Skeletal and muscular composition</li>
        <li class="mb-2"><strong>Gait:</strong> Movement and functionality</li>
        <li class="mb-2"><strong>Temperament:</strong> Behavioral characteristics typical of the breed</li>
        <li class="mb-2"><strong>Condition:</strong> Overall health and presentation</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Show Procedures</h4>
      <ol class="list-decimal ml-6 mb-4">
        <li class="mb-2">Dogs are examined individually by the judge</li>
        <li class="mb-2">Handlers demonstrate the dog's gait by moving in patterns specified by the judge</li>
        <li class="mb-2">Dogs are compared to others in their class</li>
        <li class="mb-2">Winners of each class compete for Winners Dog/Bitch</li>
        <li class="mb-2">Winners Dog/Bitch compete with Champions for Best of Breed</li>
        <li class="mb-2">Best of Breed winners advance to Group competition</li>
        <li class="mb-2">Group winners compete for Best in Show</li>
      </ol>
    `
  },
  {
    id: "obedience",
    name: "Obedience Trials",
    description: "Rules for obedience competitions across all levels.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Obedience Trial Rules</h3>
      <p class="mb-4">Obedience trials test a dog's ability to perform specific exercises as directed by the handler. These guidelines outline the rules for obedience competitions:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Competition Levels</h4>
      <p class="mb-4">Obedience trials typically include the following levels, each requiring increasingly complex skills:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Beginner Novice:</strong> Basic on-leash exercises</li>
        <li class="mb-2"><strong>Novice:</strong> Basic on and off-leash exercises</li>
        <li class="mb-2"><strong>Open:</strong> Advanced exercises including jumps and retrieving</li>
        <li class="mb-2"><strong>Utility:</strong> Complex exercises requiring scent discrimination and directed retrieves</li>
        <li class="mb-2"><strong>Utility Dog Excellent (UDX):</strong> Competing in both Open and Utility at the same trial</li>
        <li class="mb-2"><strong>Obedience Trial Champion (OTCH):</strong> Highest level of achievement</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Standard Exercises</h4>
      <p class="mb-4">Common exercises evaluated in obedience trials include:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Heel on Leash and Figure Eight:</strong> Dog must follow handler's pace and direction</li>
        <li class="mb-2"><strong>Stand for Examination:</strong> Dog must remain standing while judge examines</li>
        <li class="mb-2"><strong>Heel Free:</strong> Off-leash heeling</li>
        <li class="mb-2"><strong>Recall:</strong> Dog comes when called</li>
        <li class="mb-2"><strong>Sit and Down Stay:</strong> Dog maintains position while handler walks away</li>
        <li class="mb-2"><strong>Retrieve on Flat/Over Jump:</strong> Dog retrieves a dumbbell</li>
        <li class="mb-2"><strong>Directed Jumping:</strong> Dog jumps over specific jumps as directed</li>
        <li class="mb-2"><strong>Scent Discrimination:</strong> Dog finds articles with handler's scent</li>
        <li class="mb-2"><strong>Directed Retrieve:</strong> Dog retrieves specific glove as directed</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Scoring</h4>
      <p class="mb-4">Scoring in obedience is based on precision and accuracy:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2">Each exercise has a perfect score (usually 40-50 points)</li>
        <li class="mb-2">Points are deducted for errors or imprecise execution</li>
        <li class="mb-2">A qualifying score is 170 out of 200 points</li>
        <li class="mb-2">Three qualifying scores under at least two different judges earn a title</li>
      </ul>
    `
  },
  {
    id: "agility",
    name: "Agility Competitions",
    description: "Rules for agility courses and judging criteria.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Agility Competition Rules</h3>
      <p class="mb-4">Agility is a dog sport where the handler directs the dog through an obstacle course with speed and accuracy. These guidelines explain the rules for agility competitions:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Competition Levels</h4>
      <p class="mb-4">Agility competitions typically include the following levels:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Novice/Starters:</strong> Basic courses with limited obstacles</li>
        <li class="mb-2"><strong>Open/Advanced:</strong> More complex courses with additional obstacles</li>
        <li class="mb-2"><strong>Excellent/Masters:</strong> The most challenging courses with complex sequences</li>
        <li class="mb-2"><strong>Championship:</strong> Highest level of competition</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Standard Obstacles</h4>
      <p class="mb-4">Common obstacles in agility courses include:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Jumps:</strong> Bar jumps, spread jumps, tire jumps</li>
        <li class="mb-2"><strong>Contact Obstacles:</strong> A-frame, dog walk, seesaw (teeter-totter)</li>
        <li class="mb-2"><strong>Tunnels:</strong> Open tunnel, closed tunnel (chute)</li>
        <li class="mb-2"><strong>Weave Poles:</strong> Series of upright poles the dog must navigate through</li>
        <li class="mb-2"><strong>Table:</strong> Raised platform where dog must perform a sit or down stay</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Scoring Methods</h4>
      <p class="mb-4">Scoring in agility varies by organization but generally follows one of these methods:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Time Plus Faults:</strong> Course time plus penalty seconds for faults</li>
        <li class="mb-2"><strong>Points Then Time:</strong> Obstacles are assigned point values, highest score wins, with time as tiebreaker</li>
        <li class="mb-2"><strong>Standard Course Time (SCT):</strong> Dogs must complete the course within the SCT with minimal faults</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Common Faults</h4>
      <p class="mb-4">Penalties are assessed for the following errors:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Refusals:</strong> Dog stops or turns away from an obstacle</li>
        <li class="mb-2"><strong>Wrong Course:</strong> Dog takes an obstacle out of sequence</li>
        <li class="mb-2"><strong>Missed Contacts:</strong> Dog doesn't touch contact zones on relevant obstacles</li>
        <li class="mb-2"><strong>Knocked Bars:</strong> Dog knocks down a jump bar</li>
        <li class="mb-2"><strong>Missed Weave Poles:</strong> Dog skips poles or enters incorrectly</li>
        <li class="mb-2"><strong>Time Faults:</strong> Exceeding the standard course time</li>
      </ul>
    `
  },
  {
    id: "field-trials",
    name: "Field Trials & Tests",
    description: "Rules for sporting dog trials and field performance tests.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Field Trial & Test Rules</h3>
      <p class="mb-4">Field trials and tests evaluate a sporting dog's ability to perform its original breed purpose in hunting or field work. These guidelines outline the rules for various field events:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Retriever Field Trials</h4>
      <p class="mb-4">Retriever trials test a dog's marking ability, memory, perseverance, and trainability:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Junior Level:</strong> Single and double marked retrieves on land and water</li>
        <li class="mb-2"><strong>Senior Level:</strong> Multiple marked retrieves, blind retrieves, and honoring</li>
        <li class="mb-2"><strong>Master Level:</strong> Complex multiple marks, challenging blind retrieves, and steady honoring</li>
        <li class="mb-2"><strong>Field Trial:</strong> Competitive events with placement of dogs</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Pointing Breed Trials</h4>
      <p class="mb-4">Pointing breed trials evaluate a dog's ability to find and point game birds:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Hunting Dog Test:</strong> Basic pointing, steadiness, and retrieving skills</li>
        <li class="mb-2"><strong>Field Trial:</strong> Competitive evaluation of pointing, backing, and bird finding ability</li>
        <li class="mb-2"><strong>Gun Dog Stake:</strong> Emphasis on practical hunting skills</li>
        <li class="mb-2"><strong>All-Age Stake:</strong> Tests range, independence, and bird finding at distance</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Spaniel Field Trials</h4>
      <p class="mb-4">Spaniel trials evaluate flushing, marking, and retrieving abilities:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Junior Level:</strong> Basic quartering, flushing, and retrieving</li>
        <li class="mb-2"><strong>Senior Level:</strong> Steady to flush and shot, blind retrieves</li>
        <li class="mb-2"><strong>Master Level:</strong> Advanced steadiness, multiple retrieves, and complex hunting scenarios</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Earthdog Tests</h4>
      <p class="mb-4">Earthdog tests evaluate terriers and dachshunds on their natural hunting abilities underground:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Introduction to Quarry:</strong> Basic interest in quarry (typically caged rats)</li>
        <li class="mb-2"><strong>Junior Earthdog:</strong> Navigating a simple tunnel to quarry</li>
        <li class="mb-2"><strong>Senior Earthdog:</strong> More complex tunnels with turns and obstacles</li>
        <li class="mb-2"><strong>Master Earthdog:</strong> Working with other dogs, discriminating between entrances</li>
      </ul>
    `
  },
  {
    id: "herding",
    name: "Herding Trials",
    description: "Rules for herding dog competitions and evaluations.",
    content: `
      <h3 class="text-xl font-semibold mb-4">Herding Trial Rules</h3>
      <p class="mb-4">Herding trials evaluate a dog's ability to control and move livestock. These guidelines outline the rules for herding trials with various livestock:</p>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Test Levels</h4>
      <p class="mb-4">Herding tests and trials typically include these levels:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Herding Instinct Test:</strong> Basic evaluation of natural herding instinct</li>
        <li class="mb-2"><strong>Herding Tested/Pre-Trial Tested:</strong> Demonstrates basic control and interest</li>
        <li class="mb-2"><strong>Started:</strong> Basic herding patterns with guidance from handler</li>
        <li class="mb-2"><strong>Intermediate:</strong> More complex herding tasks with less handler assistance</li>
        <li class="mb-2"><strong>Advanced:</strong> High level of control with minimal handler assistance</li>
        <li class="mb-2"><strong>Herding Champion:</strong> Highest level of achievement</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Course Types</h4>
      <p class="mb-4">Several course types are used in herding trials:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>A Course:</strong> Tests the dog's ability to move stock through a field course with gates</li>
        <li class="mb-2"><strong>B Course:</strong> Border collie style course with outrun, lift, fetch, drive, and pen</li>
        <li class="mb-2"><strong>C Course:</strong> Focuses on tending style herding with boundary work</li>
        <li class="mb-2"><strong>D Course:</strong> Ranch or farm utility course with practical tasks</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Livestock Types</h4>
      <p class="mb-4">Herding trials may involve different livestock:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Sheep:</strong> Most common stock type used in trials</li>
        <li class="mb-2"><strong>Ducks/Geese:</strong> Used for smaller areas and some breeds</li>
        <li class="mb-2"><strong>Cattle:</strong> Used for testing stronger, more confident dogs</li>
        <li class="mb-2"><strong>Goats:</strong> Sometimes used as an alternative to sheep</li>
      </ul>
      
      <h4 class="text-lg font-medium mt-6 mb-2">Judging Criteria</h4>
      <p class="mb-4">Herding trials are judged on:</p>
      <ul class="list-disc ml-6 mb-4">
        <li class="mb-2"><strong>Control:</strong> Dog's ability to control livestock movement</li>
        <li class="mb-2"><strong>Style:</strong> Natural working style appropriate to the breed</li>
        <li class="mb-2"><strong>Power:</strong> Appropriate force used to move stock</li>
        <li class="mb-2"><strong>Response to Commands:</strong> Obedience to handler's directions</li>
        <li class="mb-2"><strong>Efficiency:</strong> Completion of tasks with minimal stress to livestock</li>
        <li class="mb-2"><strong>Time:</strong> Completion within the allotted time frame</li>
      </ul>
    `
  }
];

export default function CompetitionRules() {
  const [selectedCategory, setSelectedCategory] = useState<string>(competitionCategories[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter categories based on search query
  const filteredCategories = competitionCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find the selected category
  const selectedCategoryData = selectedCategory 
    ? competitionCategories.find(category => category.id === selectedCategory) 
    : competitionCategories[0];

  return (
    <ProtectedRoute allowedRoles={[]}>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Competition Rules</h1>
          <p className="text-gray-600 mb-8">
            Comprehensive rules and guidelines for dog competitions across various disciplines. 
            These resources help handlers, judges, and spectators understand the rules, scoring systems, 
            and expectations for each competition type.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Category List */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label htmlFor="search-categories" className="sr-only">Search Competition Categories</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search-categories"
                    id="search-categories"
                    className="block w-full rounded-md border-0 py-2 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Search competition types..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h2 className="text-lg font-medium text-gray-900 mb-3">Competition Types</h2>
              <ul className="space-y-2">
                {filteredCategories.map(category => (
                  <li key={category.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Category Details */}
            {selectedCategoryData && (
              <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-md">
                <article className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedCategoryData.content }} />
                </article>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Related Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        href="/competitions"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        View Upcoming Competitions
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/docs/user-guides"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                        </svg>
                        Download Competition Rulebooks
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/club-events"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                        </svg>
                        Find Club-Hosted Events
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

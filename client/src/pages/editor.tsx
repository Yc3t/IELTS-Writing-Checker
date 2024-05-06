// components/Editor.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useEssay } from './context/EssayContext';

const Editor: React.FC = () => {
  const { essay, setEssay, topic, setTopic } = useEssay();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    console.log("Sending essay:", essay);
    console.log("Sending topic:", topic);
  
    localStorage.setItem('essay', essay);
    localStorage.setItem('topic', topic);
  
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay, topic })
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        router.push({
          pathname: '/result',
          query: { scores: JSON.stringify(data) }
        });
      } else {
        console.error('Failed to fetch scores');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black px-6 py-12">
      <div className="flex flex-col items-center w-full">
        <h1 className="text-center text-4xl md:text-8xl md:mb-3 md:mt-5 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300 font-sans font-bold">
          WRITING CHECKER
        </h1>
        <div className="w-full">
          <div className="mb-6">
            <h2 className="text-2xl text-white font-bold mb-2">Topic:</h2>
            <textarea
              className="w-full h-20 p-4 text-lg text-white bg-gray-800 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic..."
            />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl text-white font-bold mb-2">Essay:</h2>
            <textarea
              className="w-full h-48 p-4 text-lg text-white bg-gray-800 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Enter your IELTS writing task 2 essay..."
            />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
              onClick={handleEvaluate}
              disabled={loading}>
              {loading ? 'Checking...' : 'Check Essay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;

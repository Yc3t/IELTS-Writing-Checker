// pages/result.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { useEssay } from './context/EssayContext';

interface ScoreResponse {
  [trait: string]: number;
}

const ResultPage: React.FC = () => {
  const router = useRouter();
  const scoresQuery = router.query.scores as string | undefined;

  // Retrieve from local storage
  const essay = localStorage.getItem('essay') || '';
  const topic = localStorage.getItem('topic') || '';

  let scores: ScoreResponse | null = null;
  if (scoresQuery) {
    try {
      scores = JSON.parse(scoresQuery) as ScoreResponse;
    } catch (error) {
      console.error('Failed to parse scores:', error);
      scores = null;
    }
  }


  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="w-2/3 p-4 overflow-auto text-white">
        <h1 className="text-3xl font-bold">Essay Review</h1>
        <h2 className="text-xl font-bold">Topic</h2>
        <p className="p-4 bg-gray-800 rounded-lg">{topic}</p>
        <h2 className="text-xl font-bold">Essay Content</h2>
        <textarea readOnly value={essay} className="w-full h-96 p-2 bg-gray-700 text-white rounded" />
      </div>
      <div className="w-1/3 p-4 bg-gray-800 text-white">
        <h1 className="text-3xl font-bold">Scores and Feedback</h1>
        {scores && (
          <div className="space-y-3">
            {Object.entries(scores).map(([trait, score], index) => (
              <div key={index} className="p-2 bg-gray-700 rounded">
                <strong>{trait}:</strong> <span>{score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;

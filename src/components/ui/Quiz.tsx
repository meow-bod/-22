'use client';

import React, { useState } from 'react';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface QuizProps {
  questions: Question[];
}

const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswerOptionClick = (option: string) => {
    if (option === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    setSelectedOption(option);

    const nextQuestion = currentQuestion + 1;
    setTimeout(() => {
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedOption(null);
      } else {
        setShowScore(true);
      }
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {showScore ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold">測驗完成！</h2>
          <p className="text-xl mt-4">您答對了 {score} / {questions.length} 題</p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">問題 {currentQuestion + 1}</h2>
            <p className="text-lg">{questions[currentQuestion].question}</p>
          </div>
          <div className="flex flex-col space-y-2">
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerOptionClick(option)}
                disabled={!!selectedOption}
                className={`p-3 rounded-lg text-left transition-colors duration-300 ${
                  selectedOption
                    ? option === questions[currentQuestion].answer
                      ? 'bg-green-500 text-white'
                      : option === selectedOption
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
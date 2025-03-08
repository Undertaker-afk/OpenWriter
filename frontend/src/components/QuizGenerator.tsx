import React from 'react';

interface Flashcard {
  question: string;
  answer: string;
  status: 'need to learn' | 'already know';
}

interface QuizGeneratorProps {
  flashcards: Flashcard[];
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ flashcards }) => {
  const generateQuiz = () => {
    return flashcards.map((flashcard, index) => {
      const options = generateOptions(flashcard.answer);
      return (
        <div key={index} className="quiz-question">
          <div className="question">{flashcard.question}</div>
          <div className="options">
            {options.map((option, idx) => (
              <button key={idx} className="option">
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    });
  };

  const generateOptions = (correctAnswer: string) => {
    const options = [correctAnswer];
    while (options.length < 4) {
      const randomOption = generateRandomOption();
      if (!options.includes(randomOption)) {
        options.push(randomOption);
      }
    }
    return shuffleArray(options);
  };

  const generateRandomOption = () => {
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    return flashcards[randomIndex].answer;
  };

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  return <div className="quiz-generator">{generateQuiz()}</div>;
};

export default QuizGenerator;

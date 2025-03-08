import React from 'react';

interface FlashcardProps {
  question: string;
  answer: string;
  status: 'need to learn' | 'already know';
  onStatusChange: (newStatus: 'need to learn' | 'already know') => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer, status, onStatusChange }) => {
  return (
    <div className="flashcard">
      <div className="question">
        {question}
      </div>
      <div className="answer">
        {answer}
      </div>
      <div className="status-buttons">
        <button 
          className={status === 'need to learn' ? 'active' : ''}
          onClick={() => onStatusChange('need to learn')}
        >
          Need to Learn
        </button>
        <button 
          className={status === 'already know' ? 'active' : ''}
          onClick={() => onStatusChange('already know')}
        >
          Already Know
        </button>
      </div>
    </div>
  );
};

export default Flashcard;

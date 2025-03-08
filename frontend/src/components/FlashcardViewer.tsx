import React, { useState } from 'react';
import Flashcard from './Flashcard';

interface FlashcardData {
  question: string;
  answer: string;
  status: 'need to learn' | 'already know';
}

const FlashcardViewer: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([
    { question: 'What is React?', answer: 'A JavaScript library for building user interfaces', status: 'need to learn' },
    { question: 'What is a component?', answer: 'A reusable piece of UI', status: 'already know' },
  ]);

  const handleStatusChange = (index: number, newStatus: 'need to learn' | 'already know') => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[index].status = newStatus;
    setFlashcards(updatedFlashcards);
  };

  return (
    <div className="flashcard-viewer">
      {flashcards.map((flashcard, index) => (
        <Flashcard
          key={index}
          question={flashcard.question}
          answer={flashcard.answer}
          status={flashcard.status}
          onStatusChange={(newStatus) => handleStatusChange(index, newStatus)}
        />
      ))}
    </div>
  );
};

export default FlashcardViewer;

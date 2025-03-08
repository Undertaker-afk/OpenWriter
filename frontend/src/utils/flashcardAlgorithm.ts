export interface Flashcard {
  question: string;
  answer: string;
  status: 'need to learn' | 'already know';
}

export function balanceFlashcards(flashcards: Flashcard[]): Flashcard[] {
  const needToLearn = flashcards.filter(card => card.status === 'need to learn');
  const alreadyKnow = flashcards.filter(card => card.status === 'already know');

  const balancedFlashcards: Flashcard[] = [];
  const maxLength = Math.max(needToLearn.length, alreadyKnow.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < needToLearn.length) {
      balancedFlashcards.push(needToLearn[i]);
    }
    if (i < alreadyKnow.length) {
      balancedFlashcards.push(alreadyKnow[i]);
    }
  }

  return balancedFlashcards;
}

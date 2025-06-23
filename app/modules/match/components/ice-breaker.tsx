import clsx from 'clsx';

interface IceBreakerProps {
  question: string;
  answers: string[];
  onAnswerSelect: (answer: string) => void;
  selectedAnswer?: string;
}

export function IceBreaker({
  question,
  answers,
  onAnswerSelect,
  selectedAnswer,
}: IceBreakerProps) {
  const answerLabels = ['A', 'B', 'C'];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      {/* Question */}
      <div className="mb-6">
        <p className="text-white text-base leading-relaxed">{question}</p>
      </div>

      {/* Answer Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {answers.slice(0, 3).map((answer, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(answer)}
            className={clsx(
              'p-4 rounded-lg border-2 transition-all duration-200 text-left',
              'hover:bg-white/10 hover:border-purple-400',
              selectedAnswer === answer
                ? 'bg-purple-500/20 border-purple-400 text-white'
                : 'bg-white/5 border-white/20 text-gray-300',
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-purple-400 mt-0.5">
                {answerLabels[index]}
              </span>
              <span className="text-sm leading-relaxed flex-1">{answer}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Submit Button (optional - could be handled externally) */}
      {selectedAnswer && (
        <div className="mt-6 flex justify-center">
          <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-200">
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to create mock ice breaker data
export function createMockIceBreaker() {
  return {
    id: '1',
    question:
      'Ice breaker Ice breaker Ice breaker Ice breaker Ice breaker Ice breaker Ice breaker Ice breaker Ice breaker',
    answers: ['answer A', 'answer B', 'answer C'],
  };
}

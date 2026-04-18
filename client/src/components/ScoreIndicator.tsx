export default function ScoreIndicator({ score }: { score: number }) {
  let colorClass: string;
  if (score < 4) {
    colorClass = 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700';
  } else if (score <= 7) {
    colorClass = 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
  } else {
    colorClass = 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700';
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm ${colorClass}`}
    >
      {score}
    </span>
  );
}

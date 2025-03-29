import PuzzleGame from "@/components/puzzle-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">15 Puzzle Game</h1>
      <PuzzleGame />
    </main>
  )
}

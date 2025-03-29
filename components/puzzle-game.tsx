"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shuffle, RotateCcw, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Position = {
  row: number
  col: number
}

type Tile = {
  id: number
  value: number
  position: Position
}

const GRID_SIZE = 4
const EMPTY_TILE_VALUE = 0

export default function PuzzleGame() {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [isWon, setIsWon] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Initialize the game
  useEffect(() => {
    initializeGame()
  }, [])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && !isWon) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, isWon])

  // Check for win condition
  useEffect(() => {
    if (tiles.length === 0) return

    const hasWon = tiles.every((tile) => {
      if (tile.value === EMPTY_TILE_VALUE) {
        return tile.position.row === GRID_SIZE - 1 && tile.position.col === GRID_SIZE - 1
      }
      const expectedRow = Math.floor((tile.value - 1) / GRID_SIZE)
      const expectedCol = (tile.value - 1) % GRID_SIZE
      return tile.position.row === expectedRow && tile.position.col === expectedCol
    })

    if (hasWon && !isWon && moveCount > 0) {
      setIsWon(true)
      setIsRunning(false)
    }
  }, [tiles, isWon, moveCount])

  // Initialize the game with a solvable puzzle
  const initializeGame = useCallback(() => {
    const newTiles: Tile[] = []
    const values = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i)

    // Generate a solvable puzzle
    do {
      shuffleArray(values)
    } while (!isSolvable(values))

    for (let i = 0; i < values.length; i++) {
      const row = Math.floor(i / GRID_SIZE)
      const col = i % GRID_SIZE
      newTiles.push({
        id: i,
        value: values[i],
        position: { row, col },
      })
    }

    setTiles(newTiles)
    setIsWon(false)
    setMoveCount(0)
    setTime(0)
    setIsRunning(true)
  }, [])

  // Check if the puzzle is solvable
  const isSolvable = (values: number[]): boolean => {
    // Count inversions
    let inversions = 0
    const valuesWithoutEmpty = values.filter((val) => val !== EMPTY_TILE_VALUE)

    for (let i = 0; i < valuesWithoutEmpty.length; i++) {
      for (let j = i + 1; j < valuesWithoutEmpty.length; j++) {
        if (valuesWithoutEmpty[i] > valuesWithoutEmpty[j]) {
          inversions++
        }
      }
    }

    // Find the row of the empty tile (from bottom)
    const emptyIndex = values.indexOf(EMPTY_TILE_VALUE)
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE)
    const emptyRowFromBottom = GRID_SIZE - emptyRow

    // For a 4x4 puzzle:
    // If the empty tile is on an even row from the bottom, the number of inversions must be odd
    // If the empty tile is on an odd row from the bottom, the number of inversions must be even
    return (
      (emptyRowFromBottom % 2 === 0 && inversions % 2 === 1) || (emptyRowFromBottom % 2 === 1 && inversions % 2 === 0)
    )
  }

  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  // Handle tile click
  const handleTileClick = (clickedTile: Tile) => {
    if (isWon) return

    const emptyTile = tiles.find((tile) => tile.value === EMPTY_TILE_VALUE)
    if (!emptyTile) return

    // Check if the clicked tile is adjacent to the empty tile
    const { row, col } = clickedTile.position
    const { row: emptyRow, col: emptyCol } = emptyTile.position

    const isAdjacent =
      (row === emptyRow && Math.abs(col - emptyCol) === 1) || (col === emptyCol && Math.abs(row - emptyRow) === 1)

    if (isAdjacent) {
      // Swap positions
      setTiles((prevTiles) => {
        return prevTiles.map((tile) => {
          if (tile.value === clickedTile.value) {
            return { ...tile, position: { ...emptyTile.position } }
          }
          if (tile.value === EMPTY_TILE_VALUE) {
            return { ...tile, position: { ...clickedTile.position } }
          }
          return tile
        })
      })

      setMoveCount((prev) => prev + 1)
      if (!isRunning) setIsRunning(true)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center p-4 rounded-lg shadow-lg max-w-md w-full",
        "bg-white dark:bg-gray-800 transition-colors duration-300",
      )}
    >
      {/* Game controls */}
      <div className="flex justify-between w-full mb-4">
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={initializeGame} title="Shuffle">
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setMoveCount(0)
              setTime(0)
              setIsRunning(true)
              setIsWon(false)
            }}
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Moves: {moveCount}</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Time: {formatTime(time)}</div>
        </div>

        <Button variant="outline" size="icon" onClick={toggleDarkMode} title="Toggle Dark Mode">
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Game board */}
      <div
        className="grid gap-2 relative bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: "100%",
          aspectRatio: "1/1",
        }}
      >
        <AnimatePresence>
          {tiles.map(
            (tile) =>
              tile.value !== EMPTY_TILE_VALUE && (
                <motion.div
                  key={tile.id}
                  initial={false}
                  animate={{
                    x: tile.position.col * 100 + "%",
                    y: tile.position.row * 100 + "%",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className={cn(
                    "absolute w-[calc(25%-8px)] h-[calc(25%-8px)]",
                    "flex items-center justify-center rounded-lg cursor-pointer",
                    "font-bold text-xl md:text-2xl select-none",
                    "bg-primary text-primary-foreground",
                    "hover:brightness-110 active:brightness-90 transition-all",
                  )}
                  onClick={() => handleTileClick(tile)}
                >
                  {tile.value}
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      {/* Win message */}
      {isWon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg text-center"
        >
          <h2 className="text-xl font-bold">You Win! 🎉</h2>
          <p className="mt-2">
            Completed in {moveCount} moves and {formatTime(time)}
          </p>
          <Button className="mt-3" onClick={initializeGame}>
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  )
}


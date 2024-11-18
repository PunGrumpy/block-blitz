'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import { GamePiece } from '@/types/game'

const previewContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
}

const previewPieceVariants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  }
}

interface NextPiecePreviewProps {
  piece: GamePiece | null
  cellSize?: number
}

export function NextPiecePreview({
  piece,
  cellSize = 30
}: NextPiecePreviewProps) {
  const [mounted, setMounted] = React.useState(false)
  const [pieceKey, setPieceKey] = React.useState(0)
  const [renderedPiece, setRenderedPiece] = React.useState<GamePiece | null>(
    null
  )

  // Handle mounting to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Update piece key when the piece changes to trigger animation
  React.useEffect(() => {
    if (piece && (!renderedPiece || piece.color !== renderedPiece.color)) {
      setPieceKey(prev => prev + 1)
      setRenderedPiece(piece)
    }
  }, [piece, renderedPiece])

  const renderPiece = React.useCallback(() => {
    if (!piece || !mounted) return null

    const cells: JSX.Element[] = []
    const pieceHeight = piece.shape.length
    const pieceWidth = piece.shape[0].length

    // Calculate size of the piece container
    const pieceContainerWidth = pieceWidth * cellSize
    const pieceContainerHeight = pieceHeight * cellSize

    piece.shape.forEach((row, y) => {
      row.forEach((isSet, x) => {
        if (isSet) {
          const style = {
            width: cellSize - 1,
            height: cellSize - 1,
            backgroundColor: piece.color,
            left: x * cellSize,
            top: y * cellSize,
            opacity: 1,
            transform: 'scale(1)'
          }

          cells.push(
            <motion.div
              key={`piece-${x}-${y}`}
              className="absolute rounded-sm border border-foreground/10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                delay: (x + y) * 0.05
              }}
              style={style}
            />
          )
        }
      })
    })

    return (
      <div
        className="relative"
        style={{
          width: pieceContainerWidth,
          height: pieceContainerHeight
        }}
      >
        {cells}
      </div>
    )
  }, [piece, cellSize, mounted])

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className="flex size-full items-center justify-center"
        style={{ minHeight: cellSize * 4 }}
      />
    )
  }

  return (
    <div className="flex size-full items-center justify-center">
      <motion.div
        className="relative"
        variants={previewContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pieceKey}
            className="relative"
            variants={previewPieceVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderPiece()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

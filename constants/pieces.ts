export const PIECE_VISUALS = {
  I: {
    color: '#00E5FF',
    gradient: 'linear-gradient(135deg, #00E5FF 0%, #0091EA 100%)',
    shadow: '#0091EA',
    glow: 'rgba(0, 229, 255, 0.5)'
  },
  O: {
    color: '#FFD600',
    gradient: 'linear-gradient(135deg, #FFD600 0%, #FFC400 100%)',
    shadow: '#FFC400',
    glow: 'rgba(255, 214, 0, 0.5)'
  },
  T: {
    color: '#FF4081',
    gradient: 'linear-gradient(135deg, #FF4081 0%, #F50057 100%)',
    shadow: '#F50057',
    glow: 'rgba(255, 64, 129, 0.5)'
  },
  L: {
    color: '#FF9100',
    gradient: 'linear-gradient(135deg, #FF9100 0%, #FF6D00 100%)',
    shadow: '#FF6D00',
    glow: 'rgba(255, 145, 0, 0.5)'
  },
  J: {
    color: '#651FFF',
    gradient: 'linear-gradient(135deg, #651FFF 0%, #4527A0 100%)',
    shadow: '#4527A0',
    glow: 'rgba(101, 31, 255, 0.5)'
  }
} as const

export const PIECE_TYPES = {
  I: {
    shape: [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false]
    ],
    visuals: PIECE_VISUALS.I
  },
  O: {
    shape: [
      [true, true],
      [true, true]
    ],
    visuals: PIECE_VISUALS.O
  },
  T: {
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false]
    ],
    visuals: PIECE_VISUALS.T
  },
  L: {
    shape: [
      [false, false, true],
      [true, true, true],
      [false, false, false]
    ],
    visuals: PIECE_VISUALS.L
  },
  J: {
    shape: [
      [true, false, false],
      [true, true, true],
      [false, false, false]
    ],
    visuals: PIECE_VISUALS.J
  }
} as const

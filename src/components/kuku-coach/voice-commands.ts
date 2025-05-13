
interface Position {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const MOVE_DISTANCE = 30;

export function move(position: Position, direction: Direction): Position {
  switch (direction) {
    case 'up':
      return { ...position, y: position.y - MOVE_DISTANCE };
    case 'down':
      return { ...position, y: position.y + MOVE_DISTANCE };
    case 'left':
      return { ...position, x: position.x - MOVE_DISTANCE };
    case 'right':
      return { ...position, x: position.x + MOVE_DISTANCE };
    default:
      return position;
  }
}

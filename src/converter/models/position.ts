import BigNumber from 'bignumber.js';

/**
 * Position represents the position of the block in the grid
 * @class
 * @property {BigNumber} x - x position of the block
 * @property {BigNumber} y - y position of the block
 */
export class Position {
  x: BigNumber;
  y: BigNumber;

  constructor(x = new BigNumber('0'), y = new BigNumber('0')) {
    this.x = x;
    this.y = y;
  }
}

import { Block, BlockType } from './models/index';

import BigNumber from 'bignumber.js';
import { Position } from './models/position';

/**
 * Grid represents the placement of the blocks
 */
export type Grid = number[][];

/**
 * Width of the grid
 */
export const GRID_WIDTH = 20;

/**
 * Height of the grid
 */
export const GRID_HEIGHT = 16;

/**
 * Function prefix for `ab_drop` function calls
 */
export const FUNCTION_PREFIX = 'ab_drop(';

/**
 * Width of the one cell of a grid in Unity
 */
export const ONE_CELL_WIDTH_IN_UNITY = new BigNumber('0.2401');

/**
 * Level width in Unity
 */
export const LEVEL_WIDTH_IN_UNITY = new BigNumber('18');

/**
 * Structure starting position in Unity
 */
export const STRUCTURE_STARTING_POSITION = new Position(new BigNumber('2'), new BigNumber('-3.5'));

/**
 * This function is used to get the left most block from the array of blocks
 * @param blocks array of blocks to get the left most block from
 * @returns the left most block
 */
export function getLeftMostBlock(blocks: Array<Block>): Block {
  let leftMostBlock = blocks[0];
  for (const block of blocks) {
    if (block.position.x.isLessThan(leftMostBlock.position.x)) {
      leftMostBlock = block;
    }
  }
  return leftMostBlock;
}

/**
 * This function is used to get the right most block from the array of blocks
 * @param blocks array of blocks to get the right most block from
 * @returns the right most block
 */
export function getRightMostBlock(blocks: Array<Block>): Block {
  let rightMostBlock = blocks[0];
  for (const block of blocks) {
    if (block.position.x.isGreaterThan(rightMostBlock.position.x)) {
      rightMostBlock = block;
    }
  }
  return rightMostBlock;
}

/**
 * This function is used to get the top most block from the array of blocks
 * @param blocks array of blocks to get the top most block from
 * @returns the top most block
 */
export function getHighestBlock(blocks: Array<Block>): Block {
  let highestBlock = blocks[0];
  for (const block of blocks) {
    if (block.position.y.isGreaterThan(highestBlock.position.y)) {
      highestBlock = block;
    }
  }
  return highestBlock;
}

/**
 * This function is used to shift blocks to the left most position on the grid
 * @param blocks array of blocks to shift to the left most position

* @param grid grid represents the placement of the blocks
 * @returns an array of blocks shifted to the left most position and the updated grid
 */
export function shiftBlocksOnGrid(blocks: Array<Block>, grid: Grid): [Array<Block>, Grid] {
  const newGrid = grid.map((row) => [...row]);

  let shiftAmount = newGrid[0].length;
  for (let i = 0; i < newGrid[0].length; i++) {
    for (const row of newGrid) {
      if (row[i] !== 0) {
        shiftAmount = Math.min(shiftAmount, i);
      }
    }
  }

  for (const block of blocks) {
    block.position.x = block.position.x.minus(shiftAmount);
  }

  for (let i = 0; i < newGrid.length; i++) {
    newGrid[i] = newGrid[i].slice(shiftAmount);
    for (let j = 0; j < shiftAmount; j++) {
      newGrid[i].push(0);
    }
  }
  return [blocks, newGrid];
}

/**
 * This function is used to get the blocks with their positions on the grid
 * @param functionsString string of `ab_drop()` functions
 * @returns an array of `Block`'s blocks with their positions on the grid
 */
export function getBlocksWithPosition(functionsString: string): [Array<Block>, Grid] {
  const blocks = [];
  let grid = initializeGrid(GRID_WIDTH, GRID_HEIGHT);

  const lines = functionsString.split('\n');
  for (const line of lines) {
    if (line.substring(0, FUNCTION_PREFIX.length) !== FUNCTION_PREFIX) {
      continue;
    }

    const blockType = getBlockTypeFromLine(line);
    const slotPosition = getSlotPositionFromLine(line);
    const block = Block.getAvailableBlock(blockType);

    const position = getBlockPositionOnGrid(blockType, slotPosition, grid);
    grid = placeBlockOnGrid(grid, position, slotPosition, block.size);

    block.position = new Position(new BigNumber(position.x), new BigNumber(position.y));
    blocks.push(block);
  }

  return [blocks, grid];
}

/**
 * This function is used to get the block type from the line of `ab_drop()` function
 * @param line line of `ab_drop()` function
 * @returns the block type of the block
 */
function getBlockTypeFromLine(line: string): BlockType {
  const commaIndex = line.indexOf(',');
  const extractedBlockType = line.substring(FUNCTION_PREFIX.length + 1, commaIndex - 1).toUpperCase();
  const blockType = BlockType[extractedBlockType as keyof typeof BlockType];
  return blockType;
}

/**
 * This function is used to get the slot position from the line of `ab_drop()` function
 * @param line line of `ab_drop()` function
 * @returns the slot position of the block
 */
function getSlotPositionFromLine(line: string): number {
  const commaIndex = line.indexOf(',');
  const extractedSlotPosition = line
    .substring(commaIndex + 1)
    .split(')')[0]
    .trim();
  const slotPosition = parseInt(extractedSlotPosition, 10);
  return slotPosition;
}

/**
 * This function is used to get the block position on the grid
 * @param blockType block type
 * @param slotPosition slot position
 * @param grid grid represents the placement of the blocks
 * @returns
 */
export function getBlockPositionOnGrid(blockType: BlockType, slotPosition: number, grid: Grid) {
  const blockSize = Block.getBlockSize(blockType); // Assume that width always be an odd number
  const halfWidth = (blockSize.width - 1) / 2;
  const isWideBlock = blockSize.width > 1;

  if (grid[grid.length - 1][slotPosition] !== 0) {
    throw Error('Height boundary is intruded.');
  }

  const allowPosition = { x: slotPosition, y: grid.length - 1 };

  for (let rowIndex = grid.length - 1; rowIndex >= 0; rowIndex--) {
    if (grid[rowIndex][slotPosition] !== 0) {
      break;
    }

    if (isWideBlock && !isSpaceEnoughForWideBlock(grid, rowIndex, slotPosition, halfWidth)) {
      break;
    }
    allowPosition.y = rowIndex;
  }

  return allowPosition;
}

/**
 * This function is used to check if there is enough space for a wide block on the grid
 * @param grid grid represents the placement of the blocks
 * @param rowIndex index of the row on the grid to check
 * @param slotPosition slot position of the block
 * @param halfWidth half width of the block
 * @returns
 */
function isSpaceEnoughForWideBlock(grid: Grid, rowIndex: number, slotPosition: number, halfWidth: number) {
  let isEmpty = true;
  // Check left and right side of a wide block that it is empty
  for (let j = 1; j <= halfWidth; j++) {
    const isBoundaryIntruded = slotPosition - j < 0 || slotPosition + j > grid[0].length - 1;
    if (isBoundaryIntruded) {
      throw Error('Width boundary is intruded.')
    }

    if (grid[rowIndex][slotPosition - j] !== 0 || grid[rowIndex][slotPosition + j] !== 0) {
      isEmpty = false;
      break;
    }
  }
  return isEmpty;
}

/**
 * This function is used to place a block on the grid
 * @param grid grid represents the placement of the blocks
 * @param allowPosition true position of the block on the grid
 * @param slotPosition slot position of the block
 * @param blockSize size of the block
 * @returns
 */
function placeBlockOnGrid(
  grid: Grid,
  allowPosition: { x: number; y: number },
  slotPosition: number,
  blockSize: { width: number; height: number },
) {
  const newGrid = grid.map((row) => [...row]);
  const isWideBlock = blockSize.width > 1;
  const isTallBlock = blockSize.height > 1;
  const halfWidth = (blockSize.width - 1) / 2;

  newGrid[allowPosition.y][slotPosition] = 1;

  if (isWideBlock) {
    for (let j = 1; j <= halfWidth; j++) {
      newGrid[allowPosition.y][slotPosition - j] = 1;
      newGrid[allowPosition.y][slotPosition + j] = 1;
    }
  }
  if (isTallBlock) {
    for (let j = 1; j < blockSize.height; j++) {
      const isBoundaryIntruded = allowPosition.y + j > grid.length - 1;
      if (isBoundaryIntruded) {
        throw Error('Height boundary is intruded.')
      }
      newGrid[allowPosition.y + j][slotPosition] = 1;
    }
  }

  return newGrid;
}

/**
 * This function is used to get the width of the grid part that contains blocks
 * @param grid grid represents the placement of the blocks
 * @returns the width of the grid part that contains blocks
 */
export function getGridContentWidth(grid: Grid) {
  let temp = 0;
  for (const row of grid) {
    const rowSum = row.reduce((a, b) => a + b, 0);
    if (rowSum > temp) {
      temp = rowSum;
    }
  }
  const width = new BigNumber(temp);
  return STRUCTURE_STARTING_POSITION.x.abs().plus(width.multipliedBy(ONE_CELL_WIDTH_IN_UNITY));
}

/**
 * This function is used to get the height of the grid part that contains blocks
 * @param grid grid represents the placement of the blocks
 * @returns the height of the grid part that contains blocks
 */
export function getGridContentHeight(grid: Grid) {
  let previousNonEmpty = 0;
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    const rowSum = row.reduce((a, b) => a + b, 0);
    if (rowSum > 0) {
      previousNonEmpty = i;
    }
  }
  const height = new BigNumber(previousNonEmpty + 1);
  return STRUCTURE_STARTING_POSITION.y.abs().plus(height.multipliedBy(ONE_CELL_WIDTH_IN_UNITY));
}

/**
 * This function is used to initialize the grid with the given width and height with 0
 * @param width width of the grid
 * @param height height of the grid
 * @returns a grid with the given width and height initialized with 0
 */
export function initializeGrid(width: number, height: number) {
  const grid: Grid = [];
  for (let i = 0; i < height; i++) {
    grid.push([]);
    for (let j = 0; j < width; j++) {
      grid[i].push(0);
    }
  }

  return grid;
}

/**
 * This function is used to print the grid
 * @param grid grid represents the placement of the blocks
 * @returns a string representation of the grid
 */
export function printGrid(grid: Grid) {
  let output = '';
  for (let i = grid.length - 1; i >= 0; i--) {
    const row = grid[i];
    for (const item of row) {
      output += item;
    }
    output += '\n';
  }
  console.log(output);
  return output;
}

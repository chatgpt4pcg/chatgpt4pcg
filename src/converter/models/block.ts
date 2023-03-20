import { Position } from './position';
import { Size } from './size';

/**
 * BlockType
 * @enum {string}
 * @property {string} B31 - 3x1 block
 * @property {string} B13 - 1x3 block
 * @property {string} B11 - 1x1 block
 */
export enum BlockType {
  B31,
  B13,
  B11,
}

/**
 * Block
 * @class
 * @property {string} id - block id
 * @property {string} type - block type
 * @property {number} rotation - block rotation between 0 and 360
 * @property {Position} position - block position
 * @property {Size} size - block size
 */
export class Block {
  id: string;
  type: string;
  rotation: number;
  position: Position;
  readonly size: Size;

  constructor(id: string, type: string, rotation: number) {
    this.id = id;
    this.type = type;
    this.rotation = rotation;
    this.position = new Position();
    this.size = Block.getBlockSize(BlockType[id.toUpperCase() as keyof typeof BlockType]);
  }

  /**
   * This function is used to get the available block based on the block type
   * @param type block type
   * @returns the block instance based on the block type
   */
  static getAvailableBlock(type: BlockType) {
    if (type === BlockType.B31) {
      return new Block('b31', 'RectSmall', 0);
    } else if (type === BlockType.B13) {
      return new Block('b13', 'RectSmall', 90);
    } else if (type === BlockType.B11) {
      return new Block('b11', 'SquareTiny', 0);
    }

    throw new Error(`BlockType does not exist.`);
  }

  /**
   * This function is used to get the block size based on the block type
   * @param type block type
   * @returns the block size based on the block type
   */
  static getBlockSize(type: BlockType) {
    if (type === BlockType.B31) {
      return new Size(3, 1);
    } else if (type === BlockType.B13) {
      return new Size(1, 3);
    } else if (type === BlockType.B11) {
      return new Size(1, 1);
    }

    throw new Error(`BlockType does not exist.`);
  }
}

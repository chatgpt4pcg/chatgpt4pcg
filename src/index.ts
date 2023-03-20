import { Block, BlockType, Position, Size } from './converter/models/index';

import { convertToXML } from './converter/xml';
import { getBlocksWithPosition } from './converter/converter';
import wordsCount from 'words-count';

export { Block, Position, Size, BlockType };

/**
 *  This function is used to extract `ab_drop` function calls from the text
 * @param text text containing `ab_drop` function calls
 * @returns a new string containing only the `ab_drop` function calls
 */
export function extractCode(text: string): string | null {
  const PATTERN = /```([^`]+)```/g;
  const CODE_PATTERN = /ab_drop\(['|"]b[1|3][1|3]['|"], *\d*\)/g;

  let match;
  let lastMatch = null;
  while ((match = PATTERN.exec(text)) !== null) {
    lastMatch = match;
  }
  if (!lastMatch) {
    return null;
  }
  const code = lastMatch[0];
  const functionCode = code.matchAll(CODE_PATTERN);

  let output = '';
  for (const fn of functionCode) {
    output += fn.toString().replaceAll('"', "'") + '\n';
  }

  if (output.length === 0) {
    return null;
  }

  return output.toLowerCase();
}

/**
 * This function is used to count words in the text
 * @param text text to count words in
 * @returns a number of words in the text
 */
export function countWords(text: string): number {
  return wordsCount(text);
}

/**
 * This function is used to convert text of only `ab_drop()` functions to XML file used in Science Birds
 * @param text text of only `ab_drop()` functions to convert to XML
 * @returns XML file represents a level in the Science Birds
 */
export function convertTextToXML(text: string) {
  return convertToXML(text.toLowerCase());
}

/**
 * This function is used to convert text of only `ab_drop()` functions to an array of `Block`'s blocks with their positions on the grid
 * @param text text of only `ab_drop()` functions to convert to blocks
 * @returns an array of `Block`'s blocks with their positions on the grid
 */
export function convertTextToBlocks(text: string) {
  return getBlocksWithPosition(text.toLowerCase());
}

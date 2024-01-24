import { Block, BlockType, Position, Size } from './converter/models/index';

import { convertToXML } from './converter/xml';
import { getBlocksWithPosition } from './converter/converter';
import wordsCount from 'words-count';

export { Block, Position, Size, BlockType };

/**
 *  This function is used to extract `functionPrefix` function calls from the text
 * @param text text containing `functionPrefix` function calls
 * @returns a new string containing only the `functionPrefix` function calls
 */
export function extractCode(text: string, functionPrefix = 'ab_drop'): string | null {
  const PATTERN = /```([^`]+)```/g;
  const CODE_PATTERN = new RegExp(`${functionPrefix}\\(['|"]b[1|3][1|3]['|"], *\\d*\\)`, 'g');

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
 * This function is used to check if the text contains disallowed characters
 * @param text text to check for disallowed characters
 * @returns true if the text contains disallowed characters, false otherwise
 */
export function containDisallowedCharacters(text: string): boolean {
  const PATTERN = /([A-Za-z\d~/\\+,\-*`'".!@#$%^&()_=[\]{}|<>:;?—\u201C\u201D\u2018\u2019 \n\r\t]*)*/g;
  return text.replaceAll(PATTERN, '').trim().length !== 0;
}

/**
 * This function is used to check if the text contains <OBJECT> tokens
 * @param text text to check for <OBJECT> tokens
 * @returns true if the text contains object tokens, false otherwise
 */
export function containObjectTokens(text: string): boolean {
  const PATTERN = /<OBJECT>/g;
  return (text.match(PATTERN)?.length ?? -1) > 0;
}

/**
 * This function is used to convert text of only `functionPrefix()` functions to XML file used in Science Birds
 * @param text text of only `functionPrefix()` functions to convert to XML
 * @returns XML file represents a level in the Science Birds
 */
export function convertTextToXML(text: string, functionPrefix = 'ab_drop(') {
  return convertToXML(text.toLowerCase(), functionPrefix);
}

/**
 * This function is used to convert text of only `functionPrefix()` functions to an array of `Block`'s blocks with their positions on the grid
 * @param text text of only `functionPrefix()` functions to convert to blocks
 * @returns an array of `Block`'s blocks with their positions on the grid
 */
export function convertTextToBlocks(text: string) {
  return getBlocksWithPosition(text.toLowerCase());
}

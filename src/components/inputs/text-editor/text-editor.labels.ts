import { StateEffect } from '@codemirror/state';

/** Says the editor's labels changed, such as after a language switch: the
 *  widgets that draw a translated label rebuild with the new text. */
export const relabel = StateEffect.define<null>();

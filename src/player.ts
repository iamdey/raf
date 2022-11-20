/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { synth, midi } from '@coderline/alphatab';

export const setupPlayer = (
  midiFile: midi.MidiFile,
  soundFont: Uint8Array,
  { startEl, stopEl }: { startEl: HTMLElement; stopEl: HTMLElement }
) => {
  const player = new synth.AlphaSynth(
    new synth.AlphaSynthScriptProcessorOutput(),
    10000
  );
  player.loadSoundFont(soundFont, false);
  player.loadMidiFile(midiFile);
  startEl.addEventListener('click', () => {
    player.play();
  });
  stopEl.addEventListener('click', () => {
    player.pause();
  });
};

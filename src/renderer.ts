/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { model } from '@coderline/alphatab';
import { Application, Graphics, ICanvas, Text, TextStyle } from 'pixi.js';

const SCREEN_HEIGHT = 300;
const SCREEN_WIDTH = 600;
const GUITAR_HEIGHT = 200;
const MARGIN_Y = (SCREEN_HEIGHT - GUITAR_HEIGHT) / 2;
const STRING_HEIGHT = 3;
const NOTE_HEIGHT = 13;
const NOTE_RADIUS = 4;

const posYGstrings = {
  ETreble: MARGIN_Y + GUITAR_HEIGHT / 6,
  B: MARGIN_Y + (GUITAR_HEIGHT / 6) * 2,
  G: MARGIN_Y + (GUITAR_HEIGHT / 6) * 3,
  D: MARGIN_Y + (GUITAR_HEIGHT / 6) * 4,
  A: MARGIN_Y + (GUITAR_HEIGHT / 6) * 5,
  EBass: MARGIN_Y + GUITAR_HEIGHT,
};

type IGString = keyof typeof posYGstrings;

class Note {
  // XXX: should compute itself string & fret if no indications
  constructor({
    gString,
    x,
    fretNumber,
  }: {
    gString: IGString;
    x: number;
    fretNumber: number;
  }) {
    this.background = new Graphics();
    this.background.beginFill(0x33c7de);
    this.background.drawRoundedRect(
      0,
      0,
      NOTE_HEIGHT * 2,
      NOTE_HEIGHT,
      NOTE_RADIUS
    );
    this.background.endFill();
    // tmp
    this.background.x = x;

    const style = new TextStyle({
      fontSize: 10,
    });
    this.fret = new Text(fretNumber.toString(), style);
    this.fret.x = x + 3;

    this.gString = gString;
  }

  background: Graphics;
  fret: Text;
  _gString: IGString = 'EBass';

  set gString(gString: IGString) {
    this._gString = gString;
    this.background.y = posYGstrings[gString] - NOTE_HEIGHT / 2;
    this.fret.y = posYGstrings[gString] - NOTE_HEIGHT / 2;
  }

  get gString() {
    // XXX: compute based on y pos.
    return this._gString;
  }

  render(app: Application<ICanvas>) {
    app.stage.addChild(this.background);
    app.stage.addChild(this.fret);
  }
}

export class RafDisplay {
  constructor(app: Application) {
    this.__app = app;
  }

  __app;
  load(score: model.Score, trackIdx: number) {
    console.log({ score });
  }
  play() {}
  pause() {}
}

export const setupRenderer = ({ contentEl }: { contentEl: HTMLElement }) => {
  const app = new Application({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#002B36',
  });

  const gStringTemplate = new Graphics();
  gStringTemplate.beginFill(0x8a919b);
  gStringTemplate.drawRect(0, 0, SCREEN_WIDTH, STRING_HEIGHT);
  gStringTemplate.endFill();

  const gStrings = [];
  Object.entries(posYGstrings).forEach(([, posY]) => {
    let gString = new Graphics(gStringTemplate.geometry);
    gString.y = posY - STRING_HEIGHT / 2;

    gStrings.push(gString);
    app.stage.addChild(gString);
  });

  const center = new Graphics();
  center.beginFill(0xff0000);
  center.drawRect(300, 0, 1, 300);
  center.endFill();

  app.stage.addChild(center);

  // --- NOTES
  const note1 = new Note({ gString: 'A', x: SCREEN_WIDTH - 50, fretNumber: 3 });
  note1.render(app);
  const note2 = new Note({
    gString: 'A',
    x: SCREEN_WIDTH - 100,
    fretNumber: 5,
  });
  note2.render(app);
  const note3 = new Note({
    gString: 'EBass',
    x: SCREEN_WIDTH - 150,
    fretNumber: 0,
  });
  note3.render(app);
  // ---

  // @ts-ignore
  contentEl.appendChild(app.view);

  return new RafDisplay(app);
};

/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { Application, Graphics } from 'pixi.js';

export const setupRenderer = ({ contentEl }: { contentEl: HTMLElement }) => {
  const app = new Application({
    width: 600,
    height: 300,
    backgroundColor: '#002B36',
  });

  const gStringTemplate = new Graphics();
  gStringTemplate.beginFill(0x8a919b);
  gStringTemplate.drawRect(0, 0, 600, 5);
  gStringTemplate.endFill();

  const gStrings = [];
  for (let i = 0; i < 6; i++) {
    let gString = new Graphics(gStringTemplate.geometry);
    gString.y = (200 / 6) * (i + 1) + 30;
    gStrings.push(gString);
    app.stage.addChild(gString);
  }

  const center = new Graphics();
  center.beginFill(0xff0000);
  center.drawRect(300, 0, 1, 300);
  center.endFill();

  app.stage.addChild(center);

  // @ts-ignore
  contentEl.appendChild(app.view);
};

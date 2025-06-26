export default class move {
  constructor(player_dom, game_container_dom, KeyEvent) {
    this.player = player_dom;
    this.gameContainer = game_container_dom;
    this.w = KeyEvent.w;
    this.s = KeyEvent.s;
    this.a = KeyEvent.a;
    this.d = KeyEvent.d;
    this.virtualEvents = []; // 仮想空間イベントのリスト
  }

  /**
   * 仮想空間イベントを登録
   * @param {Object} area - {x1, y1, x2, y2}
   * @param {Function} callback - 領域に侵入した時に呼ばれる関数
   * @param {Boolean} repeatable - 何度でも発火する場合はtrue（省略時はfalse）
   */
  onEnterVirtualArea(area, callback, repeatable = false) {
    this.virtualEvents.push({ area, callback, triggered: false, repeatable });
  }

  start(forbiddenAreas) {
    let playerX = 0;
    let playerY = 0;
    const self = this;

    // キーボードの入力を監視
    document.addEventListener("keydown", function (event) {
      let nextPlayerX = playerX;
      let nextPlayerY = playerY;

      switch (event.key) {
        case self.w:
          nextPlayerY = playerY - 10;
          break;
        case self.s:
          nextPlayerY = playerY + 10;
          break;
        case self.d:
          nextPlayerX = playerX + 10;
          break;
        case self.a:
          nextPlayerX = playerX - 10;
          break;
      }

      if (nextPlayerX < 0) nextPlayerX = 0;
      if (nextPlayerX > self.gameContainer.offsetWidth - self.player.offsetWidth)
        nextPlayerX = self.gameContainer.offsetWidth - self.player.offsetWidth;
      if (nextPlayerY < 0) nextPlayerY = 0;
      if (nextPlayerY > self.gameContainer.offsetHeight - self.player.offsetHeight)
        nextPlayerY = self.gameContainer.offsetHeight - self.player.offsetHeight;

      for (let i = 0; i < forbiddenAreas.length; i++) {
        if (
          nextPlayerX < forbiddenAreas[i].x + forbiddenAreas[i].width &&
          nextPlayerX + self.player.offsetWidth > forbiddenAreas[i].x &&
          nextPlayerY < forbiddenAreas[i].y + forbiddenAreas[i].height &&
          nextPlayerY + self.player.offsetHeight > forbiddenAreas[i].y
        ) {
          return;
        }
      }

      playerX = nextPlayerX;
      playerY = nextPlayerY;
      self.player.style.left = playerX + "px";
      self.player.style.top = playerY + "px";

      // 仮想空間座標に変換
      const centerX = self.gameContainer.offsetWidth / 2;
      const centerY = self.gameContainer.offsetHeight / 2;
      const virtualX = playerX - centerX;
      const virtualY = playerY - centerY;

      // 仮想空間イベントの判定
      self.virtualEvents.forEach(ev => {
        const { x1, y1, x2, y2 } = ev.area;
        const inArea =
          virtualX + self.player.offsetWidth > Math.min(x1, x2) &&
          virtualX < Math.max(x1, x2) &&
          virtualY + self.player.offsetHeight > Math.min(y1, y2) &&
          virtualY < Math.max(y1, y2);

        if (inArea) {
          if (!ev.triggered || ev.repeatable) {
            ev.callback({ x: virtualX, y: virtualY });
            if (!ev.repeatable) ev.triggered = true;
          }
        } else {
          // 領域外に出たらtriggeredをリセット（repeatable用）
          if (ev.repeatable) ev.triggered = false;
        }
      });
    });
  }
}
export default class dom {
  constructor(dom) {
    this.player_dom = dom.player_dom;
    this.game_container_dom = dom.game_container_dom;
    this.mapImage = dom.mapImage;
    this.mapImagePath = dom.mapImagePath;
  }
  access(type, domName) {
    if ((type = "id")) {
      return document.getElementById(id);
    } else {
      return document.getElementById(id);
    }
  }
}
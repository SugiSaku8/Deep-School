import dom from './element/dom.js';
import move from './element/move.js';
export default class Jrpg{
    constructor(config){
        this.player_dom = config.player_dom;
        this.game_container_dom = config.game_container_dom;
        this.w = config.w;
        this.s = config.s;
        this.a = config.a;
        this.d = config.d;
        this.KeyEvent = {
            w:this.w,
            s:this.s,
            a:this.a,
            d:this.d
        }
        const JrpgDom = new dom(config);
        const JrpgMove = new move(this.player_dom,this.game_container_dom,KeyEvent)
    }
}
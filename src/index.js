import Phaser from 'phaser';
import Preloader from "./scenes/preloader"
import Game from "./scenes/game"


export default class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super("main");
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 840,
    height: 640,
    scene: [Preloader, Game],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 },
        }
    },
};

const game = new Phaser.Game(config);

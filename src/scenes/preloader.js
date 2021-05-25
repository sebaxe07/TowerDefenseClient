import Phaser from "phaser"
import { StrictEventEmitter } from "socket.io-client/build/typed-events"

export default class preloader extends Phaser.Scene {
    constructor() {
        super("Preloader")
    }

    preload() {
        this.load.image("terrain", "src/assets/DIY/TerrainSheet.png")
        this.load.image("walls", "src/assets/DIY/walls.png")
        this.load.image("bullet", "src/assets/DIY/bullet.png")
        this.load.image("coin", "src/assets/DIY/dogecoin.png")



        this.load.atlas("turrets", "src/assets/DIY/Atlas/turretAtlas.png", "src/assets/DIY/Atlas/turretAtlas.json")
        this.load.atlas("lasers", "src/assets/DIY/Atlas/laserAtlas.png", "src/assets/DIY/Atlas/laserAtlas.json")
        this.load.atlas("halfers", "src/assets/DIY/Atlas/halfAtlas.png", "src/assets/DIY/Atlas/halfAtlas.json")
        this.load.atlas("tanks", "src/assets/DIY/Atlas/tankAtlas.png", "src/assets/DIY/Atlas/tankAtlas.json")




        this.load.tilemapTiledJSON("map1", "src/assets/Maps/Map1.json")

    }

    create() {
        this.scene.start("Game")
    }

    restartGame() {
        this.registry.destroy(); 
        this.events.off();
        this.scene.stop("Game")
        this.create()
    }


}
export default class TurretGroup extends Phaser.Physics.Arcade.Group {

    constructor(scene) {

        super(scene.physics.world, scene)

    }


    spawn(scene, x, y, sprite, interactive) {
        console.log(sprite)
        if (sprite === "turrets") {
            var turret = new Turret(scene, x, y, sprite, 500, 50, 100, "Torreta MK", interactive, 0)

        } else {
            var turret = new Turret(scene, x, y, sprite, 0, 1, 200, "Laser MK", interactive, 1000)

        }
        turret.setScale(0.55)
        this.add(turret, true)

    }


}

class Turret extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, firerate, damage, rango, name, interactive, cooldown) {

        super(scene, x, y, texture)
        this.nextTic = 0;
        this.scene = scene;
        this.firerate = firerate
        this.damage = damage
        this.rango = rango
        this.lvl = 1
        this.name = name
        this.cooldown = cooldown
        this.rafaga = 0

        console.log("creando torreta")
        if (interactive) {
            this.setInteractive();
        }

        this.on('pointerdown', function () {

            console.log("click")
            scene.upgrade(this)

        })
    }

    preUpdate(time, delta) {


        var enemy = this.scene.getEnemy(this.x, this.y, this.rango);
        var angle
        if (enemy) {
            angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
            this.angle = (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
        }
        if (time > this.nextTic) {
            this.fire(angle);
            this.nextTic = time + this.firerate;
            if(this.name === "Laser MK"){
                if (this.rafaga > 30) {
                    this.rafaga = 0
                    this.nextTic = time + this.cooldown
                }
            }
            
        }
    }

    fire(angle) {

        if (angle) {
            this.scene.addBullet(this.x, this.y, angle, this.damage);
            this.rafaga += 1
        }
    }

    create() {

    }




}
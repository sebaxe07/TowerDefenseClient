export default class BulletGroup extends Phaser.Physics.Arcade.Group {

    constructor(scene) {

        super(scene.physics.world, scene)
        this.createMultiple({
            classType: Bullet,
            frameQuantity: 500,
            active: false,
            visible: false,
            key: "bullet"
        })
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {

        super(scene, x, y, "bullet")
        this.speed = 0.5;
        this.setDepth(2)
        this.dx = 0
        this.dy = 0
        this.radio = 30;
        this.circle = new Phaser.Geom.Circle(x, y, this.radio);
        this.point = new Phaser.Geom.Rectangle(0, 0, 8, 8);
        this.damage

    }

    fire(x, y, angle, dmg) {
        if (dmg < 10) {
            this.clearTint()
            this.tint = 0x007dff
        } else {

            this.clearTint()
            this.tint = 0xffff00

        }

        this.setActive(true);
        this.setVisible(true);
        this.damage = dmg
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
        this.circle.x = x
        this.circle.y = y

        Phaser.Geom.Circle.CircumferencePoint(this.circle, angle, this.point)


        this.setPosition(this.point.x, this.point.y);

        this.lifespan = 600;
    }


    preUpdate(time, delta) {
        this.lifespan -= delta;
        this.x += this.dx * (this.speed * delta);
        this.y += this.dy * (this.speed * delta);

        if (this.lifespan <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }



}
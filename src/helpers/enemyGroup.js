export default class EnemyGroup extends Phaser.Physics.Arcade.Group {

    constructor(scene) {

        super(scene.physics.world, scene)

        /*this.createMultiple({
            classType: Enemy,
            frameQuantity: 10,
            active: false,
            visible: false,
            key: "enemy"
        })*/
    }

    addEnemy(scene, key, sprite, path) {

        if (key === "tanks") {


            if (sprite === "TAMK1.png") {
                var enemy = new Enemy(scene, 0, 0, key, sprite, 30000, 500, "Tanque MK", path, 100)
            } else if (sprite === "TAMK2.png") {
                var enemy = new Enemy(scene, 0, 0, key, sprite, 27000, 600, "Tanque MK", path, 150)
            } else if (sprite === "TAMK3.png") {
                var enemy = new Enemy(scene, 0, 0, key, sprite, 24000, 700, "Tanque MK", path, 200)
            } else if (sprite === "TAMK4.png") {
                var enemy = new Enemy(scene, 0, 0, key, sprite, 21000, 800, "Tanque MK", path, 250)
            } 

        } else {

            if (sprite === "HAMK1.png") {
                var enemy = new Enemy(scene, 0, 0, key, sprite, 20000, 150, "Halfer MK", path, 50)
            } else if (sprite === "HAMK2.png") {
                var enemy = new Enemy(scene, 0, 0, key, sprite, 17000, 200, "Halfer MK", path, 100)
            } else if (sprite === "HAMK3.png") {
                var enemy = new Enemy(scene, 0, 0, key, sprite, 14000, 250, "Halfer MK", path, 150)
            } else if (sprite === "HAMK4.png") {
                var enemy = new Enemy(scene, 0, 0, key, sprite, 11000, 300, "Halfer MK", path, 200)
            } 
            

        }
        enemy.setScale(0.5)
        enemy.setDepth(0)
        enemy.setActive(false)
        enemy.setVisible(false)
        this.add(enemy, true)
    }


    spawn(scene) {
        var interaciones = 0

        var spawner = setInterval(() => {
            if (interaciones === this.getChildren().length) {

                console.log("Todo listo")
                if (interaciones == 0) {
                    scene.socket.emit("newRound")

                }
                clearInterval(spawner)
            } else {
                const enemy = this.getFirstDead(false);
                if (enemy) {
                    interaciones += 1
                    console.log("Se fue")
                    enemy.spawn(scene)
                } else {
                    console.log("se acabaron los carritos")
                    clearInterval(spawner)

                }
            }

        }, 500);
    }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, key, sprite, speed, hp, name, patho, valor) {

        super(scene, x, y, key, sprite)
        this.hpbase = hp
        this.hp = 0

        this.scene = scene;
        this.speed = speed;
        this.lvl = 1
        this.name = name
        this.valor = valor
        this.path = patho


    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta)

        if (this.y >= 650) {
            this.scene.puntoB()
            this.setActive(false)
            this.setVisible(false)
        }
    }

    spawn(scene) {

        this.body.reset()
        this.setActive(true)
        this.setVisible(true)

        this.setScale(0.5)
        this.body.setSize(64, 64)

        this.pathFollower = scene.plugins.get('rexpathfollowerplugin').add(this, {
            path: this.path,
            t: 0,
            rotateToPath: true,
            rotationOffset: Phaser.Math.PI2 / 4
        });

        scene.tweens.add({
            targets: this.pathFollower,
            t: 1,
            ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: this.speed,
            repeat: 0,
            yoyo: false
        });

        this.hp = this.hpbase

    }


    damage(damage) {

        this.hp -= damage

        if (this.hp <= 0) {
            this.scene.addMoney(this.valor)
            this.scene.countDead()
            this.setActive(false)
            this.setVisible(false)
        }
    }
}
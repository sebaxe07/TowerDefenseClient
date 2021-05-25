import Phaser from "phaser"
import Zone from "../helpers/zone";
import EnemyGroup from "../helpers/enemyGroup";
import TurretGroup from "../helpers/turretGroup";
import BulletGroup from "../helpers/bulletGroup";
import io from 'socket.io-client';




export default class game extends Phaser.Scene {
    constructor() {
        super("Game")
        this.enemyGroup
        this.turretGroup
        this.bullets
        this.timer = -100000;
        this.timer2 = 0;
        this.segundos = 10
        this.BULLET_DAMAGE;
        this.path
        this.socket
        this.money = 500
        this.countD = 0
        this.TotEnemigos = 0
        this.vida = 5
        this.ronda = 1
        this.rondaalive = false
        this.valortank = 150
        this.valorhalfer = 50



        //Vars UI
        this.defendCreate
        this.turretUpgrade
        this.attackCreate
        this.tankUpgrade
        this.textomejora
        this.cantIzq
        this.cantDer
        this.izqT
        this.izqH
        this.derT
        this.derH
        this.relojRonda
        this.moneyUI
        this.vidaUI
        this.rondaUI
        this.textomejoraH
        this.textomejoraT



    }

    preload() {
        this.load.plugin('rexpathfollowerplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpathfollowerplugin.min.js', true);
        this.enemyGroup
        this.turretGroup
        this.bullets
        this.timer = -100000;
        this.timer2 = 0;
        this.segundos = 10
        this.BULLET_DAMAGE;
        this.path
        this.socket
        this.money = 500
        this.countD = 0
        this.TotEnemigos = 0
        this.vida = 5
        this.ronda = 1
        this.rondaalive = false
        this.valortank = 150
        this.valorhalfer = 50
        this.costoMejora = 0


        //Vars UI
        this.defendCreate
        this.turretUpgrade
        this.attackCreate
        this.tankUpgrade
        this.textomejora
        this.cantIzq
        this.cantDer
        this.izqT
        this.izqH
        this.derT
        this.derH
        this.relojRonda
        this.moneyUI
        this.vidaUI
        this.winScreen
        this.rondaUI
        this.textomejoraH
        this.textomejoraT



    }


    create() {
        let self = this
        this.isPlayerA = false;

        ////SOCKET.IO////  https://TowerDefenseGame.sebaxe07.repl.co    http://localhost:3000
        this.socket = io('https://TowerDefenseGame.sebaxe07.repl.co', { transports: ["websocket"] })


        this.socket.on('connect', function () {
            console.log('Connected!');
        });


        this.socket.on("isPlayerA", function () {
            self.isPlayerA = true;
            console.log("Player A")
        })

        this.socket.on("Start", function () {
            console.log("Creando UI")
            createUI()
            zonesCreation(self.isPlayerA)

        })

        this.socket.on("turretPlaced", function (gameObject, isPlayerA, dropzone) {
            if (isPlayerA !== self.isPlayerA) {
                self.turretGroup.spawn(self, dropzone.x, dropzone.y, gameObject.textureKey, false);

            }
        })

        this.socket.on("enemyADD", function (key, sprite, isPlayerA, camino) {
            console.log("entregado")

            if (isPlayerA !== self.isPlayerA) {
                self.TotEnemigos += 1
                console.log("agregando enemigo")
                if (camino === "C1") {
                    self.enemyGroup.addEnemy(self, key, sprite, path);

                } else {
                    self.enemyGroup.addEnemy(self, key, sprite, path2);

                }

            }
        })

        this.socket.on("upgradeTurret", function (x, y, lvl, name, forC, damage) {
            console.log("entregado")

            if (!self.isPlayerA) {
                console.log("mejorando Torreta")

                var turrestOption = self.turretGroup.getChildren()

                turrestOption.forEach(element => {

                    if (element.x === x && element.y === y) {

                        if (name === "Torreta MK") {
                            element.lvl = lvl
                            element.firerate = forC
                            element.damage = damage
                            element.setTexture("turrets", "TMK" + element.lvl + ".png")
                        } else {
                            element.lvl = lvl
                            element.cooldown = forC
                            element.damage = damage
                            element.setTexture("lasers", "LMK" + element.lvl + ".png")
                        }

                    }
                });
            }
        })

        this.socket.on("newRound", function () {
            self.ronda += 1
            self.rondaUI.setText("Ronda: " + self.ronda)


            self.timer = 2000
            self.rondaalive = false

            self.TotEnemigos = 0
            self.countD = 0
            if (!self.isPlayerA) {
                self.izqT = 0
                self.izqH = 0
                self.derT = 0
                self.derH = 0

                self.cantIzq.setText("T: " + self.izqT + "\nH: " + self.izqH)

                self.cantDer.setText("T: " + self.derT + "\nH: " + self.derH)
            }

            self.enemyGroup = new EnemyGroup(self)
            self.physics.add.overlap(self.enemyGroup, self.bulletsGroup, damageEnemy);
            if (self.isPlayerA) {
                if (self.ronda === 11) {
                    self.socket.emit("gameover")

                }
            }

        })

        this.socket.on("gameover", function () {
            var theOtherScene = self.scene.get('Preloader');

            self.winScreen.add(self.add.rectangle(self.cameras.main.centerX, self.cameras.main.centerY, 400, 200, 0xffffff))
            self.winScreen.add(self.add.text(self.cameras.main.centerX, self.cameras.main.centerY, "Gano el atacante!").setFontSize(40).setFontFamily("Trebuchet MS").setColor("#000000").setOrigin(0.5))
            var winsc = self.winScreen.getChildren()
            if (self.ronda === 11) {
                winsc[1].setText("Gano el defensor!")
            } else {
                winsc[1].setText("Gano el atacante!")

            }
            self.winScreen.setVisible(true)
            self.winScreen.setActive(true)


            setTimeout(() => {
                theOtherScene.restartGame();
                self.socket.disconnect()
            }, 2000);



        })
        ////Inicializacion Mapa////


        const map = this.make.tilemap({ key: "map1" })
        const tilesetTerrain = map.addTilesetImage("terrain", "terrain")
        const tilesetWalls = map.addTilesetImage("walls", "walls")

        const floorlayer = map.createLayer("back", tilesetTerrain)
        floorlayer.setScale(0.5)

        const wallsLayer = map.createLayer("front", tilesetWalls)
        wallsLayer.setCollisionByProperty({ collides: true })
        wallsLayer.setScale(0.5)



        ////Inicializacion UI////
        var sidebar = this.add.rectangle(740, 320, 200, 640, 0xB6B6B6);
        sidebar.setDepth(1)

        this.add.rectangle(740, 375, 180, 500, 0x6A6A6A).setDepth(1);


        this.rondaUI = this.add.text(740, 550, "Ronda: " + this.ronda).setOrigin(0.5).setDepth(1)
        this.relojRonda = this.add.text(740, 600, "Faltan: " + this.segundos + "s").setOrigin(0.5).setDepth(1)


        this.defendCreate = this.add.group().setDepth(1)
        this.turretUpgrade = this.add.group().setDepth(1)
        this.attackCreate = this.add.group().setDepth(1)
        this.tankUpgrade = this.add.group().setDepth(1)
        this.winScreen = this.add.group().setDepth(6)




        function createUI() {

            if (self.isPlayerA) {

                console.log("Jugador A")

                self.add.text(740, 50, "DEFEND").setFontSize(32).setFontFamily("Trebuchet MS").setColor("#000000").setOrigin(0.5).setDepth(1)
                self.moneyUI = self.add.text(690, 100, self.money).setFontSize(18).setFontFamily("Trebuchet MS").setColor("#000000").setOrigin(0).setDepth(1)
                self.add.image(670, 110, "coin").setScale(0.05).setDepth(1)

                var graphics = self.add.graphics();

                graphics.lineStyle(2, 0x000000, 1);

                self.vidaUI = self.add.text(760, 100, "Vidas: " + self.vida).setFontSize(18).setFontFamily("Trebuchet MS").setColor("#000000").setOrigin(0).setDepth(1)


                self.defendCreate.add(torretBar(740, 200, "turrets", "TMK1.png"), true).setDepth(1)
                self.defendCreate.add(torretBar(740, 350, "lasers", "LMK1.png"), true).setDepth(1)
                self.defendCreate.add(self.add.text(740, 250, "Torreta MK1").setOrigin(0.5), true).setDepth(1)
                self.defendCreate.add(self.add.text(740, 400, "Laser MK1").setOrigin(0.5), true).setDepth(1)
                self.defendCreate.add(self.add.text(740, 270, "100").setOrigin(0.5), true).setDepth(1)
                self.defendCreate.add(self.add.text(740, 420, "200").setOrigin(0.5), true).setDepth(1)
                self.defendCreate.add(self.add.image(710, 270, "coin").setScale(0.05), true).setDepth(1)
                self.defendCreate.add(self.add.image(710, 420, "coin").setScale(0.05), true).setDepth(1)
                self.defendCreate.add(graphics.strokeRoundedRect(670, 150, 140, 140, 32), true).setDepth(1)
                self.defendCreate.add(graphics.strokeRoundedRect(670, 300, 140, 140, 32), true).setDepth(1)


                self.turretUpgrade.add(self.add.text(740, 190, "MK").setOrigin(0.5), false).setDepth(1)
                self.turretUpgrade.add(self.add.sprite(740, 250, "").setScale(0.75), false).setDepth(1)
                self.turretUpgrade.add(self.add.text(740, 300, "Nivel: ").setOrigin(0.5), false).setDepth(1)
                self.turretUpgrade.add(self.add.text(740, 350, "Velocidad: ").setOrigin(0.5), false).setDepth(1)
                self.turretUpgrade.add(self.add.text(740, 400, "Daño: ").setOrigin(0.5), false).setDepth(1)



                self.textomejora = self.add.text(740, 450, "MEJORAR").setOrigin(0.5).setInteractive().setDepth(1)

                self.turretUpgrade.add(self.textomejora, false)

                self.textomejora.on("pointerover", function () {
                    self.textomejora.setColor("#00ffff")
                })

                self.textomejora.on("pointerout", function () {
                    self.textomejora.setColor("#ffffff")
                })
                self.turretUpgrade.add(self.add.image(710, 480, "coin").setScale(0.05), false).setDepth(1)
                self.turretUpgrade.add(self.add.text(740, 480, "500").setOrigin(0.5), false).setDepth(1)


                self.turretUpgrade.setVisible(false)
                self.turretUpgrade.setActive(false)
                self.attackCreate.setVisible(false)
                self.attackCreate.setActive(false)
                self.tankUpgrade.setVisible(false)
                self.tankUpgrade.setActive(false)



            } else {


                console.log("Jugador B")

                self.add.text(740, 50, "ATTACK").setFontSize(32).setFontFamily("Trebuchet MS").setColor("#000000").setOrigin(0.5).setDepth(1)
                self.moneyUI = self.add.text(690, 100, self.money).setFontSize(18).setFontFamily("Trebuchet MS").setColor("#000000").setOrigin(0).setDepth(1)
                self.add.image(670, 110, "coin").setScale(0.05).setDepth(1)

                var graphics = self.add.graphics();

                graphics.lineStyle(2, 0x000000, 1);

                self.attackCreate.add(torretBar(740, 200, "tanks", "TAMK1.png"), true).setDepth(1)
                self.attackCreate.add(torretBar(740, 350, "halfers", "HAMK1.png"), true).setDepth(1)
                self.attackCreate.add(self.add.text(740, 250, "Tanque MK1").setOrigin(0.5), true).setDepth(1)
                self.attackCreate.add(self.add.text(740, 400, "Halfer MK1").setOrigin(0.5), true).setDepth(1)
                self.attackCreate.add(self.add.text(740, 270, self.valortank).setOrigin(0.5), true).setDepth(1)
                self.attackCreate.add(self.add.text(740, 420, self.valorhalfer).setOrigin(0.5), true).setDepth(1)
                self.attackCreate.add(self.add.image(710, 270, "coin").setScale(0.05), true).setDepth(1)
                self.attackCreate.add(self.add.image(710, 420, "coin").setScale(0.05), true).setDepth(1)
                self.attackCreate.add(graphics.strokeRoundedRect(670, 150, 140, 140, 32), true).setDepth(1)
                self.attackCreate.add(graphics.strokeRoundedRect(670, 300, 140, 140, 32), true).setDepth(1)



                self.textomejoraT = self.add.text(740, 480, "Mejorar Tanque").setOrigin(0.5).setDepth(1)
                self.textomejoraT.setInteractive()

                self.textomejoraT.on("pointerover", function () {
                    self.textomejoraT.setColor("#ff0000")
                })

                self.textomejoraT.on("pointerout", function () {
                    self.textomejoraT.setColor("#ffffff")
                })

                self.textomejoraT.on("pointerup", function () {
                    self.upgrade("TAMK")
                })

                self.textomejoraH = self.add.text(740, 510, "Mejorar Halfer").setOrigin(0.5).setDepth(1)
                self.textomejoraH.setInteractive()


                self.textomejoraH.on("pointerover", function () {
                    self.textomejoraH.setColor("#ff0000")
                })

                self.textomejoraH.on("pointerout", function () {
                    self.textomejoraH.setColor("#ffffff")
                })
                self.textomejoraH.on("pointerup", function () {
                    self.upgrade("HAMK")
                })

                self.tankUpgrade.add(self.add.text(740, 190, "MK").setOrigin(0.5), false).setDepth(1)
                self.tankUpgrade.add(self.add.sprite(740, 250, "").setScale(0.75), false).setDepth(1)
                self.tankUpgrade.add(self.add.text(740, 300, "Nivel: ").setOrigin(0.5), false).setDepth(1)
                self.tankUpgrade.add(self.add.text(740, 350, "Velocidad: ").setOrigin(0.5), false).setDepth(1)
                self.tankUpgrade.add(self.add.text(740, 400, "Vida: ").setOrigin(0.5), false).setDepth(1)

                self.textomejora = self.add.text(740, 450, "MEJORAR").setOrigin(0.5).setInteractive().setDepth(1)

                self.tankUpgrade.add(self.textomejora, false)

                self.textomejora.on("pointerover", function () {
                    self.textomejora.setColor("#00ffff")
                })

                self.textomejora.on("pointerout", function () {
                    self.textomejora.setColor("#ffffff")
                })

                self.tankUpgrade.add(self.add.image(710, 160, "coin").setScale(0.05), false).setDepth(1)
                self.tankUpgrade.add(self.add.text(740, 160, "500").setOrigin(0.5), false).setDepth(1)

                self.izqT = 0
                self.izqH = 0
                self.derT = 0
                self.derH = 0

                self.cantIzq = self.add.text(32, 96, "T: " + self.izqT + "\nH: " + self.izqH).setOrigin(0.5)

                self.cantDer = self.add.text(608, 224, "T: " + self.derT + "\nH: " + self.derH).setOrigin(0.5)


                self.tankUpgrade.setVisible(false)
                self.tankUpgrade.setActive(false)
                self.defendCreate.setVisible(false)
                self.defendCreate.setActive(false)
                self.turretUpgrade.setVisible(false)
                self.turretUpgrade.setActive(false)

            }
            self.timer = 0
        }




        function torretBar(x, y, atlas, name) {
            let T = self.add.sprite(x, y, atlas, name).setScale(0.60).setInteractive()
            self.input.setDraggable(T)
            return T
        }


        ////Creacion caminos enemigos////
        var graphics = this.add.graphics();
        var path
        path = this.add.path(-32, 96);
        path.lineTo(544, 96);
        path.lineTo(544, 544);
        path.lineTo(352, 544);
        path.lineTo(352, 352);
        path.lineTo(160, 352);
        path.lineTo(160, 672);

        var path2
        path2 = this.add.path(672, 224);
        path2.lineTo(544, 224);
        path2.lineTo(544, 544);
        path2.lineTo(352, 544);
        path2.lineTo(352, 352);
        path2.lineTo(160, 352);
        path2.lineTo(160, 672);

        graphics.lineStyle(3, 0xffffff, 1);
        //path.draw(graphics);
        //path2.draw(graphics);

        ////Creacion grupos de objetos////

        this.enemyGroup = new EnemyGroup(this)
        this.turretGroup = new TurretGroup(this)
        this.bulletsGroup = new BulletGroup(this)

        this.physics.add.overlap(this.enemyGroup, this.bulletsGroup, damageEnemy);

        ////Funciones////


        function damageEnemy(enemy, bullet) {
            if (enemy.active === true && bullet.active === true) {
                enemy.damage(bullet.damage);
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        }


        this.input.on("dragstart", function (pointer, gameObject) {
            self.children.bringToTop(gameObject)
        })

        this.input.on("dragend", function (pointer, gameObject, dropped) {
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX
                gameObject.y = gameObject.input.dragStartY

            }
        })

        this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        })

        this.input.on("drop", function (pointer, gameObject, dropZone) {
            if (!self.rondaalive) {
                if (self.isPlayerA) {
                    if (!dropZone.data.values.used) {

                        if (gameObject.texture.key === "turrets") {
                            if (self.money < 100) {
                                console.log("tas pobre")
                                gameObject.x = gameObject.input.dragStartX
                                gameObject.y = gameObject.input.dragStartY
                                return
                            }
                            self.money -= 100
                            self.moneyUI.setText(self.money)
                        } else {
                            if (self.money < 200) {
                                console.log("tas pobre")
                                gameObject.x = gameObject.input.dragStartX
                                gameObject.y = gameObject.input.dragStartY
                                return
                            }
                            self.money -= 200
                            self.moneyUI.setText(self.money)
                        }


                        dropZone.data.values.used = true;

                        self.turretGroup.spawn(self, dropZone.x, dropZone.y, gameObject.texture.key, true);


                        gameObject.x = gameObject.input.dragStartX
                        gameObject.y = gameObject.input.dragStartY

                        //torretBar(gameObject.input.dragStartX, gameObject.input.dragStartY, gameObject.texture.key)

                        console.log("Marcado " + gameObject.texture.key)
                        self.socket.emit("turretPlaced", gameObject, self.isPlayerA, dropZone)
                    } else {
                        console.log("Ya esta usado")
                        gameObject.x = gameObject.input.dragStartX
                        gameObject.y = gameObject.input.dragStartY
                    }
                } else {
                    if (gameObject.texture.key === "tanks") {
                        if (self.money < self.valortank) {
                            console.log("tas pobre")
                            gameObject.x = gameObject.input.dragStartX
                            gameObject.y = gameObject.input.dragStartY
                            return
                        }
                        self.money -= self.valortank
                        self.moneyUI.setText(self.money)
                    } else {
                        if (self.money < self.valorhalfer) {
                            console.log("tas pobre")
                            gameObject.x = gameObject.input.dragStartX
                            gameObject.y = gameObject.input.dragStartY
                            return
                        }
                        self.money -= self.valorhalfer
                        self.moneyUI.setText(self.money)
                    }

                    self.TotEnemigos += 1
                    dropZone.data.values.cant += 1;

                    if (dropZone.x === 32) {
                        if (gameObject.texture.key === "tanks") {
                            self.izqT += 1
                            self.cantIzq.setText("T: " + self.izqT + "\nH: " + self.izqH)
                        } else {
                            self.izqH += 1
                            self.cantIzq.setText("T: " + self.izqT + "\nH: " + self.izqH)
                        }
                        self.enemyGroup.addEnemy(self, gameObject.texture.key, gameObject.frame.name, path);
                        self.socket.emit("enemyADD", gameObject.texture.key, gameObject.frame.name, self.isPlayerA, "C1")


                    } else {
                        if (gameObject.texture.key === "tanks") {
                            self.derT += 1
                            self.cantDer.setText("T: " + self.derT + "\nH: " + self.derH)
                        } else {
                            self.derH += 1
                            self.cantDer.setText("T: " + self.derT + "\nH: " + self.derH)
                        }
                        self.enemyGroup.addEnemy(self, gameObject.texture.key, gameObject.frame.name, path2);
                        self.socket.emit("enemyADD", gameObject.texture.key, gameObject.frame.name, self.isPlayerA, "C2")


                    }

                    gameObject.x = gameObject.input.dragStartX
                    gameObject.y = gameObject.input.dragStartY


                    console.log("Agregado " + gameObject.texture.key)
                }

            } else {
                gameObject.x = gameObject.input.dragStartX
                gameObject.y = gameObject.input.dragStartY
            }


        })



        ////Creacion zonas torretas////

        function zonesCreation(AoB) {
            if (AoB) {
                self.zone = new Zone(self)

                self.T1 = self.zone.renderZone(160, 32)
                self.T2 = self.zone.renderZone(352, 32)
                self.T3 = self.zone.renderZone(608, 32)
                self.T4 = self.zone.renderZone(160, 160)
                self.T5 = self.zone.renderZone(608, 160)
                self.T6 = self.zone.renderZone(288, 288)
                self.T7 = self.zone.renderZone(480, 352)
                self.T8 = self.zone.renderZone(224, 416)
                self.T9 = self.zone.renderZone(608, 416)
                self.T10 = self.zone.renderZone(96, 480)
                self.T11 = self.zone.renderZone(608, 608)

                /*
                self.outline1 = self.zone.renderOutline(self.T1)
                self.outline2 = self.zone.renderOutline(self.T2)
                self.outline3 = self.zone.renderOutline(self.T3)
                self.outline4 = self.zone.renderOutline(self.T4)
                self.outline5 = self.zone.renderOutline(self.T5)
                self.outline6 = self.zone.renderOutline(self.T6)
                self.outline7 = self.zone.renderOutline(self.T7)
                self.outline8 = self.zone.renderOutline(self.T8)
                self.outline9 = self.zone.renderOutline(self.T9)
                self.outline10 = self.zone.renderOutline(self.T10)
                self.outline11 = self.zone.renderOutline(self.T11)
                */

            } else {
                self.zone = new Zone(self)

                self.T1 = self.zone.renderZone(32, 96)
                self.T2 = self.zone.renderZone(608, 224)
                /*
                self.outline1 = self.zone.renderOutline(self.T1)
                self.outline2 = self.zone.renderOutline(self.T2)
                */

            }


        }


        /*const debugGraphics = this.add.graphics().setAlpha(0.7)
        wallsLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        })*/




    }

    getEnemy(x, y, distance) {
        var enemyUnits = this.enemyGroup.getChildren();
        for (var i = 0; i < enemyUnits.length; i++) {
            if (enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
                return enemyUnits[i];
        }
        return false;
    }

    addBullet(x, y, angle, dmg) {
        var bullet = this.bulletsGroup.getFirstDead(false);
        if (bullet) {
            bullet.fire(x, y, angle, dmg);

            //console.log("disparando")

        }
    }

    addMoney(valor) {
        if (this.isPlayerA) {
            this.money += valor
            this.moneyUI.setText(this.money)
        }

    }

    upgrade(item) {

        if (this.defendCreate.active || this.attackCreate.active) {
            if (this.isPlayerA) {
                console.log("defendInfo")
                this.defendCreate.setVisible(false)
                this.defendCreate.setActive(false)
                this.turretUpgrade.setVisible(true)
                this.turretUpgrade.setActive(true)
                var turretData = this.turretUpgrade.getChildren();
                let self = this
                turretData[0].setText(item.name + item.lvl)
                turretData[1].setScale(0.5)

                turretData[2].setText("Nivel: " + item.lvl)
                if (item.name === "Torreta MK") {
                    turretData[1].setTexture(item.texture.key, "TMK" + item.lvl + ".png")
                    turretData[3].setText("Velocidad: " + item.firerate)
                    turretData[4].setText("Daño: " + item.damage)
                    switch (item.lvl) {
                        case 1:
                            turretData[7].setText("500")
                            this.costoMejora = 500
                            break;
                        case 2:
                            turretData[7].setText("600")
                            this.costoMejora = 600

                            break;
                        case 3:
                            turretData[7].setText("700")
                            this.costoMejora = 700

                            break;
                        default:
                            break;
                    }

                } else {
                    turretData[1].setTexture("lasers", "LMK" + item.lvl + ".png")
                    turretData[3].setText("Cooldown: " + item.cooldown)
                    turretData[4].setText("Daño: " + item.damage * 30)
                    switch (item.lvl) {
                        case 1:
                            turretData[7].setText("700")
                            this.costoMejora = 700

                            break;
                        case 2:
                            turretData[7].setText("800")
                            this.costoMejora = 800

                            break;
                        case 3:
                            turretData[7].setText("900")
                            this.costoMejora = 900

                            break;
                        default:
                            break;
                    }

                }
                turretData[5].removeListener("pointerdown")
                turretData[5].on("pointerdown", function () {
                    upgradelevel()
                })
                if (item.lvl === 4) {
                    turretData[5].setVisible(false)
                    turretData[6].setVisible(false)
                    turretData[7].setVisible(false)

                }


                function upgradelevel() {
                    if (self.money >= self.costoMejora) {
                        self.money -= self.costoMejora
                        self.moneyUI.setText(self.money)

                        if (item.name === "Torreta MK") {
                            console.log("upgradeado " + item.name)
                            item.lvl += 1
                            item.firerate -= 55
                            item.damage += 20
                            item.setTexture("turrets", "TMK" + item.lvl + ".png")
                            turretData[0].setText(item.name + item.lvl)
                            turretData[1].setTexture("turrets", "TMK" + item.lvl + ".png")
                            turretData[2].setText("Nivel: " + item.lvl)
                            turretData[3].setText("Velocidad: " + item.firerate)
                            turretData[4].setText("Daño: " + item.damage)
                            self.socket.emit("upgradeTurret", item.x, item.y, item.lvl, item.name, item.firerate, item.damage)
                            self.costoMejora += 100
                            turretData[7].setText(self.costoMejora)

                            if (item.lvl === 4) {
                                turretData[5].setVisible(false)
                                turretData[6].setVisible(false)
                                turretData[7].setVisible(false)


                            }

                        } else {
                            console.log("upgradeado " + item.name)
                            item.lvl += 1
                            item.cooldown -= 150
                            item.damage += 2
                            item.setTexture("lasers", "LMK" + item.lvl + ".png")
                            turretData[0].setText(item.name + item.lvl)
                            turretData[1].setTexture("lasers", "LMK" + item.lvl + ".png")
                            turretData[2].setText("Nivel: " + item.lvl)
                            turretData[3].setText("Cooldown: " + item.cooldown)
                            turretData[4].setText("Daño: " + item.damage * 30)
                            self.socket.emit("upgradeTurret", item.x, item.y, item.lvl, item.name, item.cooldown, item.damage)
                            self.costoMejora += 100
                            turretData[7].setText(self.costoMejora)

                            if (item.lvl === 4) {
                                turretData[5].setVisible(false)
                                turretData[6].setVisible(false)
                                turretData[7].setVisible(false)
                            }
                        }
                    }


                }
            } else {
                console.log("attackInfo")

                this.attackCreate.setVisible(false)
                this.attackCreate.setActive(false)
                this.tankUpgrade.setVisible(true)
                this.tankUpgrade.setActive(true)
                var tankData = this.tankUpgrade.getChildren();
                var attackData = this.attackCreate.getChildren();
                if (item === "TAMK") {
                    var it = attackData[0].frame.name
                    if (it === "TAMK1.png") {
                        tankData[0].setText("Tanque MK1")
                        tankData[1].setTexture("tanks", it)
                        tankData[2].setText("Nivel: " + 1)
                        tankData[3].setText("Velocidad: " + 10)
                        tankData[4].setText("Vida: " + 500)

                        tankData[7].setText("500")
                        this.costoMejora = 500
                    } else if (it === "TAMK2.png") {
                        tankData[0].setText("Tanque MK2")
                        tankData[1].setTexture("tanks", it)
                        tankData[2].setText("Nivel: " + 2)
                        tankData[3].setText("Velocidad: " + 10)
                        tankData[4].setText("Vida: " + 500)

                        tankData[7].setText("600")
                        this.costoMejora = 600
                    } else if (it === "TAMK3.png") {
                        tankData[0].setText("Tanque MK3")
                        tankData[1].setTexture("tanks", it)
                        tankData[2].setText("Nivel: " + 3)
                        tankData[3].setText("Velocidad: " + 10)
                        tankData[4].setText("Vida: " + 500)

                        tankData[7].setText("700")
                        this.costoMejora = 700
                    } else if (it === "TAMK4.png") {
                        tankData[0].setText("Tanque MK4")
                        tankData[1].setTexture("tanks", it)
                        tankData[2].setText("Nivel: " + 4)
                        tankData[3].setText("Velocidad: " + 10)
                        tankData[4].setText("Vida: " + 500)
                        tankData[5].setVisible(false)

                        tankData[6].setVisible(false)
                        tankData[7].setVisible(false)

                    }

                } else {
                    var it = attackData[1].frame.name
                    if (it === "HAMK1.png") {
                        tankData[0].setText("Halfer MK1")
                        tankData[1].setTexture("halfers", it)
                        tankData[2].setText("Nivel: " + 1)
                        tankData[3].setText("Velocidad: " + 50)
                        tankData[4].setText("Vida: " + 150)

                        tankData[7].setText("400")
                        this.costoMejora = 400
                    } else if (it === "HAMK2.png") {
                        tankData[0].setText("Halfer MK2")
                        tankData[1].setTexture("halfers", it)
                        tankData[2].setText("Nivel: " + 2)
                        tankData[3].setText("Velocidad: " + 10)
                        tankData[4].setText("Vida: " + 500)

                        tankData[7].setText("500")
                        this.costoMejora = 500
                    } else if (it === "HAMK3.png") {
                        tankData[0].setText("Halfer MK3")
                        tankData[1].setTexture("halfers", it)
                        tankData[2].setText("Nivel: " + 3)
                        tankData[3].setText("Velocidad: " + 10)
                        tankData[4].setText("Vida: " + 500)

                        tankData[7].setText("600")
                        this.costoMejora = 600
                    } else if (it === "HAMK4.png") {
                        tankData[0].setText("Halfer MK4")
                        tankData[1].setTexture("halfers", it)
                        tankData[2].setText("Nivel: " + 4)
                        tankData[3].setText("Velocidad: " + 10)
                        tankData[4].setText("Vida: " + 500)
                        tankData[5].setVisible(false)

                        tankData[6].setVisible(false)
                        tankData[7].setVisible(false)


                    }
                }


                this.textomejora = tankData[5]
                this.textomejora.removeListener("pointerdown")
                this.textomejora.on("pointerdown", function () {
                    upgradelevel()
                })
                let self = this
                function upgradelevel() {
                    if (self.money >= self.costoMejora) {
                        self.money -= self.costoMejora
                        self.moneyUI.setText(self.money)
                        if (item === "TAMK") {
                            console.log("upgradeado " + item)
                            var it = attackData[0].frame.name

                            if (it === "TAMK1.png") {
                                attackData[0].setTexture("tanks", "TAMK2.png")
                                attackData[2].setText("Tanque MK2")
                                self.valortank += 50
                                attackData[4].setText(self.valortank)


                                tankData[0].setText("Tanque MK2")
                                tankData[1].setTexture("tanks", "TAMK2.png")
                                tankData[2].setText("Nivel: " + 2)
                                tankData[3].setText("Velocidad: " + 20)
                                tankData[4].setText("Vida: " + 600)
                                tankData[7].setText("600")
                                self.costoMejora = 600
                            } else if (it === "TAMK2.png") {
                                attackData[0].setTexture("tanks", "TAMK3.png")
                                attackData[2].setText("Tanque MK3")
                                self.valortank += 50
                                attackData[4].setText(self.valortank)

                                tankData[0].setText("Tanque MK3")
                                tankData[1].setTexture("tanks", "TAMK3.png")
                                tankData[2].setText("Nivel: " + 3)
                                tankData[3].setText("Velocidad: " + 30)
                                tankData[4].setText("Vida: " + 700)
                                tankData[7].setText("700")
                                self.costoMejora = 700
                            } else if (it === "TAMK3.png") {
                                attackData[0].setTexture("tanks", "TAMK4.png")
                                attackData[2].setText("Tanque MK4")
                                self.valortank += 50
                                attackData[4].setText(self.valortank)

                                tankData[0].setText("Tanque MK4")
                                tankData[1].setTexture("tanks", "TAMK4.png")
                                tankData[2].setText("Nivel: " + 4)
                                tankData[3].setText("Velocidad: " + 40)
                                tankData[4].setText("Vida: " + 800)
                                tankData[5].setVisible(false)
                                tankData[6].setVisible(false)
                                tankData[7].setVisible(false)

                            }

                        } else {
                            console.log("upgradeado " + item)
                            var it = attackData[1].frame.name

                            if (it === "HAMK1.png") {
                                attackData[1].setTexture("halfers", "HAMK2.png")
                                attackData[3].setText("Halfer MK2")
                                self.valorhalfer += 50
                                attackData[5].setText(self.valorhalfer)

                                tankData[0].setText("Halfer MK2")
                                tankData[1].setTexture("halfers", "HAMK2.png")
                                tankData[2].setText("Nivel: " + 2)
                                tankData[3].setText("Velocidad: " + 60)
                                tankData[4].setText("Vida: " + 200)
                                tankData[7].setText("500")
                                self.costoMejora = 500
                            } else if (it === "HAMK2.png") {
                                attackData[1].setTexture("halfers", "HAMK3.png")
                                attackData[3].setText("Halfer MK3")
                                self.valorhalfer += 50
                                attackData[5].setText(self.valorhalfer)

                                tankData[0].setText("Halfer MK3")
                                tankData[1].setTexture("halfers", "HAMK3.png")
                                tankData[2].setText("Nivel: " + 3)
                                tankData[3].setText("Velocidad: " + 70)
                                tankData[4].setText("Vida: " + 250)
                                tankData[7].setText("600")
                                self.costoMejora = 600
                            } else if (it === "HAMK3.png") {
                                attackData[1].setTexture("halfers", "HAMK4.png")
                                attackData[3].setText("Halfer MK4")
                                self.valorhalfer += 50
                                attackData[5].setText(self.valorhalfer)

                                tankData[0].setText("Halfer MK4")
                                tankData[1].setTexture("halfers", "HAMK4.png")
                                tankData[2].setText("Nivel: " + 4)
                                tankData[3].setText("Velocidad: " + 80)
                                tankData[4].setText("Vida: " + 300)
                                tankData[5].setVisible(false)
                                tankData[6].setVisible(false)
                                tankData[7].setVisible(false)

                            }
                        }
                    }
                }
            }

        } else {
            if (this.isPlayerA) {
                this.defendCreate.setVisible(true)
                this.defendCreate.setActive(true)
                this.turretUpgrade.setVisible(false)
                this.turretUpgrade.setActive(false)
            } else {
                this.attackCreate.setVisible(true)
                this.attackCreate.setActive(true)
                this.tankUpgrade.setVisible(false)
                this.tankUpgrade.setActive(false)
            }

        }

    }

    spawnEnemy() {
        console.log("spawn Funct")
        this.enemyGroup.spawn(this);
    }

    countDead() {
        console.log("Total a matar: " + this.TotEnemigos)
        this.countD += 1
        console.log("Total muertos: " + this.countD)
        if (this.countD === this.TotEnemigos) {
            console.log("nueva ronda")
            this.socket.emit("newRound")

        }

    }

    puntoB() {
        this.vida -= 1
        if (this.isPlayerA) {

            this.vidaUI.setText("Vidas: " + this.vida)

            if (this.vida === 0) {
                this.socket.emit("gameover")
            }
        }
        if (this.vida !== 0) {
            this.countDead()
        }


    }

    update(time, delta) {

        this.timer += delta;
        while (this.timer > 1000) {
            this.segundos -= 1
            this.relojRonda.setText("Faltan: " + this.segundos + "s")
            this.timer -= 1000;
            if (this.segundos === 0) {
                console.log("Ronda Empezada!")
                this.rondaalive = true

                this.relojRonda.setText("Ronda Empezada!")
                this.segundos = 30
                this.timer = -1000000

                this.spawnEnemy()
            }
        }
        this.timer2 += delta;
        if (!this.isPlayerA) {
            while (this.timer2 > 1000) {
                this.money += 50
                try {
                    this.moneyUI.setText(this.money)

                } catch (error) {
                    console.log("aun no creado")
                }
                this.timer2 -= 1000;

            }
        }

    }
}


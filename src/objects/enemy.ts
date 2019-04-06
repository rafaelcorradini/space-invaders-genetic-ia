import { Player } from './player';
import { Bullet } from "./bullet";

export class Enemy extends Phaser.GameObjects.Sprite {
  private bullets: Phaser.GameObjects.Group;
  private currentScene: Phaser.Scene;
  private dyingTime: number;
  private enemyTint: number;
  private enemyType: string;
  private hurtingTime: number;
  private isHurt: boolean;
  private lives: number;
  private moveTween: Phaser.Tweens.Tween;
  private reloadTime: number;
  private valueKill: number;
  private player: Player;
  public fitness: number = 0;
  public moveGap: number;
  public id: number;
  public flyingSpeed: number = 50;

  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  constructor(params) {
    super(params.scene, params.x, params.y, params.key);

    this.initVariables(params);
    this.initImage();
    this.initPhysics();

    // this.initTweens();
    this.player = params.player;

    this.currentScene.add.existing(this);
  }

  private initVariables(params): void {
    this.currentScene = params.scene;
    this.bullets = this.currentScene.add.group({
      maxSize: 10,
      runChildUpdate: true
    });
    this.enemyType = params.key;
    this.hurtingTime = 200;
    this.isHurt = false;
    this.moveGap = params.moveGap;
    this.id = params.id;

    // set the characteristics of the specific enemy
    switch (this.enemyType) {
      case "octopus":
        this.dyingTime = 100;
        this.enemyTint = 0xffffff;
        this.lives = 1;
        this.reloadTime = 1000;
        this.valueKill = 40;
        break;

      case "crab":
        this.dyingTime = 120;
        this.enemyTint = 0x42a4aa;
        this.lives = 2;
        this.reloadTime = 5000;
        this.valueKill = 40;
        break;

      case "squid":
        this.dyingTime = 140;
        this.enemyTint = 0x4a4e4d;
        this.lives = 5;
        this.reloadTime = 15000;
        this.valueKill = 40;

        break;
    }
  }

  private initImage(): void {
    this.setOrigin(0.5, 0.5);
    this.setActive(true);
    this.setTint(this.enemyTint);
  }

  private initPhysics(): void {
    this.currentScene.physics.world.enable(this);
    this.body.setSize(12, 8);
  }

  // private initTweens(): void {
  //   this.moveTween = this.currentScene.tweens.add({
  //     targets: this,
  //     x: this.x + Math.floor((Math.random() * 100) + 1),
  //     y: this.y + Math.floor((Math.random() * 100) + 1),
  //     ease: "Power0",
  //     duration: this.moveGap,
  //     yoyo: true,
  //     repeat: -1
  //   });
  // }

  update(): void {
    if (this.active) {
      this.anims.play(this.enemyType + "Fly", true);

      if (Phaser.Math.RND.between(0, this.reloadTime) === 0) {
        this.bullets.add(
          new Bullet({
            scene: this.currentScene,
            x: this.x,
            y: this.y,
            key: "bullet",
            bulletProperties: {
              speed: 100
            }
          })
        );
      }

      this.handleFlying();

      if (this.isHurt) {
        this.setTint(0xfc8a75);
        this.setScale(0.8);
        this.setAlpha(0.8);
        if (this.hurtingTime > 0) {
          this.hurtingTime -= 10;
        } else {
          this.setTint(this.enemyTint);
          this.setScale(1);
          this.setAlpha(1);
          this.isHurt = false;
          this.hurtingTime = 200;
        }
      }
    } else {
      this.anims.play(this.enemyType + "Dead");

      if (this.dyingTime > 0) {
        this.dyingTime -= 10;
      } else {
        this.addPoints();
        this.destroy();
      }
    }
  }

  public gotHurt(): void {
    this.lives -= 1;
    if (this.lives === 0) {
      this.setActive(false);
    } else {
      this.isHurt = true;
    }
  }

  private handleFlying(): void {
    if (
      Phaser.Math.RND.between(-this.moveGap, this.moveGap) + this.x < this.player.x
    ) {
      this.body.setVelocityX(Phaser.Math.RND.between(this.flyingSpeed - 50, this.flyingSpeed));
    } else {
      this.body.setVelocityX((-1) * Phaser.Math.RND.between(this.flyingSpeed - 50, this.flyingSpeed));
    }
  }

  private addPoints(): void {
    let getCurrentPoints = this.currentScene.registry.get("points");
    this.currentScene.registry.set("points", getCurrentPoints + this.valueKill);
    this.currentScene.events.emit("pointsChanged");
  }
}

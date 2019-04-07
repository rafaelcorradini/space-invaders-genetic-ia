import { Bullet } from "./bullet";

export class Player extends Phaser.GameObjects.Image {
  private bullets: Phaser.GameObjects.Group;
  private currentScene: Phaser.Scene;
  private cursors: CursorKeys;
  private flyingSpeed: number;
  private lastShoot: number;
  private shootingKey: Phaser.Input.Keyboard.Key;
  private randomKey: Phaser.Input.Keyboard.Key;
  private normalKey: Phaser.Input.Keyboard.Key;

  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  constructor(params) {
    super(params.scene, params.x, params.y, params.key);

    this.initVariables(params);
    this.initImage();
    this.initInput();
    this.initPhysics();

    this.currentScene.add.existing(this);
  }

  private initVariables(params): void {
    this.currentScene = params.scene;
    this.bullets = this.currentScene.add.group({
      runChildUpdate: true
    });
    this.lastShoot = 0;
    this.flyingSpeed = 200;
  }

  private initImage(): void {
    this.setOrigin(0.5, 0.5);
  }

  private initInput(): void {
    this.cursors = this.currentScene.input.keyboard.createCursorKeys();
    this.shootingKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.randomKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.I
    );
    this.normalKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.O
    );
  }

  private initPhysics(): void {
    this.currentScene.physics.world.enable(this);
    this.body.setSize(13, 8);
  }

  update(): void {
    if (this.randomKey.isDown) {
      this.currentScene.registry.set('random', true);
    }
    if (this.normalKey.isDown) {
      this.currentScene.registry.set('random', false);
    }
    if (this.currentScene.registry.get('random')) {
      this.handleFlyingRandom();
      this.handleShootingRandom();
    } else {
      this.handleFlying();
      this.handleShooting();
    }
    
  }

  // fly randomly respecting screen limits
  private handleFlyingRandom(): void {
    const direction = Phaser.Math.RND.between(-1, 1);
    if (
      this.x < this.currentScene.sys.canvas.width - this.width / 2 &&
      this.x > this.width / 2
    ) {
      this.body.setVelocityX(direction * this.flyingSpeed);
    } else if (this.x >= this.width / 2) {
      this.body.setVelocityX(-1 * this.flyingSpeed);
    } else {
      this.body.setVelocityX(1 * this.flyingSpeed);
    }
  }

  // fly with keyboard
  private handleFlying(): void {
    if (
      this.cursors.right.isDown &&
      this.x < this.currentScene.sys.canvas.width - this.width / 2
    ) {
      this.body.setVelocityX(this.flyingSpeed);
    } else if (this.cursors.left.isDown && this.x > this.width / 2) {
      this.body.setVelocityX(-this.flyingSpeed);
    } else {
      this.body.setVelocityX(0);
    }
    // vertical move
    // if (
    //   this.cursors.down.isDown &&
    //   this.y < this.currentScene.sys.canvas.height - this.width / 2
    // ) {
    //   this.body.setVelocityY(this.flyingSpeed);
    // } else if (this.cursors.up.isDown && this.y > this.height / 2) {
    //   this.body.setVelocityY(-this.flyingSpeed);
    // } else {
    //   this.body.setVelocityY(0);
    // }
  }

  private handleShootingRandom(): void {
    if (Phaser.Math.RND.between(0, 2) === 0) {
      this.bullets.add(
        new Bullet({
          scene: this.currentScene,
          x: this.x,
          y: this.y - this.height,
          key: "bullet",
          bulletProperties: {
            speed: -300
          }
        })
      );

      this.lastShoot = this.currentScene.time.now + 500;
    }
  }

  private handleShooting(): void {
    if (
      this.shootingKey.isDown &&
      this.currentScene.time.now > this.lastShoot
    ) {
      if (this.bullets.getLength() < 1) {
        this.bullets.add(
          new Bullet({
            scene: this.currentScene,
            x: this.x,
            y: this.y - this.height,
            key: "bullet",
            bulletProperties: {
              speed: -300
            }
          })
        );

        this.lastShoot = this.currentScene.time.now + 500;
      }
    }
  }

  public gotHurt() {
    // update lives
    let currentLives = this.currentScene.registry.get("lives");
    this.currentScene.registry.set("lives", currentLives - 1);
    this.currentScene.events.emit("livesChanged");
    
    // reset position
    this.cursors.down.isDown = false;
    this.cursors.right.isDown = false;
    this.cursors.up.isDown = false;
    this.cursors.left.isDown = false;
    this.shootingKey.isDown = false;
    this.x = this.currentScene.sys.canvas.width / 2;
    this.y = this.currentScene.sys.canvas.height - 40;
  }
}

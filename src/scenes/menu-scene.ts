export class MenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key;
  private resetKey: Phaser.Input.Keyboard.Key;
  private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];
  private upKey: Phaser.Input.Keyboard.Key;
  constructor() {
    super({
      key: "MenuScene"
    });
  }

  init(): void {
    this.startKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    this.resetKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.R
    );
    this.resetKey.isDown = false;
    this.startKey.isDown = false;
    this.initRegistry();
  }

  create(): void {
    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2 - 65,
        this.sys.canvas.height / 2,
        "font",
        "PRESS S TO PLAY",
        8
      )
    );

    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2 - 70,
        this.sys.canvas.height / 2 + 30,
        "font",
        "PRESS R TO RESET",
        8
      )
    );

    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2 - 60,
        this.sys.canvas.height / 2 - 40,
        "font",
        "SPACE INVADERS",
        8
      )
    );
  }

  update(): void {
    if (this.startKey.isDown) {
      this.scene.start("HUDScene");
      this.scene.start("GameScene");
      this.scene.bringToTop("HUDScene");
    }

    if (this.resetKey.isDown) {
      localStorage.clear();
    }
  }

  /**
   * Build-in global game data manager to exchange data between scenes.
   * Here we initialize our variables with a key.
   */
  private initRegistry(): void {
    this.registry.set("points", this.registry.get("points"));
    this.registry.set("lives", 3);
  }
}

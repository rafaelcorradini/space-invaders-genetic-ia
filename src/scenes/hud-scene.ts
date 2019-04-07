export class HUDScene extends Phaser.Scene {
  private bitmapTexts: Phaser.GameObjects.BitmapText[];
  private saved;
  constructor() {
    super({
      key: "HUDScene"
    });
  }

  init(): void {
    this.bitmapTexts = [];
  }

  create(): void {
    // create bitmap texts
    this.saved = JSON.parse(localStorage.getItem('generation'));
    if (this.saved == null || this.saved == undefined) {
      this.saved = {
        number: 1
      };
    }
    this.bitmapTexts.push(
      this.add.bitmapText(
        10,
        this.scene.systems.canvas.height - 20,
        "font",
        `Lifes: ${this.registry.get("lives")}`,
        8
      )
    );
    this.bitmapTexts.push(
      this.add.bitmapText(
        10,
        10,
        "font",
        `Points: ${this.registry.get("points")}`,
        8
      )
    );

    this.bitmapTexts.push(
      this.add.bitmapText(
        this.scene.systems.canvas.width - 85,
        this.scene.systems.canvas.height - 20,
        "font",
        `Gen: ${this.saved.number}`,
        8
      )
    );

    // create events
    const level = this.scene.get("GameScene");
    level.events.on("pointsChanged", this.updatePoints, this);
    level.events.on("livesChanged", this.updateLives, this);
  }

  private updatePoints() {
    this.bitmapTexts[1].setText(`Points: ${this.registry.get("points")}`);
  }

  private updateLives() {
    this.bitmapTexts[0].setText(`Lives: ${this.registry.get("lives")}`);
  }
}

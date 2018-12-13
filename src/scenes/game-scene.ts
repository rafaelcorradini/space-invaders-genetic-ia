import { Enemy } from "../objects/enemy";
import { Player } from "../objects/player";

export class GameScene extends Phaser.Scene {
  private enemies: Phaser.GameObjects.Group;
  private player: Player;
  private generation: any;
  constructor() {
    super({
      key: "GameScene"
    });
    this.generation = JSON.parse(localStorage.getItem('generation'));
  }

  init(): void {
    this.enemies = this.add.group({ runChildUpdate: true });
  }

  create(): void {
    // create game objects
    this.player = new Player({
      scene: this,
      x: this.sys.canvas.width / 2,
      y: this.sys.canvas.height - 40,
      key: "player"
    });

    if (this.generation !== null && this.generation !== undefined) {
      this.nextGen();
    } else {
      // generate random enemies
      let enemyTypes = ["octopus", "crab", "squid"];
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 10; x++) {
          let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
          const moveTime = Math.floor(Math.random() * 5000) + 2000;
          this.enemies.add(
            new Enemy({
              scene: this,
              x: 20 + x * 15,
              y: 50 + y * 15,
              moveTime: moveTime,
              key: type
            })
          );
        }
      }
      this.generation = {
        number: 1,
        enemies: this.enemies.children.entries
      };
      localStorage.setItem('generation', JSON.stringify(this.generation));
    }
    
  }

  nextGen(): void {
    let x = 0, y = 0;
    for (let enemy of this.generation.enemies) {
      this.enemies.add(
        new Enemy({
          scene: this,
          x: 20 + x++ * 15,
          y: 50 + y++ * 15,
          key: enemy.type,
          moveTime: enemy.moveTime
        })
      );
      this.generation = {
        number: this.generation.number++,
        enemies: this.enemies.children.entries
      };
      localStorage.setItem('generation', JSON.stringify(this.generation));
    }
  }

  update(): void {
    if (this.player.active) {
      this.player.update();

      this.enemies.children.each(function(enemy) {
        enemy.update();
        if (enemy.getBullets().getLength() > 0) {
          this.physics.overlap(
            enemy.getBullets(),
            this.player,
            this.bulletHitPlayer,
            null,
            this
          );
        }
      }, this);

      this.checkCollisions();
    }

    if (this.registry.get("lives") < 0 || this.enemies.getLength() === 0) {
      this.registry.set("level", this.registry.get("level")+1);
      this.enemies.children.entries.map((enemy: Enemy) => {
        enemy.fitness++;
        return enemy;
      });
      this.generation.enemies = this.enemies.children.entries;
      localStorage.setItem('generation', JSON.stringify(this.generation));

      this.scene.start("MenuScene");
      this.scene.stop("HUDScene");
    }
  }

  private checkCollisions(): void {
    this.physics.overlap(
      this.player.getBullets(),
      this.enemies,
      this.bulletHitEnemy,
      null,
      this
    );
    this.physics.overlap(
      this.player,
      this.enemies,
      this.enemyHitPlayer,
      null,
      this
    );
  }

  private bulletHitEnemy(bullet, enemy): void {
    bullet.destroy();
    enemy.gotHurt();
  }

  private bulletHitPlayer(bullet, player): void {
    bullet.destroy();
    player.gotHurt();
  }

  private enemyHitPlayer(player, enemy): void {
    enemy.fitness++;
    player.gotHurt();
  }
}

import { Enemy } from '../objects/enemy';
import { Player } from '../objects/player';
import * as _ from 'lodash';

export class GameScene extends Phaser.Scene {
  private enemies: Phaser.GameObjects.Group;
  private player: Player;
  private generation: any;
  private saved: any;
  constructor() {
    super({
      key: 'GameScene'
    });
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
      key: 'player'
    });

    // get generation saved on localstorage
    this.saved = JSON.parse(localStorage.getItem('generation'));

    if (this.saved !== null && this.saved !== undefined) {
      this.nextGen();
    } else {
      // generate random enemies
      let enemyTypes = ['octopus', 'crab', 'squid'];
      let id = 0;
      this.generation = {
        number: 1,
        enemies: []
      };
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
              key: type,
              id: id
            })
          );
          this.generation.enemies.push({
            moveTime: moveTime,
            key: type,
            fitness: 0
          });
          id++;
        }
      }
      localStorage.setItem('generation', JSON.stringify(this.generation));
    }
  }

  nextGen(): void {
    let best1: any = { fitness: -1 };
    let best2: any = { fitness: -1 };
    this.saved.enemies.map((enemy) => {
      if (best1.fitness < enemy.fitness) {
        best1 = enemy;
      } else if (best2.fitness < enemy.fitness) {
        best2 = enemy;
      }
    });
    this.generation = {
      number: this.saved.number + 1,
      enemies: []
    };
    let id = 0;
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 10; x++) {
        if (y % 2 === 0) {
          this.enemies.add(
            new Enemy({
              scene: this,
              x: 20 + x * 15,
              y: 50 + y * 15,
              moveTime: best1.moveTime,
              key: best2.key,
              id: id
            })
          );
          this.generation.enemies.push({
            moveTime: best2.moveTime,
            key: best1.key,
            fitness: 0
          });
        } else {
          this.enemies.add(
            new Enemy({
              scene: this,
              x: 20 + x * 15,
              y: 50 + y * 15,
              moveTime: best2.moveTime,
              key: best1.key,
              id: id
            })
          );
          this.generation.enemies.push({
            moveTime: best2.moveTime,
            key: best1.key,
            fitness: 0
          });
        }
        id++;
      }
    }
    localStorage.setItem('generation', JSON.stringify(this.generation));
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
            () => enemy.fitness++,
            this
          );
        }
      }, this);

      this.checkCollisions();
    }

    if (this.registry.get('lives') < 0 || this.enemies.getLength() === 0) {
      this.registry.set('level', this.registry.get('level')+1);
      this.generation.enemies.map((enemy: Enemy) => {
        enemy.fitness++;
        return enemy;
      });
      localStorage.setItem('generation', JSON.stringify(this.generation));

      this.scene.start('MenuScene');
      this.scene.stop('HUDScene');
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
    this.generation.enemies[enemy.id].fitness++;
    player.gotHurt();
  }
}

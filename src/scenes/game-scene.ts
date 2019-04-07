import { Enemy } from '../objects/enemy';
import { Player } from '../objects/player';
import * as _ from 'lodash';

export class GameScene extends Phaser.Scene {
  private enemies: Phaser.GameObjects.Group;
  private player: Player;
  private generation: any;
  private history: any;
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
    this.generation = localStorage.getItem('generation');
    this.history = localStorage.getItem('historyFitness');
    if (!this.history) {
      this.history = [];
    } else {
      this.history = JSON.parse(this.history);
    }

    if (this.generation !== null && this.generation !== undefined) {
      this.generation = JSON.parse(this.generation);
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
          const moveGap = Phaser.Math.RND.between(-50, 50);
          this.enemies.add(
            new Enemy({
              scene: this,
              x: 20 + x * 15,
              y: 50 + y * 15,
              moveGap: moveGap,
              key: type,
              id: id,
              player: this.player
            })
          );
          this.generation.enemies.push({
            moveGap: moveGap,
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
    let enemyTypes = ['octopus', 'crab', 'squid'];
    let best1: any = { fitness: -1 };
    let best2: any = { fitness: -1 };
    this.generation.enemies.map((enemy) => {
      if (best1.fitness < enemy.fitness) {
        best1 = enemy;
      } else if (best2.fitness < enemy.fitness) {
        best2 = enemy;
      }
    });
    const bestFitness = Math.max(best1.fitness, best2.fitness);
    this.history.push(bestFitness);
    localStorage.setItem('historyFitness', JSON.stringify(this.history));
    this.generation = {
      number: this.generation.number + 1,
      enemies: []
    };
    let id = 0;
    let spd = 0;
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 10; x++) {
        let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const moveGap = Phaser.Math.RND.between(-50, 50);
        if (y !== 4) {
          let form = type;
          let mutate_chance = 10;
          let mutation = Math.random() * 100;
          if (y % 2 === 0) {
            spd = best1.moveGap;
            form = best2.key;
          }
          else {
            spd = best2.moveGap;
            form = best1.key;
          }
          if (mutation <= mutate_chance) {
            if (mutation < 5) {
              spd = moveGap;
            }
            else {
              form = type;
            }
          }
          this.enemies.add(
            new Enemy({
              scene: this,
              x: 20 + x * 15,
              y: 50 + y * 15,
              moveGap: spd,
              key: form,
              id: id,
              player: this.player
            })
          );
          this.generation.enemies.push({
            moveGap: spd,
            key: form,
            fitness: 0
          });
          id++;
        } else {
          let id = 0;
          const moveGap = Phaser.Math.RND.between(-50, 50);
          this.enemies.add(
            new Enemy({
              scene: this,
              x: 20 + x * 15,
              y: 50 + y * 15,
              moveGap: moveGap,
              key: type,
              id: id,
              player: this.player
            })
          );
          this.generation.enemies.push({
            moveGap: moveGap,
            key: type,
            fitness: 0
          });
          id++;
        }
      }
    }
    localStorage.setItem('generation', JSON.stringify(this.generation));
  }

  update(): void {
    if (this.player.active) {
      this.player.update();

      this.enemies.children.each(function (enemy) {
        enemy.update();
        if (enemy.getBullets().getLength() > 0) {
          this.physics.overlap(
            enemy.getBullets(),
            this.player,
            this.bulletHitPlayer,
            () => this.generation.enemies[enemy.id].fitness += 10,
            this
          );
        }
      }, this);

      this.checkCollisions();
    }

  
    if (this.registry.get('lives') <= 0 || this.enemies.getLength() === 0) {
      this.enemies.getChildren().map((enemy: Enemy) => {
        if (enemy.active) {
          this.generation.enemies[enemy.id].fitness += 5;
        }
        return enemy;
      }, this);
      
      localStorage.setItem('generation', JSON.stringify(this.generation));
      if (this.registry.get('random')) {
        this.registry.set('lives', 3);
        this.events.emit("livesChanged");
        this.scene.restart();
      } else {
        if (this.enemies.getLength() !== 0) {
          this.registry.set('points', 0);
          this.scene.start('MenuScene');
          this.scene.stop('HUDScene');
        } else {
          this.scene.restart();
        }
      }
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

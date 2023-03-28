import Phaser from 'phaser';
import AnimationScene from './AnimationScene';
import Cell from './Cell';

const tiers = [50, 100, 250, 500, 1000, 2500, 5000];
/*
NOTES
during console.logs for tier 2:
  Adjacent Pair: two squares within a one block radius of each other
  Blob Pair: two squares that are not adjacent to each other because the parent cell is an island

*/


class GameScene extends Phaser.Scene {
  constructor() {
    super({
      active: true,
      visible: false,
      key: 'Game',
    });
    // todo: to keep track of how blobs are being produced, make an array of cell arrays that group up blobs by a random oid
    this.blobs = [];
    this.rows = [];
    this.items;
    this.completed = false;
    this.cellImage;
  }

  preload() {
    // this.load.image('cell', new URL('../assets/final/grid-item.jpg', import.meta.url).href);
    // this.load.image('artopia', new URL('../assets/final/Artopia_Example00.png', import.meta.url).href);

    // this.load.video('artopia', '../assets/final/Foiling_Example.mp4');
    this.load.video('artopia', new URL('../assets/final/Foiling_Example.mp4', import.meta.url).href);
  }

  create() {
    // create grid of cells
    const items = this.add.group();

    const vid = this.add.video(0, 0, 'artopia').setScale(2).setOrigin(0);
    vid.play(true);

    const rows = [];
    for (let i = 0; i < 40; i++) {
      const col = []
      for (let j = 0; j < 50; j++) {
        col.push({
          x: j,
          y: i,
          revealed: false,
        });
        const x = j * (1920 / 50);
        const y = i * (1080 / 40);
        // 1920 / 50 = 38.2
        // 1080 / 40 = 27
        // const cellImage = this.add.image(x, y, 'cell').setOrigin(0).setInteractive().setDisplaySize(38.4, 27).setName(`(${j}, ${i})`);
        // this.cellImage = this.add.video(x, y, 'artopia').setOrigin(0).setInteractive().setDisplaySize(38.4, 27).setName(`(${j}, ${i})`);





        // items.add(cellImage).setOrigin(0);

      }
      rows.push(col);
    }

    // this.cellImage.play(true);

    this.rows = rows;
    // console.log("Rows: " + this.rows);
    this.items = items;
    // console.log("Items: " + items);

    this.controls = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN')

    // this.fillSquares(50 * 10, rows, items);
    // tiers: 50, 100, 250, 500, 1000, 2500, 5000

    this.items.setDepth(1);

    // console.log(this.controls);

    // setInterval(() => {
    //   this.fillSquares(50, rows, items);
    // }, 10)

    console.log('Reachme 01');
    console.log('Reachme 01');

  }

  update() {
    if (this.input.keyboard.checkDown(this.controls['ONE'], 100)) {
      this.fillSquares(tiers[0], this.rows, this.items)
    }
    if (this.input.keyboard.checkDown(this.controls['TWO'], 100)) {
      this.fillSquares(tiers[1], this.rows, this.items)
    }
    if (this.input.keyboard.checkDown(this.controls['THREE'], 100)) {
      this.fillSquares(tiers[2], this.rows, this.items)
    }
    if (this.input.keyboard.checkDown(this.controls['FOUR'], 1000)) {
      this.fillSquares(tiers[3], this.rows, this.items)
    }
    if (this.input.keyboard.checkDown(this.controls['FIVE'], 1000)) {
      this.fillSquares(tiers[4], this.rows, this.items)
    }
    if (this.input.keyboard.checkDown(this.controls['SIX'], 1000)) {
      this.fillSquares(tiers[5], this.rows, this.items)
    }
    if (this.input.keyboard.checkDown(this.controls['SEVEN'], 1000)) {
      this.fillSquares(tiers[6], this.rows, this.items)
    }
  }

  findSquare(callback) {
    const results = []
    this.rows.forEach((row) => {
      results.push(row.find(col => callback(col)));
    });

    return results[Math.floor(Math.random() * results.length)];
  }

  sortSquares() {
    const results = [];
    this.rows.forEach(row => {
      const sample = row.filter(cell => new Cell(cell.x, cell.y, this.rows, cell.revealed).filled !== true).map(cell => new Cell(cell.x, cell.y, this.rows, cell.revealed));
      sample.sort((a, b) => b.countUnpaintedCells() - a.countUnpaintedCells())

      results.push(...sample)
    });

    return results.sort((a, b) => b.countUnpaintedCells() - a.countUnpaintedCells());
    // this.rows.forEach((row) => {
    //   results.push(row.filter(col => callback(col)))
    // });
  }

  checkForCompletion(rows) {
    this.completed = rows.every((row) => {
      return row.every(item => item.revealed)
    });
    return this.completed;
  }

  generateCenterCell(rows) {
    let src = rows[Math.floor(Math.random() * 40)][Math.floor(Math.random() * 50)];
    // let count = 0;

    while (src.revealed) {
      if (this.checkForCompletion(rows)) {
        console.log("All Cells Revealed!!!")
        break;
      }
      // count++
      src = rows[Math.floor(Math.random() * 40)][Math.floor(Math.random() * 50)];
    }
    return src;
  }

  fillSquares(donation, rows, items, parented) {
    const squares = donation / 50;

    const src = this.generateCenterCell(rows)

    src.revealed = true;
    const centerCell = new Cell(src.x, src.y, rows, src.revealed);
    // console.log(centerCell.getSurroundingCells().asArray.filter(c => c !== null).every(c => c.filled))
    items.getChildren().find(item => item.name === `(${centerCell.data.x}, ${centerCell.data.y})`).setVisible(false);

    if (parented) {
      switch (squares) {
        case 1:
          return centerCell;
        default:
          console.log(centerCell)
      }
    }

    switch (squares) {
      case 2: {
        if (centerCell.getSurroundingCells().asArray.every(child => child === null || child.filled)) {
          const second = this.fillSquares(50, rows, items, true)
          console.log(`~~~~~~~~~~~BLOB PAIR~~~~~~~~~~~~\nfirst: ${centerCell.data.x}, ${centerCell.data.y} second: ${second.data.x}, ${second.data.y}\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
          return;
        }
  
        const nextCell = centerCell.getSurroundingCells().asArray.find(child => child != null && !child.filled);
        console.log(`~~~~~~~~~ADJACENT PAIR~~~~~~~~~~\nfirst: ${centerCell.data.x}, ${centerCell.data.y} second: ${nextCell.data.x}, ${nextCell.data.y}\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)

        nextCell.filled = true;
        rows[nextCell.data.y][nextCell.data.x].revealed = true;
        items.getChildren().find(i => i.name === `(${nextCell.data.x}, ${nextCell.data.y})`).setVisible(false);
        break;
      }
      case 5: {
        let total = 1;
        let blob = [centerCell];
        centerCell.getSurroundingCells().asArray.filter(child => child !== null && !child.filled).forEach(cell => {
          if (total < squares) {
            cell.filled = true;
            rows[cell.data.y][cell.data.x].revealed = true;
            items.getChildren().find(i => i.name === `(${cell.data.x}, ${cell.data.y})`).setVisible(false);
            blob.push(cell);
            total++;
          }
        });

        if (total === squares) { //if we already finished, great! no need to continue
          return;
        } else {
          console.log('expanding...')
          if (centerCell.getSurroundingCells().asArray.filter(child => child !== null && !child.filled && child.countUnpaintedCells() > 0).length > 0) {
            const nextCenterCell = centerCell.getSurroundingCells().asArray.find(child => child !== null && !child.filled && child.countUnpaintedCells() > 0)
            nextCenterCell.getSurroundingCells().asArray.filter(child => child !== null && !child.filled).forEach(cell => {
              if (total < squares) {
                cell.filled = true;
                rows[cell.data.y][cell.data.x].revealed = true;
                items.getChildren().find(i => i.name === `(${cell.data.x}, ${cell.data.y})`).setVisible(false);
                blob.push(cell);
              }
            });
          } else {
            console.log('reset expansion because we have ' + (squares - total) + ' left')
            while (total < squares) {
              const remainder = this.fillSquares(50, rows, items, true);
              remainder.filled = true;
              rows[remainder.data.y][remainder.data.x].revealed = true;
              blob.push(remainder);
              total++;
            }
            // this.fillSquares(50 * (squares - total), rows, items, true);
          }
        }

        break;
      }
      case 10: {
        let total = 1;
        let blob = [centerCell];

        centerCell.getSurroundingCells().asArray.filter(child => child !== null && !child.filled).forEach(cell => {
          rows[cell.data.y][cell.data.x].revealed = true;
          items.getChildren().find(i => i.name === `(${cell.data.x}, ${cell.data.y})`).setVisible(false);
          blob.push(cell);
          total++;
        });

        const remaining = squares - total;
        const nextCell = centerCell.getRandomCell('all', cell => cell !== null && (cell.countUnpaintedCells() >= remaining || cell.countUnpaintedCells() > 0));
        if (nextCell) {
          nextCell.getSurroundingCells().asArray.filter(child => child !== null && !child.filled).forEach(cell => {
            if (total < squares) {
              rows[cell.data.y][cell.data.x].revealed = true;
              items.getChildren().find(i => i.name === `(${cell.data.x}, ${cell.data.y})`).setVisible(false);
              blob.push(cell);
              total++;
            }
          });
        }

        if (total === squares) {
          return;
        } else {
          // while (total < squares) {
            
            // console.log(expandables)
            // const squareFinder = (square, difference) => {
            //   const squareCell = new Cell(square.x, square.y, rows, square.revealed)
            //   if (squareCell.filled) return false;
            //   return squareCell.countUnpaintedCells() >= (difference || squares - total);
            // }

            // if (!sibling) {
            //   // while (total < squares) {
            //   //   if (this.findSquare(square => squareFinder(square, )))
            //   // }
            // }

            let siblingCell;
            let sibling;
            let criteria = 0;

            while (total < squares) {
              const expandables = this.sortSquares();
              while (!sibling) {
                sibling = expandables.find(cell => cell.countUnpaintedCells() === (squares - total - criteria));
                if (!sibling) {
                  criteria++;
                }
              }

              siblingCell = new Cell(sibling.x, sibling.y, rows, sibling.revealed)

              siblingCell.filled = true;
              rows[siblingCell.data.y][siblingCell.data.x].revealed = true;
              items.getChildren().find(i => i.name === `(${siblingCell.data.x}, ${siblingCell.data.y})`).setVisible(false);
              blob.push(siblingCell);
              total++;

              siblingCell.getSurroundingCells().asArray.filter(cell => cell !== null && !cell.filled).forEach(cell => {
                if (total < squares) {
                  rows[cell.data.y][cell.data.x].revealed = true;
                  items.getChildren().find(i => i.name === `(${cell.data.x}, ${cell.data.y})`).setVisible(false);
                  blob.push(cell);
                  total++;
                }
              });

              if (total < squares && !siblingCell.getSurroundingCells().asArray.find(cell => blob.includes(cell) && cell.countUnpaintedCells() >= (squares - total))) {
                sibling = null;
              }
              break;
            }
            // this adds our sibling center cell to the blob
            // blob.push(siblingCell);

            console.log(blob);


          //   if (!sibling) {
          //     const remainder = this.fillSquares(50, rows, items, true);
          //     remainder.filled = true;
          //     rows[remainder.data.y][remainder.data.x].revealed = true;
          //     blob.push(remainder);
          //     total++;              
          //     return;
          //   }
          //   const siblingCell = new Cell(sibling.x, sibling.y, rows, sibling.revealed)
          //   console.log()
          //   //  =  this.fillSquares(50 * (squares - total), rows, items, true) // this.fillSquares(50, rows, items, true);

          // }
        }
        break;
      }
      case 20: {
        // tier 1000
        console.log('tier 1000')
        break;
      }
      case 50: {
        // tier 2500
        console.log('tier 2500')
        break;
      }
      case 100: {
        // tier 5000
        console.log('tier 5000')
        break;
      }
    }
  }
}

// Set configuration for phaser game instance
const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  // Add physics, arcade, scene, and audio
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0,
      },
      debug: false,
    },
  },
  scene: [AnimationScene, GameScene],
  audio: {
    disableWebAudio: true,
  },
};

// Initialize game instance
new Phaser.Game(config);
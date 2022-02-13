const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
console.log(process.argv, 'process.argv');

const sizeMap = {};
const target = process.argv[2];
let timer = null;
sizeMap[target] = 0;
console.time(target);
async function getFolderSize(folderPath) {
  if (sizeMap[folderPath]) return sizeMap[folderPath];
  try {
    const files = await readdir(folderPath);
    const arr = await Promise.all(files.map(file => new Promise(async (resolve, reject) => {
      let temp = 0;
      const p = path.join(folderPath, file);
      try {
        const s = fs.statSync(p);
        if (s.isFile()) {
          temp += s.size;
          resolve(temp);
        }
        if (s.isDirectory()) {
          temp += await getFolderSize(p);
          resolve(temp);
        }
      } catch(e) {
        resolve(0);
      }
    })));

    const s = arr.reduce((acc, i) => (acc += i, acc), 0);

    sizeMap[folderPath] = s;
    return s;
  } catch(err) {
    // console.log('*'.repeat(100));
    // console.log(err, folderPath, 'getFolderSize err');
    // console.log('*'.repeat(100));
    sizeMap[folderPath] = 'not permitted';
    return 0;
  }
}


async function start() {
  const files = await readdir(target);
  const arr = await Promise.all(files.map(file => new Promise(async (resolve, reject) => {
    let temp = 0;
    const p = path.join(target, file);
    const s = fs.statSync(p);
    if (s.isFile()) {
      temp += s.size;
      resolve(temp);
    }
    if (s.isDirectory()) {
      temp += await getFolderSize(p);
      resolve(temp);
    }
  })));

  sizeMap[target] = arr.reduce((acc, i) => (acc += i, acc), 0);
  console.log('final send !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n');
  
  console.timeEnd(target);
  process.send({
    sizeMap: sizeMap,
    path: target,
    final: true,
  }, (err) => {
    clearTimeout(timer);
    if (err) {
      console.log(err, 'child process err');
    }
  });
}

start();


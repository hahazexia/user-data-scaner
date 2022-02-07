const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
console.log(process.argv, 'process.argv');

const sizeMap = {};
const target = process.argv[2];
let timer = null;
sizeMap[target] = 0;

async function getFolderSize(folderPath) {
  if (sizeMap[folderPath]) return sizeMap[folderPath];
  try {
    let s = 0;
    const files = await readdir(folderPath);
    for (const file of files) {
      const p = path.join(folderPath, file);
      const stat = fs.statSync(p);
      if (stat.isFile()) {
        s += stat.size;
        continue;
      }
      if (stat.isDirectory()) {
        s += await getFolderSize(p);
      }
    }
    sizeMap[folderPath] = s;
    return s;
  } catch(err) {
    // console.log('*'.repeat(100));
    // console.log(err, folderPath, 'getFolderSize err');
    // console.log('*'.repeat(100));
    return 0;
  }
}

function timerSend() {
  if (!timer) {
    console.log('timer is init');
    timer = setTimeout(() => {
      console.log('timer is invoke');
      process.send({
        sizeMap: {
          [target]: sizeMap[target]
        },
        path: target,
        final: false,
      });
      timer = null;
      timerSend();
    }, 1000);
  }
}
timerSend();

async function start() {
  const files = await readdir(target);
  for (const file of files) {
    const p = path.join(target, file);
    const s = fs.statSync(p);

    if (s.isFile()) {
      sizeMap[target] += s.size;
      continue;
    }
    if (s.isDirectory()) {
      sizeMap[target] += await getFolderSize(p);
    }
  }
  console.log('final send !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n');
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


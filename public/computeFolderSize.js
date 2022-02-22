const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
console.log(process.argv, 'process.argv');

const sizeMap = {};
// 需要遍历的目标文件夹
const target = process.argv[2];
let timer = null;
// 初始化目标文件夹大小为 0
sizeMap[target] = 0;
console.time(target);

// 递归下一级子文件夹，直到所有文件都被扫描
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
    // 将计算出的当前文件夹大小记录到 sizeMap 中
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

// 开始遍历目标文件夹
async function start() {
  const files = await readdir(target);
  const arr = await Promise.all(files.map(file => new Promise(async (resolve, reject) => {
    let temp = 0;
    const p = path.join(target, file);
    const s = fs.statSync(p);
    // 如果是文件，大小计入临时变量
    if (s.isFile()) {
      temp += s.size;
      resolve(temp);
    }
    // 如果是文件夹，调用 getFolderSize 去做递归遍历
    if (s.isDirectory()) {
      temp += await getFolderSize(p);
      resolve(temp);
    }
  })));

  // 将所有临时变量求和，计算出目标文件夹大小
  sizeMap[target] = arr.reduce((acc, i) => (acc += i, acc), 0);
  console.log('final send !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n');
  
  console.timeEnd(target);
  // 子进程返回最终结果给主进程，主进程里的子进程对象监听 message 事件就可以接收到数据
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


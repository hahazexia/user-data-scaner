import 'antd/dist/antd.less';
import './App.css';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { Button } from 'antd';
import MTree from './Tree';
// const { DirectoryTree } = Tree;

// let timer;

function App() {
  const [path, setPath] = useState('');
  const [data, setData] = useState([]);
  const [threshold, setThreshold] = useState(1048576);

  useEffect(() => {
    ipcRenderer.invoke('get-app-data-info').then(res => {
      console.log(res, 'res');
      setPath(res.path);

      const data = res.data.map((i, index) => {
        const size = i.gsize.toString().startsWith('0')
          ? i.msize.toString().startsWith('0')
            ? `${i.ksize.toFixed(2)} KB`
            : `${i.msize.toFixed(2)} MB`
          : `${i.gsize.toFixed(2)} GB`;
        return {
          path: i.path,
          title: `${i.name}`,
          key: `0-${index}`,
          isLeaf: i.isFile,
          size: size,
          overstep: i.size > threshold
        }
      });
      setData(data);
      // timer = setInterval(() => {
      //   ipcRenderer.send('folder-size', data.map(i => i.path));
      // }, 5000);
    });
  }, []);

  useEffect(() => {
    ipcRenderer.removeAllListeners('folder-size');
    ipcRenderer.on('folder-size', (event, arg) => {
      console.log(arg, 'folder-size arg');
      if (Object.keys(arg).some(i => arg[i])) {
        const res = data.map(i => {
          if (arg[i.path]) {
            const size = arg[i.path];
            const gsize = size / 1024 / 1024 / 1024;
            const msize = size / 1024 / 1024;
            const ksize = size / 1024;

            const result = gsize.toString().startsWith('0')
              ? msize.toString().startsWith('0')
                ? `${ksize.toFixed(2)} KB`
                : `${msize.toFixed(2)} MB`
              : `${gsize.toFixed(2)} GB`;
            i.size = result;
            i.overstep = size > threshold;
          }
          return i;
        });
        setData(res);
      }
    });
  }, [data]);

  // useEffect(() => {
  //   ipcRenderer.removeAllListeners('return-folder-size');
  //   ipcRenderer.on('return-folder-size', (event, arg) => {
  //     console.log(arg, 'arg');
  //     if (Object.keys(arg).some(i => arg[i])) {
  //       clearInterval(timer);
  //       const res = data.map(i => {
  //         if (arg[i.path]) {
  //           const size = arg[i.path];
  //           const gsize = size / 1024 / 1024 / 1024;
  //           const msize = size / 1024 / 1024;
  //           const ksize = size / 1024;

  //           const result = gsize.toString().startsWith('0')
  //             ? msize.toString().startsWith('0')
  //               ? `${ksize.toFixed(2)} KB`
  //               : `${msize.toFixed(2)} MB`
  //             : `${gsize.toFixed(2)} GB`;
  //           i.size = result;
  //           i.overstep = size > threshold;
  //         }
  //         return i;
  //       });
  //       setData(res);
  //     }
  //   });
  // }, [data]);

  return (
    <div className="App">
      <Button type="primary"
      onClick={() => ipcRenderer.send('open-explorer', path)}>
        打开当前目录: {path}
      </Button>
      <div className="data-box">
        {/* <DirectoryTree
          multiple
          defaultExpandAll
          treeData={data}
        /> */}
        <MTree treeData={data}/>
      </div>
    </div>
  );
}

export default App;

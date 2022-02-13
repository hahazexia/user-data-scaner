import 'antd/dist/antd.less';
import './App.css';
import { ipcRenderer } from 'electron';
import { useEffect, useState, useRef } from 'react';
import { Button } from 'antd';
import MTree from './Tree';
import classNames from 'classnames';

function App() {
  const [path, setPath] = useState('');
  const [data, setData] = useState([]);
  const [threshold, setThreshold] = useState(1048576);
  const [rightMenuData, setRightMenuData] = useState(null);
  const [rightMenuPos, setRightMenuPos] = useState({ left: 10, top: 10 });
  const [showRightMenu, setShowRightMenu] = useState(false);
  const listenerRef = useRef();
  const rightMenuRef = useRef();

  useEffect(() => {
    listenerRef.current = (e) => {
      if (rightMenuRef.current && !rightMenuRef.current.contains(e.target)) {
        setShowRightMenu(false);
      }
    };
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', listenerRef.current, false);
    return () => {
      window.removeEventListener('mousedown', listenerRef.current, false);
    }
  }, []);

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

        const key = `0-${index}`;
        const level = key.split('-').length - 1
        return {
          final: i.final,
          path: i.path,
          title: `${i.name}`,
          key: key,
          level: level,
          isLeaf: i.isFile,
          size: size,
          overstep: i.size > threshold
        }
      });
      setData(data);
    });
  }, []);

  useEffect(() => {
    ipcRenderer.removeAllListeners('folder-size');
    ipcRenderer.on('folder-size', (event, arg) => {
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
            if (arg.final) {
              i.final = true;
            }
          }
          return i;
        });
        setData(res);
      }
    });
  }, [data]);

  const folderOnClick = (arg) => {
    console.log(arg, 'arg');
    if (!arg.isLeaf) {
      if (arg.size === 'not permitted') return;
      if (arg.children) {
        const keyArr = arg.key.split('-');
        keyArr.shift();
        let findData = data;
        for (let i = 0; i < keyArr.length; i++) {
          findData = findData[keyArr[i]] || findData.children[keyArr[i]];
        }
        findData.showChildren = !findData.showChildren;
        const temp = [...data];
        setData(temp);
        return false;
      }
      ipcRenderer.invoke('get-folder-content', arg.path).then(res => {
        if (!res) return;
        console.log(res, 'get-folder-content res');

        const hanledData = res.map((i, index) => {
          let size;
          if (i.notPermitted) {
            size = 'not permitted';
          } else {
            size = i.gsize.toString().startsWith('0')
              ? i.msize.toString().startsWith('0')
                ? `${i.ksize.toFixed(2)} KB`
                : `${i.msize.toFixed(2)} MB`
              : `${i.gsize.toFixed(2)} GB`;
          }
          return {
            path: i.path,
            title: `${i.name}`,
            key: `${arg.key}-${index}`,
            level: `${arg.key}-${index}`.split('-').length - 1,
            isLeaf: i.isFile,
            size: size,
            overstep: i.size > threshold
          }
        });

        const keyArr = arg.key.split('-');
        keyArr.shift();
        let findData = data;
        for (let i = 0; i < keyArr.length; i++) {
          findData = findData[keyArr[i]] || findData.children[keyArr[i]];
        }
        findData.children = hanledData;
        findData.showChildren = true;
        const temp = [...data];
        setData(temp);
      });
    }
  };

  const rightMenu = (e, i) => {
    console.log(e, 'e')
    setRightMenuData(i);
    setRightMenuPos({
      left: e.pageX,
      top: e.pageY,
    });
    setShowRightMenu(true);
  };

  return (
    <div className="App">
      <Button type="primary"
      onClick={() => ipcRenderer.send('open-explorer', path)}>
        打开当前目录: {path}
      </Button>
      
      <div className="data-box">
        <MTree
        treeData={data}
        folderOnClick={folderOnClick}
        rightMenuClick={rightMenu}/>
      </div>

      <div className={classNames({
        'right-menu': true,
        'show': showRightMenu
      })}
      onClick={() => {
        setShowRightMenu(false);
        ipcRenderer.send('open-explorer', rightMenuData.path);
      }}
      style={{
        left: rightMenuPos.left + 'px',
        top: rightMenuPos.top + 'px',
      }}
      ref={rightMenuRef}
      >
        在资源管理器中打开
      </div>
    </div>
  );
}

export default App;

import 'antd/dist/antd.less';
import './App.css';
import { ipcRenderer } from 'electron';
import { useEffect, useState, useRef } from 'react';
import { Button } from 'antd';
import MTree from './Tree';
import classNames from 'classnames';
import { computeSizeStr } from './util';

function App() {
  const [path, setPath] = useState('');
  const [data, setData] = useState([]);
  const [threshold, setThreshold] = useState(1048576);
  const [rightMenuData, setRightMenuData] = useState(null);
  const [rightMenuPos, setRightMenuPos] = useState({ left: 10, top: 10 });
  const [showRightMenu, setShowRightMenu] = useState(false);
  const listenerRef = useRef();
  const rightMenuRef = useRef();

  // 缓存事件处理器函数
  useEffect(() => {
    listenerRef.current = (e) => {
      if (rightMenuRef.current && !rightMenuRef.current.contains(e.target)) {
        setShowRightMenu(false);
      }
    };
  }, []);

  // 监听 mousedown 事件，点击空白处关闭右键菜单
  useEffect(() => {
    window.addEventListener('mousedown', listenerRef.current, false);
    return () => {
      window.removeEventListener('mousedown', listenerRef.current, false);
    }
  }, []);

  // 刚进入页面立即进行 ipc 通信，启动主进程遍历 AppData 所有文件任务
  useEffect(() => {
    ipcRenderer.invoke('get-app-data-info').then(res => {
      console.log(res, 'res');
      setPath(res.path);

      const data = res.data.map((i, index) => {
        const size = computeSizeStr(i);

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

    // 子进程计算结束后将文件夹大小返回给页面显示出来
    ipcRenderer.on('folder-size', (event, arg) => {
      if (Object.keys(arg).some(i => arg[i])) {
        const res = data.map(i => {
          if (arg[i.path]) {
            const sizeObj = arg[i.path];

            const result = computeSizeStr(sizeObj);
            i.size = result;
            i.overstep = sizeObj.size > threshold;
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

  // 点击文件夹，如果已经遍历结束，就获取下一层目录的数据作为上一层的 children 显示成树状结构
  const folderOnClick = (arg) => {
    console.log(arg, 'arg');
    if (!arg.isLeaf) {
      // not permitted 意味着此目录是系统隐藏目录，无权限访问，不做显示直接返回
      if (arg.size === 'not permitted') return;
      // 如果是第二次点击，之前已经 ipc 通信获取过下一层数据了，直接显示
      if (arg.children) {
        arg.showChildren = !arg.showChildren;
        const temp = [...data];
        setData(temp);
        return false;
      }
      // 如果是第一次点击，还没有 children 属性，ipc 通信从主进程获取下一层目录数据
      ipcRenderer.invoke('get-folder-content', arg.path).then(res => {
        if (!res) return;
        console.log(res, 'get-folder-content res');

        const hanledData = res.map((i, index) => {
          let size;
          if (i.notPermitted) {
            size = 'not permitted';
          } else {
            size = computeSizeStr(i);
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

        arg.children = hanledData;
        arg.showChildren = true;
        const temp = [...data];
        setData(temp);
      });
    }
  };

  // 显示右键菜单
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
        open current directory: {path}
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
        // ipc 通信让主进程在资源管理器中打开对应文件夹
        ipcRenderer.send('open-explorer', rightMenuData.path);
      }}
      style={{
        left: rightMenuPos.left + 'px',
        top: rightMenuPos.top + 'px',
      }}
      ref={rightMenuRef}
      >
        reveal in explorer
      </div>
    </div>
  );
}

export default App;

import classNames from 'classnames';
import { VscFile, VscFolder, VscFolderOpened } from "react-icons/vsc";
import './Tree.css';

function Tree(props) {
  const data = props.treeData;
  if (!data) return <></>;
  const handledData = data.map(item => {
    return {
      ...item,
      level: item.key.split('-').length - 1
    }
  });

  return (
    <div className="tree-box">
      {
        handledData.map(i => {
          return (
            <div className={classNames({
              'tree-item': true,
              'tree-item-dir': !i.isLeaf,
              'tree-item-file': i.isLeaf,
              'overstep': i.overstep
            })}
              style={{ paddingLeft: (i.level - 1) * 20 + 'px' }}
              key={i.key}
              title={i.path}
            >
              {i.isLeaf
                ? <VscFile className="icon" />
                : <VscFolder className="icon" />}
              <span className="name">{i.title}</span>
              {
                !i.size.startsWith('0.00') && <span>size: {i.size}</span>
              }
            </div>
          )
        })
      }
    </div>
  );
}

export default Tree;
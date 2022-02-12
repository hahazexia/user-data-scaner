import classNames from 'classnames';
import { VscFile, VscFolder, VscFolderOpened } from "react-icons/vsc";
import './Tree.css';

function Tree(props) {
  const { folderOnClick, rightMenuClick, treeData: data } = props;
  if (!data) return <></>;

  const childrenDom = (data) => {
    return data.map(i => {
      return (
        <>
          <div className={classNames({
            'tree-item': true,
            'tree-item-dir': !i.isLeaf,
            'tree-item-file': i.isLeaf,
            'overstep': i.overstep,
            'not-permitted': i.size === 'not permitted',
          })}
            style={{ paddingLeft: (i.level - 1) * 20 + 'px' }}
            key={i.key}
            title={i.path}
            onClick={() => folderOnClick(i)}
            onContextMenu={(e) => rightMenuClick(e, i)}
          >
            {
              i.isLeaf
                ? <VscFile className="icon" />
                :  i.showChildren ? <VscFolderOpened className="icon" /> : <VscFolder className="icon" />
            }
            <span className="name">{i.title}</span>
            {
              !(i.size.startsWith('0.00') && i.size !== 'not permitted')
              && <span>size: {i.size}</span>
            }
          </div>
          {
            i.showChildren
              && i.children
              && i.children.length > 0
              && childrenDom(i.children)
          }
        </>
      )
    });
  };

  return (
    <div className="tree-box">
      {
        data.map(i => {
          return (
            <>
              <div className={classNames({
                'tree-item': true,
                'tree-item-dir': !i.isLeaf,
                'tree-item-file': i.isLeaf,
                'overstep': i.overstep,
                'not-permitted': i.size === 'not permitted',
              })}
                style={{ paddingLeft: (i.level - 1) * 20 + 'px' }}
                key={i.key}
                title={i.path}
                onClick={() => folderOnClick(i)}
                onContextMenu={(e) => rightMenuClick(e, i)}
              >
                {
                  i.isLeaf
                    ? <VscFile className="icon" />
                    : i.showChildren ? <VscFolderOpened className="icon" /> : <VscFolder className="icon" />
                }
                <span className="name">{i.title}</span>
                {
                  !(i.size.startsWith('0.00') && i.size !== 'not permitted')
                  && <span>size: {i.size}</span>
                }
              </div>
              {
                i.showChildren
                  && i.children
                  && i.children.length > 0
                  && (
                    <div className={classNames({
                      'children': true,
                      'show': i.showChildren
                    })}
                      >
                      {childrenDom(i.children)}
                    </div>
                  )
              }
            </>
          )
        })
      }
    </div>
  );
}

export default Tree;
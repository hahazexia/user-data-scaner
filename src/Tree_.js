import React, { Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

class Tree extends Component {
    constructor(props){
        super(props)
        this.treeItemCroup = this.treeItemCroup.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.state = {
            openList : false
        }
    }

    handleClick(e) {
        // 这是点击➡️ 时调用的方法
        // 如果当前这个➡️ 没有旋转，那就设置旋转，视觉效果
        e.target.style.transform = e.target.style.transform == "rotate(-90deg)" ? "rotate(0deg)" : "rotate(-90deg)"
        for(let item in e.target.parentNode.parentNode.childNodes){
            // 点击的时候设置当前层级的子元素素隐藏
            // 操作了DOM,我很难受
            if(item > 0){
                e.target.parentNode.parentNode.childNodes[item].style.display = e.target.parentNode.parentNode.childNodes[item].style.display === 'none' ? 'block' : 'none' 
            }
        }
    }
    
    itemTitle(item){
        // 这个是返回title，因为有时候是点击一个链接，所以设置了两种情况，如果node节点里面有component这个节点，那就设置成可以点击跳转
        if(item.component){ 
            return (<Link to={ item.component } >
                         <span onClick={this.handleClick.bind(this)}>{item.title}</span>
                    </Link>)
        }else{
            return (
                 <span onClick={this.handleClick.bind(this)}>{item.title}</span>
            )
        }
    }

    treeItemCroup(itemGroup) {
        let itemGroupItem = []
        // 每个元素的样式，根据当前等级来设置样式，level1的就缩紧20px,level2的缩紧40px，一次类推，在视觉上呈现树的形式
        let itemStyle = {
                paddingLeft: 20*parseInt(itemGroup.level.slice(5), 10)+'px'
            }
        // 如果当前节点还有子元素，就设置一个➡️ 箭头 ，可以点击展开。
        let iconChevron = classNames('fa',{'fa-chevron-down' : itemGroup.child})
        // 把所有节点放在一个数组里面
        itemGroupItem.push(
            <ul>
                {/* 第一个层级 */}
                <li className={itemGroup.level} key={itemGroup.key} style={itemStyle}>
                    <i aria-hidden="true" className={iconChevron} onClick={this.handleClick.bind(this)}></i>
                    {this.itemTitle(itemGroup)}
                </li>
                {/* 调用tree方法 */}
                {this.tree(itemGroup.child)}
            </ul>
        )
        return itemGroupItem
    }

    tree(child){
        let treeItem
        // 如果有子元素
        if(child){  
            // 子元素是数组的形式，把所有的子元素循环出来
            treeItem = child.map((item, key) => {
                // 同理，设置样式
                let itemStyle = {
                    paddingLeft: 20*parseInt(item.level.slice(5), 10)+'px'
                }
                // 同理，设置➡️ 
                let iconChevron = classNames('fa',{'fa-chevron-down' : item.child})
                return  (
                    <ul>
                        <li className={item.level} key={key} style={itemStyle}>
                           <i aria-hidden="true" className={iconChevron} onClick={this.handleClick.bind(this)}></i>
                            {this.itemTitle(item)}
                        </li>
                        {/* 如果当前子元素还有子元素，就递归使用tree方法，把当前子元素的子元素渲染出来 */}
                        {this.tree(item.child)}
                    </ul>
                )
            })
        }
        return treeItem
    }

    render() {
        return (
            <div className="tree">
                { this.treeItemCroup(this.props.treeList) }
            </div>
        );
    }
}

export default Tree;
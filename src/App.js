import React, { Component } from 'react';
import './App.css';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

function dragDirection(
  dragIndex,
  hoverIndex,
  initialClientOffset,
  clientOffset,
  sourceClientOffset,
) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}

class BodyRow extends React.Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      dragRow,
      clientOffset,
      sourceClientOffset,
      initialClientOffset,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: 'move' };
    let className = restProps.className;
    if (isOver && initialClientOffset) {
      const direction = dragDirection(
        dragRow.index,
        restProps.index,
        initialClientOffset,
        clientOffset,
        sourceClientOffset
      );
      if (direction === 'downward') {
        className += ' drop-over-downward';
      }
      if (direction === 'upward') {
        className += ' drop-over-upward';
      }
    }
    
    return connectDragSource(
      connectDropTarget(
        <div
          {...restProps}
          className={className}
          style={style}
        />
      )
    );
  }
}

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    // Don't replace items with themselves
    // console.log(dragIndex, hoverIndex)
    if (dragIndex === hoverIndex) {
      return;
    }
    
    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);
    
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(BodyRow)
);

class App extends Component {
  state = {
    data: [{
      index: 1,
      name: '爸爸'
    }, {
      index: 2,
      name: '妈妈',
    }, {
      index: 3,
      name: '家源'
    }, {
      index: 4,
      name: '佳乐'
    }, {
      index: 5,
      name: '全家'
    }]
  };
  moveRow = (dragIndex, hoverIndex) => {
    let copyData = JSON.parse(JSON.stringify(this.state.data));
    let record = null, hoverKey = null;
    this.state.data.forEach((item, key) => {
      if (item.index === dragIndex) {
        copyData.splice(key, 1);
        record = item
      }
      if (item.index === hoverIndex) {
        hoverKey = key
      }
    });
    copyData.splice(hoverKey, 0, record);
    this.setState({
        data: copyData
      });
  };
  render() {
    return (
      <div className="App">
        {
          this.state.data.map(item => (
              <DragableBodyRow
                className="dragList"
                moveRow={this.moveRow}
                index={item.index}
                key={item.index}>
                {item.name}
              </DragableBodyRow>
            ))
        }
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { List, Icon } from 'antd';
import { NavTab } from 'src/components/types';

export interface Props {
  tabs: NavTab[],
  onChange: (tabs: NavTab[]) => void
}

const ReorderNavTabs = (props: Props) => {
  const { onChange, tabs: initialTabs } = props

  const [ tabs, setTabs ] = useState(initialTabs)

  const reorder = (list: NavTab[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [ removed ] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  useEffect(() => {
    setTabs(initialTabs)
  }, [ initialTabs ])

  const onDragEnd = (result: any) => {
    const { destination, source } = result

    if (!destination) {
      return
    }

    if (destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newTabs = reorder(
      tabs,
      result.source.index,
      result.destination.index
    );

    setTabs(newTabs)

    onChange(newTabs)
  }

  return <>
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list" >
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={'RNTList'}>
            {
              tabs.map((tab: NavTab, index: number) => (
                <Draggable draggableId={tab.id.toString()} index={index} key={tab.id.toString()}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={'RNTListItem'}
                    >
                      <List.Item>
                        <Icon type="pause" className={'RNTIcon'} />
                        <List.Item.Meta title={tab.title} />
                      </List.Item>
                    </div>
                  )}
                </Draggable>
              ))
            }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  </>
}

export default ReorderNavTabs

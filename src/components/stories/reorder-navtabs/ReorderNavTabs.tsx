import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { List, Icon, Button } from 'antd';
import './ReorderNavTabs.css'

interface NavTab {
  id: number
  name: string
}

export interface Props {
  tabs: NavTab[]
}

const ReorderNavTabs = (props: Values) => {
  const initialTabs = props.tabs

  const [ tabs, setTabs ] = useState(initialTabs)
  const [ isNewOrder, setIsNewOrder ] = useState(false)


  const reorder = (list: NavTab[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [ removed ] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

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

    const diff: number[] = []

    newTabs.forEach((e, i) => {
      if (e.id !== initialTabs[i].id) diff.push(i)
    })

    if (diff.length === 0) {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }

  const handleSave = () => {
    console.warn('Save operation is not implemented yet')
    console.log('The current order of tabs:', tabs)
  }

  return (<>
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
                        <Icon type="pause" className={'RNTIcon'}/>
                        <List.Item.Meta title={tab.name} />
                          title={tab.name}
                        />
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

    <Button type="primary" disabled={!isNewOrder} onClick={handleSave} className={'RNTSaveButton'}>Save</Button>
  </>
  )
}

export default ReorderNavTabs

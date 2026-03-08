import { createContext, useContext } from 'react'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const DragAndDropContext = createContext<{ isDragging: boolean }>({
  isDragging: false,
})

export function DragAndDropProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const value = { isDragging: false }

  return (
    <DndProvider backend={HTML5Backend}>
      <DragAndDropContext.Provider value={value}>
        {children}
      </DragAndDropContext.Provider>
    </DndProvider>
  )
}

export function useDragAndDrop() {
  return useContext(DragAndDropContext)
}

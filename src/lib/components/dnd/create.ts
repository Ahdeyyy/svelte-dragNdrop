


export function createDraggableAndDropZone<T>(
    item: T,
    dropEffect: 'copy' | 'move' | 'link' | 'none' = 'move',
    DragStart: (item: T) => void,
    DragEnd: (item: T) => void,
    DragOver: (item: T) => void,
    DragEnter: (item: T) => void,
    DragLeave: (item: T) => void,
    Drop: (item: T) => void,

) {

    const dragEl = createDraggable(item, dropEffect, DragStart, DragEnd);
    const dropZone = createDropZone(item, dropEffect, DragOver, DragEnter, DragLeave, Drop);

    return {
        dragEl,
        dropZone
    }

}


function createDraggable<T>(
    data: T,
    dropEffect: 'copy' | 'move' | 'link' | 'none' = 'move',
    DragStart: (item: T) => void,
    DragEnd: (item: T) => void,
) {

    function onDragStart(event: DragEvent) {
        DragStart(data)
        // TODO: add ways to transfer other data types (like images)
        event.dataTransfer!.setData('text/plain', JSON.stringify(data))
        event.dataTransfer!.dropEffect = dropEffect
    }

    function onDragEnd(event: DragEvent) {
        DragEnd(data)
        event.dataTransfer!.clearData()
    }

    function dragEl(node: HTMLElement) {
        node.setAttribute('draggable', 'true')
        node.addEventListener('dragstart', onDragStart)
        node.addEventListener('dragend', onDragEnd)


        return {
            destroy() {
                node.removeEventListener('dragstart', onDragStart)
                node.removeEventListener('dragend', onDragEnd)
            },

            update() {
                console.log('update')
            }
        }
    }

    return dragEl;

}

function createDropZone<T>(
    item: T,
    dropEffect: 'copy' | 'move' | 'link' | 'none' = 'move',
    DragOver?: (item: T) => void,
    DragEnter?: (item: T) => void,
    DragLeave?: (item: T) => void,
    Drop?: (item: T) => void,
) {
    function onDragOver(event: DragEvent) {
        event.preventDefault()
        event.dataTransfer!.dropEffect = dropEffect
        DragOver && DragOver(item)
    }

    function onDrop(event: DragEvent) {
        event.preventDefault()
        const data = event.dataTransfer!.getData('text/plain')
        Drop && Drop(JSON.parse(data) as T)
    }

    function onDragEnter(event: DragEvent) {
        event.preventDefault()
        DragEnter && DragEnter(item)
    }

    function onDragLeave(event: DragEvent) {
        event.preventDefault()
        DragLeave && DragLeave(item)
    }




    function dropZone(node: HTMLElement) {

        node.addEventListener('dragover', onDragOver)
        node.addEventListener('drop', onDrop)
        node.addEventListener('dragenter', onDragEnter)
        node.addEventListener('dragleave', onDragLeave)


        return {
            destroy() {
                node.removeEventListener('dragover', onDragOver)
                node.removeEventListener('drop', onDrop)
            },
            update() {
                console.log('update')
            }
        }

    }

    return dropZone
}

function serializeTransferData<T>(data: T): string {

    switch (typeof data) {
        case 'string':
            return data
        case 'number':
            return data.toString()
        case 'object':
            return JSON.stringify(data)
        default:
            return ''
    }

}

function deserializeTransferData<T>(data: string): T {

    try {
        return JSON.parse(data) as T
    } catch (error) {
        return data as unknown as T
    }

}
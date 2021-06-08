import './Layout.css'
import Court from './baddy_crt.jpg'
import  {
    useEffect,
    useRef,
    useState
} from 'react'
import {
    Box,
    chakra,
    Button,
    Stack,
    Tooltip,
    Text,
    VStack,
    Center,
    SimpleGrid,
} from '@chakra-ui/react'
import {
    fabric
} from 'fabric'
import 'fabric-history'
import {
    BiCircle,
    BiEdit,
    BiPointer,
    BiRedo,
    BiTrash,
    BiUndo,
    BsSquare,
    BsTriangle,
    GrClear,
    IoEllipseOutline,
    RiSubtractLine
} from 'react-icons/all'

// Layout Function has Layout of Court as well as controls

export default function Layout() {
    // Create Reference to parent Box
    const boxDiv = useRef(null)

    // Get Dimensions of parent Box
    const [dims, setDims] = useState({
        boxW: 0.1,
        boxH: 0.1
    })

    //Init Canvas every time reload happens
    const initCanvas = () => {
        // console.log(dims)
        const canvas = new fabric.Canvas('canvas', {
            height: dims.boxH,
            width: dims.boxW,
        })
        fabric.Image.fromURL(Court, function (img) {
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                scaleX: canvas.width / img.width,
                scaleY: canvas.height / img.height,
            })
        })
        // console.log(canvas)
        return canvas
    }

    // Initialize Canvas
    const [canvas, setCanvas] = useState(null)

    // Create State Variable for Canvas Dimensions
    const [canvasMeta, setCanvasMeta] = useState({
        offsetX: 0,
        offsetY: 0,
        height: 0,
        width: 0
    })

    // Function for Loading Canvas (Call Init Canvas after setting new dimensions)
    const loadCanvas = () => {
        // console.log(boxDiv)
        setDims({
            boxW: boxDiv.current.clientWidth,
            boxH: boxDiv.current.clientHeight
        })
        let refCanvas = initCanvas()
        setCanvasMeta({
            offsetX: refCanvas._offset.left,
            offsetY: refCanvas._offset.top,
            height: refCanvas.height,
            width: refCanvas.width
        })
        console.log(canvasMeta)
        setCanvas(refCanvas)

    }

    // Check for change in Dimensions
    useEffect(() => {
        loadCanvas()
    }, [boxDiv.current])

    // Create a Mode Variable to Highlight which mode is active
    const [mode, setMode] = useState('Pointer')

    // Variables for Drawing Objects
    let isDown = false
    let startX = 0
    let startY = 0

    // Add Circle Object to canvas
    const addCircle = () => {
        canvas.isDrawingMode = false
        // canvas.__eventListeners = {}
        setMode('Circle')
        let circle;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false
            })
        })

        canvas.on('mouse:down', (event) => {
            isDown = true
            startX = canvas.getPointer(event.e).x
            startY = canvas.getPointer(event.e).y
            circle = new fabric.Circle({
                radius: 0,
                left: startX,
                top: startY,
                selectable: true,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 3
            })
            canvas.add(circle)

            circle.set({
                left: startX,
                top: startY
            })
        })

        canvas.on('mouse:move', (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x
                circle.set({
                    radius: Math.abs((startX - currPosX) / 2)
                })
                canvas.renderAll()
            }
        })
        canvas.on('mouse:up', () => {
            isDown = false
            canvas.off('mouse:down')
            canvas.off('mouse:move')
            canvas.off('mouse:up')
            canvas.getObjects().forEach((object) => {
                // console.log(object)
                object.set({
                    selectable: true
                })
            })
            setMode('none')
            return
        })
    }

    // Add Rectangle Object to Canvas
    const addRectangle = () => {
        canvas.isDrawingMode = false
        // canvas.__eventListeners = {}
        setMode('Rectangle/Square')
        var rectangle;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false
            })
        })

        canvas.on('mouse:down', (event) => {
            isDown = true
            startX = canvas.getPointer(event.e).x
            startY = canvas.getPointer(event.e).y
            rectangle = new fabric.Rect({
                hasControls: true,
                height: 1,
                width: 1,
                left: startX,
                top: startY,
                selectable: true,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 3,
            })
            canvas.add(rectangle)
        })

        canvas.on('mouse:move', (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x
                let currPosY = canvas.getPointer(event.e).y
                rectangle.set({
                    height: currPosY - startY,
                    width: currPosX - startX
                })
                canvas.renderAll()
            }
        })
        canvas.on('mouse:up', (event) => {
            isDown = false
            canvas.off('mouse:down')
            canvas.off('mouse:move')
            canvas.off('mouse:up')
            canvas.getObjects().forEach((object) => {
                // console.log(object)
                object.set({
                    selectable: true
                })
            })
            setMode('none')
            return
        })
    }

    // Add Ellipse Object to Canvas
    const addEllipse = () => {
        canvas.isDrawingMode = false
        // canvas.__eventListeners = {}
        setMode('Ellipse')
        var ellipse;;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false
            })
        })

        canvas.on('mouse:down', (event) => {
            isDown = true
            startX = canvas.getPointer(event.e).x
            startY = canvas.getPointer(event.e).y
            ellipse = new fabric.Ellipse({
                hasControls: true,
                left: startX,
                top: startY,
                originX: 'left',
                originY: 'top',
                rx: 0,
                ry: 0,
                angle: 0,
                selectable: true,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 3,
            })
            canvas.add(ellipse)
        })

        canvas.on('mouse:move', (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x
                let currPosY = canvas.getPointer(event.e).y
                ellipse.set({
                    rx: (currPosX - startX) / 2,
                    ry: (currPosY - startY) / 2
                })
                canvas.renderAll()
            }
        })
        canvas.on('mouse:up', (event) => {
            isDown = false
            canvas.off('mouse:down')
            canvas.off('mouse:move')
            canvas.off('mouse:up')
            canvas.getObjects().forEach((object) => {
                // console.log(object)
                object.set({
                    selectable: true
                })
            })
            setMode('none')
            return
        })
    }

    // Add Triangle Object to Canvas
    const addTriangle = () => {
        canvas.isDrawingMode = false
        // canvas.__eventListeners = {}
        setMode('Triangle')
        var triangle;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false
            })
        })

        canvas.on('mouse:down', (event) => {
            isDown = true
            startX = canvas.getPointer(event.e).x
            startY = canvas.getPointer(event.e).y
            triangle = new fabric.Triangle({
                hasControls: true,
                height: 0,
                width: 0,
                left: startX,
                top: startY,
                selectable: true,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 3,
            })
            canvas.add(triangle)
        })

        canvas.on('mouse:move', (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x
                let currPosY = canvas.getPointer(event.e).y
                triangle.set({
                    width: currPosX - startX,
                    height: currPosY - startY
                })
                canvas.renderAll()
            }
        })
        canvas.on('mouse:up', (event) => {
            isDown = false
            canvas.off('mouse:down')
            canvas.off('mouse:move')
            canvas.off('mouse:up')
            canvas.getObjects().forEach((object) => {
                object.set({
                    selectable: true
                })
            })
            setMode('none')
            return
        })
    }

    // Add Line Object to Canvas
    const addLine = () => {
        canvas.isDrawingMode = false
        // canvas.__eventListeners = {}
        setMode('Line')
        var line;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false
            })
        })

        canvas.on('mouse:down', (event) => {
            isDown = true
            startX = canvas.getPointer(event.e).x
            startY = canvas.getPointer(event.e).y
            line = new fabric.Line([startX, startY, startX, startY], {
                left: startX,
                top: startY,
                selectable: true,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 3,
            })
            canvas.add(line)
        })

        canvas.on('mouse:move', (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x
                let currPosY = canvas.getPointer(event.e).y
                line.set({
                    x2: currPosX,
                    y2: currPosY
                })
                canvas.renderAll()
            }
        })
        canvas.on('mouse:up', (event) => {
            isDown = false
            line.setCoords()
            canvas.off('mouse:down')
            canvas.off('mouse:move')
            canvas.off('mouse:up')
            canvas.getObjects().forEach((object) => {
                object.set({
                    selectable: true
                })
            })
            setMode('none')
            return
        })
    }

    // Add Free Drawing to Canvas
    const freeDraw = () => {
        setMode('Draw')
        canvas.isDrawingMode = true
    }

    // Add Pointer Mode to Canvas
    const pointerMode = () => {
        setMode('Pointer')
        canvas.isDrawingMode = false
    }

    // Add Undo to Canvas
    const undoHistory = () => {
        canvas.isDrawingMode = false
        canvas.undo()
    }

    // Add Redo to Canvas
    const redoHistory = () => {
        canvas.isDrawingMode = false
        canvas.redo()
    }

    // Add Delete to Canvas
    const deleteItem = () => {
        canvas.isDrawingMode = false
        let activeObject = canvas.getActiveObject()

        if (activeObject) {
            canvas.remove(activeObject)
        }
    }

    // Add ClearHistory to Canvas
    const clearCanvas = () => {
        canvas.isDrawingMode = false
        let objects = canvas.getObjects()
        for (var i = 0; i < objects.length; i++) {
            canvas.remove(objects[i])
        }
        canvas.renderAll()
    }

    // Drawing Controls Menu
    const controlsmenu = [
        {
            name: 'Draw',
            icon: <BiEdit />,
            func: freeDraw,
        },
        {
            name: 'Pointer',
            icon: <BiPointer />,
            func: pointerMode,
        },
        {
            name: 'Circle',
            icon: <BiCircle />,
            func: addCircle,
        },
        {
            name: 'Rectangle/Square',
            icon: <BsSquare />,
            func: addRectangle,
        },
        {
            name: 'Ellipse',
            icon: <IoEllipseOutline />,
            func: addEllipse,
        },
        {
            name: 'Triangle',
            icon: <BsTriangle />,
            func: addTriangle,
        },
        {
            name: 'Line',
            icon: <RiSubtractLine />,
            func: addLine,
        },
        {
            name: 'Undo',
            icon: <BiUndo />,
            func: undoHistory,
        },
        {
            name: 'Redo',
            icon: <BiRedo />,
            func: redoHistory,
        },
        {
            name: 'Delete',
            icon: <BiTrash />,
            func: deleteItem,
        },
        {
            name: 'Clear History',
            icon: <GrClear />,
            func: () => {
                if (window.confirm("Do you want clear canvas? It cannot be recovered.")) {
                    clearCanvas()
                }
            },
        }
    ]

    // Simulation Menu
    const simulationMenu = [
        {

        }
    ]

    return (
        <chakra.div my={5}>
            <Stack direction={["column", "row"]}>
                <Box display={['none', 'flex']} w={'19vw'} ml={'2vw'}>
                    Some Stuff here
                </Box>
                <Box display={['none', 'flex']} w={'8vw'}>
                    <VStack w={'8vw'}>
                        <Box >
                            <Center w='100%' >
                                <Text fontSize={'2xl'} mb={'2vh'}>
                                    Controls
                                </Text>
                            </Center>
                            <Stack direction={["row", "column"]}>
                                {
                                    controlsmenu.map((item) => {
                                        return (
                                            <Tooltip key={item.name} label={item.name}>
                                                <Button px={'1vw'} py={'3vh'} onClick={item.func} fontSize={'xl'} w={'100%'}
                                                    bg={mode === item.name ? 'blue.400' : 'white'}>
                                                    <SimpleGrid columns={1}>
                                                        <Box>
                                                            {item.icon}
                                                        </Box>
                                                    </SimpleGrid>
                                                </Button>
                                            </Tooltip>
                                        )
                                    })
                                }
                            </Stack>
                        </Box>
                    </VStack>
                </Box>
                <Box w={["100vw", "40vw", "40vw"]} minW={'35vw'} h={'95vh'} ref={boxDiv}>
                    <canvas id='canvas'></canvas>
                </Box>
                <Box display={['none', 'flex']} w={'8vw'}>
                    <VStack w={'8vw'}>
                        <Box >
                            <Center w='100%' >
                                <Text fontSize={'2xl'} mb={'2vh'}>
                                    Simulation
                                </Text>
                            </Center>
                            <Stack direction={["row", "column"]}>
                                {
                                    controlsmenu.map((item) => {
                                        return (
                                            <Tooltip key={item.name} label={item.name}>
                                                <Button px={'1vw'} py={'3vh'} onClick={item.func} fontSize={'xl'} w={'100%'}
                                                    bg={mode === item.name ? 'blue.400' : 'white'}>
                                                    <SimpleGrid columns={1}>
                                                        <Box>
                                                            {item.icon}
                                                        </Box>
                                                    </SimpleGrid>
                                                </Button>
                                            </Tooltip>
                                        )
                                    })
                                }
                            </Stack>
                        </Box>
                    </VStack>
                </Box>
                <Box display={['none', 'flex']} w={'19vw'} mr={'2vw'}>
                    Some Stuff here
                </Box>
            </Stack>
        </chakra.div>
    )
}
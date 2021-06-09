import './Layout.css'
import Court from './baddy_crt.jpg'
import {
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
    GiMagnifyingGlass,
    GiShuttlecock,
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

    // Simulation Related State Variables
    // Boolean value to show lines on click
    const [showRefLines, setShowRefLines] = useState(true)

    // Store references of lines that are drawn as reference lines
    const [refLineX, setRefLineX] = useState(null)
    const [refLineY, setRefLineY] = useState(null)

    // Array to store all shots played
    const [shotArray, setShotArray] = useState([])

    // Variable to tell in which half was last point placed
    let lastPointPlacedY;


    // Function for Loading Canvas (Call Init Canvas after setting new dimensions)
    const loadCanvas = () => {
        // console.log(boxDiv)
        setDims({
            boxW: boxDiv.current.clientWidth,
            boxH: boxDiv.current.clientHeight
        })
        setCanvas(initCanvas())

    }

    // Check for change in Dimensions
    useEffect(() => {
        loadCanvas()
        // eslint-disable-next-line
    }, [boxDiv.current])

    // Create a Mode Variable to Highlight which mode is active
    const [mode, setMode] = useState('Pointer')

    // Variables for Drawing Objects
    let isDown = false
    let startX = 0
    let startY = 0

    // Create a Function that clears all Mouse listeners
    const clearMouseListeners = () => {
        canvas.off('mouse:down')
        canvas.off('mouse:move')
        canvas.off('mouse:up')
    }

    // Add Circle Object to canvas
    const addCircle = () => {
        clearMouseListeners()
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
            clearMouseListeners()
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
        clearMouseListeners()
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
            clearMouseListeners()
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
        clearMouseListeners()
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
            clearMouseListeners()
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
        clearMouseListeners()
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
        canvas.on('mouse:up', () => {
            isDown = false
            clearMouseListeners()
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
        clearMouseListeners()
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
        canvas.on('mouse:up', () => {
            isDown = false
            line.setCoords()
            clearMouseListeners()
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
        clearMouseListeners()
        canvas.isDrawingMode = true
    }

    // Add Pointer Mode to Canvas
    const pointerMode = () => {
        // clearMouseListeners()
        setMode('Pointer')
        canvas.isDrawingMode = false
    }

    // Add Undo to Canvas
    const undoHistory = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
        canvas.undo()
    }

    // Add Redo to Canvas
    const redoHistory = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
        canvas.redo()
    }

    // Add Delete to Canvas
    const deleteItem = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
        let activeObject = canvas.getActiveObject()

        if (activeObject) {
            canvas.remove(activeObject)
        }
    }

    // Add ClearHistory to Canvas
    const clearCanvas = () => {
        clearMouseListeners()
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

    // Following Code is related to Simulation, all functions henceforth do either Animations
    // or are responsible for creating Rallies and movement of objects on the Canvas

    // Recognize Vertical Midpoint of Canvas using a Function
    const findMidOfCanvas = () => {
        setShowRefLines(!showRefLines)
        console.log(showRefLines)
        let midX = parseInt(dims.boxW / 2)
        let midY = parseInt(dims.boxH / 2)
        console.log(dims, midX, midY)

        // Create 2 lines that give estimate of reference points of court
        var horizontalLine = new fabric.Line([0, midY, dims.boxW, midY], {
            selectable: true,
            fill: 'transparent',
            stroke: 'blue',
            strokeWidth: 3,
        })
        var verticalLine = new fabric.Line([midX, 0, midX, dims.boxH], {
            selectable: true,
            fill: 'transparent',
            stroke: 'red',
            strokeWidth: 3,
        })
        if (showRefLines) {
            setMode('Check')
            setRefLineX(horizontalLine)
            setRefLineY(verticalLine)
            canvas.add(horizontalLine)
            canvas.add(verticalLine)
        }
        else {
            setMode('none')
            canvas.remove(refLineX)
            canvas.remove(refLineY)
        }
    }

    // Function that takes Y co-ordinate as input and returns in which half point lies
    // If Y is in Lower Half, return 2
    // If Y is in Upper Half, return 1
    const checkHalfVertical = (YValue) => {
        if (YValue > (dims.boxH/2)) {
            return 2
        } else {
            return 1
        }
    }

    // Function to create rally
    // 1st point can be anywhere on canvas
    // 2nd point onwards, point has to be on other side of current selected point
    const constructRally = () => {
        console.log(shotArray)
        clearMouseListeners()
        setMode('Rally')
        canvas.on('mouse:down', (event) => {
            let currentX = canvas.getPointer(event.e).x
            let currentY = canvas.getPointer(event.e).y
            
            // If array is empty, then do not check where Point has been placed
            if (shotArray.length === 0) {
                let circle = new fabric.Circle({
                    radius: 6,
                    left: currentX - 3,
                    top: currentY - 3,
                    fill: 'red',
                    selectable: false,
                    stroke: 'red',
                    strokeWidth: 1
                })
                canvas.add(circle)
                setShotArray({
                    shotArray: shotArray.push({
                        x: currentX,
                        y: currentY
                    })
                })
                // Set lastPointPlacedY value
                lastPointPlacedY = checkHalfVertical(currentY)
                console.log(shotArray)
                console.log(lastPointPlacedY)
            } 
            // Otherwise check in which half last Point was recorded
            else if (shotArray.length > 0) {
                let currPointLocY = checkHalfVertical(currentY)
                console.log(currPointLocY, lastPointPlacedY)
                if ((currPointLocY === lastPointPlacedY)) {
                    // Do nothing
                } else {
                    let circle = new fabric.Circle({
                        radius: 6,
                        left: currentX - 3,
                        top: currentY - 3,
                        fill: 'red',
                        selectable: false,
                        stroke: 'red',
                        strokeWidth: 1
                    })
                    setShotArray({
                        shotArray: shotArray.push({
                            x: currentX,
                            y: currentY
                        })
                    })
                    
                    let line = new fabric.Line([shotArray[shotArray.length - 1].x, shotArray[shotArray.length - 1].y, 
                        shotArray[shotArray.length - 2].x, shotArray[shotArray.length - 2].y],{
                            stroke: 'blue',
                            strokeWidth: 4,
                            selectable: false,
                        })
                    canvas.add(line)
                    canvas.add(circle)
                    // Set lastPointPlacedY value
                    lastPointPlacedY = checkHalfVertical(currentY)
                    console.log(lastPointPlacedY)
                    console.log(shotArray) 
                }
            }
        })
        
    }

    // Simulation Menu
    const simulationMenu = [
        {
            name: 'Check',
            icon: <GiMagnifyingGlass />,
            func: findMidOfCanvas,
        },
        {
            name: 'Rally',
            icon: <GiShuttlecock />,
            func: constructRally,
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
                                    simulationMenu.map((item) => {
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
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
    BiGridSmall,
    BiPointer,
    BiRedo,
    BiText,
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

    /** 
     * Following State Variables are required to Draw Canvas,
     * its height, width, etc.
    */

    // Create Reference to parent Box
    const boxDiv = useRef(null)

    // Get Dimensions of parent Box
    const [dims, setDims] = useState({
        boxW: 0.1,
        boxH: 0.1
    })

    // Initialize Canvas
    const [canvas, setCanvas] = useState(null)

    /**  
     * Simulation Related State Variables
    */

    // Boolean value to show lines on click
    const [showRefLines, setShowRefLines] = useState(true)

    // Store references of lines that are drawn as reference lines
    const [refLineX, setRefLineX] = useState(null)
    const [refLineY, setRefLineY] = useState(null)

    // Array to store all shots played
    const [shotArray, setShotArray] = useState([])

    // Store Gridlines and their values
    const [gridLines, setGridlines] = useState({
        show: true,
        numRows: 0,
        numColumns: 0,
    })

    const [gridLineRefs, setGridLineRefs] = useState([])

    // Variable to tell in which half was last point placed
    var [lastY, setLastY] = useState(0)

    /**
     * Common State Variables
     */

    // Create a Mode Variable to Highlight which mode is active
    const [mode, setMode] = useState('Pointer')

    /**
     * Variables for Drawing Objects
     */

    let isDown = false
    let startX = 0
    let startY = 0

    /**
     * Initialize Canvas every time reload happens
     * @updates {canvas}
     * @returns canvas with appropriate height and width
     */

    const initCanvas = () => {
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
        return canvas
    }

    /**
     * Get Parent Dimensions of Canvas
     * and call initCanvas()
     * @updates {canvas}
     * @wrapper for initCanvas()
     * @returns none
     */

    const loadCanvas = () => {
        setDims({
            boxW: boxDiv.current.clientWidth,
            boxH: boxDiv.current.clientHeight
        })
        setCanvas(initCanvas())
    }

    /**
     * @listens boxDiv
     * Reloads Canvas on Change in Dimensions
     * @returns none
     */

    useEffect(() => {
        loadCanvas()
        // eslint-disable-next-line
    }, [boxDiv.current])

    /**
     * Clears all Mouse Events for canvas
     * @updates {canvas}
     * @returns none
     */

    const clearMouseListeners = () => {
        canvas.off('mouse:down')
        canvas.off('mouse:move')
        canvas.off('mouse:up')
    }

    /**
     * Draws Circle on Canvas with moving animation
     * As per pointer on screen
     * Uses only X value as radius, main differentiating factor between
     * Circle and Ellipse
     * Creates 1 circle and changes mode
     * @returns none
     * @updates {canvas, mode}
     */

    const addCircle = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
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
                object.set({
                    selectable: true
                })
            })

            setMode('none')
            return
        })
    }

    /**
     * Draws Rectangle/Square on Canvas with moving animation
     * As per pointer on screen
     * Creates 1 rectangle and changes mode
     * @returns none
     * @updates {canvas, mode}
     */

    const addRectangle = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
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

    /**
     * Draws Ellipse on Canvas with moving animation
     * As per pointer on screen
     * Uses X and Y values for drawing Ellipse
     * Creates 1 Ellipse and changes mode
     * @returns none
     * @updates {canvas, mode}
     */
    

    const addEllipse = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
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
                object.set({
                    selectable: true
                })
            })

            setMode('none')
            return
        })
    }

    /**
     * Draws Triangle on Canvas with moving animation
     * As per pointer on screen
     * Uses X and Y values for drawing Triangle
     * Creates 1 Triangle and changes mode
     * @returns none
     * @updates {canvas, mode}
     */

    const addTriangle = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
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

    /**
     * Draws Line on Canvas with moving animation
     * As per pointer on screen
     * Uses X and Y values for drawing Line
     * Creates 1 Line and changes mode
     * @returns none
     * @updates {canvas, mode}
     */

    const addLine = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
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

    /**
     * Creates free Drawing Mode on Canvas
     * @returns none
     * @updates {canvas, mode}
     */

    const freeDraw = () => {
        setMode('Draw')
        clearMouseListeners()
        canvas.isDrawingMode = true
    }

    /**
     * Activates Pointer Mode on Canvas
     * This is Default mode
     * @updates {canvas, mode}
     */

    const pointerMode = () => {
        clearMouseListeners()
        setMode('Pointer')
        canvas.isDrawingMode = false
    }

    /**
     * Adds a text box to Canvas
     * Uses current X and Y values to place the text box
     * @returns none
     * @updates {canvas, mode}
     */

    // Add Text to canvas
    const addText = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
        // canvas.__eventListeners = {}
        setMode('Text')
        var text;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false
            })
        })

        canvas.on('mouse:down', (event) => {
            startX = canvas.getPointer(event.e).x
            startY = canvas.getPointer(event.e).y
            text = new fabric.IText('Tap and Type', {
                fontFamily: 'arial black',
                left: startX,
                top: startY,
                fontSize: 30,

            })

            canvas.add(text)
        })

        canvas.on('mouse:up', () => {
            canvas.getObjects().forEach((object) => {
                object.set({
                    selectable: true
                })
            })

            setMode('none')
            clearMouseListeners()
        })
    }

    /**
     * Undo operation on Canvas
     * Removes the last Object Modification which is added
     * @returns none
     * @updates {canvas}
     */

    const undoHistory = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
        canvas.undo()
    }

    /**
     * Undo operation on Canvas
     * Adds the last Object Modification which is removed
     * @returns none
     * @updates {canvas}
     */

    const redoHistory = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
        canvas.redo()
    }

    /**
     * Deletes Selected Item from Canvas
     * @returns none
     * @updates {canvas}
     */

    const deleteItem = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
        let activeObject = canvas.getActiveObject()

        if (activeObject) {
            canvas.remove(activeObject)
        }
    }

    /**
     * Removes all objects from Canvas
     * @returns none
     * @updates {canvas}
     */

    const clearCanvas = () => {
        clearMouseListeners()
        canvas.isDrawingMode = false
        let objects = canvas.getObjects()
        for (var i = 0; i < objects.length; i++) {
            canvas.remove(objects[i])
        }
        canvas.renderAll()
    }

    /**
     * Controls Menu
     * Calls all above functions as per options
     */

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
            name: 'Text',
            icon: <BiText />,
            func: addText,
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

    /**
     * Following Code is related to Simulation, all functions henceforth do either Animations 
     * or are responsible for creating Rallies and movement of objects on the Canvas
     */

    /**
     * Given Dimensions of Canvas (Or Precisely of Badminton Court)
     * Find MidpointX and MidPointY
     * @returns none
     * @updates {canvas, mode, refLineX, refLineY, dims}
     */

    const findMidOfCanvas = () => {
        setShowRefLines(!showRefLines)
        console.log(showRefLines)
        let midX = parseInt(dims.boxW / 2)
        let midY = parseInt(dims.boxH / 2)
        console.log(dims, midX, midY)

        // Create 2 lines that give estimate of reference points of court
        var horizontalLine = new fabric.Line([0, midY, dims.boxW, midY], {
            selectable: false,
            fill: 'transparent',
            stroke: 'red',
            strokeWidth: 5,
        })
        var verticalLine = new fabric.Line([midX, 0, midX, dims.boxH], {
            selectable: false,
            fill: 'transparent',
            stroke: 'red',
            strokeWidth: 5,
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

    /**
     * Checks Value given and returns in which half
     * the value resides vertically
     * @param {number} YValue <Height of Canvas> 
     * @returns {2} if YValue is in lower half
     * @returns {1} if YValue is in upper half
     * @updates none
     */

    const checkHalfVertical = (YValue) => {
        if (YValue > (dims.boxH / 2)) {
            return 2
        } else {
            return 1
        }
    }

    /**
     * Creates Rally where user can select any point on court
     * after which he has to select a point on Vertically opposite side 
     * of current point if Canvas was divided into 2 vertical zones
     * @updates {shotArray, lastY}
     * @returns none
     * 
     * Problem : (Resolved) => Solution was to change how values were pushed in State Variable
     * Rally Construction works fine when we constantly keep on updating and moving the rally
     * Problem arises when any other component is used with this component, ie. adding some Normal
     * Components like Circle, Square, Triangle, etc.
     * 
     * When those components are used and again this method is called, only the length of the object 
     * is recovered from previous state, this means that even if a new rally is created, only the new points are
     * recorded in the rally. It prevents user from having full data. It does not work with State Variable, nor a 
     * simple array, this needs to be resolved with high priority
     */

    const constructRally = () => {
        clearMouseListeners()
        setMode('Rally')
        canvas.on('mouse:down', (event) => {
            let currentX = canvas.getPointer(event.e).x
            let currentY = canvas.getPointer(event.e).y

            // If array is empty, then do not check where Point has been placed
            if (shotArray.length === 0) {
                
                shotArray.push({
                    x: currentX,
                    y: currentY
                })
                setShotArray([...shotArray])

                let circle = new fabric.Circle({
                    radius: 6,
                    left: currentX - 3,
                    top: currentY - 3,
                    fill: 'black',
                    selectable: false,
                    stroke: 'black',
                    strokeWidth: 1
                })
                
                let text = new fabric.IText(shotArray.length + '', {
                    fontFamily: 'arial black',
                    left: currentX + 12,
                    top: currentY,
                    fontSize: 20,
                    editable: false,
                    selectable: false
                })

                canvas.add(text)
                canvas.add(circle)

                // Set lastY value
                lastY = checkHalfVertical(currentY)
                setLastY(lastY)
                console.log("Last", lastY, " Last Func : ", checkHalfVertical(currentY))
            }
            // Otherwise check in which half last Point was recorded
            else if (shotArray.length > 0) {
                let currPointLocY = checkHalfVertical(currentY)
                console.log("current ", currPointLocY)
                console.log("Compare ", currPointLocY, lastY)

                if ((currPointLocY === lastY)) {
                    // Do nothing, as selected point
                    // is not on opposite vertical half
                    // Invalid Point Selected
                } else {

                    shotArray.push({
                        x: currentX,
                        y: currentY
                    })
                    setShotArray([...shotArray])
                    
                    let circle = new fabric.Circle({
                        radius: 6,
                        left: currentX - 3,
                        top: currentY - 3,
                        fill: 'black',
                        selectable: false,
                        stroke: 'black',
                        strokeWidth: 1
                    })

                    let text = new fabric.IText(shotArray.length + '', {
                        fontFamily: 'arial black',
                        left: currentX + 12,
                        top: currentY,
                        fontSize: 20,
                        editable: false,
                        selectable: false
                    })

                    let line = new fabric.Line([shotArray[shotArray.length - 1].x, shotArray[shotArray.length - 1].y,
                    shotArray[shotArray.length - 2].x, shotArray[shotArray.length - 2].y], {
                        stroke: 'red',
                        strokeWidth: 2,
                        selectable: false,
                    })

                    canvas.add(text)
                    canvas.add(line)
                    canvas.add(circle)

                    // Set lastY value
                    lastY = checkHalfVertical(currentY)
                    setLastY(lastY)
                }
            }
        })

    }

    /**
     * 
     * @param {number} numRows <Number of Rows to Divided into>
     * @param {number} numColumns <Number of Columns to Divided into>
     * @returns none
     * @updates {gridLines.numColumns, gridLines.numRows, gridLineRefs}
     * @todo Last 2 lines not yet visible => Done
     */

    const initGridLines = (numRows, numColumns) => {
        setGridlines({
            numColumns: numColumns,
            numRows: numRows,
        })

        let incrementValueX = (dims.boxW - 6) / numRows
        let incrementValueY = (dims.boxH - 6) / numColumns

        // Get Dimensions for each Grid Box

        // for (let i = 3; i <= dims.boxW; i = i + incrementValueX) {
        //     for (let j = 3; j <= dims.boxH; j = j + incrementValueY) {
        //         console.log(i, j, dims.boxW, dims.boxH)
        //     }
        // }

        for (let i = 3; i <= dims.boxW; i = i + incrementValueX) {
            let line = new fabric.Line([i, 0, i, dims.boxH], {
                selectable: false,
                stroke: '#ffaa99',
                strokeWidth: 3,
                strokeDashArray: [15, 15]
            })
            console.log(i)
            gridLineRefs.push(line)
            setGridLineRefs([...gridLineRefs])
        }

        for (let j = 3; j <= dims.boxH; j = j + incrementValueY) {
            let line = new fabric.Line([0, j, dims.boxW, j], {
                selectable: false,
                stroke: '#ffaa99',
                strokeWidth: 3,
                strokeDashArray: [15, 15]
            })
            gridLineRefs.push(line)
            setGridLineRefs([...gridLineRefs])
        }
    }

    /**
     * @param {number} numRows <Number of Rows to Divided into>
     * @param {number} numColumns <Number of Columns to Divided into>
     * @returns none
     * @updates {gridLines.show, canvas}
     */

    // Show Gridlines (Given N*M grid size)
    const showGrids = (numRows, numColumns) => {
        setMode('Grids')
        if (gridLines.numColumns === 0 && gridLines.numRows === 0) {
            initGridLines(4, 4) // Should be taken during execution
        }

        setGridlines({
            show: !gridLines.show
        })

        if (gridLines.show) {
            for (let i = 0; i < gridLineRefs.length; i++) {
                // console.log(gridLineRefs[i])
                canvas.add(gridLineRefs[i])
            }
        }
        else {
            setMode('none')
            for (let i = 0; i < gridLineRefs.length; i++) {
                canvas.remove(gridLineRefs[i])
            }
        }
    }

    /**
     * Simulation Menu consists of Controls for 
     * Simulation of rallies
     */

    const simulationMenu = [
        {
            name: 'Check',
            icon: <GiMagnifyingGlass />,
            func: findMidOfCanvas,
        },
        {
            name: 'Grids',
            icon: <BiGridSmall />,
            func: showGrids,
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
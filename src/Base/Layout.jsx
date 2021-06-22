import "./Layout.css";
import Court from "./baddy_crt.jpg";
import { useEffect, useRef, useState } from "react";
import {
    Box,
    chakra,
    Button,
    Stack,
    Tooltip,
    Text,
    Flex,
    Center,
    SimpleGrid,
    useColorMode,
    useColorModeValue,
    Table,
    Thead,
    Tbody,
    Tr,
    Td,
    useDisclosure,
    OrderedList,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Input,
    ModalFooter,
    ListItem,
} from "@chakra-ui/react";
import { fabric } from "fabric";
import "fabric-history";
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
    RiSubtractLine,
    RiFootprintFill,
    BsPlay,
    BsPlusCircle,
} from "react-icons/all";

// Layout Function has Layout of Court as well as controls

export default function Layout() {
    // Color Mode State Variable
    const { colorMode, toggleColorMode } = useColorMode();

    /**
     * Following State Variables are required to Draw Canvas,
     * its height, width, etc.
     */

    // Create Reference to parent Box
    const boxDiv = useRef(null);

    // Get Dimensions of parent Box
    const [dims, setDims] = useState({
        boxW: 0.1,
        boxH: 0.1,
    });

    // Initialize Canvas
    const [canvas, setCanvas] = useState(null);

    // Variable to store current selected object
    const [currentObject, setCurrentObject] = useState(null);

    /**
     * Simulation Related State Variables
     */

    // Boolean value to show lines on click
    const [showRefLines, setShowRefLines] = useState(true);

    // Store references of lines that are drawn as reference lines
    const [refLineX, setRefLineX] = useState(null);
    const [refLineY, setRefLineY] = useState(null);

    // Array to store all shots played
    const [arrayOfRallies, setArrayOfRallies] = useState({
        currentActiveIndex: 0,
        rallies: [],
    });

    // disclosure variables for controlling the change name modal
    const { isOpen, onOpen, onClose } = useDisclosure();

    // reference variable to get the rally name or footwork name
    const rallyOrFootworkName = useRef(null);

    // Store Gridlines and their values
    const [gridLines, setGridlines] = useState({
        show: true,
        numRows: 1,
        numColumns: 1,
    });

    // Store Gridline references
    const [gridLineRefs, setGridLineRefs] = useState([]);

    // Array to store all footwork patterns
    const [arrayOfFootwork, setArrayOfFootwork] = useState({
        numFootworks: 0,
        currentActiveIndex: -1,
        footworks: [
            {
                name: "",
                lastY: 0,
                movements: [],
            },
        ],
    });

    // variables for updating the numFootworks and currentActiveIndex of footwork
    const [currentActiveIndexFootwork, setCurrentActiveIndexFootwork] =
        useState(0);
    const [numFootworks, setNumFootworks] = useState(0);

    const [listOfFootworks, setListOfFootworks] = useState([]);

    // Variable to store animation object
    const [animationObject, setAnimationObject] = useState(null);

    // Variable for Different Colors for Rally and Footwork
    const rallyColors = ['#a83232', '#e3e017', '#ffffff', '#d400e3', '#7de5ff']
    const footworkColors = ['#424a42', '#abb068', '#20687a', '#20687a', '#850052']

    /**
     * Common State Variables
     */

    // Create a Mode Variable to Highlight which mode is active
    const [mode, setMode] = useState("Pointer");

    /**
     * Variables for Drawing Objects
     */

    let isDown = false;
    let startX = 0;
    let startY = 0;

    /**
     * Initialize Canvas every time reload happens
     * @updates {canvas}
     * @returns canvas with appropriate height and width
     */

    const initCanvas = () => {
        const canvas = new fabric.Canvas("canvas", {
            height: dims.boxH,
            width: dims.boxW,
        });
        fabric.Image.fromURL(Court, function (img) {
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                scaleX: canvas.width / img.width,
                scaleY: canvas.height / img.height,
            });
        });
        return canvas;
    };

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
            boxH: boxDiv.current.clientHeight,
        });
        setCanvas(initCanvas());
    };

    /**
     * @listens boxDiv
     * Reloads Canvas on Change in Dimensions
     * @returns none
     */

    useEffect(() => {
        loadCanvas();
        // eslint-disable-next-line
    }, [boxDiv.current]);

    /**
     * Listends to arrayOfRallies
     * Update state before doing any other task
     * @updates None
     * @returns None
     */

    useEffect(() => {
        console.log(arrayOfRallies.currentActiveIndex)
    }, [arrayOfRallies])

    /**
     * Add Object Select Listener
     * Add Object De-select Listener
     * Following 2 functions do the above task
     * First function is responsible for setting and unsetting of object variable
     * Second function is required to check initialization of Canvas (exception handling)
     * and setting listerners accordingly
     * @updates {canvas}
     * @returns none
     */

    const updateSelectedObject = () => {
        setCurrentObject(canvas.getActiveObject());
    };

    // Check if Canvas is Initialized, if yes, add Object Listeners to it
    (() => {
        if (canvas === null) {
            setTimeout(1000, this);
        } else {
            canvas.on("selection:created", updateSelectedObject);
            canvas.on("selection:updated", updateSelectedObject);
            canvas.on("selection:cleared", updateSelectedObject);
            canvas.on("object:modified", updateSelectedObject);
            return;
        }
    })();

    /**
     * Clears all Mouse Events for canvas
     * @updates {canvas}
     * @returns none
     */

    const clearMouseListeners = () => {
        canvas.off("mouse:down"); // Event Name
        canvas.off("mouse:move");
        canvas.off("mouse:up");
    };

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
        clearMouseListeners();
        canvas.isDrawingMode = false;
        setMode("Circle");
        let circle;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false,
            });
        });

        canvas.on("mouse:down", (event) => {
            isDown = true;
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            circle = new fabric.Circle({
                radius: 0,
                left: startX,
                top: startY,
                selectable: true,
                fill: "transparent",
                stroke: "black",
                strokeWidth: 3,
            });
            canvas.add(circle);

            circle.set({
                left: startX,
                top: startY,
            });
        });

        canvas.on("mouse:move", (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x;
                circle.set({
                    radius: Math.abs((startX - currPosX) / 2),
                });
                canvas.renderAll();
            }
        });

        canvas.on("mouse:up", () => {
            isDown = false;
            clearMouseListeners();
            canvas.getObjects().forEach((object) => {
                object.set({
                    selectable: true,
                });
            });

            setMode("none");
            return;
        });
    };

    /**
     * Draws Rectangle/Square on Canvas with moving animation
     * As per pointer on screen
     * Creates 1 rectangle and changes mode
     * @returns none
     * @updates {canvas, mode}
     */

    const addRectangle = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        setMode("Rectangle/Square");
        var rectangle;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false,
            });
        });

        canvas.on("mouse:down", (event) => {
            isDown = true;
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            rectangle = new fabric.Rect({
                hasControls: true,
                height: 1,
                width: 1,
                left: startX,
                top: startY,
                selectable: true,
                fill: "transparent",
                stroke: "black",
                strokeWidth: 3,
            });
            canvas.add(rectangle);
        });

        canvas.on("mouse:move", (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x;
                let currPosY = canvas.getPointer(event.e).y;
                rectangle.set({
                    height: currPosY - startY,
                    width: currPosX - startX,
                });
                canvas.renderAll();
            }
        });

        canvas.on("mouse:up", (event) => {
            isDown = false;
            clearMouseListeners();
            canvas.getObjects().forEach((object) => {
                // console.log(object)
                object.set({
                    selectable: true,
                });
            });

            setMode("none");
            return;
        });
    };

    /**
     * Draws Ellipse on Canvas with moving animation
     * As per pointer on screen
     * Uses X and Y values for drawing Ellipse
     * Creates 1 Ellipse and changes mode
     * @returns none
     * @updates {canvas, mode}
     */

    const addEllipse = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        setMode("Ellipse");
        var ellipse;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false,
            });
        });

        canvas.on("mouse:down", (event) => {
            isDown = true;
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            ellipse = new fabric.Ellipse({
                hasControls: true,
                left: startX,
                top: startY,
                originX: "left",
                originY: "top",
                rx: 0,
                ry: 0,
                angle: 0,
                selectable: true,
                fill: "transparent",
                stroke: "black",
                strokeWidth: 3,
            });
            canvas.add(ellipse);
        });

        canvas.on("mouse:move", (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x;
                let currPosY = canvas.getPointer(event.e).y;
                ellipse.set({
                    rx: (currPosX - startX) / 2,
                    ry: (currPosY - startY) / 2,
                });
                canvas.renderAll();
            }
        });

        canvas.on("mouse:up", (event) => {
            isDown = false;
            clearMouseListeners();
            canvas.getObjects().forEach((object) => {
                object.set({
                    selectable: true,
                });
            });

            setMode("none");
            return;
        });
    };

    /**
     * Draws Triangle on Canvas with moving animation
     * As per pointer on screen
     * Uses X and Y values for drawing Triangle
     * Creates 1 Triangle and changes mode
     * @returns none
     * @updates {canvas, mode}
     */

    const addTriangle = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        setMode("Triangle");
        var triangle;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false,
            });
        });

        canvas.on("mouse:down", (event) => {
            isDown = true;
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            triangle = new fabric.Triangle({
                hasControls: true,
                height: 0,
                width: 0,
                left: startX,
                top: startY,
                selectable: true,
                fill: "transparent",
                stroke: "black",
                strokeWidth: 3,
            });
            canvas.add(triangle);
        });

        canvas.on("mouse:move", (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x;
                let currPosY = canvas.getPointer(event.e).y;
                triangle.set({
                    width: currPosX - startX,
                    height: currPosY - startY,
                });
                canvas.renderAll();
            }
        });

        canvas.on("mouse:up", () => {
            isDown = false;
            clearMouseListeners();
            canvas.getObjects().forEach((object) => {
                object.set({
                    selectable: true,
                });
            });

            setMode("none");
            return;
        });
    };

    /**
     * Draws Line on Canvas with moving animation
     * As per pointer on screen
     * Uses X and Y values for drawing Line
     * Creates 1 Line and changes mode
     * @returns none
     * @updates {canvas, mode}
     */

    const addLine = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        setMode("Line");
        var line;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false,
            });
        });

        canvas.on("mouse:down", (event) => {
            isDown = true;
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            line = new fabric.Line([startX, startY, startX, startY], {
                left: startX,
                top: startY,
                selectable: true,
                fill: "transparent",
                stroke: "black",
                strokeWidth: 3,
            });
            canvas.add(line);
        });

        canvas.on("mouse:move", (event) => {
            if (isDown) {
                let currPosX = canvas.getPointer(event.e).x;
                let currPosY = canvas.getPointer(event.e).y;
                line.set({
                    x2: currPosX,
                    y2: currPosY,
                });
                canvas.renderAll();
            }
        });

        canvas.on("mouse:up", () => {
            isDown = false;
            line.setCoords();
            clearMouseListeners();
            canvas.getObjects().forEach((object) => {
                object.set({
                    selectable: true,
                });
            });

            setMode("none");
            return;
        });
    };

    /**
     * Creates free Drawing Mode on Canvas
     * @returns none
     * @updates {canvas, mode}
     */

    const freeDraw = () => {
        setMode("Draw");
        clearMouseListeners();
        canvas.isDrawingMode = true;
    };

    /**
     * Activates Pointer Mode on Canvas
     * This is Default mode
     * @updates {canvas, mode}
     */

    const pointerMode = () => {
        clearMouseListeners();
        setMode("Pointer");
        canvas.isDrawingMode = false;
    };

    /**
     * Adds a text box to Canvas
     * Uses current X and Y values to place the text box
     * @returns none
     * @updates {canvas, mode}
     */

    // Add Text to canvas
    const addText = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        // canvas.__eventListeners = {}
        setMode("Text");
        var text;

        canvas.getObjects().forEach((object) => {
            object.set({
                selectable: false,
            });
        });

        canvas.on("mouse:down", (event) => {
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            text = new fabric.IText("Tap and Type", {
                fontFamily: "arial black",
                left: startX,
                top: startY,
                fontSize: 30,
            });

            canvas.add(text);
        });

        canvas.on("mouse:up", () => {
            canvas.getObjects().forEach((object) => {
                object.set({
                    selectable: true,
                });
            });

            setMode("none");
            clearMouseListeners();
        });
    };

    /**
     * Undo operation on Canvas
     * Removes the last Object Modification which is added
     * @returns none
     * @updates {canvas}
     */

    const undoHistory = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        canvas.undo();
    };

    /**
     * Undo operation on Canvas
     * Adds the last Object Modification which is removed
     * @returns none
     * @updates {canvas}
     */

    const redoHistory = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        canvas.redo();
    };

    /**
     * Deletes Selected Item from Canvas
     * @returns none
     * @updates {canvas}
     */

    const deleteItem = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        let activeObject = canvas.getActiveObject();

        if (activeObject) {
            canvas.remove(activeObject);
        }
    };

    /**
     * Removes all objects from Canvas
     * @returns none
     * @updates {canvas}
     */

    const clearCanvas = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        let objects = canvas.getObjects();
        for (var i = 0; i < objects.length; i++) {
            canvas.remove(objects[i]);
        }
        canvas.renderAll();
    };

    /**
     * Controls Menu
     * Calls all above functions as per options
     */

    const objectsMenu = [
        {
            name: "Draw",
            icon: <BiEdit />,
            func: freeDraw,
        },
        {
            name: "Pointer",
            icon: <BiPointer />,
            func: pointerMode,
        },
        {
            name: "Circle",
            icon: <BiCircle />,
            func: addCircle,
        },
        {
            name: "Rectangle/Square",
            icon: <BsSquare />,
            func: addRectangle,
        },
        {
            name: "Ellipse",
            icon: <IoEllipseOutline />,
            func: addEllipse,
        },
        {
            name: "Triangle",
            icon: <BsTriangle />,
            func: addTriangle,
        },
        {
            name: "Line",
            icon: <RiSubtractLine />,
            func: addLine,
        },
        {
            name: "Text",
            icon: <BiText />,
            func: addText,
        },
    ];

    /**
     * Control Objects using a simple set of Controls
     */

    const canvasControlMenu = [
        {
            name: "Undo",
            icon: <BiUndo />,
            func: undoHistory,
        },
        {
            name: "Redo",
            icon: <BiRedo />,
            func: redoHistory,
        },
        {
            name: "Delete",
            icon: <BiTrash />,
            func: deleteItem,
        },
        {
            name: "Clear History",
            icon: <GrClear />,
            func: () => {
                if (
                    window.confirm("Do you want clear canvas? It cannot be recovered.")
                ) {
                    clearCanvas();
                }
            },
        },
    ];

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
        setShowRefLines(!showRefLines);
        // console.log(showRefLines)
        let midX = parseInt(dims.boxW / 2);
        let midY = parseInt(dims.boxH / 2);
        // console.log(dims, midX, midY)

        // Create 2 lines that give estimate of reference points of court
        var verticalLine = new fabric.Line([0, midY, dims.boxW, midY], {
            selectable: false,
            fill: "transparent",
            stroke: "red",
            strokeWidth: 5,
        });
        var horizontalLine = new fabric.Line([midX, 0, midX, dims.boxH], {
            selectable: false,
            fill: "transparent",
            stroke: "red",
            strokeWidth: 5,
        });
        if (showRefLines) {
            setMode("Check");
            setRefLineX(horizontalLine);
            setRefLineY(verticalLine);
            canvas.add(horizontalLine);
            canvas.add(verticalLine);
        } else {
            setMode("none");
            canvas.remove(refLineX);
            canvas.remove(refLineY);
        }
    };

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
            numColumns: numColumns, // 4
            numRows: numRows, // 4
        });

        let incrementValueX = (dims.boxW - 6) / numRows;
        let incrementValueY = (dims.boxH - 6) / numColumns;

        // Get Dimensions for each Grid Box

        // for (let i = 3; i <= dims.boxW; i = i + incrementValueX) {
        //     for (let j = 3; j <= dims.boxH; j = j + incrementValueY) {
        //         console.log(i, j, dims.boxW, dims.boxH)
        //     }
        // }

        for (let i = 3; i <= dims.boxW; i = i + incrementValueX) {
            let line = new fabric.Line([i, 0, i, dims.boxH], {
                selectable: false,
                stroke: "#ffaa99",
                strokeWidth: 3,
                strokeDashArray: [15, 15],
            });
            console.log(i);
            gridLineRefs.push(line);
            setGridLineRefs([...gridLineRefs]);
        }

        for (let j = 3; j <= dims.boxH; j = j + incrementValueY) {
            let line = new fabric.Line([0, j, dims.boxW, j], {
                selectable: false,
                stroke: "#ffaa99",
                strokeWidth: 3,
                strokeDashArray: [15, 15],
            });
            gridLineRefs.push(line);
            setGridLineRefs([...gridLineRefs]);
        }
    };

    /**
     * @param {number} numRows <Number of Rows to Divided into>
     * @param {number} numColumns <Number of Columns to Divided into>
     * @returns none
     * @updates {gridLines.show, canvas}
     */

    // Show Gridlines (Given N*M grid size)
    const showGrids = () => {
        setMode("Grids");
        initGridLines(gridLines.numRows, gridLines.numColumns);

        setGridlines({
            show: !gridLines.show,
        });

        // console.log(gridLines)

        if (gridLines.show) {
            for (let i = 0; i < gridLineRefs.length; i++) {
                // console.log(gridLineRefs[i])
                canvas.add(gridLineRefs[i]);
            }
        } else {
            setMode("none");
            for (let i = 0; i < gridLineRefs.length; i++) {
                canvas.remove(gridLineRefs[i]);
            }
        }
    };

    /**
     * Checks Value given and returns in which half
     * the value resides vertically
     * @param {number} YValue <Height of Canvas>
     * @returns {2} if YValue is in lower half
     * @returns {1} if YValue is in upper half
     * @updates none
     */

    const checkHalfVertical = (YValue) => {
        if (YValue > dims.boxH / 2) {
            return 2;
        } else {
            return 1;
        }
    };

    /**
     * Creates Rally where user can select any point on court
     * after which he has to select a point on Vertically opposite side
     * of current point if Canvas was divided into 2 vertical zones
     * @updates {arrayOfRallies}
     * @returns none
     * @todo Add support for multiple rallies to be used
     *       which will have different colors for lines
     *       An array of distinct colors should be used to give different colors for each new rally
     *       There will be no limit to create a new rally, but there will be a limit on no. of colors
     *       we are using for the rally, we will use 5 colors, so they can make 5 different rallies
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

        clearMouseListeners();
        setMode("Rally");
        canvas.on("mouse:down", (event) => {
            // console.log(arrayOfRallies)
            if (arrayOfRallies.rallies.length === 0) {
                window.alert('No Rallies Created, press the "+" button to add rallies')
                return
            }
            let currentX = canvas.getPointer(event.e).x;
            let currentY = canvas.getPointer(event.e).y;

            // console.log(arrayOfRallies.currentActiveIndex)

            // If array is empty, then do not check where Point has been placed
            console.log("This matters", arrayOfRallies.currentActiveIndex)
            if (arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.length === 0) {
                arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.push({
                    x: currentX,
                    y: currentY,
                });

                // Set lastY value
                arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].lastY =
                    checkHalfVertical(currentY);

                setArrayOfRallies((prevArrayOfRallies) => ({
                    ...prevArrayOfRallies,
                    rallies: [...arrayOfRallies.rallies],
                }));

                let circle = new fabric.Circle({
                    radius: 6,
                    left: currentX - 3,
                    top: currentY - 3,
                    fill: rallyColors[arrayOfRallies.currentActiveIndex % rallyColors.length],
                    selectable: false,
                    stroke: rallyColors[arrayOfRallies.currentActiveIndex % rallyColors.length],
                    strokeWidth: 1,
                });

                let text = new fabric.IText(
                    arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.length + "",
                    {
                        fontFamily: "arial black",
                        stroke: rallyColors[arrayOfRallies.currentActiveIndex % rallyColors.length],
                        left: currentX + 12,
                        top: currentY,
                        fontSize: 20,
                        editable: false,
                        selectable: false,
                    }
                );

                canvas.add(text);
                canvas.add(circle);

                // console.log("Last", rallyLastY, " Last Func : ", checkHalfVertical(currentY))
            }

            // Otherwise check in which half last Point was recorded
            else if (arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.length > 0) {
                let currPointLocY = checkHalfVertical(currentY);
                // console.log("current ", currPointLocY)
                // console.log("Compare ", curshotArray.lengthrPointLocY, rallyLastY)

                if (
                    currPointLocY === arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].lastY
                ) {
                    // Do nothing, as selected point
                    // is not on opposite vertical half
                    // Invalid Point Selected
                } else {
                    arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.push({
                        x: currentX,
                        y: currentY,
                    });

                    // Set rallyLastY value
                    arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].lastY =
                        checkHalfVertical(currentY);

                    setArrayOfRallies((prevArrayOfRallies) => ({
                        ...prevArrayOfRallies,
                        rallies: [...arrayOfRallies.rallies],
                    }));

                    let circle = new fabric.Circle({
                        radius: 6,
                        left: currentX - 3,
                        top: currentY - 3,
                        fill: rallyColors[arrayOfRallies.currentActiveIndex % rallyColors.length],
                        selectable: false,
                        stroke: rallyColors[arrayOfRallies.currentActiveIndex % rallyColors.length],
                        strokeWidth: 1,
                    });

                    let text = new fabric.IText(
                        arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.length + "",
                        {
                            fontFamily: "arial black",
                            stroke: rallyColors[arrayOfRallies.currentActiveIndex % rallyColors.length],
                            left: currentX + 12,
                            top: currentY,
                            fontSize: 20,
                            editable: false,
                            selectable: false,
                        }
                    );

                    let line = new fabric.Line(
                        [
                            arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots[
                                arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.length - 1
                            ].x,
                            arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots[
                                arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.length - 1
                            ].y,
                            arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots[
                                arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.length - 2
                            ].x,
                            arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots[
                                arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots.length - 2
                            ].y,
                        ],
                        {
                            stroke: rallyColors[arrayOfRallies.currentActiveIndex % rallyColors.length],
                            strokeWidth: 2,
                            selectable: false,
                        }
                    );

                    canvas.add(text);
                    canvas.add(line);
                    canvas.add(circle);

                    console.log(arrayOfRallies.currentActiveIndex)
                }
            }
        });
    };

    /**
     * Creates Footwork Movements, like a Rally
     * This is available only on 1 side of court, wherever the point is first activated
     * @param
     * @returns none
     * @updates {mode}
     */

    const constructFootwork = () => {
        // Check if Any footworks are present or not
        // If not, then just create one
        if (numFootworks === 0) {
            setArrayOfFootwork((prevArrayOfFootwork) => ({
                ...prevArrayOfFootwork,
                numFootworks: numFootworks + 1,
                currentActiveIndex: 0,
            }));
        }

        clearMouseListeners();
        setMode("Footwork");
        canvas.on("mouse:down", (event) => {
            let currentX = canvas.getPointer(event.e).x;
            let currentY = canvas.getPointer(event.e).y;

            // If array is empty, then do not check where Point has been placed
            console.log(currentActiveIndexFootwork);
            if (
                arrayOfFootwork.footworks[currentActiveIndexFootwork].movements
                    .length === 0
            ) {
                arrayOfFootwork.footworks[currentActiveIndexFootwork].movements.push({
                    x: currentX,
                    y: currentY,
                });

                // Set lastY value
                arrayOfFootwork.footworks[currentActiveIndexFootwork].lastY =
                    checkHalfVertical(currentY);

                // setArrayOfFootwork({
                //     footworks: {
                //         lastY: arrayOfFootwork.footworks[currentActiveIndexFootwork].lastY,
                //         movements: [...arrayOfFootwork.footworks[currentActiveIndexFootwork].movements]
                //     }
                // })

                setArrayOfFootwork((prevArrayOfFootwork) => ({
                    ...prevArrayOfFootwork,
                    footworks: [...arrayOfFootwork.footworks],
                }));

                let square = new fabric.Rect({
                    left: currentX - 3,
                    top: currentY - 3,
                    height: 12,
                    width: 12,
                    fill: "#32a7e6",
                    selectable: false,
                    stroke: "#32a7e6",
                    strokeWidth: 1,
                });

                let text = new fabric.IText(
                    arrayOfFootwork.footworks[currentActiveIndexFootwork].movements
                        .length + "",
                    {
                        fontFamily: "arial black",
                        left: currentX + 12,
                        top: currentY,
                        stroke: "black",
                        fontSize: 20,
                        editable: false,
                        selectable: false,
                    }
                );

                canvas.add(text);
                canvas.add(square);
            }

            // Otherwise check in which half last Point was recorded
            else if (
                arrayOfFootwork.footworks[currentActiveIndexFootwork].movements.length >
                0
            ) {
                let currPointLocY = checkHalfVertical(currentY);
                // console.log("current ", currPointLocY)
                // console.log("Compare ", currPointLocY, footworkLastY)

                if (
                    currPointLocY ===
                    arrayOfFootwork.footworks[currentActiveIndexFootwork].lastY
                ) {
                    arrayOfFootwork.footworks[currentActiveIndexFootwork].movements.push({
                        x: currentX,
                        y: currentY,
                    });

                    // setArrayOfFootwork({
                    //     footworks: {
                    //         movements: [...arrayOfFootwork.footworks[currentActiveIndexFootwork].movements]
                    //     }
                    // })

                    setArrayOfFootwork((prevArrayOfFootwork) => ({
                        footworks: [...arrayOfFootwork.footworks],
                    }));

                    let square = new fabric.Rect({
                        left: currentX - 3,
                        top: currentY - 3,
                        height: 12,
                        width: 12,
                        fill: "#32a7e6",
                        selectable: false,
                        stroke: "#32a7e6",
                        strokeWidth: 1,
                    });

                    let text = new fabric.IText(
                        arrayOfFootwork.footworks[currentActiveIndexFootwork].movements
                            .length + "",
                        {
                            fontFamily: "arial black",
                            left: currentX + 12,
                            top: currentY,
                            stroke: "black",
                            fontSize: 20,
                            editable: false,
                            selectable: false,
                        }
                    );

                    let line = new fabric.Line(
                        [
                            arrayOfFootwork.footworks[currentActiveIndexFootwork].movements[
                                arrayOfFootwork.footworks[currentActiveIndexFootwork].movements
                                    .length - 1
                            ].x,
                            arrayOfFootwork.footworks[currentActiveIndexFootwork].movements[
                                arrayOfFootwork.footworks[currentActiveIndexFootwork].movements
                                    .length - 1
                            ].y,
                            arrayOfFootwork.footworks[currentActiveIndexFootwork].movements[
                                arrayOfFootwork.footworks[currentActiveIndexFootwork].movements
                                    .length - 2
                            ].x,
                            arrayOfFootwork.footworks[currentActiveIndexFootwork].movements[
                                arrayOfFootwork.footworks[currentActiveIndexFootwork].movements
                                    .length - 2
                            ].y,
                        ],
                        {
                            stroke: "purple",
                            strokeWidth: 2,
                            selectable: false,
                        }
                    );

                    canvas.add(text);
                    canvas.add(line);
                    canvas.add(square);
                } else {
                    // Do nothing, as selected point
                    // is in opposite vertical half
                    // Invalid Point Selected
                }
            }
        });
    };

    /**
     * Create Animation for Footwork as well as Rally
     * Animation can be paused using a button
     * Animation can be stopped using another button
     * @returns none
     * @updates {animationObject}
     */

    const setAndPlayAnimationObject = () => {
        // If mode = Rally, then get currentActiveIndex of Rally
        // Else If mode = Footwork, then get currentActiveIndex of Footwork
        // Then update path variable that will be used to animate
        // Start Animation
        if (mode === "Rally") {
            // Get currentActiveIndex's shots array
            let pathShots = "";
            let shots =
                arrayOfRallies.rallies[arrayOfRallies.currentActiveIndex].shots;
            console.log(shots);
            if (shots.length > 0) {
                pathShots += "M " + shots[0].x + " " + shots[0].y;
                for (var i = 1; i < shots.length; i++) {
                    pathShots += " L " + shots[i].x + " " + shots[i].y;
                }
            }

            if (shots.length > 0) {
                let path = new fabric.Path(pathShots, {
                    stroke: "black",
                    fill: "transparent",
                    top: shots[0].y,
                    left: shots[0].x,
                });
                canvas.add(path);
                setAnimationObject(path);
                console.log(animationObject);
            }
        }
    };

    /**
     * Simulation Menu consists of Controls for
     * Simulation of rallies
     */

    const simulationRefs = [
        {
            name: "Check",
            icon: <GiMagnifyingGlass />,
            func: findMidOfCanvas,
        },
        {
            name: "Grids",
            icon: <BiGridSmall />,
            func: showGrids,
        },
    ];

    /**
     * Menu for Controlling Rally
     */

    const rallyMenu = [
        {
            name: "Rally",
            icon: <GiShuttlecock />,
            func: constructRally,
        },
        {
            name: "Set Rally",
            icon: <BsPlay />,
            func: setAndPlayAnimationObject,
        },
        {
            name: "Add Rally",
            icon: <BsPlusCircle />,
            func: onOpen,
        },
    ];

    /**
     * Menu for Controlling Footwork
     */

    const footworkMenu = [
        {
            name: "Footwork",
            icon: <RiFootprintFill />,
            func: constructFootwork,
        },
    ];

    /**
     * Mode of Color as per colorModeValue
     */

    let currentBackgroundColor = useColorModeValue("white", "gray.800");
    let currentLineColor = useColorModeValue("gray.800", "white.200");

    /**
     * left panel displays properties of selected object and can be dynamicaly changed
     */
    const leftPannel = [
        {
            name: "Radius",
            prop: "radius",
        },
        {
            name: "Height",
            prop: "height",
        },
        {
            name: "Width",
            prop: "width",
        },
        {
            name: "Fill",
            prop: "fill",
        },
        {
            name: "Angle",
            prop: "angle",
        },
        {
            name: "Top",
            prop: "top",
        },
        {
            name: "Left",
            prop: "left",
        },
        {
            name: "Stroke",
            prop: "stroke",
        },
        {
            name: "Radius x",
            prop: "rx",
        },
        {
            name: "Radius y",
            prop: "ry",
        },
    ];
     
    /** Create a new rally in the state variable arrayOfRallies
     * @updates {currentActiveIndex, arrayOfRallies}
     * @returns none
     * @problems previous state is reflected and does not ppend the current user inputed rally. Cannot find `shots` attribute in the newly created rally
     */

    function addRally() {

        let x = arrayOfRallies.rallies.length
        if (x === undefined) {
            x = 0
        }
        console.log("ARLen" + x)
    
        arrayOfRallies.rallies.push({
            name: rallyOrFootworkName.current.value,
            shots: [],
            lastY: -1
        })

        setArrayOfRallies((prevArrayOfRallies) => ({
            ...prevArrayOfRallies,
            currentActiveIndex: x,
            rallies: [...arrayOfRallies.rallies],
        }));

        constructRally();
    }

    /**
     * Create a new footwork in the state variable arrayOfFootworks
     * @updates {currentActiveIndexFootwork, numFootworks, arrayOfFootworks}
     * @returns none
     * @problems previous state is reflected and does not ppend the current user inputed footwork. Cannot find `movements` attribute in the newly created footwork
     */
    function addFootwork() {
        setCurrentActiveIndexFootwork(currentActiveIndexFootwork + 1);
        setNumFootworks(numFootworks + 1);

        setArrayOfFootwork({
            numFootworks: numFootworks,
            currentActiveIndex: currentActiveIndexFootwork,
            footworks: {
                name: rallyOrFootworkName.current.value,
                lastY: 0,
                movements: [],
            },
        });
        for (const i in arrayOfFootwork) {
            if (i === "footworks") {
                listOfFootworks.push(arrayOfFootwork[i]);
            }
        }
        setListOfFootworks([...listOfFootworks]);
        constructFootwork();
    }

    /**
     * Displays the current number of rallies or footworks placed on the canvas by the user
     * @returns the chakra.div for displaying the rallies and footworks
     * @function {addRally, addFunction}
     */

    const setRightMenu = () => {
        let ralliesOrFootwork = null;
        let l = null;
        if (mode === "Rally") {
            l = arrayOfRallies.rallies;
            if (l === undefined) {
                l = []
            }
            ralliesOrFootwork = "Rallies";
        } else if (mode === "Footwork") {
            l = listOfFootworks;
            if (l === undefined) {
                l = []
            }
            ralliesOrFootwork = "Footworks";
        } else {
            l = [];
            ralliesOrFootwork = "Nothing Selected";
        }
        return (
            <chakra.div>
                <Center w="100%">
                    <Text fontSize={"2xl"} mb={"2vh"}>
                        {ralliesOrFootwork}
                    </Text>
                </Center>

                <chakra.div
                    my="10"
                    mx="20"
                    py="10"
                    overflowY="auto"
                    maxH="500"
                    minW="200"
                >
                    {"LEN : " + arrayOfRallies.rallies.length}
                    {" CURR : " + arrayOfRallies.currentActiveIndex}
                    <OrderedList justifyContent="center" alignItems="center" spacing="5">
                        {l.map((i, index) => (
                            <ListItem key={index}>
                                <SimpleGrid columns="1" mx="4">
                                    <Button variant='ghost' 
                                        border='solid'
                                        bg={rallyColors[index % rallyColors.length]} 
                                        onClick={async (e) => {
                                        await setArrayOfRallies(prevArrayOfRallies => ({
                                            ...prevArrayOfRallies,
                                            currentActiveIndex: parseInt(index)
                                        }))
                                        clearMouseListeners()
                                        constructRally()
                                    }
                                    }>{i.name}</Button>
                                </SimpleGrid>
                            </ListItem>
                        ))}
                    </OrderedList>
                </chakra.div>
            </chakra.div>
        );
    };

    return (
        <chakra.div my={5}>
            <Stack direction={["column", "row"]}>
                <Box display={["none", "flex"]} w={"19vw"} ml={"2vw"}>
                    <Table variant="simple" maxH={"10vh"} overflowY="auto" size="xsm">
                        <Thead>OBJECT PROPERTIES</Thead>
                        <Tbody>
                            {leftPannel.map((obj) => {
                                return (
                                    <Tr>
                                        <Td>
                                            <Text> {obj.name}</Text>
                                        </Td>
                                        <Td>
                                            <Input
                                                placeholder={
                                                    currentObject == null
                                                        ? "None"
                                                        : currentObject.get(obj.prop)
                                                }
                                                onChange={null}
                                            />
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                        <Box>
                            <Input value={gridLines.numRows}
                                type="number"
                                name="x" size="md" mt={2}
                                onChange={(e) => {
                                    setGridlines(prevGridLines => ({
                                        ...prevGridLines,
                                        numRows: parseInt(e.target.value)
                                    }))
                                }} />
                            <Input value={gridLines.numColumns}
                                type="number"
                                name="y" size="md" mt={2}
                                onChange={(e) => {
                                    setGridlines(prevGridLines => ({
                                        ...prevGridLines,
                                        numColumns: parseInt(e.target.value)
                                    }))
                                }} />
                            <Button colorScheme="blue" mt={3}
                                onClick={showGrids}
                            >Set Grid Lines</Button>
                        </Box>
                        <Flex mt={5}>
                            <Button colorScheme="red" onClick={loadCanvas}>
                                Reload Canvas
                            </Button>
                        </Flex>
                        <Button onClick={toggleColorMode}>
                            Toggle {colorMode === "light" ? "Dark" : "Light"}
                        </Button>
                    </Table>
                </Box>

                <Box w={"10vw"} h={dims.boxH}>
                    <Center w="100%">
                        <Text fontSize={"2xl"}>Objects</Text>
                    </Center>
                    <Box display={["none", "flex"]}>
                        <SimpleGrid w={"8vw"} columns={2} maxH={"40vh"} overflowY="auto">
                            {objectsMenu.map((item) => {
                                return (
                                    <Flex scroll={"true"} key={item.name}>
                                        <Tooltip label={item.name}>
                                            <Button
                                                px={"0.2vw"}
                                                py={"3vh"}
                                                onClick={item.func}
                                                color={currentLineColor}
                                                fontSize={"xl"}
                                                w={"100%"}
                                                bg={
                                                    mode === item.name
                                                        ? "blue.400"
                                                        : currentBackgroundColor
                                                }
                                            >
                                                {item.icon}
                                            </Button>
                                        </Tooltip>
                                    </Flex>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                    <Center w="100%">
                        <Text fontSize={"2xl"}>Object Controls</Text>
                    </Center>
                    <Box display={["none", "flex"]}>
                        <SimpleGrid w={"8vw"} columns={2} maxH={"20vh"} overflowY="auto">
                            {canvasControlMenu.map((item) => {
                                return (
                                    <Flex scroll="true" key={item.name}>
                                        <Tooltip label={item.name}>
                                            <Button
                                                px={"0.2vw"}
                                                py={"3vh"}
                                                onClick={item.func}
                                                fontSize={"xl"}
                                                w={"100%"}
                                                color={currentLineColor}
                                                bg={
                                                    mode === item.name
                                                        ? "blue.400"
                                                        : currentBackgroundColor
                                                }
                                            >
                                                {item.icon}
                                            </Button>
                                        </Tooltip>
                                    </Flex>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                </Box>
                <Box
                    w={["100vw", "36vw", "40vw"]}
                    minW={"35vw"}
                    h={"95vh"}
                    ref={boxDiv}
                >
                    <canvas id="canvas"></canvas>
                </Box>
                <Box w={"10vw"}>
                    <Box w="100%">
                        <Text fontSize={"2xl"}>Reference Points</Text>
                    </Box>
                    <Box display={["none", "flex"]}>
                        <SimpleGrid w={"8vw"} columns={2} maxH={"15vh"} overflowY="auto">
                            {simulationRefs.map((item) => {
                                return (
                                    <Flex scroll="true" key={item.name}>
                                        <Tooltip label={item.name}>
                                            <Button
                                                px={"0.2vw"}
                                                py={"3vh"}
                                                onClick={item.func}
                                                fontSize={"xl"}
                                                w={"100%"}
                                                color={currentLineColor}
                                                bg={
                                                    mode === item.name
                                                        ? "blue.400"
                                                        : currentBackgroundColor
                                                }
                                            >
                                                {item.icon}
                                            </Button>
                                        </Tooltip>
                                    </Flex>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                    <Center w="100%">
                        <Text fontSize={"2xl"}>Rally Control</Text>
                    </Center>
                    <Box display={["none", "flex"]}>
                        <SimpleGrid w={"8vw"} columns={2} h={"15vh"} overflowY="auto">
                            {rallyMenu.map((item) => {
                                return (
                                    <Flex scroll="true" key={item.name}>
                                        <Tooltip label={item.name}>
                                            <Button
                                                px={"0.2vw"}
                                                py={"3vh"}
                                                onClick={item.func}
                                                fontSize={"xl"}
                                                w={"100%"}
                                                color={currentLineColor}
                                                bg={
                                                    mode === item.name
                                                        ? "blue.400"
                                                        : currentBackgroundColor
                                                }
                                            >
                                                {item.icon}
                                            </Button>
                                        </Tooltip>
                                    </Flex>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                    <Center w="100%">
                        <Text fontSize={"2xl"}>Footwork Control</Text>
                    </Center>
                    <Box display={["none", "flex"]}>
                        <SimpleGrid w={"8vw"} columns={2} h={"15vh"} overflowY="auto">
                            {footworkMenu.map((item) => {
                                return (
                                    <Flex scroll="true" key={item.name}>
                                        <Tooltip label={item.name}>
                                            <Button
                                                px={"0.2vw"}
                                                py={"3vh"}
                                                onClick={item.func}
                                                fontSize={"xl"}
                                                w={"100%"}
                                                color={currentLineColor}
                                                bg={
                                                    mode === item.name
                                                        ? "blue.400"
                                                        : currentBackgroundColor
                                                }
                                            >
                                                {item.icon}
                                            </Button>
                                        </Tooltip>
                                    </Flex>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                </Box>
                <Box display={["none", "flex"]} w={"19vw"} mr={"2vw"}>
                    {setRightMenu()}
                </Box>
            </Stack>

            {/* Modal to take the user input for naming the rally or footwork */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {mode === "Rally" ? "Set Rally Name" : "Set Footwork Name"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input
                            placeholder={mode === "Rally" ? "Rally Name" : "Footwork Name"}
                            ref={rallyOrFootworkName}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="red" mx="3" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={mode === "Rally" ? addRally : addFootwork}
                            onMouseUp={onClose}
                        >
                            Set Name
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </chakra.div>
    );
}

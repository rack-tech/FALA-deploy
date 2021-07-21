import "./Layout.css";
import FrontCourt3d from "../assets/3d_court.svg"
import FrontCourt3dFlat from "../assets/3d_court_colored_flat.svg"
import SideCourt3d from '../assets/Side_view.svg'
import SideCourt3dFlat from '../assets/Side_view_flat.svg'
import Shuttle from "../assets/badminton_shuttle.png";
import LeftBoot from "../assets/left_boot.png"
import RightBoot from "../assets/right_boot.png";
import download from 'downloadjs'

import { useEffect, useReducer, useRef, useState } from "react";
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
    VStack,
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
    Checkbox,
    Grid,
    GridItem,
    Divider,
    Popover,
    PopoverBody,
    PopoverHeader,
    PopoverArrow,
    PopoverCloseButton,
    PopoverTrigger,
    PopoverContent,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Select,
} from "@chakra-ui/react";

import { fabric } from "fabric";
import randomColor from 'randomcolor'

import {
    BiCircle,
    BiEdit,
    BiPointer,
    BiText,
    BiTrash,
    BsSquare,
    BsTriangle,
    GiShuttlecock,
    IoEllipseOutline,
    RiSubtractLine,
    RiFootprintFill,
    BsPlusCircle,
    BiPlayCircle,
    BiPauseCircle,
    BiStopCircle,
    BsPlayFill,
    BsPauseFill,
    BiUndo,
    AiOutlineClear,
    MdDelete,
    BiSave,
    AiOutlineBgColors,
    VscSymbolProperty,
    AiOutlineReload,
    BsSun,
    BsMoon,
    GiRunningShoe,
    FaShapes,
    RiRemoteControl2Line,
    GiGears,
    IoIosListBox,
    BiCustomize
} from "react-icons/all";

import {
    isMobile,
    isTablet,
    isBrowser,
} from 'react-device-detect'

// Layout Function has Layout of Court as well as controls

export default function Layout3D(props) {

    // Drawer for Mobile Devices
    const { isOpen: isObjectsDrawerOpen, onOpen: onObjectsDrawerOpen, onClose: onObjectsDrawerClose } = useDisclosure()
    const { isOpen: isSimulationControlsDrawerOpen, onOpen: onSimulationControlsDrawerOpen, onClose: onSimulationControlsDrawerClose } = useDisclosure()
    const { isOpen: isControlsDrawerOpen, onOpen: onControlsDrawerOpen, onClose: onControlsDrawerClose } = useDisclosure()
    const { isOpen: isSimulationListsDrawerOpen, onOpen: onSimulationListsDrawerOpen, onClose: onSimulationListsDrawerClose } = useDisclosure()
    const { isOpen: isPersonizationDrawerOpen, onOpen: onPersonizationDrawerOpen, onClose: onPersonizationDrawerClose } = useDisclosure()

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

    // Title for Canvas
    const canvasTitle = useRef("Untitled")

    // Initialize Canvas
    const [canvas, setCanvas] = useState(null);

    // Variable to store current selected object
    const [currentObject, setCurrentObject] = useState(null);

    // Variable to Keep Track of added Objects
    const canvasObjects = useRef([]);

    // Create a Mode Variable to Highlight which mode is active
    const [mode, setMode] = useState("Pointer");

    // Create Save Settings reference Object
    const saveSettings = useRef({
        name: canvasTitle.current,
        keepObjects: false,
        exportAs: 'image/svg+xml;charset=utf-8'
    })

    /**
     * Variables for Drawing Objects
     */

    let isDown = false;
    let startX = 0;
    let startY = 0;

    /**
     * State Variable to Force Re render on screen (of right menu)
     * @returns None
     * @updates None
     */

    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    /**
     * Simulation Related State Variables
     */

    // Array to store all shots played
    const arrayOfRallies = useRef({
        currentActiveIndex: 0,
        rallies: [],
    });

    // disclosure variables for controlling the change name modal
    const { isOpen: isNameControlOpen, onOpen: onNameControlOpen, onClose: onNameControlClose } = useDisclosure();

    // disclosure variable for controlling save canvas options
    const {isOpen: isSaveCanvasOpen, onOpen: onSaveCanvasOpen, onClose: onSaveCanvasClose } = useDisclosure()

    // reference variable to get the rally name or footwork name
    const rallyOrFootworkName = useRef(null);

    // Array to store all footwork patterns
    const arrayOfFootwork = useRef({
        currentActiveIndex: 0,
        footworks: [],
    });

    // Variable to keep track of show all rallies
    const showAllRallies = useRef(false);

    // Varaible to keep track of show all footworks
    const showAllFootworks = useRef(false);

    // Run animation flag
    const runFlag = useRef(false);

    // Shuttle Animation Object
    const shuttleAnimationObject = useRef(null);

    // Footwork Animaton Object
    const rightFootworkAnimationObject = useRef(null);
    const leftFootworkAnimationObject = useRef(null);
    const footworkAnimationObject = useRef(null);


    /**
     * Initialize Canvas every time reload happens
     * @updates {canvas}
     * @returns canvas with appropriate height and width
     */

    const initCanvas = () => {
        fabric.Object.prototype.transparentCorners = false
        fabric.Object.prototype.cornerColor = '#00008B'
        fabric.Object.prototype.cornerStyle = 'circle'
        fabric.Object.prototype.borderColor = 'red'
        const canvas = new fabric.Canvas("canvas", {
            height: dims.boxH,
            width: dims.boxW,
        });
        if (props.flat === "Front") {
            console.log("Flat : ", props.flat)
            fabric.loadSVGFromURL(FrontCourt3d, (objects, options) => {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.set({
                    selectable: false,
                    scaleX: canvas.width / obj.width,
                    scaleY: canvas.height / obj.height,
                })
                canvas.add(obj)
                canvas.setBackgroundColor('white')
            })
        } else if (props.flat === "Front_Flat") {
            console.log("Flat : ", props.flat)
            fabric.loadSVGFromURL(FrontCourt3dFlat, (objects, options) => {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.set({
                    selectable: false,
                    scaleX: canvas.width / obj.width,
                    scaleY: canvas.height / obj.height,
                })
                canvas.add(obj)
                canvas.setBackgroundColor('white')
            })
        }
        else if (props.flat === "Side") {
            console.log("Flat : ", props.flat)
            fabric.loadSVGFromURL(SideCourt3d, (objects, options) => {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.set({
                    selectable: false,
                    scaleX: canvas.width / obj.width,
                    scaleY: canvas.height / obj.height,
                })
                canvas.add(obj)
                canvas.setBackgroundColor('white')
            })
        }
        else if (props.flat === "Side_Flat") {
            console.log("Flat : ", props.flat)
            fabric.loadSVGFromURL(SideCourt3dFlat, (objects, options) => {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.set({
                    selectable: false,
                    scaleX: canvas.width / obj.width,
                    scaleY: canvas.height / obj.height,
                })
                canvas.add(obj)
                canvas.setBackgroundColor('white')
            })
        }
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
        if (canvas !== null) {
            canvas.clear();
        }
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
     * Receives object as a parameter
     * Adds object to canvas
     * @updates {canvasObjects, canvas}
     * @returns None
     */

    const addObjectToArray = (object) => {
        canvasObjects.current.push(object);
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

        for (let i = 0; i < canvasObjects.current.length; i++) {
            canvasObjects.current[i].set({
                selectable: false,
            });
        }

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
            addObjectToArray(circle);

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
            for (let i = 0; i < canvasObjects.current.length; i++) {
                canvasObjects.current[i].set({
                    selectable: true,
                });
            }

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

        for (let i = 0; i < canvasObjects.current.length; i++) {
            canvasObjects.current[i].set({
                selectable: false,
            });
        }

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
            addObjectToArray(rectangle);
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
            for (let i = 0; i < canvasObjects.current.length; i++) {
                canvasObjects.current[i].set({
                    selectable: true,
                });
            }

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

        for (let i = 0; i < canvasObjects.current.length; i++) {
            canvasObjects.current[i].set({
                selectable: false,
            });
        }

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
            addObjectToArray(ellipse);
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
            for (let i = 0; i < canvasObjects.current.length; i++) {
                canvasObjects.current[i].set({
                    selectable: true,
                });
            }

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

        for (let i = 0; i < canvasObjects.current.length; i++) {
            canvasObjects.current[i].set({
                selectable: false,
            });
        }

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
            addObjectToArray(triangle);
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
            for (let i = 0; i < canvasObjects.current.length; i++) {
                canvasObjects.current[i].set({
                    selectable: true,
                });
            }

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

        for (let i = 0; i < canvasObjects.current.length; i++) {
            canvasObjects.current[i].set({
                selectable: false,
            });
        }

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
            addObjectToArray(line);
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
            for (let i = 0; i < canvasObjects.current.length; i++) {
                canvasObjects.current[i].set({
                    selectable: true,
                });
            }

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
     * Adds a p box to Canvas
     * Uses current X and Y values to place the p box
     * @returns none
     * @updates {canvas, mode}
     */

    // Add Text to canvas
    const addText = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        // canvas.__eventListeners = {}
        setMode("Text");
        var p;

        for (let i = 0; i < canvasObjects.current.length; i++) {
            canvasObjects.current[i].set({
                selectable: false,
            });
        }

        canvas.on("mouse:down", (event) => {
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            p = new fabric.IText("Tap and Type", {
                fontFamily: "Quicksand",
                left: startX,
                top: startY,
                fontSize: 30,
            });

            canvas.add(p);
            addObjectToArray(p);
        });

        canvas.on("mouse:up", () => {
            for (let i = 0; i < canvasObjects.current.length; i++) {
                canvasObjects.current[i].set({
                    selectable: true,
                });
            }

            setMode("none");
            clearMouseListeners();
        });
    };

    /**
     * Adds a Shuttlecock Object to Canvas
     * Uses current X and Y values to place the shuttlecock image
     * @updates {canvas}
     * @returns None
     */

    const addShuttleObject = () => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        // canvas.__eventListeners = {}
        setMode("Shuttle Object");

        for (let i = 0; i < canvasObjects.current.length; i++) {
            canvasObjects.current[i].set({
                selectable: false,
            });
        }

        canvas.on("mouse:down", (event) => {
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            new fabric.Image.fromURL(Shuttle, (img) => {
                img.set({
                    left: startX,
                    top: startY
                })
                img.scaleToWidth(40)
                canvas.add(img);
                addObjectToArray(img);
            })

        });

        canvas.on("mouse:up", () => {
            for (let i = 0; i < canvasObjects.current.length; i++) {
                canvasObjects.current[i].set({
                    selectable: true,
                });
            }

            setMode("none");
            clearMouseListeners();
        });
    }

    /**
     * Adds a Shoe Object to Canvas
     * Uses current X and Y values to place the shuttlecock image
     * @updates {canvas}
     * @returns None
     */

    const addShoeObject = (isRightBoot) => {
        clearMouseListeners();
        canvas.isDrawingMode = false;
        // canvas.__eventListeners = {}
        setMode("Shuttle Object");

        for (let i = 0; i < canvasObjects.current.length; i++) {
            canvasObjects.current[i].set({
                selectable: false,
            });
        }

        canvas.on("mouse:down", (event) => {
            startX = canvas.getPointer(event.e).x;
            startY = canvas.getPointer(event.e).y;
            new fabric.Image.fromURL(RightBoot, (img) => {
                img.set({
                    left: startX,
                    top: startY
                })
                img.scaleToWidth(40)
                if (!isRightBoot) {
                    img.set({
                        flipX: true
                    })
                }
                canvas.add(img);
                addObjectToArray(img);
            })

        });

        canvas.on("mouse:up", () => {
            for (let i = 0; i < canvasObjects.current.length; i++) {
                canvasObjects.current[i].set({
                    selectable: true,
                });
            }

            setMode("none");
            clearMouseListeners();
        });
    }

    /**
     * Saves current State of canvas
     * @returns None
     */

    const saveCanvas = () => {

        // JSON

        /* const element = document.createElement("temporary_element_whose_name_nobody_will_take");
        const file = new Blob([JSON.stringify(canvas)], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "canvas.json";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        */

        // SVG

        if (!saveSettings.current.keepObjects) {
            clearAllRallyObjects()
            clearAllFootworkObjects()
        }

        setMode("Pointer")

        console.log(canvas.toSVG())
        let blob = canvas.toSVG()
        setTimeout(() => {
            const file = new Blob([blob], { type: saveSettings.current.exportAs });
            console.log(saveSettings.current.exportAs)
            if (saveSettings.current.exportAs === 'image/svg+xml;charset=utf-8') {
                download(file, saveSettings.current.name + ".svg")
            } else if (saveSettings.current.exportAs === 'image/png') {
                download(file, saveSettings.current.name + ".png")
            } else {
                download(file, saveSettings.current.name + ".jpg")
            }
        }, 200);
    }

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
        // Remove everything from canvasObjects Array
        canvasObjects.current = [];
    };

    /**
     * Set Background Color for Canvas
     */

    const selectCanvasBackground = () => {
        const list = ["white", "#d4edad", "#82cdcd", "#eedd82", "#82cda8", "#82a8cd", "#cd8282", "orange", "yellow", "red", "teal", "blue", "cyan", "purple", "pink"]
        return (
            list.map((item) => (
                <Button bg={item} value={item} m="1" borderRadius={'100%'} size='sm' onClick={
                    () => {
                        canvas.setBackgroundColor(item)
                        canvas.renderAll()
                    }}> </Button>
            ))
        )
    }

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
        {
            name: "Shuttle Object",
            icon: <GiShuttlecock />,
            func: addShuttleObject,
        },
        {
            name: "Right Boot",
            icon: <GiRunningShoe />,
            func: () => addShoeObject(true),
        },
        {
            name: "Left Boot",
            icon: <GiRunningShoe />,
            func: () => addShoeObject(false),
        }
    ];

    /**
     * Control Objects using a simple set of Controls
     */

    const canvasControlMenu = [
        {
            name: "Save",
            icon: <BiSave />,
            func: () => {
                onSaveCanvasOpen()
            },
        },
        {
            name: "Delete",
            icon: <BiTrash />,
            func: deleteItem,
        },
        {
            name: "Reload Canvas",
            icon: <AiOutlineReload />,
            func: () => {
                // Get all Objects and Remove them one by one
                let objects = canvas.getObjects();
                for (var i = 0; i < objects.length; i++) {
                    canvas.remove(objects[i]);
                }
                canvas.renderAll();

                // Remove everything from CanvasObjects array also
                canvasObjects.current = [];
            }
        },
        {
            name: "Clear History",
            icon: <AiOutlineClear />,
            func: () => {
                if (
                    window.confirm("Do you want clear canvas? It cannot be recovered.")
                ) {
                    clearCanvas()
                }
            },
        }, {
            name: colorMode === "light" ? "Dark Mode" : "Light Mode",
            icon: colorMode === "light" ? <BsMoon /> : <BsSun />,
            func: toggleColorMode,
        },
    ];

    /**
     * Following Code is related to Simulation, all functions henceforth do either Animations
     * or are responsible for creating Rallies and movement of objects on the Canvas
     */

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
     * Remove all objects from all other rallies
     * @updates None
     * @return None
     */

    const clearAllRallyObjects = () => {
        for (let i = 0; i < arrayOfRallies.current.rallies.length; i++) {
            for (
                let j = 0;
                j < arrayOfRallies.current.rallies[i].objectHistory.length;
                j++
            ) {
                canvas.remove(arrayOfRallies.current.rallies[i].objectHistory[j]);
            }
        }
    };

    /**
     * Draw Rally Objects on screen as per demand
     * If only current one is to be displayed
     * @param showCurrentOnly is set to true
     * Else is set to false
     */

    const drawRallyObjectsOnCanvas = (showCurrentOnly) => {
        if (arrayOfRallies.current.rallies.length === 0) {
            return;
        }
        if (showCurrentOnly) {
            for (
                let i = 0;
                i <
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].objectHistory.length;
                i++
            ) {
                canvas.add(
                    arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].objectHistory[i]
                );
            }
        } else {
            for (let i = 0; i < arrayOfRallies.current.rallies.length; i++) {
                for (
                    let j = 0;
                    j < arrayOfRallies.current.rallies[i].objectHistory.length;
                    j++
                ) {
                    canvas.add(arrayOfRallies.current.rallies[i].objectHistory[j]);
                }
            }
        }
    };

    /**
     * Creates Rally where user can select any point on court
     * after which he has to select a point on Vertically opposite side
     * of current point if Canvas was divided into 2 vertical zones
     * @updates {arrayOfRallies}
     * @returns None
     */

    const constructRally = () => {
        clearAllRallyObjects();
        clearAllFootworkObjects()
        if (showAllRallies.current) {
            drawRallyObjectsOnCanvas(false);
        } else {
            drawRallyObjectsOnCanvas(true);
        }
        clearMouseListeners();
        setMode("Rally");
        canvas.on("mouse:down", (event) => {
            // console.log(arrayOfRallies.current)
            if (arrayOfRallies.current.rallies.length === 0) {
                window.alert('No Rallies Created, press the "+" button to add rallies');
                return;
            }
            let currentX = canvas.getPointer(event.e).x;
            let currentY = canvas.getPointer(event.e).y;

            // console.log(arrayOfRallies.current.currentActiveIndex)

            // If array is empty, then do not check where Point has been placed
            // console.log("This matters", arrayOfRallies.current.currentActiveIndex)

            if (
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].shots.length === 0
            ) {
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].shots.push({
                    x: currentX,
                    y: currentY,
                });

                // Set lastY value
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].lastY = checkHalfVertical(currentY);

                let circle = new fabric.Circle({
                    radius: 6,
                    left: currentX - 3,
                    top: currentY - 3,
                    fill: arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].color,
                    selectable: false,
                    stroke: arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].color,
                    strokeWidth: 1,
                });

                let p = new fabric.IText(
                    arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots.length + "",
                    {
                        fontFamily: "Quicksand",
                        stroke: arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].color,
                        left: currentX + 12,
                        top: currentY,
                        fontSize: 20,
                        editable: false,
                        selectable: false,
                    }
                );

                let group = new fabric.Group([p, circle], {
                    selectable: false
                })

                canvas.add(group);

                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].objectHistory.push(group);

            }

            // Otherwise check in which half last Point was recorded
            else if (
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].shots.length > 0
            ) {
                // console.log("current ", currPointLocY)
                // console.log("Compare ", curshotArray.lengthrPointLocY, rallyLastY)


                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].shots.push({
                    x: currentX,
                    y: currentY,
                });

                // Set rallyLastY value
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].lastY = checkHalfVertical(currentY);

                let circle = new fabric.Circle({
                    radius: 6,
                    left: currentX - 3,
                    top: currentY - 3,
                    fill: arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].color,
                    selectable: false,
                    stroke: arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].color,
                    strokeWidth: 1,
                });

                let p = new fabric.IText(
                    arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots.length + "",
                    {
                        fontFamily: "Quicksand",
                        stroke: arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].color,
                        left: currentX + 12,
                        top: currentY,
                        fontSize: 20,
                        editable: false,
                        selectable: false,
                    }
                );

                let line = new fabric.Line(
                    [
                        arrayOfRallies.current.rallies[
                            arrayOfRallies.current.currentActiveIndex
                        ].shots[
                            arrayOfRallies.current.rallies[
                                arrayOfRallies.current.currentActiveIndex
                            ].shots.length - 1
                        ].x,
                        arrayOfRallies.current.rallies[
                            arrayOfRallies.current.currentActiveIndex
                        ].shots[
                            arrayOfRallies.current.rallies[
                                arrayOfRallies.current.currentActiveIndex
                            ].shots.length - 1
                        ].y,
                        arrayOfRallies.current.rallies[
                            arrayOfRallies.current.currentActiveIndex
                        ].shots[
                            arrayOfRallies.current.rallies[
                                arrayOfRallies.current.currentActiveIndex
                            ].shots.length - 2
                        ].x,
                        arrayOfRallies.current.rallies[
                            arrayOfRallies.current.currentActiveIndex
                        ].shots[
                            arrayOfRallies.current.rallies[
                                arrayOfRallies.current.currentActiveIndex
                            ].shots.length - 2
                        ].y,
                    ],
                    {
                        stroke: arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].color,
                        strokeWidth: 2,
                        selectable: false,
                    }
                );

                let group = new fabric.Group([p, line, circle], {
                    selectable: false
                })
                // group.add(p)
                // group.add(line)
                // group.add(circle)

                canvas.add(group);

                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].objectHistory.push(group);
            }
        });
    };

    /**
     * Remove 1 element from Current Rally Object
     * @updates arrayOfRallies
     * @returns None
     */

    const undoLastArraySimulation = () => {
        if (arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].shots.length === 0 ||
            isNaN(arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].shots.length)) {

            window.alert("No item to undo", arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].shots.length)
        }
        else {
            canvas.remove(arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].objectHistory[
                arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].objectHistory.length - 1])

            arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].objectHistory.pop()
            arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].shots.pop()

            if (arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].shots.length > 0) {
                arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].lastY = checkHalfVertical(
                    arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].shots[
                        arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].shots.length - 1
                    ].y
                )
            }
        }
    }

    /**
     * Remove all objects from all other rallies
     * Keep only plotted points of current active index
     * @updates None
     * @return None
     */

    const clearAllFootworkObjects = () => {
        for (let i = 0; i < arrayOfFootwork.current.footworks.length; i++) {
            for (
                let j = 0;
                j < arrayOfFootwork.current.footworks[i].objectHistory.length;
                j++
            ) {
                canvas.remove(arrayOfFootwork.current.footworks[i].objectHistory[j]);
            }
        }
    };

    /**
     * Draw Footwork Objects on screen as per demand
     * If only current one is to be displayed
     * @param showCurrentOnly is set to true
     * Else is set to false
     */

    const drawFootworkObjectsOnCanvas = (showCurrentOnly) => {
        if (arrayOfFootwork.current.footworks.length === 0) {
            return;
        }
        if (showCurrentOnly) {
            for (
                let i = 0;
                i <
                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].objectHistory.length;
                i++
            ) {
                canvas.add(
                    arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].objectHistory[i]
                );
            }
        } else {
            for (let i = 0; i < arrayOfFootwork.current.footworks.length; i++) {
                for (
                    let j = 0;
                    j < arrayOfFootwork.current.footworks[i].objectHistory.length;
                    j++
                ) {
                    canvas.add(arrayOfFootwork.current.footworks[i].objectHistory[j]);
                }
            }
        }
    };

    /**
     * Creates Footwork Movements, like a Rally
     * This is available only on 1 side of court, wherever the point is first activated
     * @param
     * @returns none
     * @updates {mode}
     */

    const constructFootwork = () => {
        clearAllFootworkObjects();
        clearAllRallyObjects()
        if (showAllFootworks.current) {
            drawFootworkObjectsOnCanvas(false);
        } else {
            drawFootworkObjectsOnCanvas(true);
        }
        clearMouseListeners();
        setMode("Footwork");
        canvas.on("mouse:down", (event) => {
            // console.log(arrayOfRallies)
            if (arrayOfFootwork.current.footworks.length === 0) {
                window.alert(
                    'No Footworks Created, press the "+" button to add footworks'
                );
                return;
            }
            let currentX = canvas.getPointer(event.e).x;
            let currentY = canvas.getPointer(event.e).y;

            // If array is empty, then do not check where Point has been placed
            if (
                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].movements.length === 0
            ) {
                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].movements.push({
                    x: currentX,
                    y: currentY,
                });

                // Set lastY value
                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].lastY = checkHalfVertical(currentY);

                let rect = new fabric.Rect({
                    height: 10,
                    width: 10,
                    left: currentX - 3,
                    top: currentY - 3,
                    fill: arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].color,
                    selectable: false,
                    stroke: arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].color,
                    strokeWidth: 1,
                });

                let p = new fabric.IText(
                    arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].movements.length + "",
                    {
                        fontFamily: "Quicksand",
                        stroke: arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].color,
                        left: currentX + 12,
                        top: currentY,
                        fontSize: 20,
                        editable: false,
                        selectable: false,
                    }
                );

                let group = new fabric.Group([p, rect], {
                    selectable: false
                })

                canvas.add(group);

                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].objectHistory.push(group);
            }

            // Otherwise check in which half last Point was recorded
            else if (
                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].movements.length > 0
            ) {
                // console.log("current ", currPointLocY)
                // console.log("Compare ", curshotArray.lengthrPointLocY, rallyLastY)


                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].movements.push({
                    x: currentX,
                    y: currentY,
                });

                let rect = new fabric.Rect({
                    height: 10,
                    width: 10,
                    left: currentX - 3,
                    top: currentY - 3,
                    fill: arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].color,
                    selectable: false,
                    stroke: arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].color,
                    strokeWidth: 1,
                });

                let p = new fabric.IText(
                    arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].movements.length + "",
                    {
                        fontFamily: "Quicksand",
                        stroke: arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].color,
                        left: currentX + 12,
                        top: currentY,
                        fontSize: 20,
                        editable: false,
                        selectable: false,
                    }
                );

                let line = new fabric.Line(
                    [
                        arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].movements[
                            arrayOfFootwork.current.footworks[
                                arrayOfFootwork.current.currentActiveIndex
                            ].movements.length - 1
                        ].x,
                        arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].movements[
                            arrayOfFootwork.current.footworks[
                                arrayOfFootwork.current.currentActiveIndex
                            ].movements.length - 1
                        ].y,
                        arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].movements[
                            arrayOfFootwork.current.footworks[
                                arrayOfFootwork.current.currentActiveIndex
                            ].movements.length - 2
                        ].x,
                        arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].movements[
                            arrayOfFootwork.current.footworks[
                                arrayOfFootwork.current.currentActiveIndex
                            ].movements.length - 2
                        ].y,
                    ],
                    {
                        stroke: arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].color,
                        strokeWidth: 2,
                        selectable: false,
                    }
                );

                let group = new fabric.Group([p, line, rect], {
                    selectable: false
                })

                canvas.add(group);

                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].objectHistory.push(group);

            }
        });
    };

    /**
     * Remove 1 element from Current Rally Object
     * @updates arrayOfRallies
     * @returns None
     */

    const undoLastFootworkSimulation = () => {
        if (arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].movements.length === 0 ||
            isNaN(arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].movements.length)) {
            window.alert("No item to undo")
        }
        else {
            canvas.remove(arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].objectHistory[
                arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].objectHistory.length - 1])

            arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].objectHistory.pop()
            arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].movements.pop()

            if (arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].movements.length > 0) {
                arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].lastY = checkHalfVertical(
                    arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].movements[
                        arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].movements.length - 1
                    ].y
                )
            }
        }
    }

    /** Create a new rally in the state variable arrayOfRallies
     * @updates {currentActiveIndex, arrayOfRallies}
     * @returns none
     * @problems previous state is reflected and does not ppend the current user inputed rally.
     * Cannot find `shots` attribute in the newly created rally @resolved
     */

    function addRally() {
        let x = arrayOfRallies.current.rallies.length;
        if (x === undefined) {
            x = 0;
        }

        arrayOfRallies.current.rallies.push({
            name: rallyOrFootworkName.current.value,
            shots: [],
            lastY: -1,
            color: randomColor({ luminosity: 'dark', }),
            objectHistory: [],
            lastActiveAnimation: -1,
            lastActiveAnimationRef: null,
        });

        arrayOfRallies.current.currentActiveIndex = x;
        forceUpdate();
        constructRally();
    }

    /**
     * Create a new footwork in the state variable arrayOfFootwork.currents
     * @updates {currentActiveIndexFootwork, numFootworks, arrayOfFootwork.currents}
     * @returns none
     * @problems previous state is reflected and does not ppend the current user inputed footwork. Cannot find `movements` attribute in the newly created footwork
     */
    function addFootwork() {
        let x = arrayOfFootwork.current.footworks.length;
        if (x === undefined) {
            x = 0;
        }

        arrayOfFootwork.current.footworks.push({
            name: rallyOrFootworkName.current.value,
            movements: [],
            lastY: -1,
            color: randomColor({ luminosity: 'dark', }),
            objectHistory: [],
            lastActiveAnimation: -1,
            lastActiveAnimationRef: null,
        });
        arrayOfFootwork.current.currentActiveIndex = x;
        forceUpdate();
        constructFootwork();
    }

    /**
     * Create a function that draws a line from 2 points of a generated rally
     * After drawing a rally, it waits for 1 second
     * Then it returns
     * @returns None
     */

    const drawOneRallyLine = (img) => {
        let lastActiveAnimation =
            arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
                .lastActiveAnimation;
        if (lastActiveAnimation === -1) {
            lastActiveAnimation = 0;
        } else if (
            lastActiveAnimation ===
            arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
                .shots.length -
            1
        ) {
            lastActiveAnimation = 0;
            return;

        }

        if (runFlag.current) {
            let angle =
                (Math.atan2(
                    arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots[lastActiveAnimation].y -
                    arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots[lastActiveAnimation + 1].y,
                    arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots[lastActiveAnimation].x -
                    arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots[lastActiveAnimation + 1].x
                ) *
                    180) /
                Math.PI +
                90;

            let YVal = checkHalfVertical(arrayOfRallies.current.rallies[
                arrayOfRallies.current.currentActiveIndex
            ].shots[lastActiveAnimation].y)

            console.log(YVal, " : UO : ", lastActiveAnimation)
            if (YVal === 1) {
                img.set({
                    left: arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots[lastActiveAnimation].x,
                    top: arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots[lastActiveAnimation].y,
                    angle: angle,
                });
                img.animate(
                    {
                        left: arrayOfRallies.current.rallies[
                            arrayOfRallies.current.currentActiveIndex
                        ].shots[lastActiveAnimation + 1].x,
                        top: arrayOfRallies.current.rallies[
                            arrayOfRallies.current.currentActiveIndex
                        ].shots[lastActiveAnimation + 1].y,
                    },
                    {
                        duration: 1000,
                        onChange: canvas.renderAll.bind(canvas),
                        onComplete: () => {
                            console.log(
                                lastActiveAnimation,
                                " : ",
                                arrayOfRallies.current.rallies[
                                    arrayOfRallies.current.currentActiveIndex
                                ].shots.length - 2
                            );
                            if (
                                lastActiveAnimation ===
                                arrayOfRallies.current.rallies[
                                    arrayOfRallies.current.currentActiveIndex
                                ].shots.length -
                                2
                            ) {
                                shuttleAnimationObject.current = null;
                                canvas.remove(img);
                                runFlag.current = false
                                forceUpdate()
                            }
                        },
                    }
                );
            }
            else {
                img.set({
                    left: arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots[lastActiveAnimation].x,
                    top: arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].shots[lastActiveAnimation].y,
                    angle: angle,
                });
                img.animate(
                    {
                        left: arrayOfRallies.current.rallies[
                            arrayOfRallies.current.currentActiveIndex
                        ].shots[lastActiveAnimation + 1].x,
                        top: arrayOfRallies.current.rallies[
                            arrayOfRallies.current.currentActiveIndex
                        ].shots[lastActiveAnimation + 1].y,
                    },
                    {
                        duration: 1000,
                        onChange: canvas.renderAll.bind(canvas),
                        onComplete: () => {
                            console.log(
                                lastActiveAnimation,
                                " : ",
                                arrayOfRallies.current.rallies[
                                    arrayOfRallies.current.currentActiveIndex
                                ].shots.length - 2
                            );
                            if (
                                lastActiveAnimation ===
                                arrayOfRallies.current.rallies[
                                    arrayOfRallies.current.currentActiveIndex
                                ].shots.length -
                                2
                            ) {
                                shuttleAnimationObject.current = null;
                                canvas.remove(img);
                                runFlag.current = false
                                forceUpdate()

                            }
                        },
                    }
                );
            }
            arrayOfRallies.current.rallies[
                arrayOfRallies.current.currentActiveIndex
            ].lastActiveAnimation = lastActiveAnimation + 1;
        }
    };

    /**
     * @repeat drawOneRallyLine() for current array
     * @returns None
     */

    const runCurrentShuttleAnimation = () => {
        if (arrayOfRallies.current.rallies[
            arrayOfRallies.current.currentActiveIndex
        ] === undefined) {
            window.alert("Please add rally positions to run simulation");
            return
        }
        if (
            isNaN(
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].shots.length
            ) ||
            arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
                .shots.length <= 0
        ) {
            window.alert("Please add rally positions to run simulation");
            console.log(
                arrayOfRallies.current.rallies[
                arrayOfRallies.current.currentActiveIndex
                ],
                arrayOfRallies.current.currentActiveIndex
            );
            return;
        } else if (
            arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
                .shots.length === 1
        ) {
            window.alert(
                "Only 1 shot has been added, please add more than 1"
            );
            return;
        }

        new fabric.Image.fromURL(Shuttle, (img) => {
            if (shuttleAnimationObject.current === null) {
                shuttleAnimationObject.current = img;
                canvas.add(shuttleAnimationObject.current);
                shuttleAnimationObject.current.scaleToWidth(40);
            }

            if (
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].lastActiveAnimation ===
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].shots.length -
                1
            ) {
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].lastActiveAnimation = 0;
            }

            if (runFlag.current === false) {
                runFlag.current = true
            }

            for (
                let i =
                    arrayOfRallies.current.rallies[
                        arrayOfRallies.current.currentActiveIndex
                    ].lastActiveAnimation,
                waitFlag = 0;
                i <
                arrayOfRallies.current.rallies[
                    arrayOfRallies.current.currentActiveIndex
                ].shots.length -
                1;
                i++
            ) {
                forceUpdate()

                if (i === -1) {
                    continue;
                }
                console.log(i);
                setTimeout(() => {
                    drawOneRallyLine(shuttleAnimationObject.current);
                }, waitFlag * 1000);
                waitFlag++;
            }
        });
    };

    /**
     * Create a function that draws a line from 2 points of a generated footwork
     * After drawing a footwork movement, it returns call to
     * @function runCurrentFootworkAnimation
     * @returns None
     */

    const drawOneFootworkLine = (img) => {
        let lastActiveAnimation =
            arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex]
                .lastActiveAnimation;
        if (lastActiveAnimation === -1) {
            lastActiveAnimation = 0;
        } else if (
            lastActiveAnimation ===
            arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex]
                .movements.length -
            1
        ) {
            lastActiveAnimation = 0;
            return;

        }

        if (runFlag.current) {
            let angle
            if (checkHalfVertical(arrayOfFootwork.current.footworks[
                arrayOfFootwork.current.currentActiveIndex
            ].movements[lastActiveAnimation].y) === 1) {
                angle = 180
            } else {
                angle = 0
            }
            let YVal = checkHalfVertical(arrayOfFootwork.current.footworks[
                arrayOfFootwork.current.currentActiveIndex
            ].movements[lastActiveAnimation].y)

            if (YVal === 1) {

                img.set({
                    left: arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].movements[lastActiveAnimation].x + 30,
                    top: arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].movements[lastActiveAnimation].y + 20,
                    angle: angle,
                });
                img.animate(
                    {
                        left: arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].movements[lastActiveAnimation + 1].x + 30,
                        top: arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].movements[lastActiveAnimation + 1].y + 20,
                    },
                    {
                        duration: 2000,
                        onChange: canvas.renderAll.bind(canvas),
                        onComplete: () => {
                            console.log(
                                lastActiveAnimation,
                                " : ",
                                arrayOfFootwork.current.footworks[
                                    arrayOfFootwork.current.currentActiveIndex
                                ].movements.length - 2
                            );
                            if (
                                lastActiveAnimation ===
                                arrayOfFootwork.current.footworks[
                                    arrayOfFootwork.current.currentActiveIndex
                                ].movements.length -
                                2
                            ) {
                                rightFootworkAnimationObject.current = null;
                                canvas.remove(img);
                                runFlag.current = false
                                forceUpdate()
                            }
                        },
                    }
                );
            }
            else {
                img.set({
                    left: arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].movements[lastActiveAnimation].x - 30,
                    top: arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].movements[lastActiveAnimation].y - 20,
                    angle: angle,
                });
                img.animate(
                    {
                        left: arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].movements[lastActiveAnimation + 1].x - 30,
                        top: arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].movements[lastActiveAnimation + 1].y - 20,
                    },
                    {
                        duration: 2000,
                        onChange: canvas.renderAll.bind(canvas),
                        onComplete: () => {
                            console.log(
                                lastActiveAnimation,
                                " : ",
                                arrayOfFootwork.current.footworks[
                                    arrayOfFootwork.current.currentActiveIndex
                                ].movements.length - 2
                            );
                            if (
                                lastActiveAnimation ===
                                arrayOfFootwork.current.footworks[
                                    arrayOfFootwork.current.currentActiveIndex
                                ].movements.length -
                                2
                            ) {
                                rightFootworkAnimationObject.current = null;
                                canvas.remove(img);
                                runFlag.current = false
                                forceUpdate()
                            }
                        },
                    }
                );
            }

            arrayOfFootwork.current.footworks[
                arrayOfFootwork.current.currentActiveIndex
            ].lastActiveAnimation = lastActiveAnimation + 1;
        }
    };

    /**
     * @repeat drawOneFoorworkLine() for current array
     * @returns None
     */

    const runCurrentFootworkAnimation = () => {
        if (arrayOfFootwork.current.footworks[
            arrayOfFootwork.current.currentActiveIndex
        ] === undefined) {
            window.alert("Please add footwork positions to run simulation");
            return
        }
        if (
            isNaN(
                arrayOfFootwork.current.footworks[
                    arrayOfFootwork.current.currentActiveIndex
                ].movements.length
            ) ||
            arrayOfFootwork.current.footworks[
                arrayOfFootwork.current.currentActiveIndex
            ].movements.length <= 0
        ) {
            window.alert("Please add footwork positions to run simulation");
            console.log(
                arrayOfFootwork.current.footworks[
                arrayOfFootwork.current.currentActiveIndex
                ],
                arrayOfFootwork.current.currentActiveIndex
            );
            return;
        } else if (
            arrayOfFootwork.current.footworks[
                arrayOfFootwork.current.currentActiveIndex
            ].movements.length === 1
        ) {
            window.alert(
                "Only 1 footwork has been added, please add more than 1"
            );
            return;
        }

        if (runFlag.current === false) {
            runFlag.current = true
        }

        new fabric.Image.fromURL(RightBoot, (right) => {
            new fabric.Image.fromURL(LeftBoot, (left) => {
                if (rightFootworkAnimationObject.current === null || leftFootworkAnimationObject.current === null) {
                    rightFootworkAnimationObject.current = right;
                    leftFootworkAnimationObject.current = left;
                    rightFootworkAnimationObject.current.set({
                        right: 30, selectable: true
                    })
                    rightFootworkAnimationObject.current.scaleToWidth(40)
                    leftFootworkAnimationObject.current.set({
                        left: -30, selectable: true
                    })
                    rightFootworkAnimationObject.current.scaleToWidth(40)
                    leftFootworkAnimationObject.current.scaleToWidth(40)

                    footworkAnimationObject.current = new fabric.Group([left, right])

                    footworkAnimationObject.current.add(rightFootworkAnimationObject.current);
                    footworkAnimationObject.current.add(leftFootworkAnimationObject.current);
                    // footworkAnimationObject.current.scaleToWidth(40)
                    canvas.add(footworkAnimationObject.current)
                }

                if (
                    arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].lastActiveAnimation ===
                    arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].movements.length -
                    1
                ) {
                    arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].lastActiveAnimation = 0;
                }

                for (
                    let i =
                        arrayOfFootwork.current.footworks[
                            arrayOfFootwork.current.currentActiveIndex
                        ].lastActiveAnimation,
                    waitFlag = 0;
                    i <
                    arrayOfFootwork.current.footworks[
                        arrayOfFootwork.current.currentActiveIndex
                    ].movements.length -
                    1;
                    i++
                ) {
                    forceUpdate()
                    if (i === -1) {
                        continue;
                    }
                    console.log(waitFlag);
                    setTimeout(() => {
                        drawOneFootworkLine(footworkAnimationObject.current);
                    }, waitFlag * 2000);
                    waitFlag++;
                }
            });
            forceUpdate()
        })
    };

    /**
     * Displays the current number of rallies or footworks placed on the canvas by the user
     * @returns the chakra.div for displaying the rallies and footworks
     * @function {addRally, addFunction}
     */

    const setSimulationMenu = () => {
        let ralliesOrFootwork = null;
        let l = null;
        if (mode === "Rally") {
            l = arrayOfRallies.current.rallies;
            if (l === undefined) {
                l = [];
            }
            ralliesOrFootwork = "Rallies";
        } else if (mode === "Footwork") {
            l = arrayOfFootwork.current.footworks;
            if (l === undefined) {
                l = [];
            }
            ralliesOrFootwork = "Footworks";
        } else {
            l = [];
            ralliesOrFootwork = "Select Simulation";
        }
        console.log("Currently Rendering : ", l, arrayOfFootwork.current.currentActiveIndex);
        return (
            <chakra.div w={"100%"} m={1} overflow='auto'>
                <Center w="100%">
                    <VStack w="100%">
                        <Text fontSize={"2xl"}>{ralliesOrFootwork}</Text>
                        <Flex as="p" fontSize={"2xl"} mb={"1vh"}>
                            {mode === "Rally" ? (
                                <Checkbox
                                    isChecked={showAllRallies.current}
                                    onChange={(e) => {
                                        showAllRallies.current = e.target.checked;
                                        forceUpdate();
                                        constructRally();
                                    }}
                                >
                                    Show All
                                </Checkbox>
                            ) : null}
                        </Flex>
                        <Flex as="p" fontSize={"2xl"} mb={"1vh"}>
                            {mode === "Footwork" ? (
                                <Checkbox
                                    isChecked={showAllFootworks.current}
                                    onChange={(e) => {
                                        showAllFootworks.current = e.target.checked;
                                        forceUpdate();
                                        console.log("Called Footwork Now");
                                        constructFootwork();
                                    }}
                                >
                                    Show All
                                </Checkbox>
                            ) : null}
                        </Flex>
                    </VStack>
                </Center>

                <chakra.div overflowY="auto">
                    <OrderedList justifyContent="center" alignItems="left" spacing="1">
                        {l.map((i, index) => (
                            <ListItem key={index}>
                                <Grid templateColumns="repeat(4, 1fr)" gap={1}>
                                    <GridItem colSpan={3}>
                                        <Input
                                            aria-colspan={8}
                                            w={"100%"}
                                            onClick={() => {
                                                if (mode === "Rally") {
                                                    arrayOfRallies.current.currentActiveIndex = index;
                                                    clearMouseListeners();
                                                    constructRally();
                                                } else if (mode === "Footwork") {
                                                    arrayOfFootwork.current.currentActiveIndex = index;
                                                    clearMouseListeners();
                                                    constructFootwork();
                                                }
                                            }}
                                            value={i.name}
                                            _hover={() => { }}
                                            border={"solid"}
                                            fill={i.color}
                                            focusBorderColor={i.color}
                                            borderColor={i.color}
                                            defaultValue={i.name}
                                            onChange={(e) => {
                                                if (e.target.value === "") {
                                                    e.target.placeholder = "Enter some value";
                                                    forceUpdate();
                                                    return;
                                                }
                                                if (mode === "Rally") {
                                                    arrayOfRallies.current.rallies[
                                                        arrayOfRallies.current.currentActiveIndex
                                                    ].name = e.target.value;
                                                } else if (mode === "Footwork") {
                                                    arrayOfFootwork.current.footworks[
                                                        arrayOfFootwork.current.currentActiveIndex
                                                    ].name = e.target.value;
                                                }
                                                forceUpdate();
                                            }}
                                        />
                                    </GridItem>
                                    <GridItem colSpan={1}>
                                        <Text
                                            fontSize={"3xl"}
                                            as="button"
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        "Do you really want to delete this item"
                                                    )
                                                ) {
                                                    if (mode === "Rally") {

                                                        // Handle Object History
                                                        if (showAllRallies.current || arrayOfRallies.current.currentActiveIndex === index) {
                                                            for (let i = 0; i < arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].objectHistory.length; i++) {
                                                                canvas.remove(arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].objectHistory[i])
                                                            }
                                                        }

                                                        // Handle Current Active Index
                                                        if (arrayOfRallies.current.rallies.length === 0) {
                                                            arrayOfRallies.current.currentActiveIndex = -1
                                                        }
                                                        else if (index === arrayOfRallies.current.rallies.length - 1) {
                                                            arrayOfRallies.current.currentActiveIndex = arrayOfRallies.current.rallies.length - 2
                                                        }
                                                        else {
                                                            arrayOfRallies.current.currentActiveIndex = index
                                                        }

                                                        arrayOfRallies.current.rallies.splice(index, 1);
                                                        forceUpdate();
                                                        constructRally()
                                                        return;
                                                    }
                                                    if (mode === "Footwork") {

                                                        // Handle Object History
                                                        if (showAllFootworks.current || arrayOfFootwork.current.currentActiveIndex === index) {
                                                            for (let i = 0; i < arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].objectHistory.length; i++) {
                                                                console.log("Deleting")
                                                                canvas.remove(arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].objectHistory[i])
                                                            }
                                                        }

                                                        // Handle Current Active Index
                                                        if (arrayOfFootwork.current.footworks.length === 0) {
                                                            arrayOfFootwork.current.currentActiveIndex = -1
                                                        }
                                                        else if (index === arrayOfFootwork.current.footworks.length - 1) {
                                                            arrayOfFootwork.current.currentActiveIndex = arrayOfFootwork.current.footworks.length - 2
                                                        }
                                                        else {
                                                            arrayOfFootwork.current.currentActiveIndex = index
                                                        }

                                                        console.log(showAllFootworks.current, arrayOfFootwork.current.currentActiveIndex)
                                                        arrayOfFootwork.current.footworks.splice(index, 1);
                                                        forceUpdate();
                                                        constructFootwork()
                                                        return;
                                                    }
                                                }
                                            }}
                                        >
                                            <MdDelete />
                                        </Text>
                                    </GridItem>
                                </Grid>
                            </ListItem>
                        ))}
                    </OrderedList>
                </chakra.div>
            </chakra.div>
        );
    };

    /**
     * Simulation Menu for Mobile Devices
     * Does everything the same setSimulationMenu() does but with tweaks for mobile devices
     * Displays the current number of rallies or footworks placed on the canvas by the user
     * @returns the chakra.div for displaying the rallies and footworks
     * @function {addRally, addFunction}
     */

    const setSimulationMenuForMobile = () => {
        let ralliesOrFootwork = null;
        let l = null;
        if (mode === "Rally") {
            l = arrayOfRallies.current.rallies;
            if (l === undefined) {
                l = [];
            }
            ralliesOrFootwork = "Rallies";
        } else if (mode === "Footwork") {
            l = arrayOfFootwork.current.footworks;
            if (l === undefined) {
                l = [];
            }
            ralliesOrFootwork = "Footworks";
        } else {
            l = [];
            ralliesOrFootwork = "Select Simulation";
        }
        console.log("Currently Rendering : ", l, arrayOfFootwork.current.currentActiveIndex);
        return (
            <chakra.div w={"100%"} overflow='auto'>
                <Center w="100%">
                    <VStack w="100%">
                        <Text fontSize={"2xl"}>{ralliesOrFootwork}</Text>
                        <Flex as="p" fontSize={"2xl"} mb={"1vh"}>
                            {mode === "Rally" ? (
                                <Checkbox
                                    isChecked={showAllRallies.current}
                                    onChange={(e) => {
                                        showAllRallies.current = e.target.checked;
                                        forceUpdate();
                                        constructRally();
                                    }}
                                >
                                    Show All
                                </Checkbox>
                            ) : null}
                        </Flex>
                        <Flex as="p" fontSize={"sm"}>
                            {mode === "Footwork" ? (
                                <Checkbox
                                    isChecked={showAllFootworks.current}
                                    onChange={(e) => {
                                        showAllFootworks.current = e.target.checked;
                                        forceUpdate();
                                        console.log("Called Footwork Now");
                                        constructFootwork();
                                    }}
                                >
                                    Show All
                                </Checkbox>
                            ) : null}
                        </Flex>
                    </VStack>
                </Center>

                <chakra.div overflowY="auto">
                    <OrderedList justifyContent="center" alignItems="left" spacing="1">
                        {l.map((i, index) => (
                            <ListItem key={index}>
                                <Grid templateColumns="repeat(4, 1fr)" gap={1}>
                                    <GridItem colSpan={3}>
                                        <Input
                                            aria-colspan={8}
                                            w={"100%"}
                                            onClick={() => {
                                                if (mode === "Rally") {
                                                    arrayOfRallies.current.currentActiveIndex = index;
                                                    clearMouseListeners();
                                                    constructRally();
                                                } else if (mode === "Footwork") {
                                                    arrayOfFootwork.current.currentActiveIndex = index;
                                                    clearMouseListeners();
                                                    constructFootwork();
                                                }
                                            }}
                                            value={i.name}
                                            _hover={() => { }}
                                            border={"solid"}
                                            fill={i.color}
                                            focusBorderColor={i.color}
                                            borderColor={i.color}
                                            defaultValue={i.name}
                                            onChange={(e) => {
                                                if (e.target.value === "") {
                                                    e.target.placeholder = "Enter some value";
                                                    forceUpdate();
                                                    return;
                                                }
                                                if (mode === "Rally") {
                                                    arrayOfRallies.current.rallies[
                                                        arrayOfRallies.current.currentActiveIndex
                                                    ].name = e.target.value;
                                                } else if (mode === "Footwork") {
                                                    arrayOfFootwork.current.footworks[
                                                        arrayOfFootwork.current.currentActiveIndex
                                                    ].name = e.target.value;
                                                }
                                                forceUpdate();
                                            }}
                                        />
                                    </GridItem>
                                    <GridItem colSpan={1}>
                                        <Text
                                            fontSize={"3xl"}
                                            as="button"
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        "Do you really want to delete this item"
                                                    )
                                                ) {
                                                    if (mode === "Rally") {

                                                        // Handle Object History
                                                        if (showAllRallies.current || arrayOfRallies.current.currentActiveIndex === index) {
                                                            for (let i = 0; i < arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].objectHistory.length; i++) {
                                                                canvas.remove(arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].objectHistory[i])
                                                            }
                                                        }

                                                        // Handle Current Active Index
                                                        if (arrayOfRallies.current.rallies.length === 0) {
                                                            arrayOfRallies.current.currentActiveIndex = -1
                                                        }
                                                        else if (index === arrayOfRallies.current.rallies.length - 1) {
                                                            arrayOfRallies.current.currentActiveIndex = arrayOfRallies.current.rallies.length - 2
                                                        }
                                                        else {
                                                            arrayOfRallies.current.currentActiveIndex = index
                                                        }

                                                        arrayOfRallies.current.rallies.splice(index, 1);
                                                        forceUpdate();
                                                        constructRally()
                                                        return;
                                                    }
                                                    if (mode === "Footwork") {

                                                        // Handle Object History
                                                        if (showAllFootworks.current || arrayOfFootwork.current.currentActiveIndex === index) {
                                                            for (let i = 0; i < arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].objectHistory.length; i++) {
                                                                console.log("Deleting")
                                                                canvas.remove(arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].objectHistory[i])
                                                            }
                                                        }

                                                        // Handle Current Active Index
                                                        if (arrayOfFootwork.current.footworks.length === 0) {
                                                            arrayOfFootwork.current.currentActiveIndex = -1
                                                        }
                                                        else if (index === arrayOfFootwork.current.footworks.length - 1) {
                                                            arrayOfFootwork.current.currentActiveIndex = arrayOfFootwork.current.footworks.length - 2
                                                        }
                                                        else {
                                                            arrayOfFootwork.current.currentActiveIndex = index
                                                        }

                                                        console.log(showAllFootworks.current, arrayOfFootwork.current.currentActiveIndex)
                                                        arrayOfFootwork.current.footworks.splice(index, 1);
                                                        forceUpdate();
                                                        constructFootwork()
                                                        return;
                                                    }
                                                }
                                            }}
                                        >
                                            <MdDelete />
                                        </Text>
                                    </GridItem>
                                </Grid>
                            </ListItem>
                        ))}
                    </OrderedList>
                </chakra.div>
            </chakra.div>
        );
    };

    /**
     * Menu for showing Simulation Modes
     */

    const simulationOptions = [
        {
            name: "Rally",
            icon: <GiShuttlecock />,
            func: constructRally,
        },
        {
            name: "Footwork",
            icon: <RiFootprintFill />,
            func: constructFootwork,
        },
    ];

    /**
     * Menu for showing operations that can be done on modes
     */

    const simulationOperations = [
        {
            name: "New",
            icon: <BsPlusCircle />,
            p: "Create",
            colorScheme: "blue",
            func: () => {
                if (mode === "Rally" || mode === "Footwork") {
                    onNameControlOpen();
                } else {
                    window.alert("Choose 1 of simulation operations");
                }
            },
        },
        {
            name: "Run",
            icon: <BiPlayCircle />,
            colorScheme: "green",
            p: "Run",
            func: () => {
                if (mode === "Rally") {
                    runCurrentShuttleAnimation();
                } else if (mode === "Footwork") {
                    runCurrentFootworkAnimation();
                }
            },
        },
        {
            name: "Pause",
            icon: <BiPauseCircle />,
            colorScheme: "yellow",
            p: "Pause",
            func: () => {
                runFlag.current = false
            },
        },
        {
            name: "Stop",
            icon: <BiStopCircle />,
            colorScheme: "red",
            p: "Stop",
            func: () => {
                runFlag.current = false
                if (mode === "Rally") {
                    arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex].lastActiveAnimation = 0
                } else if (mode === "Footwork") {
                    arrayOfFootwork.current.footworks[arrayOfFootwork.current.currentActiveIndex].lastActiveAnimation = 0
                }

            },
        },
        {
            name: "Undo",
            icon: <BiUndo />,
            colorScheme: "cyan",
            p: "Undo",
            func: () => {
                if (mode === "Rally") {
                    undoLastArraySimulation()
                } else if (mode === "Footwork") {
                    undoLastFootworkSimulation()
                }
            },
        },
    ];

    /**
     * Advanced operation modes
     */

    const advancedSimulationOperations = [
        {
            name: "Run All",
            icon: <BsPlayFill />,
            colorScheme: "teal",
            p: "Run All",
            func: () => { },
        },
        {
            name: "Pause All",
            icon: <BsPauseFill />,
            colorScheme: "whatsapp",
            p: "Pause All",
            func: () => { },
        },
    ];

    /**
     * left panel displays properties of selected object and can be dynamicaly changed
     */
    const leftPanel = [
        {
            name: "Fill",
            prop: "fill",
            type: "button"
        },
        {
            name: "Border",
            prop: "stroke",
            type: "button"
        },
        {
            name: "Border Width",
            prop: "strokeWidth",
            type: "number"
        },
    ];

    /**
     * Handle Property change in Pop over
     */

    const handleProperties = () => {
        return (
            leftPanel.map((obj, index) => {
                console.log(obj.type === 'button')
                return (
                    <Accordion allowToggle defaultIndex={[0]}>
                        <AccordionItem isDisabled={currentObject === null}>
                            <AccordionButton>
                                <Box flex='1' textAlign='left'>
                                    {obj.name}
                                </Box>
                            </AccordionButton>
                            <AccordionPanel>
                                <Box>
                                    {
                                        obj.type === 'button' ?
                                            handleButtonProps(obj) : null
                                    }
                                    {
                                        obj.type === 'number' ? handleNumberProps(obj) : null
                                    }
                                </Box>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>

                );
            })
        )
    }

    /**
     * Handle Button based Properties
     * of Object Properties
     */

    const handleButtonProps = (obj) => {
        const list = ["#d4edad", "#82cdcd", "#eedd82", "#82cda8", "#82a8cd", "#cd8282", "orange", "yellow", "red", "teal", "blue", "cyan", "purple", "pink"]
        return (
            list.map((item) => (
                <Button bg={item} value={item} m="1" borderRadius={'100%'} size='sm' onClick={
                    () => {
                        if (currentObject !== null) {
                            let property = obj.prop
                            currentObject.set(property, item)
                            currentObject.set({
                                selectable: true
                            })
                            canvas.renderAll()
                        }
                    }}> </Button>
            ))
        )
    }

    /**
     * Handle Number based Properties
     * of Object Properties
     */

    const handleNumberProps = (obj) => {
        let property = obj.prop
        return (
            <Slider aria-label="slider-ex-1" min={1} max={10} step={1} isDisabled={currentObject === null} defaultValue={1}
                onChangeEnd={(val) => {
                    console.log(val)
                    currentObject.set(property, val)
                    canvas.renderAll()
                }}>
                <SliderTrack>
                    <SliderFilledTrack bg='blue.400' />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        )
    }

    /**
     * Mode of Color as per colorModeValue
     */

    let currentBackgroundColor = useColorModeValue("white", "gray.800");
    let currentLineColor = useColorModeValue("gray.800", "white.200");

    return (
        <chakra.div mt={() => {
            if (isBrowser) {
                return "5vh"
            } else {
                return 0
            }
        }}>
            <Box display={() => {
                if (isMobile || isTablet) {
                    return "flex"
                } else {
                    return "none"
                }
            }} bg={useColorModeValue('red.400', 'red.700')}>
                <SimpleGrid columns={5} w='100%' py={2}>
                    <Button variant='ghost' onClick={onObjectsDrawerOpen} fontSize={'2xl'}><FaShapes /></Button>
                    <Button variant='ghost' onClick={onControlsDrawerOpen} fontSize={'2xl'}><RiRemoteControl2Line /></Button>
                    <Button variant='ghost' onClick={onSimulationControlsDrawerOpen} fontSize={'2xl'}><GiGears /></Button>
                    <Button variant='ghost' onClick={onSimulationListsDrawerOpen} fontSize={'2xl'}><IoIosListBox /></Button>
                    <Button variant='ghost' onClick={onPersonizationDrawerOpen} fontSize={'2xl'}><BiCustomize /></Button>

                </SimpleGrid>

                <Drawer isOpen={isObjectsDrawerOpen}
                    placement='bottom'
                    onClose={onObjectsDrawerClose}
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>
                            Objects
                        </DrawerHeader>
                        <DrawerBody>
                            <Grid templateColumns='repeat(7, 1fr)' w='100%'>
                                {objectsMenu.map((item, idx) => {
                                    return (
                                        <GridItem
                                            alignContent='start'
                                            w='100%'
                                            colSpan={7}
                                            variant="ghost"
                                            borderRadius={0}
                                            onClick={() => {
                                                onObjectsDrawerClose()
                                                item.func()
                                            }}
                                            color={currentLineColor}
                                            fontSize={"xl"}
                                            bg={
                                                mode === item.name
                                                    ? "blue.400"
                                                    : currentBackgroundColor
                                            }
                                            _hover={() => { }}
                                        >
                                            <Button variant='ghost' w='100%' justifyContent='flex-start' leftIcon={item.icon}>
                                                {item.name}
                                            </Button>
                                        </GridItem>
                                    );
                                })}
                            </Grid>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                <Drawer isOpen={isControlsDrawerOpen}
                    placement='bottom'
                    onClose={onControlsDrawerClose}
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>
                            Controls
                        </DrawerHeader>
                        <DrawerBody>
                            <Grid templateColumns='repeat(7, 1fr)' w='100%'>
                                {canvasControlMenu.map((item, idx) => {
                                    return (
                                        <GridItem
                                            alignContent='start'
                                            w='100%'
                                            colSpan={7}
                                            variant="ghost"
                                            borderRadius={0}
                                            onClick={() => {
                                                onControlsDrawerClose()
                                                item.func()
                                            }}
                                            color={currentLineColor}
                                            fontSize={"xl"}
                                            bg={
                                                mode === item.name
                                                    ? "blue.400"
                                                    : currentBackgroundColor
                                            }
                                            _hover={() => { }}
                                        >
                                            <Button variant='ghost' w='100%' justifyContent='flex-start' leftIcon={item.icon}>
                                                {item.name}
                                            </Button>
                                        </GridItem>
                                    );
                                })}
                            </Grid>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                <Drawer isOpen={isSimulationControlsDrawerOpen}
                    placement='bottom'
                    onClose={onSimulationControlsDrawerClose}
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>
                            Simulation Controls
                        </DrawerHeader>
                        <DrawerBody>
                            <Grid templateColumns='repeat(7, 1fr)' w='100%'>
                                {simulationOptions.map((item, idx) => {
                                    return (
                                        <GridItem
                                            alignContent='start'
                                            w='100%'
                                            colSpan={7}
                                            variant="ghost"
                                            borderRadius={0}
                                            onClick={() => {
                                                onSimulationControlsDrawerClose()
                                                item.func()
                                            }}
                                            color={currentLineColor}
                                            fontSize={"xl"}
                                            bg={
                                                mode === item.name
                                                    ? "blue.400"
                                                    : currentBackgroundColor
                                            }
                                            _hover={() => { }}
                                        >
                                            <Button variant='ghost' w='100%' justifyContent='flex-start' leftIcon={item.icon}>
                                                {item.name}
                                            </Button>
                                        </GridItem>
                                    );
                                })}
                                {simulationOperations.map((item, idx) => {
                                    return (
                                        <GridItem
                                            alignContent='start'
                                            w='100%'
                                            colSpan={7}
                                            variant="ghost"
                                            borderRadius={0}
                                            onClick={() => {
                                                onSimulationControlsDrawerClose()
                                                item.func()
                                            }}
                                            color={currentLineColor}
                                            fontSize={"xl"}
                                            bg={
                                                mode === item.name
                                                    ? "blue.400"
                                                    : currentBackgroundColor
                                            }
                                            _hover={() => { }}
                                        >
                                            <Button variant='ghost' w='100%' justifyContent='flex-start' leftIcon={item.icon}>
                                                {item.name}
                                            </Button>
                                        </GridItem>
                                    );
                                })}
                            </Grid>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                <Drawer isOpen={isSimulationListsDrawerOpen}
                    placement='bottom'
                    onClose={onSimulationListsDrawerClose}
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>
                            Simulation Lists
                        </DrawerHeader>
                        <DrawerBody>
                            <Grid templateColumns='repeat(7, 1fr)' w='100%'>
                                <GridItem colSpan={7}>
                                    {setSimulationMenuForMobile()}
                                </GridItem>
                            </Grid>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                <Drawer isOpen={isPersonizationDrawerOpen}
                    placement='bottom'
                    onClose={onPersonizationDrawerClose}
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>
                            Personalize
                        </DrawerHeader>
                        <DrawerBody>
                            <Grid templateColumns='repeat(7, 1fr)' w='100%'>
                                <GridItem colSpan={7} my={1}>
                                    <Input value={canvasTitle.current} onChange={(e) => {
                                        canvasTitle.current = e.target.value
                                        forceUpdate()
                                    }} />
                                </GridItem>
                            </Grid>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

            </Box>

            <Stack direction={["column", "row"]}>
                <Box h={dims.boxH} display={() => {
                    if (isBrowser) {
                        return "block"
                    } else {
                        return "none"
                    }
                }}>
                    <Box>
                        <SimpleGrid columns={1} overflowY="auto" overflow="hidden">
                            <Popover size='md' placement='right' colorScheme='cyan' arrowSize={20}>
                                <PopoverTrigger>
                                    <Button borderRadius={0}
                                        fontSize={"2xl"}
                                        w={"100%"}
                                        color={currentLineColor}
                                        bg={currentBackgroundColor}
                                        _hover={() => { }}><VscSymbolProperty /></Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader>Object Properties</PopoverHeader>
                                    <PopoverBody>{handleProperties()}</PopoverBody>
                                </PopoverContent>
                            </Popover>
                            {objectsMenu.map((item, idx) => {
                                return (
                                    <Box w={"100%"}>
                                        <Tooltip label={item.name} key={idx}>
                                            <Button
                                                variant="ghost"
                                                borderRadius={0}
                                                onClick={item.func}
                                                color={currentLineColor}
                                                fontSize={"xl"}
                                                bg={
                                                    mode === item.name
                                                        ? "blue.400"
                                                        : currentBackgroundColor
                                                }
                                                _hover={() => { }}
                                            >
                                                {item.icon}
                                            </Button>
                                        </Tooltip>
                                        {idx === 1 || idx === objectsMenu.length - 1 ? (
                                            <Divider
                                                my={5}
                                                w={"1%"}
                                            // borderColor="blue.400"
                                            // borderWidth="2px"
                                            />
                                        ) : null}
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                    <Box>
                        <SimpleGrid
                            columns={1}
                            overflowY="auto"
                            flexGrow={1}
                            overflow="hidden"
                        >
                            <Popover size='md' placement='right' colorScheme='cyan' arrowSize={20}>
                                <PopoverTrigger>
                                    <Button borderRadius={0}
                                        fontSize={"2xl"}
                                        w={"100%"}
                                        color={currentLineColor}
                                        bg={currentBackgroundColor}
                                        _hover={() => { }}><AiOutlineBgColors /></Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader>Change Court's Background Color</PopoverHeader>
                                    <PopoverBody>{selectCanvasBackground()}</PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </SimpleGrid>
                    </Box>
                    <Box>
                        <SimpleGrid
                            columns={1}
                            overflowY="auto"
                            flexGrow={1}
                            overflow="hidden"
                        >
                            {canvasControlMenu.map((item, idx) => {
                                return (
                                    <Box w={"100%"}>
                                        <Tooltip label={item.name} key={item}>
                                            <Button
                                                borderRadius={0}
                                                onClick={item.func}
                                                fontSize={"2xl"}
                                                w={"100%"}
                                                color={currentLineColor}
                                                bg={
                                                    mode === item.name
                                                        ? "blue.400"
                                                        : currentBackgroundColor
                                                }
                                                _hover={() => { }}
                                            >
                                                {item.icon}
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                </Box>

                <Box display={() => {
                    if (isBrowser) {
                        return "block"
                    } else {
                        return "none"
                    }
                }}>
                    <Box alignContent="center">
                        <SimpleGrid
                            flexGrow={1}
                            columns={1}
                            overflowY="auto"
                            overflow="hidden"
                        >
                            {simulationOptions.map((item, idx) => {
                                return (
                                    <Box w={"100%"} >
                                        <Tooltip label={item.name} key={idx}>
                                            <Button
                                                _hover={() => { }}
                                                borderRadius={0}
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
                                        {idx === simulationOptions.length - 1 ? (
                                            <Divider
                                                my={5}
                                                w={"1%"}
                                            // borderColor="blue.400"
                                            // borderWidth="2px"
                                            />
                                        ) : null}
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                    <Box>
                        <VStack flexGrow={1}>
                            <SimpleGrid columns={1} overflow="hidden">
                                {simulationOperations.map((item, idx) => {
                                    return (
                                        <Box w="100%" display={item.name === "Undo" && runFlag.current === true ? "none" : "flex"}>
                                            <Tooltip label={item.name} key={idx}>
                                                <Button
                                                    _hover={() => { }}
                                                    variant="ghost"
                                                    borderRadius={0}
                                                    onClick={item.func}
                                                    fontSize={"xl"}
                                                    w={"100%"}
                                                >
                                                    {item.icon}
                                                </Button>
                                            </Tooltip>
                                            {idx === simulationOperations.length - 1 ? (
                                                <Divider
                                                    my={5}
                                                    w={"1%"}
                                                // borderColor="blue.400"
                                                // borderWidth="2px"
                                                />
                                            ) : null}
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                            <SimpleGrid
                                w={"100%"}
                                columns={1}
                                maxH={"30vh"}
                                overflow="hidden"
                            >
                                {advancedSimulationOperations.map((item, idx) => {
                                    return (
                                        <Box

                                            w="100%"
                                            display={
                                                showAllFootworks.current || showAllRallies.current
                                                    ? "flex"
                                                    : "none"
                                            }
                                        >
                                            <Tooltip label={item.name} key={idx}>
                                                <Button
                                                    _hover={() => { }}
                                                    variant="ghost"
                                                    borderRadius={0}
                                                    onClick={item.func}
                                                    fontSize={"xl"}
                                                    w={"100%"}
                                                >
                                                    {item.icon}
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        </VStack>
                    </Box>
                </Box>

                <Box display={() => {
                    if (isBrowser) {
                        return "block"
                    } else {
                        return "none"
                    }
                }} w={"20vw"} m={"2vw"}>
                    <VStack w={'100%'}>
                        <Box mt={2} w={'100%'}>
                            <Input value={canvasTitle.current} onChange={(e) => {
                                canvasTitle.current = e.target.value
                                forceUpdate()
                            }}></Input>
                        </Box>
                        <Box mt={2} w={'100%'}>
                            {setSimulationMenu()}
                        </Box>
                    </VStack>
                </Box>

                <Box
                    border='solid'
                    borderWidth='2px'
                    w={() => {
                        if (isMobile || isTablet) {
                            return "100vw"
                        } else {
                            return "60vw"
                        }
                    }}
                    minW={"60vw"}
                    h={"90vh"}
                    ref={boxDiv}
                >
                    <canvas id="canvas"></canvas>
                </Box>

            </Stack>

            {/* Modal to take the user input for naming the rally or footwork */}
            <Modal
                isOpen={isNameControlOpen && (mode === "Rally" || mode === "Footwork")}
                onClose={onNameControlClose}
                size={'xs'}

            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {mode === "Rally" ? "Set Rally Name" : "Set Footwork Name"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input
                            autoFocus
                            placeholder={mode === "Rally" ? "Rally Name" : "Footwork Name"}
                            ref={rallyOrFootworkName}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="red" mx="3" onClick={onNameControlClose}>
                            Close
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={mode === "Rally" ? addRally : addFootwork}
                            onMouseUp={onNameControlClose}
                        >
                            Set Name
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal for saving canvas */}
            <Modal
                isOpen={isSaveCanvasOpen}
                onClose={onSaveCanvasClose}
                size={'xs'}

            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Save Canvas Settings
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input value={canvasTitle.current} onChange={(e) => {
                            canvasTitle.current = e.target.value
                            saveSettings.current.name = e.target.value
                            forceUpdate()
                        }} />
                        <Checkbox mt={3} onChange={(e) => {
                            saveSettings.current.keepObjects = e.target.checked
                            forceUpdate()
                        }} >
                            Keep Rallies and footwork objects
                        </Checkbox>
                        <Text mt={3}>
                            Export As : 
                        </Text>
                        <Select onChange={(e) => {
                            saveSettings.current.exportAs = e.target.value
                        }}>
                            <option value='image/svg+xml;charset=utf-8'>
                                SVG
                            </option>
                            <option value='image/png'>
                                PNG
                            </option>
                            <option value='image/jpg'>
                                JPG
                            </option>
                        </Select>

                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="red" mx="3" onClick={onSaveCanvasClose}>
                            Close
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={saveCanvas}
                            onMouseUp={onNameControlClose}
                        >
                            Download
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            
        </chakra.div>
    );
}

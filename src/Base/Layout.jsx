import "./Layout.css";
import Court from "./baddy_crt.jpg";
// import Shuttle from './badminton_shuttle.png'
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
  Table,
  Thead,
  Tbody,
  VStack,
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
  Checkbox,
  Grid,
  GridItem,
} from "@chakra-ui/react";

import { fabric } from "fabric";

import {
  BiCircle,
  BiEdit,
  BiGridSmall,
  BiPointer,
  BiText,
  BiTrash,
  BsSquare,
  BsTriangle,
  GiMagnifyingGlass,
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
  GrClearOption,
  MdDelete,
} from "react-icons/all";

import { rallyColors, footworkColors } from "../Vars/Colors";

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

  // Variable to Keep Track of added Objects
  const canvasObjects = useRef([]);

  // Create a Mode Variable to Highlight which mode is active
  const [mode, setMode] = useState("Pointer");

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

  // Right Side Menu Reference
  const rightMenuRef = useRef(null);

  /**
   * Simulation Related State Variables
   */

  // Boolean value to show lines on click
  const [showRefLines, setShowRefLines] = useState(true);

  // Store references of lines that are drawn as reference lines
  const [refLineX, setRefLineX] = useState(null);
  const [refLineY, setRefLineY] = useState(null);

  // Array to store all shots played
  const arrayOfRallies = useRef({
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
  const arrayOfFootwork = useRef({
    currentActiveIndex: 0,
    footworks: [],
  });

  // Variable to keep track of show all rallies
  const showAllRallies = useRef(false);

  // Varaible to keep track of show all footworks
  const showAllFootworks = useRef(false);

  // Variable for dirty bit if update has not been forced on Right Menu
  const [rightMenuDirtyBit, setRightMenuDirtyBit] = useState(false);

  // Run animation flag
  const runFlag = useRef(false);

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
   * @listens rightMenuDirtyBit
   */
  useEffect(() => {
    if (rightMenuDirtyBit) {
      console.log("Resetted");
      setRightMenuDirtyBit(false);
    }
  }, [rightMenuDirtyBit]);

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
      name: "Delete",
      icon: <BiTrash />,
      func: deleteItem,
    },
    {
      name: "Clear History",
      icon: <GrClearOption />,
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
    if (gridLineRefs.length > 0) {
      for (let i = 0; i < gridLineRefs.length; i++) {
        canvas.remove(gridLineRefs[i]);
        console.log("removed", gridLineRefs[i]);
      }
    }
    setGridLineRefs([]);
    setGridlines({
      numColumns: numColumns,
      numRows: numRows,
    });

    let incrementValueX = (dims.boxW - 6) / numRows;
    let incrementValueY = (dims.boxH - 6) / numColumns;

    // Get Dimensions for each Grid Box

    // for (let i = 3; i <= dims.boxW; i = i + incrementValueX) {
    //     for (let j = 3; j <= dims.boxH; j = j + incrementValueY) {
    //         console.log(i, j, dims.boxW, dims.boxH)
    //     }
    // }

    console.log(gridLines.numColumns, gridLines.numRows);

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
          fill: rallyColors[
            arrayOfRallies.current.currentActiveIndex % rallyColors.length
          ],
          selectable: false,
          stroke:
            rallyColors[
              arrayOfRallies.current.currentActiveIndex % rallyColors.length
            ],
          strokeWidth: 1,
        });

        let p = new fabric.IText(
          arrayOfRallies.current.rallies[
            arrayOfRallies.current.currentActiveIndex
          ].shots.length + "",
          {
            fontFamily: "Quicksand",
            stroke:
              rallyColors[
                arrayOfRallies.current.currentActiveIndex % rallyColors.length
              ],
            left: currentX + 12,
            top: currentY,
            fontSize: 20,
            editable: false,
            selectable: false,
          }
        );

        canvas.add(p);
        canvas.add(circle);

        arrayOfRallies.current.rallies[
          arrayOfRallies.current.currentActiveIndex
        ].objectHistory.push(p);
        arrayOfRallies.current.rallies[
          arrayOfRallies.current.currentActiveIndex
        ].objectHistory.push(circle);

        // console.log("Last", rallyLastY, " Last Func : ", checkHalfVertical(currentY))
      }

      // Otherwise check in which half last Point was recorded
      else if (
        arrayOfRallies.current.rallies[
          arrayOfRallies.current.currentActiveIndex
        ].shots.length > 0
      ) {
        let currPointLocY = checkHalfVertical(currentY);
        // console.log("current ", currPointLocY)
        // console.log("Compare ", curshotArray.lengthrPointLocY, rallyLastY)

        if (
          currPointLocY ===
          arrayOfRallies.current.rallies[
            arrayOfRallies.current.currentActiveIndex
          ].lastY
        ) {
          // Do nothing, as selected point
          // is not on opposite vertical half
          // Invalid Point Selected
        } else {
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
            fill: rallyColors[
              arrayOfRallies.current.currentActiveIndex % rallyColors.length
            ],
            selectable: false,
            stroke:
              rallyColors[
                arrayOfRallies.current.currentActiveIndex % rallyColors.length
              ],
            strokeWidth: 1,
          });

          let p = new fabric.IText(
            arrayOfRallies.current.rallies[
              arrayOfRallies.current.currentActiveIndex
            ].shots.length + "",
            {
              fontFamily: "Quicksand",
              stroke:
                rallyColors[
                  arrayOfRallies.current.currentActiveIndex % rallyColors.length
                ],
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
              stroke:
                rallyColors[
                  arrayOfRallies.current.currentActiveIndex % rallyColors.length
                ],
              strokeWidth: 2,
              selectable: false,
            }
          );

          canvas.add(p);
          canvas.add(line);
          canvas.add(circle);

          arrayOfRallies.current.rallies[
            arrayOfRallies.current.currentActiveIndex
          ].objectHistory.push(p);
          arrayOfRallies.current.rallies[
            arrayOfRallies.current.currentActiveIndex
          ].objectHistory.push(line);
          arrayOfRallies.current.rallies[
            arrayOfRallies.current.currentActiveIndex
          ].objectHistory.push(circle);
        }
      }
    });
  };

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
          fill: footworkColors[
            arrayOfFootwork.current.currentActiveIndex % footworkColors.length
          ],
          selectable: false,
          stroke:
            footworkColors[
              arrayOfFootwork.current.currentActiveIndex % footworkColors.length
            ],
          strokeWidth: 1,
        });

        let p = new fabric.IText(
          arrayOfFootwork.current.footworks[
            arrayOfFootwork.current.currentActiveIndex
          ].movements.length + "",
          {
            fontFamily: "Quicksand",
            stroke:
              footworkColors[
                arrayOfFootwork.current.currentActiveIndex %
                  footworkColors.length
              ],
            left: currentX + 12,
            top: currentY,
            fontSize: 20,
            editable: false,
            selectable: false,
          }
        );

        canvas.add(p);
        canvas.add(rect);

        arrayOfFootwork.current.footworks[
          arrayOfFootwork.current.currentActiveIndex
        ].objectHistory.push(p);
        arrayOfFootwork.current.footworks[
          arrayOfFootwork.current.currentActiveIndex
        ].objectHistory.push(rect);

        // console.log("Last", rallyLastY, " Last Func : ", checkHalfVertical(currentY))
      }

      // Otherwise check in which half last Point was recorded
      else if (
        arrayOfFootwork.current.footworks[
          arrayOfFootwork.current.currentActiveIndex
        ].movements.length > 0
      ) {
        let currPointLocY = checkHalfVertical(currentY);
        // console.log("current ", currPointLocY)
        // console.log("Compare ", curshotArray.lengthrPointLocY, rallyLastY)

        if (
          !(
            currPointLocY ===
            arrayOfFootwork.current.footworks[
              arrayOfFootwork.current.currentActiveIndex
            ].lastY
          )
        ) {
          // Do nothing, as selected point
          // is on opposite vertical half
          // Invalid Point Selected
        } else {
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
            fill: footworkColors[
              arrayOfFootwork.current.currentActiveIndex % footworkColors.length
            ],
            selectable: false,
            stroke:
              footworkColors[
                arrayOfFootwork.current.currentActiveIndex %
                  footworkColors.length
              ],
            strokeWidth: 1,
          });

          let p = new fabric.IText(
            arrayOfFootwork.current.footworks[
              arrayOfFootwork.current.currentActiveIndex
            ].movements.length + "",
            {
              fontFamily: "Quicksand",
              stroke:
                footworkColors[
                  arrayOfFootwork.current.currentActiveIndex %
                    footworkColors.length
                ],
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
              stroke:
                footworkColors[
                  arrayOfFootwork.current.currentActiveIndex %
                    footworkColors.length
                ],
              strokeWidth: 2,
              selectable: false,
            }
          );

          canvas.add(p);
          canvas.add(line);
          canvas.add(rect);

          arrayOfFootwork.current.footworks[
            arrayOfFootwork.current.currentActiveIndex
          ].objectHistory.push(p);
          arrayOfFootwork.current.footworks[
            arrayOfFootwork.current.currentActiveIndex
          ].objectHistory.push(line);
          arrayOfFootwork.current.footworks[
            arrayOfFootwork.current.currentActiveIndex
          ].objectHistory.push(rect);
        }
      }
    });
  };

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
    console.log("ARLen" + x);

    arrayOfRallies.current.rallies.push({
      name: rallyOrFootworkName.current.value,
      shots: [],
      lastY: -1,
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
    console.log("FOLen" + x);

    arrayOfFootwork.current.footworks.push({
      name: rallyOrFootworkName.current.value,
      movements: [],
      lastY: -1,
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

  const drawOneRallyLine = (ctx) => {
    console.log("Called");
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
    }
    console.log("Called", lastActiveAnimation);
    ctx.moveTo(
      arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
        .shots[lastActiveAnimation].x,
      arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
        .shots[lastActiveAnimation].y
    );
    ctx.lineTo(
      arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
        .shots[lastActiveAnimation + 1].x,
      arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
        .shots[lastActiveAnimation + 1].y
    );
    ctx.stroke();
    lastActiveAnimation += 1;
    arrayOfRallies.current.rallies[
      arrayOfRallies.current.currentActiveIndex
    ].lastActiveAnimation = lastActiveAnimation;
  };

  /**
   * @repeat drawOneRallyLine() for current array
   * @returns None
   */

  const runCurrentAnimation = async () => {
    if (
      isNaN(
        arrayOfRallies.current.rallies[
          arrayOfRallies.current.currentActiveIndex
        ].shots.length
      ) ||
      arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
        .shots.length <= 0
    ) {
      window.alert("Please add rally/footwork positions to run simulation");
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
        "Only 1 shot/footwork has been added, please add more than 1"
      );
      return;
    }
    let ctx = canvas.getContext("2d");
    console.log(ctx);
    for (
      let i = 0;
      i <
      arrayOfRallies.current.rallies[arrayOfRallies.current.currentActiveIndex]
        .shots.length -
        1;
      i++
    ) {
      setTimeout(() => drawOneRallyLine(ctx), i*1000);
    }
  };

  /**
   * Displays the current number of rallies or footworks placed on the canvas by the user
   * @returns the chakra.div for displaying the rallies and footworks
   * @function {addRally, addFunction}
   */

  const setRightMenu = () => {
    let ralliesOrFootwork = null;
    let l = null;
    let colors = null;
    if (mode === "Rally") {
      l = arrayOfRallies.current.rallies;
      if (l === undefined) {
        l = [];
      }
      colors = rallyColors;
      ralliesOrFootwork = "Rallies";
    } else if (mode === "Footwork") {
      l = arrayOfFootwork.current.footworks;
      if (l === undefined) {
        l = [];
      }
      colors = footworkColors;
      ralliesOrFootwork = "Footworks";
    } else {
      l = [];
      ralliesOrFootwork = "Select Simulation";
    }
    console.log("Currently Rendering : ", l);
    return (
      <chakra.div w={"100%"} m={1}>
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
                  Show All Rallies on Court
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
                  Show All Footworks on Court
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
                      _hover={() => {}}
                      border={"solid"}
                      focusBorderColor={colors[index % colors.length]}
                      borderColor={colors[index % colors.length]}
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
                            arrayOfRallies.current.rallies.splice(index, 1);
                            console.log("Index : ", index);
                            forceUpdate();
                            console.log(rightMenuRef.current);
                            setRightMenuDirtyBit(true);
                            return;
                            // setRightMenu()
                          }
                          if (mode === "Footwork") {
                            arrayOfFootwork.current.footworks.splice(index, 1);
                            console.log("Index : ", index);
                            setRightMenuDirtyBit(true);
                            forceUpdate();

                            return;
                            // setRightMenu()
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
          onOpen();
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
      func: runCurrentAnimation,
    },
    {
      name: "Pause",
      icon: <BiPauseCircle />,
      colorScheme: "yellow",
      p: "Pause",
      func: () => {},
    },
    {
      name: "Stop",
      icon: <BiStopCircle />,
      colorScheme: "red",
      p: "Stop",
      func: () => {},
    },
    {
      name: "Reset",
      icon: <BiUndo />,
      colorScheme: "cyan",
      p: "Reset",
      func: () => {},
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
      func: () => {},
    },
    {
      name: "Pause All",
      icon: <BsPauseFill />,
      colorScheme: "whatsapp",
      p: "Pause All",
      func: () => {},
    },
  ];

  /**
   * left panel displays properties of selected object and can be dynamicaly changed
   */
  const leftPanel = [
    {
      name: "Fill",
      prop: "fill",
    },
    {
      name: "Border",
      prop: "stroke",
    },
    {
      name: "Border Width",
      prop: "strokeWidth",
    },
  ];

  /**
   * Mode of Color as per colorModeValue
   */

  let currentBackgroundColor = useColorModeValue("white", "gray.800");
  let currentLineColor = useColorModeValue("gray.800", "white.200");

  return (
    <chakra.div my={5}>
      <Stack direction={["column", "row"]}>
        <Box w={"5vw"} h={dims.boxH}>
          <Box display={["none", "flex"]}>
            <SimpleGrid columns={1} overflowY="auto" flexGrow={1}>
              {objectsMenu.map((item) => {
                return (
                  <Tooltip label={item.name}>
                    <Button
                      variant="ghost"
                      borderRadius={0}
                      px={"1vw"}
                      py={"3vh"}
                      onClick={item.func}
                      color={currentLineColor}
                      fontSize={"xl"}
                      bg={
                        mode === item.name ? "blue.400" : currentBackgroundColor
                      }
                      _hover={() => {}}
                    >
                      {item.icon}
                    </Button>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </Box>
          <Box h="35vh"></Box>
          <Box display={["none", "flex"]}>
            <SimpleGrid columns={1} overflowY="auto" flexGrow={1}>
              {canvasControlMenu.map((item) => {
                return (
                  <Tooltip label={item.name}>
                    <Button
                      borderRadius={0}
                      px={"0.2vw"}
                      py={"3vh"}
                      onClick={item.func}
                      fontSize={"md"}
                      w={"100%"}
                      color={currentLineColor}
                      bg={
                        mode === item.name ? "blue.400" : currentBackgroundColor
                      }
                      _hover={() => {}}
                    >
                      {item.icon}
                    </Button>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </Box>
        </Box>

        <Box w={"5vw"}>
          <Box display={["none", "flex"]}>
            <SimpleGrid columns={1} overflowY="auto" flexGrow={1}>
              {simulationRefs.map((item) => {
                return (
                  <Tooltip label={item.name}>
                    <Button
                      _hover={() => {}}
                      variant="ghost"
                      borderRadius={0}
                      px={"0.1vw"}
                      py={"3vh"}
                      onClick={item.func}
                      fontSize={"xl"}
                      w={"100%"}
                      color={currentLineColor}
                      bg={
                        mode === item.name ? "blue.400" : currentBackgroundColor
                      }
                    >
                      {item.icon}
                    </Button>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </Box>
          <Box display={["none", "flex"]} alignContent="center">
            <SimpleGrid flexGrow={1} columns={1} overflowY="auto">
              {simulationOptions.map((item) => {
                return (
                  <Tooltip label={item.name}>
                    <Button
                      _hover={() => {}}
                      borderRadius={0}
                      px={"0.2vw"}
                      py={"3vh"}
                      onClick={item.func}
                      fontSize={"xl"}
                      w={"100%"}
                      color={currentLineColor}
                      bg={
                        mode === item.name ? "blue.400" : currentBackgroundColor
                      }
                    >
                      {item.icon}
                    </Button>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </Box>
          <Box display={["none", "flex"]}>
            <VStack flexGrow={1}>
              <SimpleGrid columns={1} overflowY="auto">
                {simulationOperations.map((item) => {
                  return (
                    <Tooltip label={item.name}>
                      <Button
                        _hover={() => {}}
                        variant="ghost"
                        borderRadius={0}
                        py={"3vh"}
                        onClick={item.func}
                        fontSize={"xl"}
                        w={"100%"}
                      >
                        {item.icon}
                      </Button>
                    </Tooltip>
                  );
                })}
              </SimpleGrid>
              <SimpleGrid w={"100%"} columns={1} maxH={"30vh"} overflowY="auto">
                {advancedSimulationOperations.map((item) => {
                  return (
                    <Tooltip label={item.name}>
                      <Button
                        _hover={() => {}}
                        display={
                          showAllRallies.current || showAllFootworks.current
                            ? "flex"
                            : "none"
                        }
                        borderRadius={0}
                        variant="ghost"
                        py={"3vh"}
                        onClick={item.func}
                        fontSize={"xl"}
                        w={"100%"}
                      >
                        {item.icon}
                      </Button>
                    </Tooltip>
                  );
                })}
              </SimpleGrid>
            </VStack>
          </Box>
        </Box>

        <Box display={["none", "flex"]} w={"22vw"} ml={"2vw"}>
          <VStack align={"flex-start"}>
            <Table variant="simple" maxH={"10vh"} overflowY="auto" size="xsm">
              <Thead>
                <Tr>
                  <Td>{"Object"}</Td>
                  <Td>{"Properties"}</Td>
                </Tr>
              </Thead>
              <Tbody>
                {leftPanel.map((obj, index) => {
                  return (
                    <Tr key={index}>
                      <Td>
                        <Text>{obj.name}</Text>
                      </Td>
                      <Td>
                        <Input
                          disabled={currentObject == null ? true : false}
                          defaultValue={
                            currentObject == null
                              ? ""
                              : currentObject.get(obj.prop)
                          }
                          onChange={(e) => {
                            if (currentObject !== null) {
                              console.log(obj.prop, e.target.value);
                              let property = obj.prop;
                              let val = e.target.value;
                              if (val === "") {
                                return;
                              }
                              if (property === "strokeWidth") {
                                val = parseInt(val);
                              }
                              currentObject.set(property, val);
                              currentObject.set({
                                selectable: true,
                              });
                              canvas.renderAll();
                            }
                          }}
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <Box>
              <Input
                value={gridLines.numRows}
                type="number"
                name="x"
                size="md"
                mt={2}
                onChange={(e) => {
                  setGridlines((prevGridLines) => ({
                    ...prevGridLines,
                    numRows: parseInt(e.target.value),
                  }));
                }}
              />
              <Input
                value={gridLines.numColumns}
                type="number"
                name="y"
                size="md"
                mt={2}
                onChange={(e) => {
                  setGridlines((prevGridLines) => ({
                    ...prevGridLines,
                    numColumns: parseInt(e.target.value),
                  }));
                }}
              />
              <Button colorScheme="blue" mt={3} w={"100%"} onClick={showGrids}>
                Set Grid Lines
              </Button>
            </Box>
            <Button
              w={"100%"}
              colorScheme="red"
              onClick={() => {
                // Get all Objects and Remove them one by one
                let objects = canvas.getObjects();
                for (var i = 0; i < objects.length; i++) {
                  canvas.remove(objects[i]);
                }
                canvas.renderAll();

                // Remove everything from CanvasObjects array also
                canvasObjects.current = [];
              }}
            >
              Reload Canvas
            </Button>
            <Button
              w={"100%"}
              variant="outline"
              colorScheme="black"
              onClick={toggleColorMode}
            >
              Toggle to {colorMode === "light" ? "Dark" : "Light"} mode
            </Button>
          </VStack>
        </Box>

        <Box
          w={["100vw", "30vw", "30vw"]}
          minW={"30vw"}
          h={"95vh"}
          ref={boxDiv}
        >
          <canvas id="canvas"></canvas>
        </Box>

        <Box
          display={["none", "flex"]}
          w={"22vw"}
          mr={"2vw"}
          // onChange={setRightMenu}
          ref={rightMenuRef}
        >
          {setRightMenu()}
        </Box>
      </Stack>

      {/* Modal to take the user input for naming the rally or footwork */}
      <Modal
        isOpen={isOpen && (mode === "Rally" || mode === "Footwork")}
        onClose={onClose}
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

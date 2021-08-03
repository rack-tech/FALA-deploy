import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
    useParams
} from 'react-router-dom'
import Layout2D from '../2D/Layout'
import Layout3D from '../3D/Layout'
import ButtonComponent from './ButtonComponent'
import Court2D from '../assets/Badminton_Court.svg'
import FrontCourt3D from '../assets/3d_court.svg'
import FrontCourt3DFlat from '../assets/3d_court_colored_flat.svg'
import SideCourt3D from '../assets/Side_view.svg'
import SideCourt3DFlat from '../assets/Side_view_flat.svg'
import BasicDemoImg from "../templates/3D-templates/FrontCourt3D/Basic-Demonstration.svg"
import Templates from './templates'

import {
    SimpleGrid,
    Box,
    chakra,
    useColorModeValue,
    useColorMode,
    Flex,
    Spacer
} from '@chakra-ui/react'
import { BsSun, BsMoon } from 'react-icons/all'

export default function Dash() {
    const LayoutComponentPopulated = () => {
        const { templateMatcher } = useParams<{ templateMatcher: string }>()
        console.log("Template Matcher :", templateMatcher)
        return (
            <Layout3D flat={'Front'} loader={templateMapper[0].loader} />)
    }
    const mapper = [{
        img: null,
        content: {
            head: "Blank Canvas",
            body: "You can choose to do anything on the blank canvas, just like a blank piece of paper. Provides maximum customization"
        },
        path: "/blank",
        arg: ""
    }, {
        img: Court2D,
        content: {
            head: "2D Court",
            body: "2D Court is used for Potential Simulations and drill visualizations, it can help in many ways to understand positioning, movements "
                + "and rally construction"
        },
        path: "/2D",
        arg: ""
    },
    {
        img: FrontCourt3D,
        content: {
            head: "3D Front View",
            body: "Normal Broadcast Angle of Badminton, it helps to understand and visualize trajectories of hits as well as plan some drills as per convinience"
        },
        path: "/Front3D",
    },
    {
        img: FrontCourt3DFlat,
        content: {
            head: "3D Front View Flat",
            body: "Similar to Front 3D angle, but better for visualizations as a flatter preset means height and overall trajectory of shuttles and movements can be better visualized"
        },
        path: "/FrontFlat3D",
    },
    {
        img: SideCourt3D,
        content: {
            head: "3D Side View",
            body: "Sideways angle to look at court, along the sidelines, it is an intuitive way to visualize trajectories from the side, especially for upward shots"
        },
        path: "/Side3D"
    }, {
        img: SideCourt3DFlat,
        content: {
            head: "3D Side View Flat",
            body: "Similar to Side View, but a more flatter court for better visualizations, just like Front Court Flat view"
        },
        path: "SideFlat3D"
    }, {
        img: BasicDemoImg,
        content: {
            head: "Templates for FALA",
            body: "Some exciting readymade templates to use right away"
        },
        path: "Templates"
    }]
    const templateMapper = [{
        name: "basicDemo",
        img: BasicDemoImg,
        content: {
            head: "Basic Demo",
            body: "A basic demonstration on 3D court for a Cross Court Toss/Clear with animations"
        },
        path: "/x",
        loader: BasicDemoImg,
    }]
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <Router>
            { }
            <Flex display={'flex'} bg={useColorModeValue('red.500', 'red.500')} pl={2} h={10}>
                <chakra.div pt={1} as='text' fontSize={'2xl'} color={useColorModeValue('whiteAlpha.800', 'black')}>
                    Rack
                </chakra.div>
                <chakra.div pt={1} as='text' fontSize={'2xl'} color={useColorModeValue('black', 'whiteAlpha.800')}>
                    Tech
                </chakra.div>
                <Spacer />
                <Box alignContent="flex-end" fontSize={'xl'} onClick={toggleColorMode} as='button' p={2}>
                    {colorMode === "light" ? <BsMoon /> : <BsSun />}
                </Box>
            </Flex>
            <Switch>
                <Route path='/' exact>
                    <SimpleGrid columns={[1, 2, 3]}>
                        {mapper.map((item) => {
                            return (
                                <Link to={item.path}>
                                    <ButtonComponent img={item.img} content={item.content} />
                                </Link>
                            )
                        })}
                    </SimpleGrid>
                </Route>
                <Route path='/blank'>
                    <Layout3D/>
                </Route>
                <Route path='/2D'>
                    <Layout2D />
                </Route>
                <Route path='/Front3D'>
                    <Layout3D flat={"Front"} />
                </Route>
                <Route path='/FrontFlat3D'>
                    <Layout3D flat={"Front_Flat"} />
                </Route>
                <Route path='/Side3D'>
                    <Layout3D flat={"Side"} />
                </Route>
                <Route path='/SideFlat3D'>
                    <Layout3D flat={"Side_Flat"} />
                </Route>
                <Route path={'Front3D/:templateMatcher'}>
                    <LayoutComponentPopulated />
                </Route>
                <Route path='/Templates'>
                    <Templates />
                </Route>
            </Switch>
        </Router>
    )
}
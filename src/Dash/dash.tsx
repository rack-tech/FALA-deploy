import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
} from 'react-router-dom'
import Layout2D from '../2D/Layout'
import Layout3D from '../3D/Layout'
import ButtonComponent from './ButtonComponent'
import Court2D from '../assets/Badminton_Court.svg'
import FrontCourt3D from '../assets/3d_court.svg'
import FrontCourt3DFlat from '../assets/3d_court_colored_flat.svg'
import SideCourt3D from '../assets/Side_view.svg'
import SideCourt3DFlat from '../assets/Side_view_flat.svg'
import { SimpleGrid } from '@chakra-ui/react'

export default function Dash() {
    const mapper = [{
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
    }]
    return (
        <Router>
            <Switch>
                <Route path='/' exact>
                    <SimpleGrid columns={[1, 2, 3]} p={12}>
                        {mapper.map((item) => {
                            return (
                                <Link to={item.path}>
                                    <ButtonComponent img={item.img} content={item.content} />
                                </Link>
                            )
                        })}
                    </SimpleGrid>
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
            </Switch>
        </Router>
    )
}
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
import Court3D from '../assets/3d_court.svg'
import Court3DFlat from '../assets/3d_court_colored_flat.svg'
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
        img: Court3D,
        content: {
            head: "3D Court",
            body: "Normal Broadcast Angle of Badminton, it helps to understand and visualize trajectories of hits as well as plan some drills as per convinience"
        },
        path: "/3D",
        arg: false
    },
    {
        img: Court3DFlat,
        content: {
            head: "3D Court Flat",
            body: "Similar to 3D angle, but better for visualizations as a flatter preset means height and overall trajectory of shuttles and movements can be better visualized"
        },
        path: "/3DFlat",
        arg: true

    }]
    return (
        <Router>
            <Switch>
                <Route path='/' exact>

                    <SimpleGrid columns={5}>
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
                <Route path='/3D'>
                    <Layout3D flat={false} />
                </Route>
                <Route path='/3DFlat'>
                    <Layout3D flat={true} />
                </Route>
            </Switch>
        </Router>
    )
}
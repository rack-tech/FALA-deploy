import { Button } from '@chakra-ui/react'
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
} from 'react-router-dom'
import Layout2D from '../2D/Layout'
import Layout3D from '../3D/Layout'

export default function Dash() {
    return (
        <Router>
            <Switch>
                <Route path='/' exact>

                    <Link to='/2D'>
                        <Button>
                            Go To 2D Court
                        </Button>
                    </Link>
                    <Link to='/3D'>
                        <Button>
                            Go To 3D Court
                        </Button>
                    </Link>
                    <Link to='/3DFlat'>
                        <Button>
                            Go To 3D Flat Court
                        </Button>
                    </Link>
                </Route>
                <Route path='/2D'>
                    <Layout2D />
                </Route>
                <Route path='/3D'>
                    <Layout3D flat={false}/>
                </Route>
                <Route path='/3DFlat'>
                    <Layout3D flat={true}/>
                </Route>
            </Switch>
        </Router>
    )
}
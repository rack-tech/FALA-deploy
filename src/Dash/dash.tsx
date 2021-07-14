import { Button } from '@chakra-ui/react'
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
} from 'react-router-dom'
import Layout from '../Base/Layout'

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
                </Route>
                <Route path='/2D'>
                    <Layout />
                </Route>
            </Switch>
        </Router>
    )
}
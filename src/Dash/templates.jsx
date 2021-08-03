import {
    SimpleGrid,
} from '@chakra-ui/react'

import {
    Link,
} from 'react-router-dom'

// import Layout3D from '../3D/Layout'
import ButtonComponent from './ButtonComponent'
// import BasicDemo from '../templates/3D-templates/FrontCourt3D/BasicDemo'
import BasicDemoImg from '../templates/3D-templates/FrontCourt3D/Basic-Demonstration.svg'


export default function Templates() {
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
    return (
        <>
            <SimpleGrid columns={[1, 2, 3]}>
                {templateMapper.map((item) => {
                    return (
                        <>
                            <Link to={'/Front3D/:' + item.name}>
                                <ButtonComponent img={item.img} content={item.content} />
                            </Link>
                        </>
                        //             {/* <Route path='/2D' >
                        //             <Layout2D loader={item.loader}/>
                        //         </Route> */}
                        // {/* <Route path='/FrontFlat3D'>
                        //             <Layout3D flat={"Front_Flat"} loader={item.loader}/>
                        //         </Route>
                        //         <Route path='/Side3D'>
                        //             <Layout3D flat={"Side"} loader={item.loader}/>
                        //         </Route>
                        //         <Route path='/SideFlat3D'>
                        //             <Layout3D flat={"Side_Flat"} loader={item.loader}/>
                        //         </Route> */}
                    )
                })}
            </SimpleGrid>
        </>
    )
}
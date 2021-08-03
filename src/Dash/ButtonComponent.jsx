import {
    Box,
    Center,
    Heading,
    Text,
    Stack,
    Image,
} from '@chakra-ui/react';

import { isTablet } from 'react-device-detect';


export default function ButtonComponent(props) {
    console.log(props.content.head === "2D Court")
    return (
        <Center py={12}>
            <Stack align={'center'}>
                <Box
                    role={'group'}
                    p={4}
                    maxW={'90%'}
                    minH={() => {
                        if (isTablet) {
                            return '70vh'
                        } else {
                            return '50vh'
                        }
                    }}
                    // overflow='scroll'
                    w={'full'}
                    bg={'whiteAlpha.800'}
                    boxShadow={'xl'}
                    border='1px'
                    rounded={'lg'}
                    pos={'relative'}
                    zIndex={1}>
                        <Center>
                    <Heading fontSize={'2xl'} fontFamily={'body'} fontWeight={500} color='black'>
                        {props.content.head}
                    </Heading>
                    </Center>
                    <Box
                        // rounded={'lg'}
                        pos={'relative'}
                        height={'200px'}
                        _after={{
                            transition: 'all .3s ease',
                            content: '""',
                            w: 'full',
                            h: 'full',
                            pos: 'absolute',
                            top: 5,
                            left: 0,
                            filter: 'blur(15px)',
                            zIndex: -1,
                        }}
                        _groupHover={{
                            _after: {
                                filter: 'blur(20px)',
                            },
                        }}>
                        <Image
                            height={'100%'}
                            width={'100%'}
                            objectFit={'contain'}
                            overflow={'initial'}
                            src={props.img}
                        />
                    </Box>

                    <Text pt={'4vh'} letterSpacing='tight' justifyContent='space-around' fontSize={'xl'} color={'black'}>
                        {props.content.body}
                    </Text>
                </Box>
            </Stack>
        </Center>
    );
}
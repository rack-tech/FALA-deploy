import {
    Box,
    Center,
    useColorModeValue,
    Heading,
    Text,
    Stack,
    Image,
} from '@chakra-ui/react';


export default function ButtonComponent(props) {
    return (
        <Center py={12}>
            <Box
                role={'group'}
                p={4}
                maxW={'90%'}
                w={'full'}
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow={'xl'}
                border='1px'
                rounded={'lg'}
                pos={'relative'}
                zIndex={1}>
                <Box
                    rounded={'lg'}
                    pos={'relative'}
                    height={'230px'}
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
                        rounded={'lg'}
                        height={'100%'}
                        width={'100%'}
                        objectFit={'contain'}
                        overflow={'initial'}
                        src={props.img}
                    />
                </Box>
                <Stack pt={10} align={'center'}>
                    <Heading fontSize={'2xl'} fontFamily={'body'} fontWeight={500}>
                        {props.content.head}
                    </Heading>
                    <Text letterSpacing='tight' justifyContent='space-around' fontSize={'xl'}>
                        {props.content.body}
                    </Text>
                </Stack>
            </Box>
        </Center>
    );
}
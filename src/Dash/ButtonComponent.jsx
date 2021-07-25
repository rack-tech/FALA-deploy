import {
    Box,
    Center,
    Heading,
    Text,
    Stack,
    Image,
} from '@chakra-ui/react';


export default function ButtonComponent(props) {
    return (
        <Center py={12}>
            <Stack align={'center'}>
                <Box
                    role={'group'}
                    p={4}
                    maxW={'90%'}
                    minH={'50vh'}
                    // overflow='scroll'
                    w={'full'}
                    bg={'whiteAlpha.400'}
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
                            rounded={'lg'}
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
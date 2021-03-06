import { Box, Flex, Heading, Divider, VStack, SimpleGrid, HStack, Button } from "@chakra-ui/react";
import { Input } from "../../components/Form/Input";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import Link from "next/link";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { api } from "../../services/api";
import { useRouter } from 'next/dist/client/router';
import { queryClient } from '../../services/queryClient';

type CreateUserFormData = {
    email: string;
    name: string;
    password: string;
    password_confirmation: string;
};

const CreateUserFormSchema = yup.object({
    name: yup.string().required("Nome obrigatório"),
    email: yup.string().email("E-mail inválido").required("E-mail obrigatório"),
    password: yup.string().required("Senha obrigatória").min(6, "A senha deve ter no mínimo 6 caracteres"),
    password_confirmation: yup.string().oneOf([null, yup.ref("password")], "As senhas precisam ser iguais"),
});

export default function CreateUser() {
const router = useRouter();

    const createUser = useMutation(async (user: CreateUserFormData) => {
        const response = await api.post("users", {
            user: {
                ...user,
                created_at: new Date(),
            },
        });

        return response.data.user;
    }, {onSuccess:()=>{
        queryClient.invalidateQueries(["users"])
    }});

    const { register, handleSubmit, formState } = useForm({ resolver: yupResolver(CreateUserFormSchema) });

    const { errors } = formState;

    const handleCreateUser: SubmitHandler<CreateUserFormData> = async (values) => {
        await createUser.mutateAsync(values);
        router.push("/users")
    };

    return (
        <Box>
            <Header></Header>
            <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
                <Sidebar></Sidebar>
                <Box
                    as="form"
                    onSubmit={handleSubmit(handleCreateUser)}
                    flex="1"
                    borderRadius={8}
                    bgColor="gray.800"
                    p={["6", "8"]}>
                    <Heading size="lg" fontWeight="normal">
                        Criar usuário
                    </Heading>
                    <Divider my="6" borderColor="gray.700" />
                    <VStack spacing="8">
                        <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
                            <Input error={errors.name} {...register("name")} name="name" label="Nome completo"></Input>
                            <Input
                                error={errors.email}
                                {...register("email")}
                                name="email"
                                type="email"
                                label="E-mail"></Input>
                        </SimpleGrid>
                        <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
                            <Input
                                error={errors.password}
                                {...register("password")}
                                name="password"
                                type="password"
                                label="Senha"></Input>
                            <Input
                                error={errors.password_confirmation}
                                {...register("password_confirmation")}
                                name="password_confirmation"
                                type="password"
                                label="Confirmação de senha"></Input>
                        </SimpleGrid>
                    </VStack>
                    <Flex mt="8" justify="flex-end">
                        <HStack spacing="4">
                            <Link href="/users" passHref>
                                <Button colorScheme="whiteAlpha">Cancelar</Button>
                            </Link>

                            <Button type="submit" colorScheme="pink" isLoading={formState.isSubmitting}>
                                Salvar
                            </Button>
                        </HStack>
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
}

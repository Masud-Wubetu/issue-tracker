'use client';

import { Box, Button, Callout, Card, Container, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage, Spinner } from '@/app/component';
import Link from 'next/link';
import { signIn } from 'next-auth/react';


const schema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email.').min(1, 'Email is required.'),
    password: z.string().min(5, 'Password must be at least 5 characters.'),
});

type RegisterForm = z.infer<typeof schema>;

const RegisterPage = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(schema)
    });
    const [error, setError] = useState('');
    const [isSubmitting, setSubmitting] = useState(false);

    const onSubmit = handleSubmit(async (data) => {

        try {
            setSubmitting(true);
            await axios.post('/api/register', data);
            
            // Automatically sign in the user after registration
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false
            });

            if (result?.error) {
                setError('Registration successful, but auto-login failed. Please sign in manually.');
                setSubmitting(false);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error: any) {
            setError(error.response?.data?.error || 'An unexpected error occurred.');
            setSubmitting(false);
        }
    });


    return (
        <Container size="1">
            <Box mt="9">
                <Card size="4">
                    <Heading mb="4">Create an Account</Heading>
                    {error && (
                        <Callout.Root color="red" mb="4">
                            <Callout.Text>{error}</Callout.Text>
                        </Callout.Root>
                    )}
                    <form onSubmit={onSubmit}>
                        <Flex direction="column" gap="3">
                            <Box>
                                <Text as="div" size="2" mb="1" weight="bold">Name</Text>
                                <TextField.Root placeholder="Your name" {...register('name')} />
                                <ErrorMessage>{errors.name?.message}</ErrorMessage>
                            </Box>
                            <Box>
                                <Text as="div" size="2" mb="1" weight="bold">Email</Text>
                                <TextField.Root placeholder="Email address" {...register('email')} />
                                <ErrorMessage>{errors.email?.message}</ErrorMessage>
                            </Box>
                            <Box>
                                <Text as="div" size="2" mb="1" weight="bold">Password</Text>
                                <TextField.Root type="password" placeholder="Password" {...register('password')} />
                                <ErrorMessage>{errors.password?.message}</ErrorMessage>
                            </Box>
                            <Button disabled={isSubmitting} mt="2" variant="solid" color="violet">
                                Register {isSubmitting && <Spinner />}
                            </Button>
                        </Flex>
                    </form>
                    <Text size="2" mt="4" align="center" as="p">
                        Already have an account?{' '}
                        <Link href="/api/auth/signin" className="text-violet-600 hover:underline">
                            Log in
                        </Link>
                    </Text>
                </Card>
            </Box>
        </Container>
    );
}

export default RegisterPage;


'use client';

import { Box, Button, Callout, Card, Container, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiFillBug } from 'react-icons/ai';
import { ErrorMessage, Spinner } from '@/app/component';

const schema = z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(1, 'Password is required.'),
});

type SignInForm = z.infer<typeof schema>;

const SignInFormContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>({
        resolver: zodResolver(schema),
    });
    const [error, setError] = useState('');
    const [isSubmitting, setSubmitting] = useState(false);

    const onSubmit = handleSubmit(async (data) => {
        try {
            setSubmitting(true);
            setError('');
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password. Please try again.');
                setSubmitting(false);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
            setSubmitting(false);
        }
    });

    return (
        <Box className="max-w-[480px] mx-auto w-full px-4">
            <Flex direction="column" align="center" mt="9" gap="6">
                {/* Logo */}
                <Flex align="center" gap="3">
                    <AiFillBug size="40" className="text-violet-600" />
                    <Text size="7" weight="bold" className="tracking-tight">IssueTracker</Text>
                </Flex>

                <Card size="4" className="w-full card-premium">
                    <Heading size="5" mb="1">Welcome back</Heading>
                    <Text size="2" color="gray" as="p" mb="5">
                        Sign in to your account to continue.
                    </Text>

                    {error && (
                        <Callout.Root color="red" mb="4">
                            <Callout.Text>{error}</Callout.Text>
                        </Callout.Root>
                    )}

                    <form onSubmit={onSubmit} noValidate>
                        <Flex direction="column" gap="4">
                            <Box>
                                <Text as="label" size="2" weight="medium" htmlFor="email">
                                    Email address
                                </Text>
                                <TextField.Root
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    mt="1"
                                    {...register('email')}
                                />
                                <ErrorMessage>{errors.email?.message}</ErrorMessage>
                            </Box>

                            <Box>
                                <Text as="label" size="2" weight="medium" htmlFor="password">
                                    Password
                                </Text>
                                <TextField.Root
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    mt="1"
                                    {...register('password')}
                                />
                                <ErrorMessage>{errors.password?.message}</ErrorMessage>
                            </Box>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                variant="solid"
                                color="violet"
                                size="3"
                                mt="1"
                            >
                                {isSubmitting ? <><Spinner /> Signing in…</> : 'Sign in'}
                            </Button>
                        </Flex>
                    </form>

                    <Text size="2" mt="5" as="p" align="center" color="gray">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-violet-600 hover:underline font-medium">
                            Create one
                        </Link>
                    </Text>
                </Card>
            </Flex>
        </Box>
    );
};

const SignInPage = () => {
    return (
        <Suspense fallback={<Flex align="center" justify="center" mt="9"><Spinner /></Flex>}>
            <SignInFormContent />
        </Suspense>
    );
};

export default SignInPage;

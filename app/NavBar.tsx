'use client'

import { Skeleton } from '@/app/component';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import React from 'react';
import { AiFillBug } from "react-icons/ai";
import classnames from 'classnames';
import { Avatar, Box, Container, DropdownMenu, Flex, Text } from '@radix-ui/themes';

const NavBar = () => {
    return (
        <nav className='border-b mb-5 px-5 py-3'>
            <Container>
                <Flex justify="between">
                    <Flex align="center" gap="6">
                        <Link href='/'>
                            <AiFillBug size="24" className='text-violet-600 hover:text-violet-700 transition-colors' />
                        </Link>
                        <NavLinks />
                    </Flex>
                    <AuthStatus />
                </Flex>
            </Container>
        </nav>
    )
}

const NavLinks = () => {
    const currentPath = usePathname();

    const links = [
        { label: 'Dashboard', href: '/' },
        { label: 'Issues', href: '/issues' }
    ]

    return (
        <ul className='flex space-x-6'>
            {links.map(link => (
                <li key={link.href}>
                    <Link
                        className={classnames({
                            'nav-link': true,
                            '!text-zinc-900 font-medium': link.href === currentPath,
                        })}
                        href={link.href}
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

const AuthStatus = () => {
    const { status, data: session } = useSession();

    if (status === 'loading') return <Skeleton width="3rem" height="1.8rem" />;

    if (status === 'unauthenticated')
        return (
            <Flex gap="3">
                <Link className='nav-link' href='/api/auth/signin'>Login</Link>
                <Link className='nav-link font-medium text-violet-600' href='/auth/register'>Register</Link>
            </Flex>
        );

    return (
        <Box>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Avatar
                        src={session!.user!.image!}
                        fallback="?"
                        size="2"
                        radius="full"
                        className='cursor-pointer hover:opacity-80 transition-opacity'
                    />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content variant='soft' size="2">
                    <DropdownMenu.Label>
                        <Text size="2">{session!.user!.email}</Text>
                    </DropdownMenu.Label>
                    <DropdownMenu.Item onClick={() => signOut()}>Logout</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Box>
    );
}

export default NavBar
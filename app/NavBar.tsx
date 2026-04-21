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
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;

    return (
        <nav className='glass sticky top-0 z-50 mb-5 px-5 py-3'>
            <Container>
                <Flex justify="between" align="center">
                    <Flex align="center" gap="6">
                        <Link href='/' className="flex items-center gap-2">
                            <AiFillBug size="28" className='text-violet-600 hover:text-violet-700 transition-transform hover:scale-110 duration-200' />
                            <Text size="4" weight="bold" className="tracking-tight hidden sm:inline-block">IssueTracker</Text>
                        </Link>
                        <NavLinks role={role} />
                    </Flex>
                    <AuthStatus />
                </Flex>
            </Container>
        </nav>
    )
}

const NavLinks = ({ role }: { role?: string }) => {
    const currentPath = usePathname();

    const links = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Issues', href: '/issues' },
        ...(role ? [{ label: 'Projects', href: '/projects' }] : []),
        ...(role === 'ADMIN' || role === 'MANAGER' ? [{ label: 'Reports', href: '/reports' }] : []),
        ...(role === 'ADMIN' || role === 'MANAGER' ? [{ label: 'Audit Trail', href: '/activities' }] : []),
        ...(role === 'ADMIN' ? [{ label: 'Users', href: '/admin/users' }] : []),
    ];




    return (
        <ul className='flex space-x-8'>
            {links.map(link => (
                <li key={link.href}>
                    <Link
                        className={classnames({
                            'nav-link text-sm': true,
                            'active': link.href === currentPath,
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

    if (status === 'loading') return <Skeleton width="2rem" height="2rem" />;

    if (status === 'unauthenticated')
        return (
            <Flex gap="3" align="center">
                <Link className='nav-link text-sm' href='/auth/signin'>Login</Link>
                <Link
                    className='text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors px-4 py-1.5 rounded-full'
                    href='/auth/register'
                >
                    Register
                </Link>
            </Flex>
        );

    const userName = session!.user!.name || session!.user!.email || 'User';
    const initials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return (
        <Box>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <button
                        className='rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2'
                        aria-label="Open user menu"
                    >
                        <Avatar
                            src={session!.user!.image ?? undefined}
                            fallback={initials}
                            size="2"
                            radius="full"
                            className='cursor-pointer hover:opacity-80 transition-opacity'
                            color="violet"
                        />
                    </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content variant='soft' size="2" align="end" sideOffset={8}>
                    <div className="px-2 py-1.5 min-w-[180px]">
                        {session!.user!.name && (
                            <Text as="p" size="2" weight="bold">{session!.user!.name}</Text>
                        )}
                        <Text as="p" size="1" color="gray">{session!.user!.email}</Text>
                    </div>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item asChild>
                        <Link href="/issues">My Issues</Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item
                        color="red"
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    >
                        Log out
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Box>
    );
}

export default NavBar
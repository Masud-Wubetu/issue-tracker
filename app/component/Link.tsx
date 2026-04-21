"use client";
import NextLink from 'next/link'
import { Link as RadixLink } from '@radix-ui/themes'

import { ReactNode } from 'react';

interface Props {
    href: string;
    children: ReactNode;
    className?: string;
}

const Link = ({ href, children, className }: Props) => {
  return (
    <RadixLink asChild className={className}>
      <NextLink href={href}>{children}</NextLink>
    </RadixLink>
  )
}

export default Link
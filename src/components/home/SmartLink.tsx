import React from 'react';
import Link from 'next/link';
import type { ResolvedLink } from '@/lib/links';

interface SmartLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  link: ResolvedLink;
  children?: React.ReactNode;
}

/** Enlace a un destino del panel: interno con <Link>, externo en otra pestaña. */
export const SmartLink: React.FC<SmartLinkProps> = ({ link, children, ...props }) =>
  link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ) : (
    <Link href={link.href} {...props}>
      {children}
    </Link>
  );

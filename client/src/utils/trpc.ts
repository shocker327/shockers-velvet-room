import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/router';

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  return 'http://localhost:3000';
}

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/trpc`,
      }),
    ],
  });
}

import type { LayoutServerLoad } from './$types';

/**
 * This load function only runs on the server.
 *
 * It is taking a getSession() function from locals (see hooks.server.ts), and
 * then exposing session to be used in +layout.ts
 */
export const load = (async ({ locals: { getSession } }) => {
    const session = await getSession();

    return {
        session,
    };
}) satisfies LayoutServerLoad;

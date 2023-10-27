import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/supabase';
import type { Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';

/**
 * This function intercepts all requests sent to the server.
 */
export const handle: Handle = async ({ event, resolve }) => {
    // We are attaching a server supabase client to the event object,
    // so that it will be usable in all server code (see +layout.server.ts).
    event.locals.supabase = createServerClient<Database>(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get: event.cookies.get,
                set: event.cookies.set,
                remove: event.cookies.delete,
            },
        },
    );

    // A convenience helper so we can just call await getSession() instead of
    // const { data: { session } } = await supabase.auth.getSession()
    event.locals.getSession = async () => {
        const {
            data: { session },
        } = await event.locals.supabase.auth.getSession();
        return session;
    };

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range';
        },
    });
};

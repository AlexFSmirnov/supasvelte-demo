import type { LayoutLoad } from './$types';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/types/supabase';
import { writable } from 'svelte/store';
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';

/**
 * This load function initially executes on the server, and then on the client.
 *
 * Just like the HTML components in a +layout.svelte file are accessible to all
 * child pages, the data returned from this load function is accessible in all
 * child pages inside the PageData.
 *
 * The load function gets a `data` object as an argument, which contains the
 * return value from +layout.server.ts
 */
export const load = (async ({ fetch, data, depends }) => {
    // This will ensure the function reruns when 'supabase:auth' is invalidated
    // (check the root +layout.svelte)
    depends('supabase:auth');

    // This is a client instance of the supabase client, will be mainly used by the browser.
    const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
            get: (key) => {
                // If the function is executed on the server, we are getting the session
                // that was passed from +layout.server.ts
                if (!isBrowser()) {
                    return JSON.stringify(data.session);
                }

                // If we are in the browser, we are using actual cookies for authentication.
                const cookie = parse(document.cookie);
                return cookie[key];
            },
        },
    });

    // The session will contain the information about the current logged in user.
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // The user_data table stores all the information related to a user.
    const getUserData = async () => {
        if (!session?.user.id) {
            return null;
        }

        const existingUserData = await supabase
            .from('user_data')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

        return existingUserData.data;
    };

    // Whenever we get an active session, we are checking if the user already has a row
    // in the user_data table. If not, we are creating one.
    if (session?.user) {
        const { id, email } = session.user;
        const existingUserData = await getUserData();

        if (!existingUserData) {
            await supabase.from('user_data').insert({ user_id: id, counter: 0, email });
        }
    }

    // For ease of access, we are creating a user data store.
    // TODO: THIS IS BAD, DON'T DO THIS
    const userData = writable(await getUserData());

    // Finally, we are returning all the data to be used in the child pages.
    return { supabase, session, userData };
}) satisfies LayoutLoad;

import { writable } from 'svelte/store';
import type { PageLoad } from './$types';

/**
 * Just like +layout.ts, this file is used for loading data.
 *
 * The main difference, however, is that the globalCounter value that will
 * be loaded in this file will only be accessible in this page, while the
 * $userData store created in +layout.ts is accessible in all pages.
 */
export const load = (async ({ parent }) => {
    // This allows us to get the supabase client from +layout.ts
    const { supabase } = await parent();

    // First, we get the initial value of the global counter from the database:
    const getGlobalCounter = async () => {
        const result = await supabase.from('public_table').select('*').eq('id', 0).maybeSingle();

        return result?.data?.global_counter ?? 0;
    };

    // Then we create a store with this value.
    // We will set up a live subscription in +page.svelte because we don't want
    // the subscription to run on the server.
    const globalCounter = writable(await getGlobalCounter());

    // We also want to fetch all the users. This value is not a store (writable),
    // so it will not be updated dynamically.
    const users = (await supabase.from('user_data').select('*')).data || [];

    return {
        globalCounter,
        users: users.sort((a, b) => a.id - b.id),
    };
}) satisfies PageLoad;

import { writable } from 'svelte/store';
import type { PageLoad } from './$types';

/**
 * This function runs on both the server and the client.
 *
 * It extracts the userId from the URL and returns it to be used in the +page.svelte.
 * Additionally, it loads the information about this user from the database, and
 * creates a realtime subscription to their counter.
 */
export const load = (async ({ params, parent }) => {
    const { supabase } = await parent();

    // Similar to the global counter in the root +page.ts, we are creating a user counter store.
    const getPageUserData = async () => {
        const result = await supabase
            .from('user_data')
            .select('*')
            .eq('id', params.slug)
            .maybeSingle();

        return result.data;
    };

    const pageUserData = writable(await getPageUserData());

    return {
        userDataId: params.slug,
        pageUserData,
    };
}) satisfies PageLoad;

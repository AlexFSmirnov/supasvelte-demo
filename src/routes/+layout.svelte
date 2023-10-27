<script lang="ts">
    import { onMount } from 'svelte';
    import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
    import { Toast, initializeStores, storePopup } from '@skeletonlabs/skeleton';
    import { invalidate } from '$app/navigation';
    import '../app.postcss';
    import type { LayoutData } from './$types';
    import type { TableRow } from '$lib/types/supabase';
    import type { RealtimeChannel } from '@supabase/supabase-js';

    // This is the data we are receiving from +layout.ts
    export let data: LayoutData;

    // We are using a reactive declaraion to extract the values we need.
    // Using $: ensures that the values will always be up to date.
    $: ({ supabase, session, userData } = data);

    // Using Supabase Realtime, we are subscribing to all events related
    // to the user_data table, while still belonging only to the current user.
    // We need to listen to the changes in +layout.svelte instead of +layout.ts
    // because we only want this listener to run on the frontend, and we want
    // to be able to unsubscribe from it when the layout is unmounted.
    let userDataSubscription: RealtimeChannel | null = null;
    $: getUserDataSubscription = (userId?: string) => {
        if (!userId) {
            return null;
        }

        return supabase
            .channel('user-data-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_data',
                    filter: `user_id=eq.${userId}`,
                },
                async (result) => {
                    // When the user data changes, we are updating the user data store.
                    userData.set(result.new as TableRow<'user_data'>);
                },
            )
            .subscribe();
    };

    onMount(() => {
        // When the component is mounted, we initialize the userDataSubscription with the current user.
        userDataSubscription = getUserDataSubscription(session?.user.id);

        // Whenever the layout is first mounted in the browser, we begin listening
        // for changes to the session. If the session expires, we invalidate the
        // 'supabase:auth' token, which re-triggers the load function in +layout.ts
        const { data } = supabase.auth.onAuthStateChange((event, _session) => {
            if (_session?.expires_at !== session?.expires_at) {
                // If the session expired, we also unsubscribe from the current userDataSubscription,
                // and subscribe to the new one based on the new user id.
                userDataSubscription?.unsubscribe();
                userDataSubscription = getUserDataSubscription(_session?.user.id);

                invalidate('supabase:auth');
            }
        });

        // The function returned from onMount is called when the component is unmounted,
        // so we can unsubscribe from all the listeners we created.
        return () => {
            data.subscription.unsubscribe();
            userDataSubscription?.unsubscribe();
        };
    });

    // Initializing some stuff fro the Skeleton UI
    storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
    initializeStores();
</script>

<Toast />
<slot />

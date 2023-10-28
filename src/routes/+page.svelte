<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import type { TableRow } from '$lib/types/supabase';

    export let data: PageData;

    // Making a reactive declaration getting the userData store and the session.
    // Both of these values are created in +layout.ts, userData is a manual store
    // and session is passed from Supabase.
    // We are also getting the authenticated supabase client for running queries.
    // Additionally, we are getting the global counter and users from +page.ts.
    // Notice how we the data object combines the exports from +layout.ts and +page.ts.
    $: ({ session, userData, supabase, globalCounter, users } = data);

    onMount(() => {
        // As mentioned in +page.ts, we need to set up the realtime listener to the db changes.
        const globalCounterSubscription = supabase
            .channel('global-counter-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'public_table',
                    filter: 'id=eq.0',
                },
                async (result) => {
                    // When the user data changes, we are updating the user data store.
                    globalCounter.set((result.new as TableRow<'public_table'>).global_counter);
                },
            )
            .subscribe();

        // And we need to unsubscribe whenever the component unmounts
        return () => {
            globalCounterSubscription.unsubscribe();
        };
    });

    // This function will update the user data store with the new value.
    const incrementUserCounter = async () => {
        if (!session || !$userData) return;

        await supabase
            .from('user_data')
            .update({
                counter: $userData.counter + 1,
            })
            .eq('user_id', session.user.id);
    };

    // This function will update the global counter in the database.
    // Instead of using the stored $globalCounter, we are calling a database function
    // defined in the global-counter-function.sql migration. This makes the solution spam-proof.
    const incrementGlobalCounter = async () => {
        await supabase.rpc('increment_global_counter', { p_id: 0 });
    };
</script>

{#if data.session}
    <div class="relative">
        <div class="absolute top-2 right-0">
            <button class="btn" on:click={() => data.supabase.auth.signOut()}>Log out</button>
        </div>
    </div>
{/if}

<div class="h-full w-screen flex justify-center">
    <div class="flex flex-col items-center container p-4">
        <h2 class="h2 text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-pink-400">
            {#if data.session}
                Welcome, {data.session.user.email}
            {:else}
                Welcome
            {/if}
        </h2>
        <div class="flex pt-4 w-full justify-center">
            {#if data.session}
                <div class="card p-2 flex flex-col items-center gap-2 flex-grow">
                    <h3 class="h3">User counter</h3>
                    <p class="text-9xl">{$userData?.counter}</p>
                    <button on:click={incrementUserCounter} class="btn variant-filled-primary my-4"
                        >Increment</button
                    >
                </div>
                <div class="w-4" />
                <div class="card p-2 flex flex-col items-center gap-2 flex-grow">
                    <h3 class="h3">Global counter</h3>
                    <p class="text-9xl">{$globalCounter}</p>
                    <button
                        on:click={incrementGlobalCounter}
                        class="btn variant-filled-primary my-4">Increment</button
                    >
                </div>
            {:else}
                <div class="card p-4 flex flex-col items-center gap-2">
                    <h3 class="h3">Global counter</h3>
                    <p class="text-9xl mb-4">{$globalCounter}</p>
                </div>
            {/if}
        </div>

        <div class="pt-8 flex-col w-full">
            <h3 class="h3 mb-2">All users</h3>
            <div class="w-full flex flex-col">
                {#each users as user (user.id)}
                    <div
                        class="w-full grid p-2 card mb-2"
                        style="grid-template-columns: 24px 1fr 32px"
                    >
                        <span class="ml-1 pr-4">{user.id}</span>
                        <a class="pr-6 anchor" href={`/user/${user.id}`}>{user.email}</a>
                        <span>{user.counter}</span>
                    </div>
                {/each}
            </div>
        </div>
        {#if !session}
            <a href="/login" class="anchor">Log in</a>
        {/if}
    </div>
</div>

<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import type { TableRow } from '$lib/types/supabase';

    export let data: PageData;
    $: ({ userDataId, pageUserData, supabase } = data);

    onMount(() => {
        // Similar the root +page.svelte, we're setting up a realtime subscription to another user's counter
        const otherUserCounterSubscription = supabase
            .channel('other-user-counter-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_data',
                    filter: `id=eq.${userDataId}`,
                },
                async (result) => {
                    pageUserData.set(result.new as TableRow<'user_data'>);
                },
            )
            .subscribe();

        // And we need to unsubscribe whenever the component unmounts
        return () => {
            otherUserCounterSubscription.unsubscribe();
        };
    });
</script>

{#if !$pageUserData}
    <h1 class="h1 text-center pt-4">User not found</h1>
{:else}
    <div class="relative">
        <div class="absolute top-2 right-0">
            <a class="btn" href="/">Back</a>
        </div>
    </div>

    <div class="h-full w-screen flex justify-center">
        <div class="flex flex-col items-center container p-4">
            <h2
                class="h2 text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-pink-400"
            >
                User {$pageUserData?.email}
            </h2>

            <div class="card p-4 mt-8 flex flex-col items-center gap-2">
                <h3 class="h3">User counter</h3>
                <p class="text-9xl mb-4">{$pageUserData.counter}</p>
            </div>
        </div>
    </div>
{/if}

<script lang="ts">
    import { AuthApiError } from '@supabase/supabase-js';
    import type { PageData } from './$types';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { goto } from '$app/navigation';

    export let data: PageData;

    const toastStore = getToastStore();

    let email = '';
    let password = '';

    $: handleSignInWithEmail = data.handleSigninWithEmail({ email, password, toastStore });
    $: handleSignInWithGoogle = data.handleSignInWithGoogle({ toastStore });
</script>

<h2 class="h2 pb-8 text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 to-cyan-500">
    Login
</h2>
<form class="w-full" on:submit|preventDefault={handleSignInWithEmail}>
    <div class="w-full text-token space-y-4">
        <label class="label">
            <span>Email</span>
            <!-- svelte-ignore a11y-autofocus -->
            <input autofocus class="input w-full" name="email" type="email" bind:value={email} />
        </label>
        <label class="label">
            <span>Password</span>
            <input class="input" name="password" type="password" bind:value={password} />
        </label>
    </div>
    <button
        class="w-full btn btn-primary mt-8 bg-gradient-to-br from-blue-500 to-pink-400"
        type="submit"
    >
        Login
    </button>
</form>
<button
    class="w-full btn btn-primary mt-4 bg-gradient-to-tr from-blue-200 to-white text-black"
    on:click={handleSignInWithGoogle}>Continue with Google</button
>
<a href="/register" class="mt-4 text-sm text-blue-500">Register</a>

<script lang="ts">
    import { getToastStore } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';

    export let data: PageData;

    const toastStore = getToastStore();

    let email = '';
    let password = '';
    let confirmPassword = '';

    $: handleSignUpWithEmail = data.handleSignUpWithEmail({
        email,
        password,
        confirmPassword,
        toastStore,
    });
    $: handleSignInWithGoogle = data.handleSignInWithGoogle({ toastStore });
</script>

<h2 class="h2 pb-8 text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 to-cyan-500">
    Register
</h2>
<form class="w-full" on:submit|preventDefault={handleSignUpWithEmail}>
    <div class="w-full text-token space-y-4">
        <label class="label">
            <span>Email</span>
            <!-- svelte-ignore a11y-autofocus -->
            <input autofocus class="input w-full" type="email" bind:value={email} />
        </label>
        <label class="label">
            <span>Password</span>
            <input class="input" type="password" bind:value={password} />
        </label>
        <label class="label">
            <span>Confirm password</span>
            <input
                class="input"
                class:input-warning={confirmPassword && password !== confirmPassword}
                type="password"
                bind:value={confirmPassword}
            />
        </label>
    </div>
    <button
        class="w-full btn btn-primary mt-8 bg-gradient-to-br from-blue-500 to-pink-400"
        type="submit"
    >
        Register
    </button>
</form>
<button
    class="w-full btn btn-primary mt-8 bg-gradient-to-tr from-blue-200 to-white text-black"
    on:click={handleSignInWithGoogle}>Sign up with Google</button
>

import { goto } from '$app/navigation';
import type { getToastStore } from '@skeletonlabs/skeleton';
import type { LayoutLoad } from './$types';
import { AuthApiError } from '@supabase/supabase-js';

interface WithToastStore {
    toastStore: ReturnType<typeof getToastStore>;
}

interface HandleSignInWithEmailProps extends WithToastStore {
    email: string;
    password: string;
}

interface HandleSignUpWithEmailProps extends WithToastStore {
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * This load function will run for the /login and /register page - all pages under (signIn).
 * Putting the pages into a folder with parentheses allows us to use a custom layout for them
 * without changing their URLs.
 *
 * This load function introduces the signIn and signUp functions that interact with Supabase.
 */
export const load = (async ({ parent }) => {
    // In order to get the data passed from the parent load function (root +layout.ts), we can
    // use the parent() function. We need the data to access the current session and the
    // authenticated supabase client.
    const data = await parent();

    const handleSigninWithEmail =
        ({ email, password, toastStore }: HandleSignInWithEmailProps) =>
        async () => {
            const { error } = await data.supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error instanceof AuthApiError) {
                    toastStore.trigger({
                        background: 'variant-filled-error',
                        message: error.message,
                    });
                } else {
                    toastStore.trigger({
                        background: 'variant-filled-error',
                        message: 'Something went wrong, try again later.',
                    });
                    console.error(error);
                }

                return;
            }

            goto('/');
        };

    const handleSignUpWithEmail =
        ({ email, password, confirmPassword, toastStore }: HandleSignUpWithEmailProps) =>
        async () => {
            if (password !== confirmPassword) {
                toastStore.trigger({
                    background: 'variant-filled-error',
                    message: 'Passwords do not match.',
                });
                return;
            }

            const { error } = await data.supabase.auth.signUp({ email, password });
            if (error) {
                if (error instanceof AuthApiError) {
                    toastStore.trigger({
                        background: 'variant-filled-error',
                        message: error.message,
                    });
                } else {
                    toastStore.trigger({
                        background: 'variant-filled-error',
                        message: 'Something went wrong, try again later.',
                    });
                    console.error(error);
                }
                return;
            }

            goto('/login');
        };

    const handleSignInWithGoogle =
        ({ toastStore }: WithToastStore) =>
        async () => {
            const { error } = await data.supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) {
                if (error instanceof AuthApiError) {
                    toastStore.trigger({
                        background: 'variant-filled-error',
                        message: error.message,
                    });
                } else {
                    toastStore.trigger({
                        background: 'variant-filled-error',
                        message: 'Something went wrong, try again later.',
                    });
                    console.error(error);
                }
                return;
            }
        };

    return {
        handleSigninWithEmail,
        handleSignUpWithEmail,
        handleSignInWithGoogle,
    };
}) satisfies LayoutLoad;

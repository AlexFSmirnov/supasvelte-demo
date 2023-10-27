import type { PostgrestError } from '@supabase/supabase-js';
import type { Database as DatabaseGenerated } from './supabase-generated';

export type Database = DatabaseGenerated;

export type TableRow<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];
export type Enum<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultErr = PostgrestError;

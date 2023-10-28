CREATE OR REPLACE FUNCTION increment_global_counter(p_id integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public_table
    SET global_counter = global_counter + 1
    WHERE id = p_id;
END;
$$;

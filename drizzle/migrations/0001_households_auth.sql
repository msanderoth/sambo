CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.households TO authenticated;
GRANT ALL ON public.households TO service_role;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.household_members (
  user_id uuid PRIMARY KEY,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.household_members TO authenticated;
GRANT ALL ON public.household_members TO service_role;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_household()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
$$;
REVOKE EXECUTE ON FUNCTION public.current_household() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_household() TO authenticated;

CREATE POLICY "members read own household" ON public.households FOR SELECT TO authenticated USING (id = public.current_household());
CREATE POLICY "members read own membership" ON public.household_members FOR SELECT TO authenticated USING (household_id = public.current_household());

ALTER TABLE public.tasks ADD COLUMN household_id uuid REFERENCES public.households(id) ON DELETE CASCADE DEFAULT public.current_household();
ALTER TABLE public.point_events ADD COLUMN household_id uuid REFERENCES public.households(id) ON DELETE CASCADE DEFAULT public.current_household();
ALTER TABLE public.custom_categories ADD COLUMN household_id uuid REFERENCES public.households(id) ON DELETE CASCADE DEFAULT public.current_household();
ALTER TABLE public.custom_categories DROP CONSTRAINT custom_categories_pkey;
ALTER TABLE public.custom_categories ADD CONSTRAINT custom_categories_household_name_key UNIQUE (household_id, name);

DROP POLICY "shared household tasks" ON public.tasks;
DROP POLICY "add points" ON public.point_events;
DROP POLICY "read points" ON public.point_events;
DROP POLICY "shared categories" ON public.custom_categories;
REVOKE ALL ON public.tasks, public.point_events, public.custom_categories FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks, public.custom_categories TO authenticated;
GRANT SELECT, INSERT ON public.point_events TO authenticated;

CREATE POLICY "household tasks" ON public.tasks FOR ALL TO authenticated
  USING (household_id = public.current_household()) WITH CHECK (household_id = public.current_household());
CREATE POLICY "household read points" ON public.point_events FOR SELECT TO authenticated
  USING (household_id = public.current_household());
CREATE POLICY "household add points" ON public.point_events FOR INSERT TO authenticated
  WITH CHECK (household_id = public.current_household() AND profile IN ('M','J') AND points BETWEEN 0 AND 1000);
CREATE POLICY "household categories" ON public.custom_categories FOR ALL TO authenticated
  USING (household_id = public.current_household())
  WITH CHECK (household_id = public.current_household() AND length(name) BETWEEN 1 AND 40);

CREATE OR REPLACE FUNCTION public.handle_new_household_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname text := lower(trim(NEW.raw_user_meta_data->>'username'));
  hid uuid;
  first boolean;
BEGIN
  IF uname IS NULL OR uname !~ '^[a-z0-9_.-]{3,30}$' THEN
    RAISE EXCEPTION 'invalid username';
  END IF;
  SELECT NOT EXISTS (SELECT 1 FROM public.households) INTO first;
  INSERT INTO public.households(username) VALUES (uname) RETURNING id INTO hid;
  INSERT INTO public.household_members(user_id, household_id) VALUES (NEW.id, hid);
  IF first THEN
    UPDATE public.tasks SET household_id = hid WHERE household_id IS NULL;
    UPDATE public.point_events SET household_id = hid WHERE household_id IS NULL;
    UPDATE public.custom_categories SET household_id = hid WHERE household_id IS NULL;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_household AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_household_user();

-- Drop old admin-only insert policy
DROP POLICY "Admins can insert uploads" ON public.energy_uploads;
DROP POLICY "Admins can delete uploads" ON public.energy_uploads;
DROP POLICY "Anyone authenticated can view uploads" ON public.energy_uploads;

-- New policies: users manage their own uploads
CREATE POLICY "Users can insert own uploads" ON public.energy_uploads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can view own uploads" ON public.energy_uploads
  FOR SELECT TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own uploads" ON public.energy_uploads
  FOR DELETE TO authenticated
  USING (auth.uid() = uploaded_by);

-- Admins can view all uploads
CREATE POLICY "Admins can view all uploads" ON public.energy_uploads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

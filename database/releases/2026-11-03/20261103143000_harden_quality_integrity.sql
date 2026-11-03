-- B2Inspect Inspector: server-side integriteits- en functiescheidingscontroles.

begin;

alter table public.quality_documents
  drop constraint if exists quality_documents_document_code_key,
  drop constraint if exists quality_documents_approval_consistent;

alter table public.quality_documents
  add constraint quality_documents_code_version_unique unique (document_code, version),
  add constraint quality_documents_approval_consistent check (
    status <> 'approved'
    or (
      approved_by is not null
      and approved_at is not null
      and effective_date is not null
      and nullif(btrim(file_path), '') is not null
    )
  );

alter table public.quality_competencies
  add constraint quality_competencies_verification_consistent check (
    status <> 'valid'
    or (
      verified_by is not null
      and verified_at is not null
      and nullif(btrim(file_path), '') is not null
    )
  );

alter table public.quality_instruments
  add column calibration_required boolean not null default true,
  add constraint quality_instruments_active_calibration_consistent check (
    status <> 'active'
    or calibration_required is false
    or (
      calibration_date is not null
      and calibration_due_date is not null
      and nullif(btrim(certificate_path), '') is not null
    )
  );

alter table public.quality_records
  drop constraint if exists quality_records_closure_consistent;

alter table public.quality_records
  add constraint quality_records_closure_consistent check (
    status not in ('completed', 'cancelled')
    or (closed_by is not null and closed_at is not null)
  ),
  add constraint quality_records_effectiveness_consistent check (
    status <> 'completed'
    or record_type not in ('finding', 'capa')
    or nullif(btrim(effectiveness_check), '') is not null
  );

drop policy if exists "quality_evidence_staff_read" on storage.objects;
drop policy if exists "quality_evidence_admin_read" on storage.objects;
drop policy if exists "quality_evidence_approved_document_staff_read" on storage.objects;
create policy "quality_evidence_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'quality-evidence' and public.mileage_is_admin());

create policy "quality_evidence_approved_document_staff_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'quality-evidence'
    and public.quality_is_staff()
    and exists (
      select 1
      from public.quality_documents
      where status = 'approved'
        and file_path = storage.objects.name
    )
  );

revoke execute on function public.touch_quality_record() from public, anon, authenticated;
revoke execute on function public.touch_quality_competency() from public, anon, authenticated;
grant execute on function public.touch_quality_record() to service_role;
grant execute on function public.touch_quality_competency() to service_role;

create or replace function public.finalize_inspection(inspection_id bigint, checklist jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
declare
  result record;
  required_key text;
  assigned_inspector_id text;
  self_review boolean := false;
  assignment_unverified boolean := false;
  independence_note text;
begin
  if not public.mileage_is_admin() then
    raise exception 'Alleen beheer mag een inspectie definitief afronden';
  end if;

  if checklist is null or jsonb_typeof(checklist) <> 'object' then
    raise exception 'Reviewchecklist ontbreekt of is ongeldig';
  end if;

  foreach required_key in array array[
    'identity_checked',
    'measurements_checked',
    'findings_checked',
    'report_checked',
    'independence_checked'
  ] loop
    if coalesce((checklist ->> required_key)::boolean, false) is not true then
      raise exception 'Reviewchecklist is niet volledig';
    end if;
  end loop;

  select report_data #>> '{meta,assignedInspectorId}'
    into assigned_inspector_id
    from public.inspections
   where id = inspection_id and status = 'review_ready'
   for update;

  if not found then
    raise exception 'Inspectie is niet gevonden of niet klaar voor beoordeling';
  end if;

  assignment_unverified := nullif(btrim(assigned_inspector_id), '') is null;
  self_review := not assignment_unverified and assigned_inspector_id = auth.uid()::text;
  independence_note := nullif(btrim(checklist ->> 'independence_note'), '');

  if (self_review or assignment_unverified) and (independence_note is null or char_length(independence_note) < 15) then
    raise exception 'Niet-aantoonbaar onafhankelijke beoordeling vereist een concrete toelichting van minimaal 15 tekens';
  end if;

  checklist := checklist || jsonb_build_object(
    'reviewer_id', auth.uid(),
    'assigned_inspector_id', nullif(btrim(assigned_inspector_id), ''),
    'independence_mode', case
      when assignment_unverified then 'unverified_assignment'
      when self_review then 'self_review_exception'
      else 'independent_review'
    end
  );

  update public.inspections
     set status = 'completed',
         reviewed_by = auth.uid(),
         reviewed_at = now(),
         review_checklist = checklist,
         final_report_data = report_data,
         reopened_reason = null
   where id = inspection_id and status = 'review_ready'
   returning * into result;

  if result.id is null then
    raise exception 'Inspectie is niet gevonden of niet klaar voor beoordeling';
  end if;

  return to_jsonb(result);
end
$function$;

revoke execute on function public.finalize_inspection(bigint, jsonb) from public, anon;
grant execute on function public.finalize_inspection(bigint, jsonb) to authenticated, service_role;

insert into public.quality_records (
  record_type,
  title,
  description,
  severity,
  status,
  source,
  due_date
)
select
  'external_task',
  'Kiwa: definitieve toelatingsroute en documentversies bevestigen',
  'Publieke informatie geeft per 2026-11-03 nog geen definitieve bevestiging van de toepasselijke toelatingsroute, overgangsregels en vereiste documentversies. Vraag Kiwa/SCIOS om schriftelijke bevestiging en koppel het antwoord als bewijs.',
  'high',
  'waiting_external',
  'SCIOS/Kiwa',
  current_date + 14
where not exists (
  select 1
  from public.quality_records
  where title = 'Kiwa: definitieve toelatingsroute en documentversies bevestigen'
    and source = 'SCIOS/Kiwa'
    and status not in ('completed', 'cancelled')
);

commit;

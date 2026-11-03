-- B2Inspect Inspector: digitale basis voor het SCIOS-kwaliteitssysteem.

begin;

create or replace function public.quality_is_staff()
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $function$
declare
  staff_found boolean := false;
begin
  if to_regclass('public.profiles') is null then
    return false;
  end if;

  execute
    'select exists (
       select 1
       from public.profiles
       where id = $1 and role in (''admin'', ''inspector'')
     )'
    into staff_found
    using auth.uid();

  return coalesce(staff_found, false);
end
$function$;

revoke execute on function public.quality_is_staff() from public, anon;
grant execute on function public.quality_is_staff() to authenticated, service_role;

create table public.quality_requirements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  category text not null,
  source_status text not null default 'verification_required',
  status text not null default 'missing',
  owner_role text,
  due_date date,
  evidence_summary text,
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quality_requirements_code_length check (char_length(code) between 2 and 50),
  constraint quality_requirements_title_length check (char_length(title) between 2 and 250),
  constraint quality_requirements_source_status_valid check (source_status in ('current', 'transition', 'draft', 'verification_required')),
  constraint quality_requirements_status_valid check (status in ('missing', 'planned', 'in_progress', 'ready', 'not_applicable')),
  constraint quality_requirements_notes_length check (notes is null or char_length(notes) <= 5000)
);

create table public.quality_documents (
  id uuid primary key default gen_random_uuid(),
  document_code text not null unique,
  title text not null,
  category text not null,
  version text not null default '0.1',
  status text not null default 'draft',
  effective_date date,
  owner_id uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  file_path text,
  requirement_codes text[] not null default '{}',
  change_reason text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quality_documents_code_length check (char_length(document_code) between 2 and 50),
  constraint quality_documents_title_length check (char_length(title) between 2 and 250),
  constraint quality_documents_status_valid check (status in ('draft', 'review', 'approved', 'archived')),
  constraint quality_documents_approval_consistent check (
    (status <> 'approved')
    or (approved_by is not null and approved_at is not null and effective_date is not null)
  ),
  constraint quality_documents_change_reason_length check (change_reason is null or char_length(change_reason) <= 2000)
);

create table public.quality_competencies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  competency_type text not null,
  scope_code text,
  title text not null,
  issuer text,
  certificate_number text,
  issued_on date,
  expires_on date,
  status text not null default 'planned',
  file_path text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quality_competencies_type_valid check (competency_type in ('diploma', 'authorization', 'knowledge_test', 'practice_audit', 'training', 'experience', 'exemption')),
  constraint quality_competencies_status_valid check (status in ('planned', 'valid', 'expired', 'suspended', 'rejected')),
  constraint quality_competencies_dates_valid check (expires_on is null or issued_on is null or expires_on >= issued_on),
  constraint quality_competencies_title_length check (char_length(title) between 2 and 250),
  constraint quality_competencies_notes_length check (notes is null or char_length(notes) <= 3000)
);

create table public.quality_instruments (
  id uuid primary key default gen_random_uuid(),
  asset_code text not null unique,
  name text not null,
  manufacturer text,
  model text,
  serial_number text not null unique,
  applicable_scopes text[] not null default '{}',
  owner_id uuid references auth.users(id) on delete set null,
  calibration_date date,
  calibration_due_date date,
  status text not null default 'active',
  certificate_path text,
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quality_instruments_status_valid check (status in ('active', 'blocked', 'defective', 'retired')),
  constraint quality_instruments_dates_valid check (calibration_due_date is null or calibration_date is null or calibration_due_date >= calibration_date),
  constraint quality_instruments_name_length check (char_length(name) between 2 and 250),
  constraint quality_instruments_notes_length check (notes is null or char_length(notes) <= 3000)
);

create table public.quality_records (
  id uuid primary key default gen_random_uuid(),
  record_type text not null,
  requirement_id uuid references public.quality_requirements(id) on delete set null,
  title text not null,
  description text,
  severity text not null default 'normal',
  status text not null default 'open',
  owner_id uuid references auth.users(id) on delete set null,
  due_date date,
  occurred_on date not null default current_date,
  source text,
  evidence_path text,
  root_cause text,
  correction text,
  corrective_action text,
  effectiveness_check text,
  closed_by uuid references auth.users(id) on delete set null,
  closed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quality_records_type_valid check (record_type in ('external_task', 'internal_audit', 'management_review', 'finding', 'capa', 'complaint', 'supplier_review', 'backup_restore_test', 'incident')),
  constraint quality_records_severity_valid check (severity in ('low', 'normal', 'high', 'critical')),
  constraint quality_records_status_valid check (status in ('open', 'in_progress', 'waiting_external', 'completed', 'cancelled')),
  constraint quality_records_closure_consistent check (
    (status not in ('completed', 'cancelled'))
    or (closed_by is not null and closed_at is not null)
  ),
  constraint quality_records_title_length check (char_length(title) between 2 and 250),
  constraint quality_records_description_length check (description is null or char_length(description) <= 10000)
);

create index quality_requirements_status_idx on public.quality_requirements (status, category);
create index quality_documents_status_idx on public.quality_documents (status, category);
create index quality_competencies_user_expiry_idx on public.quality_competencies (user_id, expires_on);
create index quality_instruments_due_idx on public.quality_instruments (calibration_due_date) where status = 'active';
create index quality_records_open_due_idx on public.quality_records (due_date) where status in ('open', 'in_progress', 'waiting_external');

create or replace function public.touch_quality_record()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end
$function$;

create trigger quality_requirements_touch before update on public.quality_requirements
  for each row execute function public.touch_quality_record();
create trigger quality_documents_touch before update on public.quality_documents
  for each row execute function public.touch_quality_record();
create trigger quality_instruments_touch before update on public.quality_instruments
  for each row execute function public.touch_quality_record();
create trigger quality_records_touch before update on public.quality_records
  for each row execute function public.touch_quality_record();

create or replace function public.touch_quality_competency()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $function$
begin
  new.updated_at := now();
  return new;
end
$function$;

create trigger quality_competencies_touch before update on public.quality_competencies
  for each row execute function public.touch_quality_competency();

alter table public.quality_requirements enable row level security;
alter table public.quality_documents enable row level security;
alter table public.quality_competencies enable row level security;
alter table public.quality_instruments enable row level security;
alter table public.quality_records enable row level security;

revoke all on table public.quality_requirements, public.quality_documents, public.quality_competencies, public.quality_instruments, public.quality_records from anon;
grant select on table public.quality_requirements, public.quality_documents, public.quality_competencies, public.quality_instruments to authenticated;
grant insert, update, delete on table public.quality_requirements, public.quality_documents, public.quality_competencies, public.quality_instruments, public.quality_records to authenticated;
grant select on table public.quality_records to authenticated;
grant all on table public.quality_requirements, public.quality_documents, public.quality_competencies, public.quality_instruments, public.quality_records to service_role;

create policy "quality_requirements_staff_read" on public.quality_requirements
  for select to authenticated using (public.quality_is_staff());
create policy "quality_requirements_admin_manage" on public.quality_requirements
  for all to authenticated using (public.mileage_is_admin()) with check (public.mileage_is_admin());

create policy "quality_documents_staff_read_approved_or_admin" on public.quality_documents
  for select to authenticated using (public.mileage_is_admin() or (public.quality_is_staff() and status = 'approved'));
create policy "quality_documents_admin_manage" on public.quality_documents
  for all to authenticated using (public.mileage_is_admin()) with check (public.mileage_is_admin());

create policy "quality_competencies_read_own_or_admin" on public.quality_competencies
  for select to authenticated using (auth.uid() = user_id or public.mileage_is_admin());
create policy "quality_competencies_admin_manage" on public.quality_competencies
  for all to authenticated using (public.mileage_is_admin()) with check (public.mileage_is_admin());

create policy "quality_instruments_staff_read" on public.quality_instruments
  for select to authenticated using (public.quality_is_staff());
create policy "quality_instruments_admin_manage" on public.quality_instruments
  for all to authenticated using (public.mileage_is_admin()) with check (public.mileage_is_admin());

create policy "quality_records_admin_only" on public.quality_records
  for all to authenticated using (public.mileage_is_admin()) with check (public.mileage_is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quality-evidence',
  'quality-evidence',
  false,
  26214400,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "quality_evidence_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'quality-evidence' and public.quality_is_staff());

create policy "quality_evidence_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'quality-evidence' and public.mileage_is_admin());

create policy "quality_evidence_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'quality-evidence' and public.mileage_is_admin())
  with check (bucket_id = 'quality-evidence' and public.mileage_is_admin());

create policy "quality_evidence_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'quality-evidence' and public.mileage_is_admin());

insert into public.quality_requirements (code, title, category, source_status, status, owner_role, notes)
values
  ('B2-QMS-001', 'Certificatiebasis, Scope 8 PI en Scope 10 vastgelegd', 'Certificatie', 'verification_required', 'planned', 'directie', 'Definitieve regeling en toelatingsroute door certificatie-instelling laten bevestigen.'),
  ('B2-QMS-002', 'Rollen, verantwoordelijkheden en onafhankelijkheid geborgd', 'Governance', 'transition', 'in_progress', 'kwaliteit', 'Eigen werk mag niet zonder geborgde functiescheiding worden geïnspecteerd of vrijgegeven.'),
  ('B2-QMS-003', 'Beheerst kwaliteitshandboek en procedures beschikbaar', 'Documentbeheer', 'transition', 'planned', 'kwaliteit', 'Documenten moeten versie, eigenaar, vrijgever en ingangsdatum bevatten.'),
  ('B2-QMS-004', 'Inspecteurs aantoonbaar vakbekwaam en bevoegd', 'Competenties', 'current', 'in_progress', 'techniek', 'Diploma, bevoegdverklaring, kennistoets en praktijkaudit per Scope bewaken.'),
  ('B2-QMS-005', 'Meetmiddelen gekalibreerd en herleidbaar', 'Meetmiddelen', 'current', 'in_progress', 'techniek', 'Verlopen of geblokkeerde middelen mogen niet voor een inspectie worden gebruikt.'),
  ('B2-QMS-006', 'Inspectie- en rapportkwaliteit aantoonbaar geborgd', 'Inspectieproces', 'transition', 'in_progress', 'techniek', 'Werk, rapport en technische beoordeling vormen het centrale auditbewijs.'),
  ('B2-QMS-007', 'Afwijkingen en corrigerende maatregelen beheerst', 'Verbetering', 'transition', 'missing', 'kwaliteit', 'Correctie, oorzaak, maatregel en effectiviteitscontrole registreren.'),
  ('B2-QMS-008', 'Klachten onafhankelijk behandeld', 'Klachten', 'current', 'missing', 'kwaliteit', 'De beklaagde medewerker beslist niet zelfstandig over de klacht.'),
  ('B2-QMS-009', 'Interne audit uitgevoerd en opgevolgd', 'Audit', 'current', 'missing', 'kwaliteit', 'Volledige cyclus uitvoeren voor het certificatieonderzoek.'),
  ('B2-QMS-010', 'Directiebeoordeling uitgevoerd en vastgelegd', 'Directie', 'current', 'missing', 'directie', 'Besluiten, middelen en verbeteracties formeel vastleggen.'),
  ('B2-QMS-011', 'Leveranciers en uitbesteding beheerst', 'Leveranciers', 'current', 'missing', 'kwaliteit', 'Kritieke leveranciers risicogestuurd selecteren en periodiek beoordelen.'),
  ('B2-QMS-012', 'Back-up, hersteltest en informatiebeveiliging aantoonbaar', 'Informatiebeveiliging', 'current', 'in_progress', 'admin', 'Hersteltest en toegangscontrole periodiek vastleggen.'),
  ('B2-QMS-013', 'SCIOS-portaalregistraties en ontvangstbewijzen gekoppeld', 'SCIOS-portaal', 'transition', 'missing', 'kantoor', 'Zolang geen officiële API bestaat worden taken en bewijs handmatig gekoppeld.'),
  ('B2-QMS-014', 'Kiwa-toelating, systeemonderzoek en praktijkaudits gepland', 'Certificatie', 'verification_required', 'missing', 'directie', 'Auditplanning en vereiste proefinspecties schriftelijk laten bevestigen.')
on conflict (code) do nothing;

commit;

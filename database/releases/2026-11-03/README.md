# Productierelease 2026-11-03

Dit is een ongewijzigde, controleerbare spiegel van de twee geteste
Supabase-migraties uit de aparte bronmap `inspector-database` die horen bij de
digitale SCIOS-kwaliteitsmodule.

- `20261103110000_add_digital_quality_system.sql`: basisregisters, RLS,
  bewijsopslag en voorbereidingsmatrix.
- `20261103143000_harden_quality_integrity.sql`: bewijsverplichtingen,
  functiescheiding en integriteitscontroles.

De bronmap `inspector-database` blijft leidend voor verdere databaseontwikkeling.
Deze releasekopie is toegevoegd zodat de gepubliceerde appversie en de daarbij
behorende productiedatabasewijziging gezamenlijk reproduceerbaar blijven.

// @ts-nocheck
/* Recovered module: admin-workspaces. Generated from the verified 2026-10-26 production runtime. */
import { $Ce, $V, $c, AC, Av, BS, CEe, Cx, DCe, DM, Ee, Eg, Ex, FM, Fd, Gt, Gv, Kc, LCe, LM, MM, Mu, NM, NS, Ng, Ns, Ou, PM, QM, RM, TS, UI, UV, VS, Vm, WEe, WV, ZEe, Ze, ac, b5, bEe, c3e, cC, dC, dEe, e1, eEe, f3e, fC, g, gC, gEe, gf, h1, hC, hr, i3e, ip, jM, k1, kCe, lEe, mf, mh, mv, oC, p1, pC, qCe, r3e, s3e, st, t1, u0, wCe, y5, yCe, zM } from './vendor-core'
import { BB, D9e, FNe, GNe, HA, II, JNe, KNe, Nk, PNe, PhoneAgendaConnection, QNe, Ru, UNe, WK, XNe, Yo, _I, aU, eje, iU, lo, lp, pf, qM, rZ, tje, wI, zA, zNe } from './reporting-vendor'

function PlanningCalendar({
  inspections: r,
  users: e,
  currentUser: t,
  canManageTeam: n = !1,
  onEdit: i,
  onCreate: a,
  onReschedule: s
}) {
  const [o, c] = Ze.useState(Yo.WEEK),
    [l, u] = Ze.useState(new Date()),
    [d, f] = Ze.useState(!1),
    [h, m] = Ze.useState(""),
    [v, A] = Ze.useState(null),
    [y, b] = Ze.useState(!1),
    [w, E] = Ze.useState(!1),
    [B, P] = Ze.useState(n ? "team" : "mine"),
    [Q, M] = Ze.useState(null),
    [H, G] = Ze.useState(""),
    [X, q] = Ze.useState("09:00"),
    [D, $] = Ze.useState(4),
    [N, C] = Ze.useState(""),
    [S, k] = Ze.useState(!1),
    [j, W] = Ze.useState(""),
    [V, K] = Ze.useState(null),
    [oe, ue] = Ze.useState({}),
    [xe, re] = Ze.useState(!1),
    ve = Ze.useRef(null),
    Z = Ze.useRef(new Set()),
    Y = h || (n ? "" : t?.id || "");
  Ze.useEffect(() => {
    const We = window.matchMedia("(max-width: 640px)"),
      Wt = () => {
        E(We.matches), We.matches && (c(Yo.AGENDA), f(!1));
      };
    return Wt(), We.addEventListener("change", Wt), () => We.removeEventListener("change", Wt);
  }, []), Ze.useEffect(() => {
    if (!Q && !V) return;
    const We = document.body.style.overflow,
      Wt = Ot => {
        Ot.key === "Escape" && (M(null), K(null));
      };
    return document.body.style.overflow = "hidden", window.addEventListener("keydown", Wt), () => {
      document.body.style.overflow = We, window.removeEventListener("keydown", Wt);
    };
  }, [V, Q]);
  const ce = Ze.useCallback(async () => {
    if (d) {
      f(!1);
      return;
    }
    f(!0);
    const We = r.filter(Ot => {
      const St = Ot.report_data?.meta,
        $e = Number.isFinite(St?.lat) && Number.isFinite(St?.lng),
        at = !!(St?.projectAddress || St?.projectPostalCode || St?.projectCity);
      return !$e && !oe[Ot.id] && !Z.current.has(Ot.id) && at;
    });
    if (We.length === 0) return;
    We.forEach(Ot => Z.current.add(Ot.id)), re(!0);
    const Wt = await Promise.all(We.map(async Ot => {
      const St = Ot.report_data.meta,
        $e = await k1(St.projectAddress, St.projectPostalCode, St.projectCity);
      return $e ? {
        id: Ot.id,
        coordinates: $e
      } : null;
    }));
    ue(Ot => {
      const St = {
        ...Ot
      };
      return Wt.forEach($e => {
        $e && (St[$e.id] = $e.coordinates);
      }), St;
    }), re(!1);
  }, [r, oe, d]);
  Ze.useEffect(() => {
    !d || !w || window.requestAnimationFrame(() => ve.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    }));
  }, [w, d]);
  const be = Ze.useMemo(() => new Map(e.filter(We => We.full_name).map(We => [We.full_name, We])), [e]),
    De = Ze.useMemo(() => {
      const We = new Set(r.map(Ot => Ot.report_data?.meta?.assignedInspectorId).filter(Boolean)),
        Wt = new Set(r.map(Ot => Ot.report_data?.meta?.inspectorName).filter(Boolean));
      return e.filter(Ot => Ot.role === "inspector" || Ot.id === t?.id || We.has(Ot.id) || !!Ot.full_name && Wt.has(Ot.full_name));
    }, [t, r, e]),
    Ne = Ze.useCallback((We, Wt) => {
      const Ot = We || HA(lp(Ru(l), 9), 0),
        St = Ot.getHours() === 0 && Ot.getMinutes() === 0 ? lp(Ot, 9) : Ot,
        $e = B === "mine" ? t?.id : B !== "team" ? B : void 0,
        at = Wt ? String(Wt) : void 0,
        vt = at && De.some(Ur => Ur.id === at) ? at : void 0,
        _r = n ? vt || $e || t?.id || De[0]?.id || "" : t?.id || "";
      M(null), K({
        planned: !0,
        clientName: "",
        projectLocation: "",
        projectAddress: "",
        projectPostalCode: "",
        projectCity: "",
        date: lo(St, "yyyy-MM-dd"),
        time: lo(St, "HH:mm"),
        durationHours: 4,
        assignedInspectorId: _r
      }), W("");
    }, [B, n, t, l, De]),
    ze = Ze.useCallback(We => {
      Ne(new Date(We.start), We.resourceId);
    }, [Ne]),
    Je = Ze.useCallback(async () => {
      if (!V) return;
      k(!0);
      const We = await a({
        ...V,
        date: V.planned ? V.date : "",
        time: V.planned ? V.time : ""
      });
      k(!1), W(We.message), We.ok && K(null);
    }, [V, a]),
    Me = Ze.useMemo(() => r.flatMap(We => {
      const Wt = We.report_data.meta;
      if (!Wt?.date) return [];
      const Ot = Wt.date,
        St = Wt.scheduledTimeStart || "09:00",
        $e = Number(Wt.estimatedDurationHours),
        at = Number.isFinite($e) && $e > 0 ? $e : 4,
        vt = _I(Ot);
      if (!WK(vt)) return [];
      const [_r, Ur] = St.split(":").map(Number),
        pr = Number.isInteger(_r) && _r >= 0 && _r <= 23 ? _r : 9,
        Wr = Number.isInteger(Ur) && Ur >= 0 && Ur <= 59 ? Ur : 0,
        Nr = HA(lp(vt, pr), Wr),
        Yr = wI(Nr, at),
        en = Wt.assignedInspectorId ? e.find(Zr => Zr.id === Wt.assignedInspectorId) : be.get(Wt.inspectorName || "");
      return [{
        id: We.id,
        title: `${Wt.clientName || "—"}${Wt.projectLocation ? " · " + Wt.projectLocation : ""}`,
        start: Nr,
        end: Yr,
        resource: We,
        inspectorName: en?.full_name || Wt.inspectorName || "Niet toegewezen",
        resourceId: en?.id || Wt.assignedInspectorId || `name:${Wt.inspectorName || "unassigned"}`
      }];
    }), [r, be, e]),
    _e = Ze.useMemo(() => {
      if (B === "team") return Me;
      const We = B === "mine" ? t?.id : B;
      return We ? Me.filter(Wt => Wt.resourceId === We || We === t?.id && Wt.inspectorName === t?.full_name) : Me;
    }, [Me, B, t]),
    Ae = Ze.useMemo(() => JNe(Me.map(We => We.resourceId)), [Me]),
    Ue = Ze.useMemo(() => {
      const We = De.map(at => ({
          id: at.id,
          title: at.full_name || at.email
        })),
        Wt = new Set(We.map(at => at.id)),
        Ot = Me.filter(at => !Wt.has(at.resourceId)).map(at => ({
          id: at.resourceId,
          title: at.inspectorName
        })),
        St = [...We, ...Ot].filter((at, vt, _r) => _r.findIndex(Ur => Ur.id === at.id) === vt);
      if (B === "team") return St;
      const $e = B === "mine" ? t?.id : B;
      return St.filter(at => at.id === $e);
    }, [Me, B, t, De]),
    tt = Ze.useMemo(() => {
      const We = new Set(),
        Wt = new Map();
      return Me.forEach(Ot => Wt.set(Ot.resourceId, [...(Wt.get(Ot.resourceId) || []), Ot])), Wt.forEach(Ot => {
        const St = [...Ot].sort(($e, at) => $e.start.getTime() - at.start.getTime());
        for (let $e = 0; $e < St.length - 1; $e += 1) St[$e].end > St[$e + 1].start && (We.add(St[$e].id), We.add(St[$e + 1].id));
      }), We;
    }, [Me]),
    Ge = Ze.useCallback(We => {
      const Wt = Ae.get(We.resourceId) || "#52525b",
        Ot = tt.has(We.id);
      return {
        style: {
          backgroundColor: Wt,
          borderLeft: Ot ? "4px solid #dc2626" : "3px solid rgba(0,0,0,0.2)",
          color: "white",
          borderRadius: "3px",
          fontSize: "12px",
          padding: "1px 4px"
        }
      };
    }, [Ae, tt]),
    et = Ze.useCallback(We => n ? !0 : t ? We.resourceId === t.id || We.inspectorName === t.full_name : !1, [n, t]),
    ct = Ze.useCallback(We => {
      M(We), G(lo(We.start, "yyyy-MM-dd")), q(lo(We.start, "HH:mm")), $(Math.max(.5, (We.end.getTime() - We.start.getTime()) / 36e5)), C(We.resourceId), W("");
    }, []),
    ht = Ze.useCallback(We => ct(We), [ct]),
    Tt = Ze.useCallback((We, Wt, Ot, St) => Me.find($e => $e.id !== We && $e.resourceId === St && Wt < $e.end && Ot > $e.start), [Me]),
    Vt = Ze.useCallback(async (We, Wt, Ot, St) => {
      const $e = wI(Wt, Ot),
        at = Tt(We.id, Wt, $e, St);
      if (at) {
        const _r = `Conflict met ${at.title} (${lo(at.start, "HH:mm")}–${lo(at.end, "HH:mm")}).`;
        return W(_r), {
          ok: !1,
          message: _r
        };
      }
      const vt = await s({
        id: We.id,
        newDate: lo(Wt, "yyyy-MM-dd"),
        newTime: lo(Wt, "HH:mm"),
        newDurationHours: Ot,
        assignedInspectorId: St,
        expectedUpdatedAt: We.resource.updated_at
      });
      return W(vt.message), vt;
    }, [Tt, s]),
    Ft = Ze.useCallback(async ({
      event: We,
      start: Wt,
      resourceId: Ot
    }) => {
      if (!et(We)) return;
      const St = lo(new Date(Wt), "yyyy-MM-dd"),
        $e = lo(new Date(Wt), "HH:mm"),
        at = Math.max(.5, (We.end.getTime() - We.start.getTime()) / 36e5),
        vt = HA(lp(_I(St), Number($e.split(":")[0])), Number($e.split(":")[1]));
      await Vt(We, vt, at, n ? String(Ot || We.resourceId) : t?.id || We.resourceId);
    }, [et, n, t, Vt]),
    Ut = Ze.useCallback(async ({
      event: We,
      start: Wt,
      end: Ot
    }) => {
      if (!et(We)) return;
      const St = (new Date(Ot).getTime() - new Date(Wt).getTime()) / (1e3 * 60 * 60);
      await Vt(We, new Date(Wt), St, We.resourceId);
    }, [et, Vt]),
    mr = Ze.useMemo(() => r.filter(We => !We.report_data?.meta?.date), [r]),
    wr = Ze.useMemo(() => {
      if (o !== Yo.DAY) return [];
      const We = lo(l, "yyyy-MM-dd"),
        Wt = _e.filter(Ot => lo(Ot.start, "yyyy-MM-dd") === We).map(Ot => ({
          lat: Ot.resource.report_data?.meta?.lat,
          lng: Ot.resource.report_data?.meta?.lng
        })).filter(Ot => !!Ot.lat && !!Ot.lng);
      return Wt.length === 0 ? [] : mr.flatMap(Ot => {
        const St = Ot.report_data?.meta?.lat,
          $e = Ot.report_data?.meta?.lng;
        if (typeof St != "number" || typeof $e != "number") return [];
        const at = Math.min(...Wt.map(vt => BB(vt.lat, vt.lng, St, $e)));
        return [{
          insp: Ot,
          distKm: Math.round(at)
        }];
      }).filter(({
        distKm: Ot
      }) => Ot <= 30).sort((Ot, St) => Ot.distKm - St.distKm);
    }, [o, l, _e, mr]),
    He = Ze.useMemo(() => Ue.map(We => ({
      id: We.id,
      name: We.title,
      color: Ae.get(We.id) || "#52525b"
    })), [Ae, Ue]),
    It = Ze.useCallback(async () => {
      b(!0);
      const We = e.find(Ur => Ur.id === Y),
        Wt = We?.full_name || We?.email || "deze inspecteur";
      let Ot = We?.home_lat,
        St = We?.home_lng;
      if ((!Ot || !St) && We?.home_address) {
        const Ur = await k1(We.home_address, We.home_postal_code || "", We.home_city || "");
        Ur && (Ot = Ur.lat, St = Ur.lng);
      }
      if (!Ot || !St) {
        alert(`Geen thuisadres gevonden voor ${Wt}.
Sla het thuisadres op via Mijn Profiel in de Inspector app.`), b(!1);
        return;
      }
      const $e = lo(l, "yyyy-MM-dd"),
        at = Me.flatMap(Ur => {
          const pr = Ur.resource.report_data?.meta?.lat,
            Wr = Ur.resource.report_data?.meta?.lng;
          return Ur.resourceId !== Y || lo(Ur.start, "yyyy-MM-dd") !== $e || typeof pr != "number" || typeof Wr != "number" ? [] : [{
            id: Ur.id,
            lat: pr,
            lng: Wr,
            estimatedDurationHours: Ur.resource.report_data.meta.estimatedDurationHours ?? 2,
            resource: Ur.resource
          }];
        });
      if (at.length < 2) {
        alert("Minimaal 2 geplande inspecties met coördinaten nodig om te optimaliseren."), b(!1);
        return;
      }
      const vt = zNe({
          lat: Ot,
          lng: St
        }, at),
        _r = UNe(vt, {
          lat: Ot,
          lng: St
        });
      A(_r), b(!1);
    }, [e, Y, l, Me]),
    Ct = Ze.useMemo(() => {
      const We = e.find(Wt => Wt.id === Y);
      return We?.full_name || We?.email || "";
    }, [Y, e]),
    mt = Ze.useCallback(async () => {
      if (!v) return;
      if (v.some(St => St.scheduledHour > 23)) {
        W("Route past niet binnen één dag. Verkort inspecties of verdeel opdrachten over meerdere dagen.");
        return;
      }
      b(!0);
      const We = lo(l, "yyyy-MM-dd"),
        Wt = v.map(St => St.id);
      let Ot = 0;
      for (const St of v) {
        const $e = `${String(St.scheduledHour).padStart(2, "0")}:${String(St.scheduledMinute).padStart(2, "0")}`,
          at = await s({
            id: St.id,
            newDate: We,
            newTime: $e,
            assignedInspectorId: Y,
            ignoreConflictIds: Wt,
            expectedUpdatedAt: St.resource.updated_at
          });
        if (!at.ok) {
          W(`Route deels opgeslagen (${Ot}/${v.length}). ${at.message}`), b(!1);
          return;
        }
        Ot += 1;
      }
      W("Geoptimaliseerde route opgeslagen. Reistijd is indicatief, zonder actuele verkeersdrukte."), A(null), b(!1);
    }, [l, s, Y, v]),
    Ye = Ze.useCallback(We => {
      const Wt = We.report_data?.meta,
        Ot = oe[We.id],
        St = Number.isFinite(Wt?.lat) ? Number(Wt.lat) : Ot?.lat,
        $e = Number.isFinite(Wt?.lng) ? Number(Wt.lng) : Ot?.lng;
      return Number.isFinite(St) && Number.isFinite($e) ? {
        inspection: We,
        lat: St,
        lng: $e
      } : null;
    }, [oe]),
    bt = Ze.useMemo(() => r.filter(We => !!We.report_data?.meta?.date).map(Ye).filter(We => We !== null), [r, Ye]),
    ke = Ze.useMemo(() => r.filter(We => !We.report_data?.meta?.date).map(Ye).filter(We => We !== null), [r, Ye]),
    Qt = Ze.useMemo(() => v ? v.map(We => [We.lat, We.lng]) : null, [v]),
    ir = Ze.useMemo(() => {
      const We = [...bt, ...ke];
      if (We.length === 0) return [52.2, 5.3];
      const Wt = We.reduce((St, $e) => St + $e.lat, 0) / We.length,
        Ot = We.reduce((St, $e) => St + $e.lng, 0) / We.length;
      return [Wt, Ot];
    }, [bt, ke]),
    ge = Ze.useMemo(() => [...bt, ...ke], [bt, ke]),
    xt = Math.max(0, r.length - ge.length),
    Nt = new Date(),
    Pe = _e.filter(We => We.start >= Ru(Nt) && We.start <= D9e(Nt)).length,
    dt = _e.filter(We => We.start >= Ru(Nt) && We.start < zA(Ru(Nt), 7)).length,
    _t = _e.filter(We => tt.has(We.id) && We.end >= Ru(Nt)).length,
    lr = Ze.useCallback(We => {
      const Wt = We.resource.report_data.meta;
      return {
        id: We.id,
        title: `Inspectie · ${We.title}`,
        start: We.start,
        end: We.end,
        location: [Wt.projectAddress, Wt.projectPostalCode, Wt.projectCity].filter(Boolean).join(", "),
        description: `Inspecteur: ${We.inspectorName}
Inspectienummer: ${We.resource.inspection_number || "concept"}`
      };
    }, []),
    dr = Ze.useCallback(async (We, Wt) => {
      try {
        const Ot = We.filter($e => $e.end >= Ru(new Date())),
          St = await GNe(Ot.map(lr), Wt);
        W(St === "shared" ? "Agenda gedeeld met je telefoon." : "Agenda-bestand gedownload. Open dit bestand met je telefoonagenda.");
      } catch (Ot) {
        if (Ot instanceof DOMException && Ot.name === "AbortError") return;
        W(Ot instanceof Error ? Ot.message : "Agenda-export mislukt.");
      }
    }, [lr]),
    yr = Ze.useCallback(We => {
      const Wt = We.report_data.meta,
        Ot = Wt.assignedInspectorId ? e.find(vt => vt.id === Wt.assignedInspectorId) : be.get(Wt.inspectorName || ""),
        St = Ot || n && De[0] || t,
        $e = Wt.assignedInspectorId || Ot?.id || (Wt.inspectorName ? `name:${Wt.inspectorName}` : ""),
        at = HA(lp(Ru(l), 9), 0);
      ct({
        id: We.id,
        title: `${Wt.clientName || We.client_name || "—"}${Wt.projectLocation ? ` · ${Wt.projectLocation}` : ""}`,
        start: at,
        end: wI(at, Wt.estimatedDurationHours ?? 4),
        resource: We,
        inspectorName: $e ? Ot?.full_name || Wt.inspectorName || "Toegewezen inspecteur" : St?.full_name || "Niet toegewezen",
        resourceId: $e || St?.id || "name:unassigned"
      });
    }, [n, t, l, ct, De, be, e]);
  return g.jsxs("div", {
    className: "ig-planning-board flex flex-col gap-4",
    children: [g.jsxs("div", {
      className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
      children: [g.jsxs("div", {
        className: "rounded-xl border bg-white p-3",
        children: [g.jsx("div", {
          className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
          children: "Vandaag"
        }), g.jsx("div", {
          className: "mt-1 text-2xl font-bold text-zinc-800",
          children: Pe
        })]
      }), g.jsxs("div", {
        className: "rounded-xl border bg-white p-3",
        children: [g.jsx("div", {
          className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
          children: "Komende 7 dagen"
        }), g.jsx("div", {
          className: "mt-1 text-2xl font-bold text-zinc-800",
          children: dt
        })]
      }), g.jsxs("div", {
        className: "rounded-xl border bg-white p-3",
        children: [g.jsx("div", {
          className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
          children: "Ongepland"
        }), g.jsx("div", {
          className: "mt-1 text-2xl font-bold text-zinc-800",
          children: mr.length
        })]
      }), g.jsxs("div", {
        className: `rounded-xl border bg-white p-3 ${_t ? "border-red-200" : ""}`,
        children: [g.jsx("div", {
          className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
          children: "Conflicten"
        }), g.jsx("div", {
          className: `mt-1 text-2xl font-bold ${_t ? "text-red-600" : "text-zinc-800"}`,
          children: _t
        })]
      })]
    }), j && g.jsxs("div", {
      role: "status",
      "aria-live": "polite",
      className: `flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${j.toLowerCase().includes("conflict") || j.toLowerCase().includes("mislukt") ? "border-red-200 bg-red-50 text-red-700" : "border-zinc-200 bg-white text-zinc-700"}`,
      children: [g.jsxs("span", {
        className: "flex items-center gap-2",
        children: [j.toLowerCase().includes("conflict") ? g.jsx(zM, {
          size: 16
        }) : g.jsx(p1, {
          size: 16
        }), j]
      }), g.jsx("button", {
        onClick: () => W(""),
        className: "p-1",
        children: g.jsx(Kc, {
          size: 15
        })
      })]
    }), g.jsxs("div", {
      className: "flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 bg-white rounded-xl p-3 sm:p-4 shadow-sm border",
      children: [g.jsxs("div", {
        className: "flex w-full gap-2 overflow-x-auto pb-1 no-scrollbar",
        "aria-label": "Agendaweergave per medewerker",
        children: [n && g.jsxs("button", {
          onClick: () => P("team"),
          className: `flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold ${B === "team" ? "border-zinc-500 bg-zinc-700 text-white" : "border-zinc-200 bg-white text-zinc-600"}`,
          children: [g.jsx(c3e, {
            size: 16
          }), " Team"]
        }), t && g.jsxs("button", {
          onClick: () => P("mine"),
          className: `flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold ${B === "mine" ? "border-zinc-500 bg-zinc-700 text-white" : "border-zinc-200 bg-white text-zinc-600"}`,
          children: [g.jsx(s3e, {
            size: 16
          }), " Mijn agenda"]
        }), n && De.filter(We => We.id !== t?.id).map(We => g.jsx("button", {
          onClick: () => P(We.id),
          className: `min-h-10 shrink-0 rounded-lg border px-3 text-sm font-bold ${B === We.id ? "border-zinc-500 bg-zinc-700 text-white" : "border-zinc-200 bg-white text-zinc-600"}`,
          children: We.full_name || We.email
        }, We.id))]
      }), He.length > 0 && g.jsxs("div", {
        className: "flex flex-wrap gap-3 items-center",
        children: [g.jsx("span", {
          className: "text-xs font-bold text-gray-500 uppercase",
          children: "Inspecteurs:"
        }), He.map(({
          name: We,
          color: Wt
        }) => g.jsxs("span", {
          className: "flex items-center gap-1.5 text-sm",
          children: [g.jsx("span", {
            className: "inline-block w-3 h-3 rounded-full shrink-0",
            style: {
              backgroundColor: Wt
            }
          }), We]
        }, We))]
      }), g.jsxs("div", {
        className: "grid w-full grid-cols-1 gap-2 sm:ml-auto sm:flex sm:w-auto sm:items-center sm:flex-wrap",
        children: [g.jsxs("button", {
          onClick: () => Ne(),
          className: "flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-bold text-white hover:bg-zinc-950",
          children: [g.jsx(mh, {
            size: 16
          }), " Nieuwe opdracht"]
        }), g.jsxs("button", {
          onClick: () => {
            ce();
          },
          "aria-pressed": d,
          className: `flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-bold ${d ? "border-zinc-500 bg-zinc-100 text-zinc-900" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"}`,
          children: [g.jsx(FM, {
            size: 14
          }), " ", d ? "Verberg kaart" : "Toon kaart"]
        }), g.jsxs("button", {
          onClick: () => {
            dr(_e, B === "team" ? "Inspector teamagenda" : `Inspector agenda ${t?.full_name || ""}`);
          },
          disabled: _e.length === 0,
          className: "flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40",
          children: [g.jsx(TS, {
            size: 15
          }), " Eenmalig exporteren"]
        }), t && g.jsx(PhoneAgendaConnection, {}), g.jsxs("select", {
          id: "planning-optimize-inspector",
          name: "planningOptimizeInspector",
          "aria-label": "Inspecteur voor routeoptimalisatie",
          value: Y,
          onChange: We => {
            m(We.target.value), A(null);
          },
          className: "min-h-11 border rounded-lg px-3 py-2 text-sm",
          children: [g.jsx("option", {
            value: "",
            children: "Kies inspecteur..."
          }), De.filter(We => n || We.id === t?.id).map(We => g.jsx("option", {
            value: We.id,
            children: We.full_name || We.email
          }, We.id))]
        }), g.jsxs("button", {
          disabled: !Y || y,
          onClick: It,
          className: "flex min-h-11 items-center justify-center gap-1.5 px-3 py-2 bg-zinc-700 text-white rounded-lg text-sm hover:bg-zinc-900 disabled:opacity-50",
          children: [g.jsx(f3e, {
            size: 14
          }), " ", y ? "Bezig..." : "Optimaliseer dag"]
        })]
      })]
    }), wr.length > 0 && g.jsxs("div", {
      className: "bg-zinc-50 border border-zinc-200 rounded-lg p-3",
      children: [g.jsx("p", {
        className: "text-xs font-bold text-zinc-700 uppercase mb-2",
        children: "Nabijgelegen ongeplande klussen (binnen 30 km van vandaag)"
      }), g.jsx("div", {
        className: "flex flex-wrap gap-2",
        children: wr.map(({
          insp: We,
          distKm: Wt
        }) => g.jsxs("button", {
          onClick: () => yr(We),
          className: "bg-white border border-zinc-200 rounded px-2 py-1 text-xs hover:bg-zinc-100 text-left",
          children: [g.jsx("span", {
            className: "font-bold",
            children: We.client_name || "—"
          }), g.jsxs("span", {
            className: "text-zinc-600 ml-1",
            children: ["· ", Wt, " km"]
          }), We.report_data?.meta?.projectLocation && g.jsxs("span", {
            className: "text-gray-400 ml-1",
            children: ["· ", We.report_data.meta.projectLocation]
          })]
        }, We.id))
      })]
    }), mr.length > 0 && g.jsxs("div", {
      className: "rounded-xl border border-zinc-200 bg-white p-3 shadow-sm",
      children: [g.jsxs("p", {
        className: "mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500",
        children: ["Ongepland (", mr.length, ")"]
      }), g.jsx("div", {
        className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
        children: mr.map(We => g.jsxs("button", {
          onClick: () => yr(We),
          className: "flex min-h-11 items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm hover:border-zinc-400 hover:bg-white",
          children: [g.jsxs("span", {
            className: "min-w-0",
            children: [g.jsx("span", {
              className: "block truncate font-bold text-zinc-800",
              children: We.client_name || "—"
            }), We.report_data?.meta?.projectLocation && g.jsx("span", {
              className: "block truncate text-xs text-zinc-500",
              children: We.report_data.meta.projectLocation
            })]
          }), g.jsx("span", {
            className: "shrink-0 font-bold text-zinc-700",
            children: "Plan"
          })]
        }, We.id))
      })]
    }), g.jsxs("div", {
      className: "flex flex-col gap-4 xl:flex-row",
      children: [w ? g.jsxs("div", {
        className: "order-2 min-w-0 w-full rounded-xl border bg-white shadow-sm xl:order-1 xl:flex-1",
        children: [g.jsxs("div", {
          className: "grid grid-cols-3 gap-2 border-b p-3",
          children: [g.jsx("button", {
            onClick: () => u(We => zA(We, -1)),
            className: "min-h-11 rounded-lg border text-sm font-bold text-zinc-600",
            children: "Vorige"
          }), g.jsx("button", {
            onClick: () => u(new Date()),
            className: "min-h-11 rounded-lg bg-zinc-700 text-sm font-bold text-white",
            children: "Vandaag"
          }), g.jsx("button", {
            onClick: () => u(We => zA(We, 1)),
            className: "min-h-11 rounded-lg border text-sm font-bold text-zinc-600",
            children: "Volgende"
          })]
        }), g.jsxs("div", {
          className: "border-b px-4 py-3 text-sm font-bold capitalize text-zinc-700",
          children: ["Vanaf ", lo(l, "EEEE d MMMM", {
            locale: pf
          })]
        }), g.jsxs("div", {
          className: "divide-y",
          children: [_e.filter(We => We.end >= Ru(l) && We.start < zA(Ru(l), 14)).sort((We, Wt) => We.start.getTime() - Wt.start.getTime()).map(We => {
            const Wt = We.resource.report_data.meta,
              Ot = tt.has(We.id);
            return g.jsxs("button", {
              onClick: () => ct(We),
              className: "flex w-full gap-3 p-4 text-left hover:bg-zinc-50",
              children: [g.jsxs("div", {
                className: "w-[4.5rem] shrink-0",
                children: [g.jsx("div", {
                  className: "text-xs font-bold capitalize text-zinc-500",
                  children: lo(We.start, "EEE d MMM", {
                    locale: pf
                  })
                }), g.jsx("div", {
                  className: "mt-1 text-lg font-bold text-zinc-800",
                  children: lo(We.start, "HH:mm")
                }), g.jsxs("div", {
                  className: "text-xs text-zinc-400",
                  children: ["tot ", lo(We.end, "HH:mm")]
                })]
              }), g.jsxs("div", {
                className: `min-w-0 flex-1 border-l-4 pl-3 ${Ot ? "border-red-500" : "border-zinc-400"}`,
                children: [g.jsx("div", {
                  className: "truncate font-bold text-zinc-900",
                  children: Wt.clientName || We.resource.client_name || "—"
                }), g.jsx("div", {
                  className: "truncate text-sm text-zinc-600",
                  children: Wt.projectLocation || Wt.projectCity || "Geen locatie"
                }), g.jsxs("div", {
                  className: "mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400",
                  children: [g.jsx("span", {
                    children: We.inspectorName
                  }), Ot && g.jsx("span", {
                    className: "font-bold text-red-600",
                    children: "Conflict"
                  }), !et(We) && g.jsx("span", {
                    children: "Alleen bekijken"
                  })]
                })]
              })]
            }, We.id);
          }), _e.filter(We => We.end >= Ru(l) && We.start < zA(Ru(l), 14)).length === 0 && g.jsx("div", {
            className: "p-8 text-center text-sm text-zinc-400",
            children: "Geen afspraken in komende 14 dagen."
          })]
        })]
      }) : g.jsx("div", {
        className: "order-2 h-[560px] min-w-0 w-full bg-white rounded-xl shadow-sm border overflow-hidden sm:h-[700px] xl:order-1 xl:flex-1",
        children: g.jsx(KNe, {
          localizer: XNe,
          events: _e,
          view: o,
          onView: We => {
            c(We), A(null);
          },
          date: l,
          onNavigate: We => {
            u(We), A(null);
          },
          views: [Yo.MONTH, Yo.WEEK, Yo.DAY, Yo.AGENDA],
          startAccessor: "start",
          endAccessor: "end",
          style: {
            height: "100%",
            padding: "8px"
          },
          eventPropGetter: Ge,
          onSelectEvent: ht,
          onSelectSlot: ze,
          onEventDrop: Ft,
          onEventResize: Ut,
          selectable: !0,
          resizable: !0,
          draggableAccessor: et,
          resizableAccessor: et,
          step: 30,
          timeslots: 2,
          min: lp(Ru(new Date()), 7),
          max: lp(Ru(new Date()), 19),
          ...(o === Yo.DAY && Ue.length > 1 ? {
            resources: Ue,
            resourceIdAccessor: "id",
            resourceTitleAccessor: "title"
          } : {}),
          messages: {
            next: "Volgende",
            previous: "Vorige",
            today: "Vandaag",
            month: "Maand",
            week: "Week",
            day: "Dag",
            agenda: "Lijst",
            date: "Datum",
            time: "Tijd",
            event: "Inspectie",
            noEventsInRange: "Geen inspecties in deze periode.",
            showMore: We => `+${We} meer`
          },
          culture: "nl",
          formats: {
            dayHeaderFormat: We => lo(We, "EEE d MMM", {
              locale: pf
            }),
            dayRangeHeaderFormat: ({
              start: We,
              end: Wt
            }) => `${lo(We, "d MMM", {
              locale: pf
            })} – ${lo(Wt, "d MMM yyyy", {
              locale: pf
            })}`,
            monthHeaderFormat: We => lo(We, "MMMM yyyy", {
              locale: pf
            }),
            agendaDateFormat: We => lo(We, "EEE d MMM", {
              locale: pf
            })
          }
        })
      }), d && g.jsxs("div", {
        ref: ve,
        className: "order-1 flex w-full shrink-0 flex-col gap-3 scroll-mt-3 xl:order-2 xl:w-[380px]",
        children: [g.jsxs("div", {
          className: "flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 xl:hidden",
          children: [g.jsxs("span", {
            className: "flex items-center gap-2 text-sm font-bold text-zinc-800",
            children: [g.jsx(FM, {
              size: 16
            }), " Opdrachtenkaart"]
          }), g.jsxs("span", {
            className: "text-xs text-zinc-500",
            children: [ge.length, " locaties"]
          })]
        }), g.jsxs("div", {
          className: "relative z-0 h-[360px] overflow-hidden rounded-xl border bg-white shadow-sm sm:h-[460px] xl:h-[700px]",
          children: [g.jsxs(PNe, {
            center: ir,
            zoom: 8,
            style: {
              height: "100%",
              width: "100%"
            },
            children: [g.jsx(tje, {
              center: ir,
              pins: ge
            }), g.jsx(FNe, {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }), bt.map(({
              inspection: We,
              lat: Wt,
              lng: Ot
            }) => {
              const St = We.report_data.meta,
                $e = St.assignedInspectorId || be.get(St.inspectorName || "")?.id || `name:${St.inspectorName || "unassigned"}`,
                at = Ae.get($e) || "#52525b";
              return g.jsx(iU, {
                position: [Wt, Ot],
                icon: rZ(at),
                children: g.jsx(aU, {
                  children: g.jsxs("div", {
                    className: "text-sm min-w-[180px]",
                    children: [g.jsx("div", {
                      className: "font-bold mb-1",
                      children: St.clientName || "—"
                    }), St.projectLocation && g.jsx("div", {
                      className: "text-gray-600 text-xs mb-0.5",
                      children: St.projectLocation
                    }), g.jsxs("div", {
                      className: "text-gray-500 text-xs mb-0.5",
                      children: [St.projectAddress, ", ", St.projectCity]
                    }), St.inspectorName && g.jsx("div", {
                      className: "text-xs text-zinc-600 mb-1",
                      children: St.inspectorName
                    }), St.date && g.jsxs("div", {
                      className: "text-xs text-gray-400 mb-1",
                      children: [St.date, St.scheduledTimeStart ? ` · ${St.scheduledTimeStart}` : ""]
                    }), g.jsxs("div", {
                      className: "flex gap-2 mt-1.5",
                      children: [g.jsx("button", {
                        onClick: () => i?.(We),
                        className: "text-xs px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200",
                        children: "Bewerken"
                      }), g.jsxs("a", {
                        href: II(St),
                        target: "_blank",
                        rel: "noreferrer",
                        className: "flex items-center gap-1 text-xs px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200",
                        children: [g.jsx(pC, {
                          size: 11
                        }), " Navigeer"]
                      })]
                    })]
                  })
                })
              }, `p-${We.id}`);
            }), ke.map(({
              inspection: We,
              lat: Wt,
              lng: Ot
            }) => {
              const St = We.report_data.meta;
              return g.jsx(iU, {
                position: [Wt, Ot],
                icon: eje,
                children: g.jsx(aU, {
                  children: g.jsxs("div", {
                    className: "text-sm min-w-[160px]",
                    children: [g.jsx("div", {
                      className: "font-bold mb-1",
                      children: St.clientName || We.client_name || "—"
                    }), g.jsx("div", {
                      className: "text-amber-600 text-xs mb-1",
                      children: "Ongepland"
                    }), g.jsxs("div", {
                      className: "text-gray-500 text-xs mb-1",
                      children: [St.projectAddress, ", ", St.projectCity]
                    }), g.jsx("button", {
                      onClick: () => i?.(We),
                      className: "text-xs px-2 py-0.5 bg-amber-100 rounded hover:bg-amber-200 w-full",
                      children: "Inplannen"
                    })]
                  })
                })
              }, `u-${We.id}`);
            }), Qt && Qt.length > 1 && g.jsx(QNe, {
              positions: Qt,
              color: "#52525b",
              weight: 2,
              dashArray: "6 4"
            })]
          }), xe && g.jsxs("div", {
            className: "pointer-events-none absolute left-1/2 top-3 z-[500] flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-zinc-700 shadow-lg",
            children: [g.jsx(dC, {
              className: "animate-spin",
              size: 14
            }), " Locaties zoeken…"]
          }), !xe && ge.length === 0 && g.jsxs("div", {
            className: "absolute inset-x-4 top-1/2 z-[500] -translate-y-1/2 rounded-xl border border-zinc-200 bg-white/95 p-4 text-center shadow-lg",
            children: [g.jsx(u0, {
              className: "mx-auto text-zinc-400",
              size: 24
            }), g.jsx("p", {
              className: "mt-2 text-sm font-bold text-zinc-800",
              children: "Geen kaartlocaties gevonden"
            }), g.jsx("p", {
              className: "mt-1 text-xs text-zinc-500",
              children: "Vul adres, postcode en plaats in bij een opdracht."
            })]
          })]
        }), xt > 0 && ge.length > 0 && g.jsxs("p", {
          className: "px-1 text-xs text-zinc-500",
          children: [xt, " opdracht", xt === 1 ? "" : "en", " zonder bruikbare locatie."]
        })]
      })]
    }), v && g.jsxs("div", {
      className: "bg-zinc-50 border border-zinc-200 rounded-lg p-4",
      children: [g.jsxs("div", {
        className: "flex items-center justify-between mb-3",
        children: [g.jsxs("h3", {
          className: "font-semibold text-zinc-800 text-sm",
          children: ["Geoptimaliseerde route — ", Ct, " — ", lo(l, "d MMM", {
            locale: pf
          })]
        }), g.jsx("button", {
          onClick: () => A(null),
          className: "text-gray-400 hover:text-gray-600",
          children: g.jsx(Kc, {
            size: 16
          })
        })]
      }), g.jsx("ol", {
        className: "space-y-2",
        children: v.map((We, Wt) => {
          const Ot = We.resource.report_data?.meta,
            St = `${String(We.scheduledHour).padStart(2, "0")}:${String(We.scheduledMinute).padStart(2, "0")}`;
          return g.jsxs("li", {
            className: "flex items-start gap-3 bg-white rounded p-2 border border-zinc-200",
            children: [g.jsxs("span", {
              className: "font-bold text-zinc-700 w-5 text-sm shrink-0",
              children: [Wt + 1, "."]
            }), g.jsxs("div", {
              className: "flex-1 min-w-0",
              children: [g.jsxs("div", {
                className: "font-medium text-sm",
                children: [St, " — ", Ot?.clientName || "—"]
              }), g.jsxs("div", {
                className: "text-xs text-gray-500 truncate",
                children: [Ot?.projectAddress, ", ", Ot?.projectCity]
              }), g.jsxs("div", {
                className: "text-xs text-gray-400",
                children: [Wt === 0 ? "Vanaf huis" : "Vanaf vorige locatie", ": circa ", We.travelMinutesFromPrevious, " min rijden", Ot?.estimatedDurationHours ? ` · ${Ot.estimatedDurationHours} uur inspectie` : ""]
              })]
            }), g.jsx("a", {
              href: II(Ot),
              target: "_blank",
              rel: "noreferrer",
              className: "shrink-0 p-1.5 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
              title: "Navigeer",
              children: g.jsx(pC, {
                size: 14
              })
            })]
          }, We.id);
        })
      }), g.jsx("button", {
        onClick: () => {
          mt();
        },
        disabled: y,
        className: "mt-3 w-full py-2.5 bg-zinc-700 text-white rounded-lg text-sm font-bold hover:bg-zinc-900 disabled:opacity-50",
        children: y ? "Route opslaan…" : "Volgorde en reistijden toepassen"
      })]
    }), V && g.jsx("div", {
      className: "fixed inset-0 z-[120] flex items-end justify-center bg-black/45 sm:items-center sm:p-4",
      children: g.jsxs("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "planning-create-title",
        className: "max-h-[96dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:rounded-2xl",
        children: [g.jsxs("div", {
          className: "sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-zinc-50 p-4",
          children: [g.jsxs("div", {
            children: [g.jsx("p", {
              className: "text-xs font-bold uppercase tracking-wider text-zinc-400",
              children: "Planning"
            }), g.jsx("h2", {
              id: "planning-create-title",
              className: "mt-1 text-lg font-bold text-zinc-900",
              children: "Nieuwe opdracht"
            }), g.jsx("p", {
              className: "text-sm text-zinc-500",
              children: "Maak direct afspraak of zet opdracht in werkvoorraad."
            })]
          }), g.jsx("button", {
            onClick: () => K(null),
            className: "ig-icon-button shrink-0",
            "aria-label": "Sluiten",
            children: g.jsx(Kc, {
              size: 19
            })
          })]
        }), g.jsxs("div", {
          className: "space-y-4 p-4",
          children: [g.jsxs("div", {
            className: "grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1",
            "aria-label": "Planningstatus",
            children: [g.jsx("button", {
              type: "button",
              onClick: () => K(We => We && {
                ...We,
                planned: !0
              }),
              className: `min-h-10 rounded-lg text-sm font-bold ${V.planned ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`,
              children: "In agenda"
            }), g.jsx("button", {
              type: "button",
              onClick: () => K(We => We && {
                ...We,
                planned: !1
              }),
              className: `min-h-10 rounded-lg text-sm font-bold ${V.planned ? "text-zinc-500" : "bg-white text-zinc-900 shadow-sm"}`,
              children: "Werkvoorraad"
            })]
          }), g.jsxs("label", {
            className: "block text-xs font-bold uppercase tracking-wide text-zinc-500",
            children: ["Klant of opdrachttitel", g.jsx("input", {
              name: "planningClientName",
              autoFocus: !0,
              required: !0,
              value: V.clientName,
              onChange: We => K({
                ...V,
                clientName: We.target.value
              }),
              className: "mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-base font-normal text-zinc-900",
              placeholder: "Bijv. Bakkerij De Markt"
            })]
          }), g.jsxs("label", {
            className: "block text-xs font-bold uppercase tracking-wide text-zinc-500",
            children: ["Locatie of project", g.jsx("input", {
              name: "planningProjectLocation",
              value: V.projectLocation,
              onChange: We => K({
                ...V,
                projectLocation: We.target.value
              }),
              className: "mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-base font-normal text-zinc-900",
              placeholder: "Bijv. Hoofdvestiging"
            })]
          }), g.jsxs("label", {
            className: "block text-xs font-bold uppercase tracking-wide text-zinc-500",
            children: ["Adres", g.jsx("input", {
              name: "planningProjectAddress",
              value: V.projectAddress,
              onChange: We => K({
                ...V,
                projectAddress: We.target.value
              }),
              className: "mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-base font-normal text-zinc-900",
              placeholder: "Straat en huisnummer"
            })]
          }), g.jsxs("div", {
            className: "grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3",
            children: [g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Postcode", g.jsx("input", {
                name: "planningProjectPostalCode",
                value: V.projectPostalCode,
                onChange: We => K({
                  ...V,
                  projectPostalCode: We.target.value
                }),
                className: "mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-base font-normal uppercase text-zinc-900",
                placeholder: "1234 AB"
              })]
            }), g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Plaats", g.jsx("input", {
                name: "planningProjectCity",
                value: V.projectCity,
                onChange: We => K({
                  ...V,
                  projectCity: We.target.value
                }),
                className: "mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-base font-normal text-zinc-900"
              })]
            })]
          }), V.planned && g.jsxs("div", {
            className: "grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-3",
            children: [g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Datum", g.jsx("input", {
                name: "planningDate",
                type: "date",
                value: V.date,
                onChange: We => K({
                  ...V,
                  date: We.target.value
                }),
                className: "mt-1 w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-base font-normal text-zinc-900"
              })]
            }), g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Starttijd", g.jsx("input", {
                name: "planningStartTime",
                type: "time",
                value: V.time,
                onChange: We => K({
                  ...V,
                  time: We.target.value
                }),
                className: "mt-1 w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-base font-normal text-zinc-900"
              })]
            }), g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Duur", g.jsxs("select", {
                name: "planningDurationHours",
                value: V.durationHours,
                onChange: We => K({
                  ...V,
                  durationHours: Number(We.target.value)
                }),
                className: "mt-1 w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-base font-normal text-zinc-900",
                children: [g.jsx("option", {
                  value: .5,
                  children: "30 minuten"
                }), g.jsx("option", {
                  value: 1,
                  children: "1 uur"
                }), g.jsx("option", {
                  value: 1.5,
                  children: "1,5 uur"
                }), g.jsx("option", {
                  value: 2,
                  children: "2 uur"
                }), g.jsx("option", {
                  value: 3,
                  children: "3 uur"
                }), g.jsx("option", {
                  value: 4,
                  children: "4 uur"
                }), g.jsx("option", {
                  value: 6,
                  children: "6 uur"
                }), g.jsx("option", {
                  value: 8,
                  children: "Hele dag"
                })]
              })]
            })]
          }), g.jsxs("label", {
            className: "block text-xs font-bold uppercase tracking-wide text-zinc-500",
            children: ["Inspecteur", g.jsx("select", {
              name: "planningInspectorId",
              value: V.assignedInspectorId,
              onChange: We => K({
                ...V,
                assignedInspectorId: We.target.value
              }),
              disabled: !n,
              className: "mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-base font-normal text-zinc-900 disabled:bg-zinc-100",
              children: De.map(We => g.jsx("option", {
                value: We.id,
                children: We.full_name || We.email
              }, We.id))
            })]
          }), j && g.jsx("p", {
            role: "alert",
            className: `rounded-lg p-3 text-sm font-semibold ${j.toLowerCase().includes("conflict") || j.toLowerCase().includes("verplicht") || j.toLowerCase().includes("ongeldig") ? "bg-red-50 text-red-700" : "bg-zinc-100 text-zinc-700"}`,
            children: j
          })]
        }), g.jsxs("div", {
          className: "safe-bottom sticky bottom-0 grid grid-cols-2 gap-2 border-t bg-white p-4",
          children: [g.jsx("button", {
            onClick: () => K(null),
            className: "min-h-11 rounded-lg border border-zinc-300 bg-white text-sm font-bold text-zinc-700",
            children: "Annuleren"
          }), g.jsxs("button", {
            disabled: S || !V.clientName.trim() || !V.assignedInspectorId || V.planned && (!V.date || !V.time),
            onClick: () => {
              Je();
            },
            className: "flex min-h-11 items-center justify-center gap-2 rounded-lg bg-zinc-800 text-sm font-bold text-white hover:bg-zinc-950 disabled:opacity-40",
            children: [S ? g.jsx(dC, {
              className: "animate-spin",
              size: 17
            }) : g.jsx(mh, {
              size: 17
            }), " ", V.planned ? "Afspraak toevoegen" : "Aan werkvoorraad toevoegen"]
          })]
        })]
      })
    }), Q && g.jsx("div", {
      className: "fixed inset-0 z-[120] flex items-end justify-center bg-black/45 sm:items-center sm:p-4",
      children: g.jsxs("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "planning-editor-title",
        className: "w-full max-w-lg overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:rounded-2xl",
        children: [g.jsxs("div", {
          className: "flex items-start justify-between gap-3 border-b bg-zinc-50 p-4",
          children: [g.jsxs("div", {
            className: "min-w-0",
            children: [g.jsx("p", {
              className: "text-xs font-bold uppercase tracking-wider text-zinc-400",
              children: "Planning"
            }), g.jsx("h2", {
              id: "planning-editor-title",
              className: "mt-1 truncate text-lg font-bold text-zinc-900",
              children: Q.resource.report_data.meta.clientName || Q.resource.client_name || "Inspectie"
            }), g.jsx("p", {
              className: "truncate text-sm text-zinc-500",
              children: Q.resource.report_data.meta.projectLocation || Q.resource.report_data.meta.projectCity || "Geen locatie"
            })]
          }), g.jsx("button", {
            onClick: () => M(null),
            className: "ig-icon-button shrink-0",
            "aria-label": "Sluiten",
            children: g.jsx(Kc, {
              size: 19
            })
          })]
        }), g.jsxs("div", {
          className: "space-y-4 p-4",
          children: [tt.has(Q.id) && g.jsxs("div", {
            className: "flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700",
            children: [g.jsx(zM, {
              size: 17
            }), " Deze afspraak overlapt met een andere afspraak."]
          }), g.jsxs("div", {
            className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
            children: [g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Datum", g.jsx("input", {
                name: "planningEditorDate",
                type: "date",
                value: H,
                onChange: We => G(We.target.value),
                disabled: !et(Q),
                className: "mt-1 w-full rounded-lg border p-2.5 text-base font-normal text-zinc-800 disabled:bg-zinc-100"
              })]
            }), g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Starttijd", g.jsx("input", {
                name: "planningEditorStartTime",
                type: "time",
                value: X,
                onChange: We => q(We.target.value),
                disabled: !et(Q),
                className: "mt-1 w-full rounded-lg border p-2.5 text-base font-normal text-zinc-800 disabled:bg-zinc-100"
              })]
            }), g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Duur", g.jsxs("select", {
                name: "planningEditorDurationHours",
                value: D,
                onChange: We => $(Number(We.target.value)),
                disabled: !et(Q),
                className: "mt-1 w-full rounded-lg border p-2.5 text-base font-normal text-zinc-800 disabled:bg-zinc-100",
                children: [g.jsx("option", {
                  value: .5,
                  children: "30 minuten"
                }), g.jsx("option", {
                  value: 1,
                  children: "1 uur"
                }), g.jsx("option", {
                  value: 1.5,
                  children: "1,5 uur"
                }), g.jsx("option", {
                  value: 2,
                  children: "2 uur"
                }), g.jsx("option", {
                  value: 3,
                  children: "3 uur"
                }), g.jsx("option", {
                  value: 4,
                  children: "4 uur"
                }), g.jsx("option", {
                  value: 6,
                  children: "6 uur"
                }), g.jsx("option", {
                  value: 8,
                  children: "Hele dag"
                })]
              })]
            }), g.jsxs("label", {
              className: "text-xs font-bold uppercase tracking-wide text-zinc-500",
              children: ["Inspecteur", g.jsxs("select", {
                name: "planningEditorInspectorId",
                value: N,
                onChange: We => C(We.target.value),
                disabled: !n,
                className: "mt-1 w-full rounded-lg border p-2.5 text-base font-normal text-zinc-800 disabled:bg-zinc-100",
                children: [N && !De.some(We => We.id === N) && g.jsxs("option", {
                  value: N,
                  children: [Q.inspectorName, " (oude koppeling)"]
                }), De.map(We => g.jsx("option", {
                  value: We.id,
                  children: We.full_name || We.email
                }, We.id))]
              })]
            })]
          }), g.jsxs("div", {
            className: "grid grid-cols-2 gap-2",
            children: [g.jsxs("button", {
              onClick: () => {
                dr([Q], `Inspectie ${Q.resource.inspection_number || Q.id}`);
              },
              className: "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white text-sm font-bold text-zinc-700",
              children: [g.jsx(kCe, {
                size: 17
              }), " Telefoonagenda"]
            }), g.jsxs("a", {
              href: II(Q.resource.report_data.meta),
              target: "_blank",
              rel: "noreferrer",
              className: "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white text-sm font-bold text-zinc-700",
              children: [g.jsx(pC, {
                size: 17
              }), " Navigeren"]
            })]
          }), !et(Q) && g.jsx("p", {
            className: "rounded-lg bg-zinc-100 p-3 text-sm text-zinc-600",
            children: "Alleen beheerder of toegewezen inspecteur kan deze afspraak wijzigen."
          }), j && g.jsx("p", {
            className: `text-sm font-semibold ${j.toLowerCase().includes("conflict") ? "text-red-600" : "text-zinc-600"}`,
            children: j
          })]
        }), g.jsxs("div", {
          className: "grid grid-cols-2 gap-2 border-t bg-zinc-50 p-4",
          children: [i ? g.jsx("button", {
            onClick: () => {
              i(Q.resource), M(null);
            },
            className: "min-h-11 rounded-lg border border-zinc-300 bg-white text-sm font-bold text-zinc-700",
            children: "Opdracht openen"
          }) : g.jsx("button", {
            onClick: () => M(null),
            className: "min-h-11 rounded-lg border border-zinc-300 bg-white text-sm font-bold text-zinc-700",
            children: "Sluiten"
          }), et(Q) && g.jsxs("button", {
            disabled: S || !H || !X || !N,
            onClick: async () => {
              k(!0);
              const [We, Wt] = X.split(":").map(Number),
                Ot = HA(lp(_I(H), We), Wt),
                St = await Vt(Q, Ot, D, N);
              k(!1), St.ok && M(null);
            },
            className: "flex min-h-11 items-center justify-center gap-2 rounded-lg bg-zinc-700 text-sm font-bold text-white hover:bg-zinc-900 disabled:opacity-40",
            children: [S ? g.jsx(dC, {
              className: "animate-spin",
              size: 17
            }) : g.jsx(p1, {
              size: 17
            }), " Opslaan"]
          })]
        })]
      })
    })]
  });
}
function x2(r, e, t) {
  if (typeof r != "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r)) return null;
  const n = typeof e == "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(e) ? e : "09:00",
    i = Number(t),
    a = new Date(`${r}T${n}:00`);
  if (Number.isNaN(a.getTime())) return null;
  const s = Number.isFinite(i) && i > 0 ? i : 4;
  return {
    start: a.getTime(),
    end: a.getTime() + s * 36e5
  };
}
function SI(r) {
  return `"${r.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function kI(r) {
  const e = [`report_data->meta->>assignedInspectorId.eq.${SI(r.id)}`],
    t = r.full_name?.trim();
  return t && (e.push(`report_data->meta->>assignedInspectorId.eq.${SI(`name:${t}`)}`), e.push(`and(report_data->meta->>assignedInspectorId.is.null,report_data->meta->>inspectorName.eq.${SI(t)})`)), e.join(",");
}
function oU(r, e) {
  const t = r.report_data?.meta,
    n = t?.assignedInspectorId?.trim();
  return n ? n === e.id || !!e.full_name && n === `name:${e.full_name.trim()}` : !!e.full_name && t?.inspectorName === e.full_name.trim();
}
function PlanningWorkspace({
  embedded: r = !1,
  onBack: e,
  onEdit: t
}) {
  const [n, i] = Ze.useState([]),
    [a, s] = Ze.useState([]),
    [o, c] = Ze.useState(null),
    [l, u] = Ze.useState(!0),
    [d, f] = Ze.useState(""),
    h = Ze.useCallback(async () => {
      f("");
      const {
          data: y
        } = await hr.auth.getSession(),
        b = y.session?.user;
      if (!b) {
        f("Sessie verlopen. Log opnieuw in."), u(!1);
        return;
      }
      const {
        data: w,
        error: E
      } = await hr.from("profiles").select("id, email, full_name, scios_nr, phone, contact_email, role, home_address, home_postal_code, home_city, home_lat, home_lng").eq("id", b.id).single();
      if (E || !w) {
        f(E?.message || "Gebruikersprofiel ontbreekt."), u(!1);
        return;
      }
      let B = hr.from("profiles").select("id, email, full_name, scios_nr, phone, contact_email, role, home_address, home_postal_code, home_city, home_lat, home_lng").in("role", ["admin", "inspector"]).order("full_name");
      w.role !== "admin" && (B = B.eq("id", b.id));
      let P = hr.from("inspections").select("*").or("report_data->meta->>isContributionMode.is.null,report_data->meta->>isContributionMode.neq.true").order("report_data->meta->>date", {
        ascending: !0
      });
      w.role !== "admin" && (P = P.or(kI(w)));
      const [Q, M] = await Promise.all([P, B]);
      (Q.error || M.error) && f(Q.error?.message || M.error?.message || "Planning laden mislukt.");
      const H = M.data || [w],
        G = Q.data || [];
      i(w.role === "admin" ? G : G.filter(X => oU(X, w))), s(H), c(w), u(!1);
    }, []);
  Ze.useEffect(() => {
    const y = window.setTimeout(() => {
        h();
      }, 0),
      b = hr.channel("inspector-planning-live").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "inspections"
      }, () => {
        h();
      }).subscribe();
    return () => {
      window.clearTimeout(y), hr.removeChannel(b);
    };
  }, [h]);
  const m = Ze.useCallback(async ({
      id: y,
      newDate: b,
      newTime: w,
      newDurationHours: E,
      assignedInspectorId: B,
      ignoreConflictIds: P = [],
      expectedUpdatedAt: Q
    }) => {
      if (!o) return {
        ok: !1,
        message: "Gebruikersprofiel ontbreekt."
      };
      const {
        data: M,
        error: H
      } = await hr.from("inspections").select("*").eq("id", y).single();
      if (H || !M) return {
        ok: !1,
        message: H?.message || "Opdracht niet gevonden."
      };
      if (Q && M.updated_at !== Q) return await h(), {
        ok: !1,
        message: "Planning is intussen gewijzigd. Bekijk de nieuwe planning en probeer opnieuw."
      };
      const G = M.report_data?.meta || {},
        X = o.role === "admin";
      if (!X && !oU(M, o)) return {
        ok: !1,
        message: "Je kunt alleen je eigen planning wijzigen."
      };
      const q = G.assignedInspectorId || a.find(Z => Z.full_name === G.inspectorName)?.id,
        D = X && (B || q) || o.id,
        $ = D.startsWith("name:") ? D.slice(5) : "",
        N = a.find(Z => Z.id === D),
        C = N?.id || G.assignedInspectorId || "",
        S = N?.full_name || $ || G.inspectorName || o.full_name || o.email,
        k = x2(b, w, E ?? G.estimatedDurationHours);
      if (!k) return {
        ok: !1,
        message: "Datum, tijd of duur is ongeldig."
      };
      let j = hr.from("inspections").select("id, client_name, report_data").eq("report_data->meta->>date", b).neq("id", y);
      X || (j = j.or(kI(o)));
      const {
        data: W,
        error: V
      } = await j;
      if (V) return {
        ok: !1,
        message: `Conflictcontrole mislukt: ${V.message}`
      };
      const K = (W || []).find(Z => {
        if (P.includes(Z.id)) return !1;
        const Y = Z.report_data?.meta || {},
          ce = Y.assignedInspectorId || a.find(Ne => Ne.full_name === Y.inspectorName)?.id || "";
        if (!(C ? ce === C || !Y.assignedInspectorId && Y.inspectorName === S : Y.inspectorName === S)) return !1;
        const De = x2(Y.date, Y.scheduledTimeStart, Y.estimatedDurationHours);
        return !!De && k.start < De.end && k.end > De.start;
      });
      if (K) {
        const Z = K.report_data.meta;
        return {
          ok: !1,
          message: `Conflict met ${Z.clientName || K.client_name || "andere inspectie"} om ${Z.scheduledTimeStart || "09:00"}.`
        };
      }
      const oe = {
          ...G,
          date: b,
          scheduledTimeStart: w,
          ...(C ? {
            assignedInspectorId: C
          } : {}),
          inspectorName: S,
          sciosRegistrationNumber: N?.scios_nr || G.sciosRegistrationNumber || "",
          ...(E !== void 0 ? {
            estimatedDurationHours: E
          } : {})
        },
        ue = {
          ...M.report_data,
          meta: oe
        };
      let xe = hr.from("inspections").update({
        report_data: ue,
        updated_at: new Date().toISOString()
      }).eq("id", y);
      M.updated_at && (xe = xe.eq("updated_at", M.updated_at));
      const {
        data: re,
        error: ve
      } = await xe.select("id");
      return ve ? {
        ok: !1,
        message: ve.message
      } : re?.length ? (await ac(X ? "admin" : "inspector", "inspection_rescheduled", "inspection", y, M.client_name, {
        newDate: b,
        newTime: w,
        newDurationHours: E,
        assignedInspectorId: C || null,
        assignedInspectorName: S
      }), await h(), {
        ok: !0,
        message: "Planning opgeslagen."
      }) : {
        ok: !1,
        message: "Planning is intussen gewijzigd. Vernieuw en probeer opnieuw."
      };
    }, [o, h, a]),
    v = Ze.useCallback(async y => {
      if (!o) return {
        ok: !1,
        message: "Gebruikersprofiel ontbreekt."
      };
      const b = y.clientName.trim();
      if (!b) return {
        ok: !1,
        message: "Klant of opdrachttitel is verplicht."
      };
      const w = o.role === "admin",
        E = w && y.assignedInspectorId || o.id,
        B = a.find(X => X.id === E) || o,
        P = B.full_name || B.email;
      if (y.date) {
        const X = x2(y.date, y.time, y.durationHours);
        if (!X) return {
          ok: !1,
          message: "Datum, tijd of duur is ongeldig."
        };
        let q = hr.from("inspections").select("id, client_name, report_data").eq("report_data->meta->>date", y.date);
        w || (q = q.or(kI(o)));
        const {
          data: D,
          error: $
        } = await q;
        if ($) return {
          ok: !1,
          message: `Conflictcontrole mislukt: ${$.message}`
        };
        const N = (D || []).find(C => {
          const S = C.report_data?.meta || {};
          if ((S.assignedInspectorId || a.find(W => W.full_name === S.inspectorName)?.id) !== E) return !1;
          const j = x2(S.date, S.scheduledTimeStart, S.estimatedDurationHours);
          return !!j && X.start < j.end && X.end > j.start;
        });
        if (N) {
          const C = N.report_data.meta;
          return {
            ok: !1,
            message: `Conflict met ${C.clientName || N.client_name || "andere inspectie"} om ${C.scheduledTimeStart || "09:00"}.`
          };
        }
      }
      const Q = await k1(y.projectAddress, y.projectPostalCode, y.projectCity),
        M = Nk({
          clientName: b,
          projectLocation: y.projectLocation.trim(),
          projectAddress: y.projectAddress.trim(),
          projectPostalCode: y.projectPostalCode.trim(),
          projectCity: y.projectCity.trim(),
          date: y.date,
          scheduledTimeStart: y.date ? y.time : void 0,
          estimatedDurationHours: y.durationHours,
          assignedInspectorId: E,
          inspectorName: P,
          sciosRegistrationNumber: B.scios_nr || "",
          ...(Q || {})
        }),
        {
          data: H,
          error: G
        } = await hr.from("inspections").insert({
          client_name: b,
          status: "new",
          scope_type: "10",
          report_data: M
        }).select("id").single();
      return G ? {
        ok: !1,
        message: G.message
      } : (await ac(w ? "admin" : "inspector", "inspection_created_from_planning", "inspection", H.id, b, {
        date: y.date || null,
        time: y.date ? y.time : null,
        assignedInspectorId: E
      }), await h(), {
        ok: !0,
        message: y.date ? "Afspraak toegevoegd." : "Opdracht aan werkvoorraad toegevoegd."
      });
    }, [o, h, a]),
    A = l ? g.jsxs("div", {
      className: "flex min-h-[22rem] items-center justify-center gap-2 text-sm text-zinc-500",
      children: [g.jsx(Ns, {
        className: "animate-spin",
        size: 18
      }), " Planning laden…"]
    }) : d ? g.jsx("div", {
      className: "rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700",
      children: d
    }) : g.jsx(PlanningCalendar, {
      inspections: n,
      users: a,
      currentUser: o,
      canManageTeam: o?.role === "admin",
      onEdit: t,
      onCreate: v,
      onReschedule: m
    });
  return r ? A : g.jsx("div", {
    "data-ui": "planning",
    className: "ig-planning-shell min-h-[100dvh] bg-[#f5f5f5] px-3 pb-8 pt-3 sm:px-5 lg:p-6",
    children: g.jsxs("div", {
      className: "mx-auto max-w-[110rem]",
      children: [g.jsxs("header", {
        className: "mb-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 sm:px-5",
        children: [g.jsxs("div", {
          className: "flex min-w-0 items-center gap-3",
          children: [e && g.jsx("button", {
            onClick: e,
            className: "ig-icon-button shrink-0",
            "aria-label": "Terug naar inspecteren",
            children: g.jsx(Cx, {
              size: 20
            })
          }), g.jsxs("div", {
            className: "min-w-0",
            children: [g.jsx("p", {
              className: "ig-eyebrow",
              children: "Inspector Gadget"
            }), g.jsx("h1", {
              className: "truncate text-xl font-bold text-zinc-800 sm:text-2xl",
              children: "Planning & agenda"
            }), g.jsx("p", {
              className: "truncate text-xs text-zinc-500 sm:text-sm",
              children: o?.role === "admin" ? "Teamplanning, routes en telefoonagenda" : "Mijn planning, open opdrachten en route"
            })]
          })]
        }), g.jsx(WV, {
          className: "hidden text-zinc-400 sm:block",
          size: 26
        })]
      }), A]
    })
  });
}
const bf = {
    scopes: {
      8: "SCIOS Scope 8 (NEN 3140)",
      10: "SCIOS Scope 10 (thermografie)",
      combi: "SCIOS Scope 8 + 10"
    },
    buildingTypes: {
      kantoor: "Kantoor / bedrijfspand",
      industrie: "Industrie",
      agrarisch: "Agrarisch",
      zorg: "Zorg",
      onderwijs: "Onderwijs",
      horeca: "Horeca",
      logistiek: "Logistiek / opslag"
    },
    ages: {
      nieuw: "Jonger dan 10 jaar",
      normaal: "10 tot 25 jaar",
      oud: "Ouder dan 25 jaar"
    },
    accessibility: {
      goed: "Goed toegankelijk",
      matig: "Beperkt toegankelijk",
      slecht: "Moeilijk toegankelijk"
    },
    documentation: {
      compleet: "Compleet",
      incompleet: "Onvolledig",
      geen: "Niet aanwezig"
    },
    riskClasses: {
      A: "Klasse A — laag risico",
      B: "Klasse B — gemiddeld risico",
      C: "Klasse C — hoog risico"
    }
  },
  nje = 2,
  ije = .45,
  lU = 35,
  aje = {
    kantoor: .0016,
    industrie: .005,
    agrarisch: .006,
    zorg: .003,
    onderwijs: .0025,
    horeca: .0045,
    logistiek: .0022
  },
  sje = {
    schemaVersion: 1,
    scope: "10",
    inspectionType: "PI",
    riskClass: "B",
    buildingType: "kantoor",
    buildingAge: "normaal",
    accessibility: "goed",
    documentation: "compleet",
    surfaceArea: 500,
    mainBoards: 1,
    subBoards: 0,
    hasSolar: !1,
    solarInverters: 1,
    hasEV: !1,
    evChargers: 1,
    heavyMachinery: 0,
    hasUPS: !1,
    travelDistance: 25,
    outOfHours: !1,
    needsLift: !1,
    safetyInduction: !1,
    hourlyRate: 95,
    unforeseenCosts: 0,
    hotelCosts: 0,
    parkingCosts: 0
  },
  oje = (r, e) => Object.prototype.hasOwnProperty.call(r, e),
  lje = r => !!r && typeof r == "object" && !Array.isArray(r),
  ng = (r, e, t) => typeof r == "string" && e.includes(r) ? r : t,
  Rd = (r, e) => typeof r == "number" && Number.isFinite(r) ? r : e,
  Pm = (r, e, t) => oje(r, e) && typeof r[e] == "boolean" ? r[e] : t,
  Qm = r => Math.round((r + Number.EPSILON) * 100) / 100;
function createDefaultQuoteInput(r = []) {
  const e = r.includes("8"),
    t = r.includes("10");
  return {
    ...sje,
    scope: e && t ? "combi" : e ? "8" : "10"
  };
}
function normalizeQuoteInput(r, e = []) {
  const t = createDefaultQuoteInput(e);
  return lje(r) ? {
    schemaVersion: 1,
    scope: ng(r.scope, ["8", "10", "combi"], t.scope),
    inspectionType: ng(r.inspectionType, ["PI", "EBI"], t.inspectionType),
    riskClass: ng(r.riskClass, ["A", "B", "C"], t.riskClass),
    buildingType: ng(r.buildingType, ["kantoor", "industrie", "agrarisch", "zorg", "onderwijs", "horeca", "logistiek"], t.buildingType),
    buildingAge: ng(r.buildingAge, ["nieuw", "normaal", "oud"], t.buildingAge),
    accessibility: ng(r.accessibility, ["goed", "matig", "slecht"], t.accessibility),
    documentation: ng(r.documentation, ["compleet", "incompleet", "geen"], t.documentation),
    surfaceArea: Rd(r.surfaceArea, t.surfaceArea),
    mainBoards: Rd(r.mainBoards, t.mainBoards),
    subBoards: Rd(r.subBoards, t.subBoards),
    hasSolar: Pm(r, "hasSolar", t.hasSolar),
    solarInverters: Rd(r.solarInverters, t.solarInverters),
    hasEV: Pm(r, "hasEV", t.hasEV),
    evChargers: Rd(r.evChargers, t.evChargers),
    heavyMachinery: Rd(r.heavyMachinery, t.heavyMachinery),
    hasUPS: Pm(r, "hasUPS", t.hasUPS),
    travelDistance: Rd(r.travelDistance, t.travelDistance),
    outOfHours: Pm(r, "outOfHours", t.outOfHours),
    needsLift: Pm(r, "needsLift", t.needsLift),
    safetyInduction: Pm(r, "safetyInduction", t.safetyInduction),
    hourlyRate: Rd(r.hourlyRate, t.hourlyRate),
    unforeseenCosts: Rd(r.unforeseenCosts, t.unforeseenCosts),
    hotelCosts: Rd(r.hotelCosts, t.hotelCosts),
    parkingCosts: Rd(r.parkingCosts, t.parkingCosts)
  } : t;
}
function validateQuoteInput(r) {
  const e = [[r.surfaceArea, 1, 1e6, "Oppervlakte"], [r.mainBoards, 0, 1e4, "Aantal hoofdverdelers"], [r.subBoards, 0, 1e4, "Aantal onderverdelers"], [r.solarInverters, 0, 1e4, "Aantal omvormers"], [r.evChargers, 0, 1e4, "Aantal laadpunten"], [r.heavyMachinery, 0, 1e4, "Aantal zware machines"], [r.travelDistance, 0, 5e3, "Reisafstand"], [r.hourlyRate, 1, 1e4, "Uurtarief"], [r.unforeseenCosts, 0, 1e6, "Onvoorziene kosten"], [r.hotelCosts, 0, 1e6, "Verblijfskosten"], [r.parkingCosts, 0, 1e6, "Parkeerkosten"]];
  for (const [t, n, i, a] of e) if (!Number.isFinite(t) || t < n || t > i) return `${a} moet tussen ${n.toLocaleString("nl-NL")} en ${i.toLocaleString("nl-NL")} liggen.`;
  return [r.mainBoards, r.subBoards, r.solarInverters, r.evChargers, r.heavyMachinery].every(Number.isInteger) ? null : "Aantallen moeten hele getallen zijn.";
}
function calculateQuote(r) {
  let e = nje + r.surfaceArea * aje[r.buildingType];
  r.buildingAge === "oud" && (e *= 1.2), r.buildingAge === "nieuw" && (e *= .9), r.riskClass === "C" && r.scope !== "10" && (e *= 1.25), r.riskClass === "A" && r.scope !== "10" && (e *= .9), r.documentation === "incompleet" && (e += 1), r.documentation === "geen" && (e += r.inspectionType === "EBI" ? 3 : 1.5);
  const t = r.accessibility === "slecht" ? 1.5 : r.accessibility === "matig" ? 1.2 : 1;
  e += r.mainBoards * t, e += r.subBoards * .6 * t, e += r.heavyMachinery * .5, r.hasSolar && (e += r.solarInverters * .75), r.hasEV && (e += r.evChargers * .5), r.hasUPS && (e += 1.5), r.inspectionType === "EBI" && (e *= 1.4), r.scope === "10" && (e += 1.5), r.scope === "combi" && (e = e * 1.35 + 1.5), r.safetyInduction && (e += 1);
  const n = Math.ceil(e * 2) / 2,
    i = r.outOfHours ? r.hourlyRate * 1.5 : r.hourlyRate,
    a = n * i,
    s = r.travelDistance * 2,
    o = s / 80,
    c = o * r.hourlyRate + s * ije,
    l = r.scope === "combi" ? lU * 2 : lU,
    u = r.needsLift ? 150 : 0,
    d = r.unforeseenCosts + r.hotelCosts + r.parkingCosts,
    f = Qm(a + c + l + u + d),
    h = Qm(f * .21);
  return {
    hours: n,
    laborCost: Qm(a),
    travelDistanceReturn: s,
    travelHours: Math.round(o * 100) / 100,
    travelCost: Qm(c),
    sciosCost: l,
    equipmentCost: u,
    otherCost: Qm(d),
    totalExcludingVat: f,
    vat: h,
    totalIncludingVat: Qm(f + h)
  };
}
function createQuotePdfFilename(r, e) {
  return `Offerte_${`${r}_${e}`.normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 120) || "B2Inspect"}.pdf`;
}
function formatCurrency(r) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR"
  }).format(r);
}
function QuoteNumberField({
  id: r,
  label: e,
  value: t,
  min: n = 0,
  max: i,
  step: a = 1,
  suffix: s,
  disabled: o,
  onChange: c
}) {
  const l = u => {
    const d = u.currentTarget.valueAsNumber;
    c(Number.isFinite(d) ? d : 0);
  };
  return g.jsxs("label", {
    className: "ig-field",
    htmlFor: r,
    children: [g.jsx("span", {
      children: e
    }), g.jsxs("span", {
      className: "ig-quote-input-unit",
      children: [g.jsx("input", {
        id: r,
        name: r,
        type: "number",
        inputMode: "decimal",
        min: n,
        max: i,
        step: a,
        value: t,
        disabled: o,
        onChange: l
      }), s && g.jsx("em", {
        children: s
      })]
    })]
  });
}
function QuoteToggleField({
  id: r,
  label: e,
  checked: t,
  disabled: n,
  onChange: i
}) {
  return g.jsxs("label", {
    className: "ig-quote-toggle",
    htmlFor: r,
    children: [g.jsx("input", {
      id: r,
      name: r,
      type: "checkbox",
      checked: t,
      disabled: n,
      onChange: a => i(a.currentTarget.checked)
    }), g.jsx("span", {
      children: e
    })]
  });
}
function QuoteCalculator({
  value: r,
  calculation: e,
  requestedScopes: t = [],
  disabled: n = !1,
  onChange: i
}) {
  const a = (l, u) => {
      i({
        ...r,
        [l]: u
      });
    },
    s = t.includes("8"),
    o = t.includes("10"),
    c = Object.entries(bf.scopes).filter(([l]) => !s && !o ? l === r.scope : l === "combi" ? s && o : l === "8" ? s : o);
  return g.jsxs("div", {
    className: "ig-quote-builder",
    children: [g.jsxs("section", {
      className: "ig-quote-section",
      children: [g.jsxs("header", {
        children: [g.jsx("h4", {
          children: "Inspectie"
        }), g.jsx("p", {
          children: "Keuze uit aanvraag en omvang van installatie."
        })]
      }), g.jsxs("div", {
        className: "ig-quote-grid",
        children: [g.jsxs("label", {
          className: "ig-field",
          htmlFor: "quote-scope",
          children: [g.jsx("span", {
            children: "Inspectiescope"
          }), g.jsx("select", {
            id: "quote-scope",
            name: "quote-scope",
            value: r.scope,
            disabled: n,
            onChange: l => a("scope", l.currentTarget.value),
            children: c.map(([l, u]) => g.jsx("option", {
              value: l,
              children: u
            }, l))
          })]
        }), g.jsxs("label", {
          className: "ig-field",
          htmlFor: "quote-inspection-type",
          children: [g.jsx("span", {
            children: "Inspectietype"
          }), g.jsxs("select", {
            id: "quote-inspection-type",
            name: "quote-inspection-type",
            value: r.inspectionType,
            disabled: n,
            onChange: l => a("inspectionType", l.currentTarget.value),
            children: [g.jsx("option", {
              value: "PI",
              children: "Periodieke inspectie (PI)"
            }), g.jsx("option", {
              value: "EBI",
              children: "Eerste bijzondere inspectie (EBI)"
            })]
          })]
        }), g.jsxs("label", {
          className: "ig-field",
          htmlFor: "quote-building-type",
          children: [g.jsx("span", {
            children: "Gebouwtype"
          }), g.jsx("select", {
            id: "quote-building-type",
            name: "quote-building-type",
            value: r.buildingType,
            disabled: n,
            onChange: l => a("buildingType", l.currentTarget.value),
            children: Object.entries(bf.buildingTypes).map(([l, u]) => g.jsx("option", {
              value: l,
              children: u
            }, l))
          })]
        }), g.jsx(QuoteNumberField, {
          id: "quote-surface-area",
          label: "Bruto vloeroppervlak",
          value: r.surfaceArea,
          min: 1,
          max: 1e6,
          step: 50,
          suffix: "m²",
          disabled: n,
          onChange: l => a("surfaceArea", l)
        }), g.jsxs("label", {
          className: "ig-field",
          htmlFor: "quote-building-age",
          children: [g.jsx("span", {
            children: "Leeftijd installatie"
          }), g.jsx("select", {
            id: "quote-building-age",
            name: "quote-building-age",
            value: r.buildingAge,
            disabled: n,
            onChange: l => a("buildingAge", l.currentTarget.value),
            children: Object.entries(bf.ages).map(([l, u]) => g.jsx("option", {
              value: l,
              children: u
            }, l))
          })]
        }), r.scope !== "10" && g.jsxs("label", {
          className: "ig-field",
          htmlFor: "quote-risk-class",
          children: [g.jsx("span", {
            children: "NEN 3140-risicoklasse"
          }), g.jsx("select", {
            id: "quote-risk-class",
            name: "quote-risk-class",
            value: r.riskClass,
            disabled: n,
            onChange: l => a("riskClass", l.currentTarget.value),
            children: Object.entries(bf.riskClasses).map(([l, u]) => g.jsx("option", {
              value: l,
              children: u
            }, l))
          })]
        }), g.jsxs("label", {
          className: "ig-field",
          htmlFor: "quote-documentation",
          children: [g.jsx("span", {
            children: "Installatiedocumentatie"
          }), g.jsx("select", {
            id: "quote-documentation",
            name: "quote-documentation",
            value: r.documentation,
            disabled: n,
            onChange: l => a("documentation", l.currentTarget.value),
            children: Object.entries(bf.documentation).map(([l, u]) => g.jsx("option", {
              value: l,
              children: u
            }, l))
          })]
        }), g.jsxs("label", {
          className: "ig-field",
          htmlFor: "quote-accessibility",
          children: [g.jsx("span", {
            children: "Toegankelijkheid"
          }), g.jsx("select", {
            id: "quote-accessibility",
            name: "quote-accessibility",
            value: r.accessibility,
            disabled: n,
            onChange: l => a("accessibility", l.currentTarget.value),
            children: Object.entries(bf.accessibility).map(([l, u]) => g.jsx("option", {
              value: l,
              children: u
            }, l))
          })]
        })]
      })]
    }), g.jsxs("section", {
      className: "ig-quote-section",
      children: [g.jsxs("header", {
        children: [g.jsx("h4", {
          children: "Installatieomvang"
        }), g.jsx("p", {
          children: "Verdelers en aanvullende elektrische installaties."
        })]
      }), g.jsxs("div", {
        className: "ig-quote-grid ig-quote-grid-compact",
        children: [g.jsx(QuoteNumberField, {
          id: "quote-main-boards",
          label: "Hoofdverdelers",
          value: r.mainBoards,
          max: 1e4,
          disabled: n,
          onChange: l => a("mainBoards", l)
        }), g.jsx(QuoteNumberField, {
          id: "quote-sub-boards",
          label: "Onderverdelers",
          value: r.subBoards,
          max: 1e4,
          disabled: n,
          onChange: l => a("subBoards", l)
        }), g.jsx(QuoteNumberField, {
          id: "quote-machinery",
          label: "Zware machines / lijnen",
          value: r.heavyMachinery,
          max: 1e4,
          disabled: n,
          onChange: l => a("heavyMachinery", l)
        }), g.jsxs("div", {
          className: "ig-quote-option",
          children: [g.jsx(QuoteToggleField, {
            id: "quote-has-solar",
            label: "PV-installatie aanwezig",
            checked: r.hasSolar,
            disabled: n,
            onChange: l => a("hasSolar", l)
          }), r.hasSolar && g.jsx(QuoteNumberField, {
            id: "quote-solar-inverters",
            label: "Omvormers",
            value: r.solarInverters,
            max: 1e4,
            disabled: n,
            onChange: l => a("solarInverters", l)
          })]
        }), g.jsxs("div", {
          className: "ig-quote-option",
          children: [g.jsx(QuoteToggleField, {
            id: "quote-has-ev",
            label: "Laadpunten aanwezig",
            checked: r.hasEV,
            disabled: n,
            onChange: l => a("hasEV", l)
          }), r.hasEV && g.jsx(QuoteNumberField, {
            id: "quote-ev-chargers",
            label: "Laadpunten",
            value: r.evChargers,
            max: 1e4,
            disabled: n,
            onChange: l => a("evChargers", l)
          })]
        }), g.jsx("div", {
          className: "ig-quote-option ig-quote-option-single",
          children: g.jsx(QuoteToggleField, {
            id: "quote-has-ups",
            label: "Noodstroom / UPS aanwezig",
            checked: r.hasUPS,
            disabled: n,
            onChange: l => a("hasUPS", l)
          })
        })]
      })]
    }), g.jsxs("section", {
      className: "ig-quote-section",
      children: [g.jsxs("header", {
        children: [g.jsx("h4", {
          children: "Uitvoering en kosten"
        }), g.jsx("p", {
          children: "Reis, uitvoeringstoeslagen en bekende bijkomende kosten."
        })]
      }), g.jsxs("div", {
        className: "ig-quote-grid",
        children: [g.jsx(QuoteNumberField, {
          id: "quote-travel-distance",
          label: "Reisafstand enkele reis",
          value: r.travelDistance,
          max: 5e3,
          step: 1,
          suffix: "km",
          disabled: n,
          onChange: l => a("travelDistance", l)
        }), g.jsx(QuoteNumberField, {
          id: "quote-hourly-rate",
          label: "Uurtarief excl. btw",
          value: r.hourlyRate,
          min: 1,
          max: 1e4,
          step: 1,
          suffix: "€",
          disabled: n,
          onChange: l => a("hourlyRate", l)
        }), g.jsx(QuoteNumberField, {
          id: "quote-unforeseen",
          label: "Onvoorziene kosten",
          value: r.unforeseenCosts,
          max: 1e6,
          step: 1,
          suffix: "€",
          disabled: n,
          onChange: l => a("unforeseenCosts", l)
        }), g.jsx(QuoteNumberField, {
          id: "quote-hotel",
          label: "Verblijfskosten",
          value: r.hotelCosts,
          max: 1e6,
          step: 1,
          suffix: "€",
          disabled: n,
          onChange: l => a("hotelCosts", l)
        }), g.jsx(QuoteNumberField, {
          id: "quote-parking",
          label: "Parkeerkosten",
          value: r.parkingCosts,
          max: 1e6,
          step: 1,
          suffix: "€",
          disabled: n,
          onChange: l => a("parkingCosts", l)
        })]
      }), g.jsxs("div", {
        className: "ig-quote-toggles",
        children: [g.jsx(QuoteToggleField, {
          id: "quote-out-of-hours",
          label: "Uitvoering buiten kantooruren (+50%)",
          checked: r.outOfHours,
          disabled: n,
          onChange: l => a("outOfHours", l)
        }), g.jsx(QuoteToggleField, {
          id: "quote-needs-lift",
          label: "Hoogwerker / klimmaterieel nodig",
          checked: r.needsLift,
          disabled: n,
          onChange: l => a("needsLift", l)
        }), g.jsx(QuoteToggleField, {
          id: "quote-safety-induction",
          label: "Verplichte veiligheidsinstructie",
          checked: r.safetyInduction,
          disabled: n,
          onChange: l => a("safetyInduction", l)
        })]
      })]
    }), g.jsxs("aside", {
      className: "ig-quote-summary",
      "aria-live": "polite",
      children: [g.jsxs("div", {
        children: [g.jsx("span", {
          children: "Geschatte inspectietijd"
        }), g.jsxs("strong", {
          children: [e.hours.toLocaleString("nl-NL"), " uur"]
        })]
      }), g.jsxs("div", {
        children: [g.jsx("span", {
          children: "Arbeid"
        }), g.jsx("strong", {
          children: formatCurrency(e.laborCost)
        })]
      }), g.jsxs("div", {
        children: [g.jsx("span", {
          children: "Reis"
        }), g.jsx("strong", {
          children: formatCurrency(e.travelCost)
        })]
      }), g.jsxs("div", {
        children: [g.jsx("span", {
          children: "SCIOS-afmelding"
        }), g.jsx("strong", {
          children: formatCurrency(e.sciosCost)
        })]
      }), e.equipmentCost > 0 && g.jsxs("div", {
        children: [g.jsx("span", {
          children: "Materieel"
        }), g.jsx("strong", {
          children: formatCurrency(e.equipmentCost)
        })]
      }), e.otherCost > 0 && g.jsxs("div", {
        children: [g.jsx("span", {
          children: "Overige kosten"
        }), g.jsx("strong", {
          children: formatCurrency(e.otherCost)
        })]
      }), g.jsxs("div", {
        className: "ig-quote-total",
        children: [g.jsx("span", {
          children: "Totaal excl. btw"
        }), g.jsx("strong", {
          children: formatCurrency(e.totalExcludingVat)
        })]
      }), g.jsxs("div", {
        children: [g.jsx("span", {
          children: "21% btw"
        }), g.jsx("strong", {
          children: formatCurrency(e.vat)
        })]
      }), g.jsxs("div", {
        children: [g.jsx("span", {
          children: "Totaal incl. btw"
        }), g.jsx("strong", {
          children: formatCurrency(e.totalIncludingVat)
        })]
      })]
    })]
  });
}
const ds = {
    ink: "#202327",
    muted: "#666b72",
    line: "#dfe2e6",
    soft: "#f4f5f6",
    accent: "#6659a7",
    accentSoft: "#efedf8"
  },
  Cn = UV.create({
    page: {
      color: ds.ink,
      fontFamily: "Helvetica",
      fontSize: 9,
      lineHeight: 1.4,
      paddingBottom: 48,
      paddingHorizontal: 42,
      paddingTop: 38
    },
    header: {
      alignItems: "flex-start",
      borderBottomColor: ds.line,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 22,
      paddingBottom: 16
    },
    brand: {
      color: ds.ink,
      fontFamily: "Helvetica-Bold",
      fontSize: 19
    },
    brandSub: {
      color: ds.muted,
      fontSize: 8,
      marginTop: 3
    },
    documentTitle: {
      color: ds.accent,
      fontFamily: "Helvetica-Bold",
      fontSize: 18,
      textAlign: "right"
    },
    meta: {
      color: ds.muted,
      fontSize: 8,
      marginTop: 3,
      textAlign: "right"
    },
    columns: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 18
    },
    party: {
      backgroundColor: ds.soft,
      borderRadius: 4,
      flex: 1,
      minHeight: 86,
      padding: 10
    },
    partyLabel: {
      color: ds.muted,
      fontFamily: "Helvetica-Bold",
      fontSize: 7,
      letterSpacing: .7,
      marginBottom: 5,
      textTransform: "uppercase"
    },
    partyName: {
      fontFamily: "Helvetica-Bold",
      fontSize: 10,
      marginBottom: 3
    },
    partyLine: {
      color: ds.muted,
      fontSize: 8,
      marginBottom: 1
    },
    section: {
      marginBottom: 17
    },
    sectionTitle: {
      borderBottomColor: ds.line,
      borderBottomWidth: 1,
      color: ds.ink,
      fontFamily: "Helvetica-Bold",
      fontSize: 10,
      marginBottom: 8,
      paddingBottom: 4
    },
    description: {
      backgroundColor: ds.soft,
      borderRadius: 4,
      color: ds.muted,
      fontSize: 8,
      marginBottom: 10,
      padding: 9
    },
    row: {
      borderBottomColor: ds.line,
      borderBottomWidth: .7,
      flexDirection: "row",
      minHeight: 22,
      paddingVertical: 5
    },
    rowLabel: {
      color: ds.muted,
      width: "62%"
    },
    rowValue: {
      fontFamily: "Helvetica-Bold",
      textAlign: "right",
      width: "38%"
    },
    totalRow: {
      backgroundColor: ds.accentSoft,
      borderRadius: 4,
      flexDirection: "row",
      marginTop: 7,
      padding: 9
    },
    totalLabel: {
      color: ds.accent,
      fontFamily: "Helvetica-Bold",
      width: "62%"
    },
    totalValue: {
      color: ds.accent,
      fontFamily: "Helvetica-Bold",
      fontSize: 12,
      textAlign: "right",
      width: "38%"
    },
    note: {
      color: ds.muted,
      fontSize: 7,
      marginTop: 5
    },
    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -4
    },
    detail: {
      marginBottom: 8,
      paddingHorizontal: 4,
      width: "50%"
    },
    detailLabel: {
      color: ds.muted,
      fontSize: 7,
      marginBottom: 2
    },
    detailValue: {
      fontFamily: "Helvetica-Bold",
      fontSize: 8
    },
    callout: {
      backgroundColor: ds.accentSoft,
      borderLeftColor: ds.accent,
      borderLeftWidth: 3,
      marginBottom: 14,
      padding: 10
    },
    calloutTitle: {
      color: ds.accent,
      fontFamily: "Helvetica-Bold",
      fontSize: 8,
      marginBottom: 3
    },
    calloutText: {
      color: ds.ink,
      fontSize: 8
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 5
    },
    bulletMark: {
      color: ds.accent,
      fontFamily: "Helvetica-Bold",
      width: 12
    },
    bulletText: {
      flex: 1,
      fontSize: 8
    },
    clause: {
      backgroundColor: ds.soft,
      borderRadius: 4,
      marginBottom: 7,
      padding: 9
    },
    clauseTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 8,
      marginBottom: 3
    },
    clauseText: {
      color: ds.muted,
      fontSize: 7.5
    },
    signatures: {
      flexDirection: "row",
      gap: 16,
      marginTop: 12
    },
    signature: {
      borderColor: ds.line,
      borderRadius: 4,
      borderWidth: 1,
      flex: 1,
      minHeight: 90,
      padding: 10
    },
    signatureTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 8
    },
    signatureLine: {
      borderBottomColor: ds.muted,
      borderBottomWidth: .7,
      marginTop: 38
    },
    signatureHint: {
      color: ds.muted,
      fontSize: 7,
      marginTop: 4
    },
    footer: {
      bottom: 22,
      color: ds.muted,
      fontSize: 7,
      left: 42,
      position: "absolute",
      right: 42,
      textAlign: "center"
    }
  }),
  rv = r => `€ ${r.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`,
  BI = r => {
    const e = new Date(`${r.slice(0, 10)}T12:00:00`);
    return Number.isNaN(e.getTime()) ? r : e.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  },
  uU = (...r) => r.filter(e => e?.trim()).join(", ");
function ch({
  label: r,
  value: e
}) {
  return g.jsxs(st, {
    style: Cn.row,
    children: [g.jsx(Ee, {
      style: Cn.rowLabel,
      children: r
    }), g.jsx(Ee, {
      style: Cn.rowValue,
      children: rv(e)
    })]
  });
}
function cp({
  label: r,
  value: e
}) {
  return g.jsxs(st, {
    style: Cn.detail,
    children: [g.jsx(Ee, {
      style: Cn.detailLabel,
      children: r
    }), g.jsx(Ee, {
      style: Cn.detailValue,
      children: e
    })]
  });
}
function ff({
  children: r
}) {
  return g.jsxs(st, {
    style: Cn.bullet,
    children: [g.jsx(Ee, {
      style: Cn.bulletMark,
      children: "•"
    }), g.jsx(Ee, {
      style: Cn.bulletText,
      children: r
    })]
  });
}
function QuotePdfDocument({
  data: r,
  input: e,
  calculation: t
}) {
  const n = e.inspectionType === "EBI" ? "Eerste bijzondere inspectie (EBI)" : "Periodieke inspectie (PI)";
  return g.jsxs(VS, {
    title: `Offerte ${r.quoteNumber}`,
    author: "B2Inspect",
    subject: r.title,
    children: [g.jsxs(Ou, {
      size: "A4",
      style: Cn.page,
      children: [g.jsxs(st, {
        style: Cn.header,
        children: [g.jsxs(st, {
          children: [g.jsx(Ee, {
            style: Cn.brand,
            children: "B2Inspect"
          }), g.jsx(Ee, {
            style: Cn.brandSub,
            children: "Inspectie en advies · info@b2inspect.nl"
          })]
        }), g.jsxs(st, {
          children: [g.jsx(Ee, {
            style: Cn.documentTitle,
            children: "OFFERTE"
          }), g.jsxs(Ee, {
            style: Cn.meta,
            children: ["Offertenummer: ", r.quoteNumber]
          }), g.jsxs(Ee, {
            style: Cn.meta,
            children: ["Dossier: ", r.caseNumber]
          }), g.jsxs(Ee, {
            style: Cn.meta,
            children: ["Datum: ", BI(r.quoteDate)]
          }), g.jsxs(Ee, {
            style: Cn.meta,
            children: ["Geldig tot: ", BI(r.validUntil)]
          })]
        })]
      }), g.jsxs(st, {
        style: Cn.columns,
        children: [g.jsxs(st, {
          style: Cn.party,
          children: [g.jsx(Ee, {
            style: Cn.partyLabel,
            children: "Opdrachtgever"
          }), g.jsx(Ee, {
            style: Cn.partyName,
            children: r.clientName
          }), g.jsx(Ee, {
            style: Cn.partyLine,
            children: uU(r.clientAddress, r.clientPostalCode, r.clientCity) || "Adres niet opgegeven"
          }), r.contactName && g.jsxs(Ee, {
            style: Cn.partyLine,
            children: ["Contact: ", r.contactName]
          }), r.contactEmail && g.jsx(Ee, {
            style: Cn.partyLine,
            children: r.contactEmail
          }), r.contactPhone && g.jsx(Ee, {
            style: Cn.partyLine,
            children: r.contactPhone
          })]
        }), g.jsxs(st, {
          style: Cn.party,
          children: [g.jsx(Ee, {
            style: Cn.partyLabel,
            children: "Inspectielocatie"
          }), g.jsx(Ee, {
            style: Cn.partyName,
            children: r.projectName
          }), g.jsx(Ee, {
            style: Cn.partyLine,
            children: uU(r.projectAddress, r.projectPostalCode, r.projectCity) || "Adres niet opgegeven"
          })]
        })]
      }), g.jsxs(st, {
        style: Cn.section,
        children: [g.jsx(Ee, {
          style: Cn.sectionTitle,
          children: "Inspectieopdracht"
        }), g.jsx(Ee, {
          style: Cn.description,
          children: r.description || r.title
        }), g.jsxs(st, {
          style: Cn.detailGrid,
          children: [g.jsx(cp, {
            label: "Scope",
            value: bf.scopes[e.scope]
          }), g.jsx(cp, {
            label: "Inspectietype",
            value: n
          }), g.jsx(cp, {
            label: "Gebouwtype",
            value: bf.buildingTypes[e.buildingType]
          }), g.jsx(cp, {
            label: "Bruto vloeroppervlak",
            value: `${e.surfaceArea.toLocaleString("nl-NL")} m²`
          }), g.jsx(cp, {
            label: "Leeftijd installatie",
            value: bf.ages[e.buildingAge]
          }), g.jsx(cp, {
            label: "Verdelers",
            value: `${e.mainBoards} hoofdverdeler(s), ${e.subBoards} onderverdeler(s)`
          }), e.scope !== "10" && g.jsx(cp, {
            label: "NEN 3140-risicoklasse",
            value: bf.riskClasses[e.riskClass]
          }), g.jsx(cp, {
            label: "Geschatte inspectietijd",
            value: `${t.hours.toLocaleString("nl-NL")} uur`
          })]
        })]
      }), g.jsxs(st, {
        style: Cn.section,
        children: [g.jsx(Ee, {
          style: Cn.sectionTitle,
          children: "Kostenopbouw excl. btw"
        }), g.jsx(ch, {
          label: `Inspectie (${t.hours.toLocaleString("nl-NL")} uur à ${rv(e.hourlyRate)}${e.outOfHours ? ", buiten kantooruren +50%" : ""})`,
          value: t.laborCost
        }), g.jsx(ch, {
          label: `Reis (${t.travelDistanceReturn.toLocaleString("nl-NL")} km retour, inclusief reistijd)`,
          value: t.travelCost
        }), g.jsx(ch, {
          label: "SCIOS-afmeldkosten",
          value: t.sciosCost
        }), t.equipmentCost > 0 && g.jsx(ch, {
          label: "Huur klimmaterieel / hoogwerker",
          value: t.equipmentCost
        }), e.hotelCosts > 0 && g.jsx(ch, {
          label: "Verblijfskosten",
          value: e.hotelCosts
        }), e.parkingCosts > 0 && g.jsx(ch, {
          label: "Parkeerkosten",
          value: e.parkingCosts
        }), e.unforeseenCosts > 0 && g.jsx(ch, {
          label: "Onvoorziene kosten",
          value: e.unforeseenCosts
        }), g.jsx(ch, {
          label: "Totaal excl. btw",
          value: t.totalExcludingVat
        }), g.jsx(ch, {
          label: "Btw (21%)",
          value: t.vat
        }), g.jsxs(st, {
          style: Cn.totalRow,
          children: [g.jsx(Ee, {
            style: Cn.totalLabel,
            children: "Totaal incl. btw"
          }), g.jsx(Ee, {
            style: Cn.totalValue,
            children: rv(t.totalIncludingVat)
          })]
        }), g.jsxs(Ee, {
          style: Cn.note,
          children: ["Offertebedrag excl. btw: ", rv(t.totalExcludingVat), ". Bedragen zijn gebaseerd op aangeleverde informatie."]
        })]
      }), g.jsxs(Ee, {
        style: Cn.footer,
        children: ["B2Inspect · info@b2inspect.nl · Offerte ", r.quoteNumber, " · Pagina 1 van 2"]
      })]
    }), g.jsxs(Ou, {
      size: "A4",
      style: Cn.page,
      children: [g.jsxs(st, {
        style: Cn.header,
        children: [g.jsxs(st, {
          children: [g.jsx(Ee, {
            style: Cn.brand,
            children: "B2Inspect"
          }), g.jsx(Ee, {
            style: Cn.brandSub,
            children: "Inspectie en advies"
          })]
        }), g.jsxs(st, {
          children: [g.jsx(Ee, {
            style: Cn.documentTitle,
            children: "VOORWAARDEN"
          }), g.jsxs(Ee, {
            style: Cn.meta,
            children: [r.quoteNumber, " · ", r.clientName]
          })]
        })]
      }), g.jsxs(st, {
        style: Cn.section,
        children: [g.jsx(Ee, {
          style: Cn.sectionTitle,
          children: "Uitgangspunten opdrachtgever"
        }), g.jsx(ff, {
          children: "Alle hoofd- en onderverdelers zijn op de inspectiedag veilig en vrij toegankelijk."
        }), g.jsx(ff, {
          children: "Een contactpersoon verschaft toegang tot relevante ruimten, kasten en installaties."
        }), g.jsx(ff, {
          children: "Sleutels, toegangspassen, actuele schema’s en beschikbare installatiedocumentatie liggen klaar."
        }), g.jsx(ff, {
          children: "Benodigde productieonderbrekingen en kortstondig spanningsloos schakelen zijn vooraf afgestemd."
        }), e.safetyInduction && g.jsx(ff, {
          children: "De verplichte veiligheidsinstructie kan direct bij aankomst starten."
        })]
      }), (e.scope === "10" || e.scope === "combi") && g.jsxs(st, {
        style: Cn.callout,
        children: [g.jsx(Ee, {
          style: Cn.calloutTitle,
          children: "Scope 10: vereiste belasting"
        }), g.jsx(Ee, {
          style: Cn.calloutText,
          children: "Voor representatieve thermografie draait de installatie minimaal 30 minuten vóór aanvang op minimaal 30% van de nominale belasting. Bij onvoldoende belasting kunnen onderdelen niet betrouwbaar worden beoordeeld."
        })]
      }), g.jsxs(st, {
        style: Cn.section,
        children: [g.jsx(Ee, {
          style: Cn.sectionTitle,
          children: "Niet inbegrepen"
        }), g.jsx(ff, {
          children: "Herstelwerk, aanpassingen en herinspecties na herstel vallen buiten deze offerte."
        }), g.jsx(ff, {
          children: "Werk buiten de beschreven scope wordt alleen uitgevoerd na aanvullende opdracht."
        }), g.jsx(ff, {
          children: "Procesmachines en apparaten vallen buiten de elektrische gebouwinstallatie, tenzij schriftelijk overeengekomen."
        }), e.hasSolar ? g.jsx(ff, {
          children: "PV-panelen en DC-bekabeling vallen buiten deze inspectie. Beoordeling van de opgegeven omvormeraansluitingen is wel meegenomen."
        }) : g.jsx(ff, {
          children: "SCIOS Scope 12-inspectie van zonnestroominstallaties is niet inbegrepen."
        })]
      }), g.jsxs(st, {
        style: Cn.section,
        children: [g.jsx(Ee, {
          style: Cn.sectionTitle,
          children: "Commerciële afspraken"
        }), g.jsxs(st, {
          style: Cn.clause,
          children: [g.jsx(Ee, {
            style: Cn.clauseTitle,
            children: "Afwijkende omvang en meerwerk"
          }), g.jsxs(Ee, {
            style: Cn.clauseText,
            children: ["Deze prijs is gebaseerd op de opgegeven omvang. Wijkt de werkelijke situatie meer dan 10% af, dan meldt B2Inspect dit zo snel mogelijk. Meerwerk wordt alleen na afstemming uitgevoerd en berekend tegen ", rv(e.hourlyRate), " excl. btw per uur, plus overeengekomen kosten."]
          })]
        }), g.jsxs(st, {
          style: Cn.clause,
          children: [g.jsx(Ee, {
            style: Cn.clauseTitle,
            children: "Annuleren of verzetten"
          }), g.jsx(Ee, {
            style: Cn.clauseText,
            children: "Bij annulering of verplaatsing binnen 48 uur voor aanvang kan B2Inspect gereserveerde reis- en voorbereidingstijd in rekening brengen, met een minimum van twee uur tegen het vermelde uurtarief."
          })]
        }), g.jsxs(st, {
          style: Cn.clause,
          children: [g.jsx(Ee, {
            style: Cn.clauseTitle,
            children: "Geldigheid"
          }), g.jsxs(Ee, {
            style: Cn.clauseText,
            children: ["Deze offerte is geldig tot en met ", BI(r.validUntil), ". Afwijkende afspraken gelden alleen wanneer beide partijen deze schriftelijk bevestigen."]
          })]
        })]
      }), g.jsxs(st, {
        style: Cn.section,
        children: [g.jsx(Ee, {
          style: Cn.sectionTitle,
          children: "Akkoord voor opdracht"
        }), g.jsx(Ee, {
          style: Cn.clauseText,
          children: "Door ondertekening bevestigt opdrachtgever de opdracht, beschreven scope, prijs en bovenstaande afspraken."
        }), g.jsxs(st, {
          style: Cn.signatures,
          children: [g.jsxs(st, {
            style: Cn.signature,
            children: [g.jsxs(Ee, {
              style: Cn.signatureTitle,
              children: ["Opdrachtgever · ", r.clientName]
            }), g.jsx(st, {
              style: Cn.signatureLine
            }), g.jsx(Ee, {
              style: Cn.signatureHint,
              children: "Naam, datum en handtekening"
            })]
          }), g.jsxs(st, {
            style: Cn.signature,
            children: [g.jsx(Ee, {
              style: Cn.signatureTitle,
              children: "Opdrachtnemer · B2Inspect"
            }), g.jsx(st, {
              style: Cn.signatureLine
            }), g.jsx(Ee, {
              style: Cn.signatureHint,
              children: "Naam, datum en handtekening"
            })]
          })]
        })]
      }), g.jsxs(Ee, {
        style: Cn.footer,
        children: ["B2Inspect · info@b2inspect.nl · Offerte ", r.quoteNumber, " · Pagina 2 van 2"]
      })]
    })]
  });
}
const Qx = [{
    status: "request",
    label: "Aanvragen",
    shortLabel: "Aanvraag"
  }, {
    status: "quote_draft",
    label: "Offertes maken",
    shortLabel: "Conceptofferte"
  }, {
    status: "quote_sent",
    label: "Offertes verstuurd",
    shortLabel: "Offerte verstuurd"
  }, {
    status: "order",
    label: "Opdrachten",
    shortLabel: "Opdracht"
  }, {
    status: "scheduled",
    label: "Ingepland",
    shortLabel: "Ingepland"
  }, {
    status: "completed",
    label: "Uitgevoerd",
    shortLabel: "Uitgevoerd"
  }],
  dU = {
    request: "Aanvraag",
    quote_draft: "Conceptofferte",
    quote_sent: "Offerte verstuurd",
    order: "Opdracht",
    scheduled: "Ingepland",
    completed: "Uitgevoerd",
    lost: "Niet doorgegaan"
  };
function pipelineStageIndex(r) {
  return r === "lost" ? -1 : Qx.findIndex(e => e.status === r);
}
function quoteNumberFromCase(r) {
  return r.case_number.replace(/^DOS-/, "OFF-");
}
function formatCents(r) {
  return r == null ? "Nog niet ingevuld" : new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR"
  }).format(r / 100);
}
function formatScheduledDate(r) {
  if (!r) return "Niet gepland";
  const e = new Date(`${r.slice(0, 10)}T12:00:00`);
  return Number.isNaN(e.getTime()) ? r : e.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
const pU = {
    title: "",
    source: "",
    description: "",
    scopes: ["10"],
    clientId: "",
    clientName: "",
    clientAddress: "",
    clientPostalCode: "",
    clientCity: "",
    clientPhone: "",
    clientEmail: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    projectId: "",
    projectName: "",
    projectAddress: "",
    projectPostalCode: "",
    projectCity: ""
  },
  gU = () => new Date().toISOString().slice(0, 10),
  mU = () => {
    const r = new Date();
    return r.setDate(r.getDate() + 30), r.toISOString().slice(0, 10);
  },
  TI = r => {
    if (r instanceof Error) return r.message;
    if (typeof r == "string") return r;
    if (r && typeof r == "object") {
      const e = r,
        t = [e.message, e.details, e.hint].find(n => typeof n == "string" && n.trim());
      if (typeof t == "string") return t;
    }
    return "Onbekende fout. Probeer opnieuw of neem contact op met beheer.";
  },
  mje = r => ["8", "10"].includes(r) ? `Scope ${r}` : r;
function CommercialPipeline({
  onOpenInspection: r
}) {
  const [e, t] = Ze.useState([]),
    [n, i] = Ze.useState([]),
    [a, s] = Ze.useState([]),
    [o, c] = Ze.useState([]),
    [l, u] = Ze.useState(!0),
    [d, f] = Ze.useState(!1),
    [h, m] = Ze.useState(""),
    [v, A] = Ze.useState(""),
    [y, b] = Ze.useState("active"),
    [w, E] = Ze.useState(!1),
    [B, P] = Ze.useState("request"),
    [Q, M] = Ze.useState(pU),
    [H, G] = Ze.useState(null),
    [X, q] = Ze.useState({
      number: "",
      validUntil: mU()
    }),
    [D, $] = Ze.useState(() => createDefaultQuoteInput()),
    [N, C] = Ze.useState({
      inspectorId: "",
      date: gU(),
      time: "09:00",
      duration: "4"
    }),
    S = Ze.useCallback(async () => {
      u(!0), m("");
      const [Ae, Ue, tt, Ge] = await Promise.all([hr.from("clients").select("*").order("name"), hr.from("crm_projects").select("*").order("name"), hr.from("crm_cases").select("*").order("updated_at", {
          ascending: !1
        }), hr.from("profiles").select("id, email, full_name, scios_nr, role").in("role", ["admin", "inspector"]).order("full_name")]),
        et = Ae.error || Ue.error || tt.error || Ge.error;
      et && m(et.message.includes("crm_") ? "Commerciële database is nog niet ingericht. Voer eerst de CRM-migratie uit." : et.message), t(Ae.data || []), i(Ue.data || []), s(tt.data || []), c(Ge.data || []), u(!1);
    }, []);
  Ze.useEffect(() => {
    S();
  }, [S]), Ze.useEffect(() => {
    const Ae = hr.channel("commercial-pipeline-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "crm_cases"
    }, () => {
      S();
    }).subscribe();
    return () => {
      hr.removeChannel(Ae);
    };
  }, [S]);
  const k = Ze.useMemo(() => a.find(Ae => Ae.id === H) || null, [a, H]),
    j = Ze.useMemo(() => new Map(e.map(Ae => [String(Ae.id), Ae])), [e]),
    W = Ze.useMemo(() => new Map(n.map(Ae => [Ae.id, Ae])), [n]),
    V = Ze.useMemo(() => new Map(o.map(Ae => [Ae.id, Ae])), [o]),
    K = Ze.useMemo(() => calculateQuote(D), [D]);
  Ze.useEffect(() => {
    k && (q({
      number: k.quote_number || quoteNumberFromCase(k),
      validUntil: k.quote_valid_until || mU()
    }), $(normalizeQuoteInput(k.quote_data, k.scopes)), C({
      inspectorId: k.assigned_inspector_id || o[0]?.id || "",
      date: k.scheduled_date || gU(),
      time: k.scheduled_time?.slice(0, 5) || "09:00",
      duration: String(k.estimated_duration_hours || 4)
    }));
  }, [o, k]);
  const oe = Ze.useMemo(() => {
      const Ae = v.trim().toLowerCase();
      return a.filter(Ue => {
        const tt = j.get(String(Ue.client_id)),
          Ge = W.get(Ue.project_id),
          et = y === "all" || (y === "active" ? !["completed", "lost"].includes(Ue.status) : Ue.status === y),
          ct = `${Ue.case_number} ${Ue.title} ${tt?.name || ""} ${Ge?.name || ""} ${Ge?.city || ""}`.toLowerCase();
        return et && (!Ae || ct.includes(Ae));
      });
    }, [a, j, W, v, y]),
    ue = Ae => {
      M({
        ...pU,
        clientId: e.length ? "" : "__new"
      }), P(Ae), m(""), E(!0);
    },
    xe = (Ae, Ue) => {
      M(tt => ({
        ...tt,
        [Ae]: Ue
      }));
    },
    re = async () => {
      if (!Q.title.trim()) return m("Geef aanvraag een duidelijke titel.");
      if (!Q.clientId) return m("Kies een klant of maak nieuwe klant.");
      if (!Q.projectId) return m("Kies een projectlocatie of maak nieuwe locatie.");
      if (!Q.scopes.length) return m("Kies minimaal één SCIOS-scope.");
      f(!0), m("");
      let Ae = Q.clientId,
        Ue = Q.projectId,
        tt = null,
        Ge = null;
      try {
        if (Ae === "__new") {
          if (!Q.clientName.trim()) throw new Error("Klantnaam is verplicht.");
          const Tt = Q.contactName.trim() ? [{
              id: crypto.randomUUID(),
              name: Q.contactName.trim(),
              role: "Contactpersoon",
              phone: Q.contactPhone.trim(),
              email: Q.contactEmail.trim()
            }] : [],
            {
              data: Vt,
              error: Ft
            } = await hr.from("clients").insert({
              name: Q.clientName.trim(),
              address: Q.clientAddress.trim(),
              postal_code: Q.clientPostalCode.trim(),
              city: Q.clientCity.trim(),
              phone: Q.clientPhone.trim(),
              email: Q.clientEmail.trim(),
              contacts: Tt
            }).select("id").single();
          if (Ft) throw Ft;
          Ae = String(Vt.id), tt = Ae;
        }
        if (Ue === "__new") {
          if (!Q.projectName.trim()) throw new Error("Projectnaam of locatie is verplicht.");
          const {
            data: Tt,
            error: Vt
          } = await hr.from("crm_projects").insert({
            client_id: Ae,
            name: Q.projectName.trim(),
            address: Q.projectAddress.trim(),
            postal_code: Q.projectPostalCode.trim(),
            city: Q.projectCity.trim(),
            contact_name: Q.contactName.trim(),
            contact_phone: Q.contactPhone.trim(),
            contact_email: Q.contactEmail.trim()
          }).select("id").single();
          if (Vt) throw Vt;
          Ue = Tt.id, Ge = Ue;
        } else {
          const Tt = n.find(Vt => Vt.id === Ue);
          if (!Tt || String(Tt.client_id) !== String(Ae)) throw new Error("Projectlocatie hoort niet bij gekozen klant.");
        }
        const et = B === "quote",
          {
            data: ct,
            error: ht
          } = await hr.from("crm_cases").insert({
            client_id: Ae,
            project_id: Ue,
            title: Q.title.trim(),
            source: Q.source.trim(),
            description: Q.description.trim(),
            contact_name: Q.contactName.trim(),
            contact_phone: Q.contactPhone.trim(),
            contact_email: Q.contactEmail.trim(),
            scopes: Q.scopes,
            status: et ? "quote_draft" : "request",
            ...(et ? {
              quote_data: createDefaultQuoteInput(Q.scopes)
            } : {})
          }).select("*").single();
        if (ht) throw ht;
        await ac("admin", et ? "commercial_quote_created_directly" : "commercial_request_created", "crm_case", ct.id, ct.case_number, {
          clientId: Ae,
          projectId: Ue,
          scopes: Q.scopes
        }), E(!1), await S(), G(ct.id);
      } catch (et) {
        Ge && (await hr.from("crm_projects").delete().eq("id", Ge)), tt && (await hr.from("clients").delete().eq("id", tt)), m(TI(et));
      } finally {
        f(!1);
      }
    },
    ve = async (Ae, Ue, tt) => {
      f(!0), m("");
      const {
        data: Ge,
        error: et
      } = await hr.from("crm_cases").update(Ue).eq("id", Ae.id).eq("updated_at", Ae.updated_at).select("*").maybeSingle();
      return et || !Ge ? (m(et?.message || "Dossier is intussen gewijzigd. Vernieuw en probeer opnieuw."), f(!1), await S(), null) : (await ac("admin", tt, "crm_case", Ae.id, Ae.case_number, {
        from: Ae.status,
        to: Ue.status || Ae.status
      }), s(ct => ct.map(ht => ht.id === Ae.id ? Ge : ht)), f(!1), Ge);
    },
    Z = async Ae => {
      if (!Ae.scopes.some(Ue => Ue === "8" || Ue === "10")) {
        m("Offertecalculator ondersteunt alleen SCIOS Scope 8 en Scope 10. Pas eerst inspectiekeuze aan.");
        return;
      }
      (await ve(Ae, {
        status: "quote_draft",
        quote_data: createDefaultQuoteInput(Ae.scopes)
      }, "commercial_quote_started")) && G(Ae.id);
    },
    Y = () => X.number.trim() ? X.validUntil ? validateQuoteInput(D) : "Geldigheidsdatum is verplicht." : "Offertenummer is verplicht.",
    ce = () => ({
      quote_number: X.number.trim(),
      quote_amount_cents: Math.round(K.totalExcludingVat * 100),
      quote_valid_until: X.validUntil,
      quote_data: D
    }),
    be = async (Ae, Ue) => {
      const tt = Y();
      if (tt) return m(tt);
      (await ve(Ae, {
        ...ce(),
        quote_number: X.number.trim(),
        ...(Ue ? {
          status: "quote_sent",
          quote_sent_at: new Date().toISOString()
        } : {})
      }, Ue ? "commercial_quote_sent" : "commercial_quote_saved")) && Ue && (await S());
    },
    De = async Ae => {
      const Ue = Y();
      if (Ue) return m(Ue);
      const tt = j.get(String(Ae.client_id)),
        Ge = W.get(Ae.project_id);
      if (!tt || !Ge) return m("Klant- of projectgegevens ontbreken.");
      f(!0), m("");
      try {
        const et = {
            quoteNumber: X.number.trim(),
            quoteDate: (Ae.quote_sent_at || Ae.quote_generated_at || new Date().toISOString()).slice(0, 10),
            validUntil: X.validUntil,
            caseNumber: Ae.case_number,
            title: Ae.title,
            description: Ae.description || "",
            clientName: tt.name,
            clientAddress: tt.address || "",
            clientPostalCode: tt.postal_code || "",
            clientCity: tt.city || "",
            contactName: Ae.contact_name || "",
            contactEmail: Ae.contact_email || "",
            contactPhone: Ae.contact_phone || "",
            projectName: Ge.name,
            projectAddress: Ge.address || "",
            projectPostalCode: Ge.postal_code || "",
            projectCity: Ge.city || ""
          },
          ct = await h1(g.jsx(QuotePdfDocument, {
            data: et,
            input: D,
            calculation: K
          })).toBlob();
        if (!(await ve(Ae, {
          ...ce(),
          quote_generated_at: new Date().toISOString()
        }, "commercial_quote_pdf_generated"))) return;
        const Tt = URL.createObjectURL(ct),
          Vt = document.createElement("a");
        Vt.href = Tt, Vt.download = createQuotePdfFilename(X.number, tt.name), document.body.appendChild(Vt), Vt.click(), Vt.remove(), window.setTimeout(() => URL.revokeObjectURL(Tt), 1e3);
      } catch (et) {
        m(`PDF kon niet worden gemaakt: ${TI(et)}`);
      } finally {
        f(!1);
      }
    },
    Ne = async Ae => {
      window.confirm("Verzonden offerte terugzetten naar concept om deze te wijzigen?") && (await ve(Ae, {
        status: "quote_draft"
      }, "commercial_quote_reopened"));
    },
    ze = async Ae => {
      if (!Ae.quote_number?.trim()) return m("Offertenummer is verplicht.");
      if (!Ae.quote_amount_cents || Ae.quote_amount_cents <= 0) return m("Vul een offertebedrag groter dan € 0 in.");
      window.confirm("Offerte als geaccepteerd registreren en opdracht maken?") && (await ve(Ae, {
        status: "order",
        accepted_at: new Date().toISOString()
      }, "commercial_quote_accepted")) && (await S());
    },
    Je = async Ae => {
      const Ue = window.prompt("Waarom gaat aanvraag of opdracht niet door?", Ae.lost_reason || "");
      if (Ue !== null) {
        if (!Ue.trim()) return m("Reden is verplicht.");
        (await ve(Ae, {
          status: "lost",
          lost_reason: Ue.trim()
        }, "commercial_case_lost")) && (await S());
      }
    },
    Me = async Ae => {
      if (!N.inspectorId || !N.date || !N.time) return m("Inspecteur, datum en tijd zijn verplicht.");
      const Ue = Number(N.duration);
      if (!Number.isFinite(Ue) || Ue < .5 || Ue > 24) return m("Duur moet tussen 0,5 en 24 uur liggen.");
      const tt = j.get(String(Ae.client_id)),
        Ge = W.get(Ae.project_id),
        et = V.get(N.inspectorId);
      if (!tt || !Ge || !et) return m("Klant, project of inspecteur ontbreekt.");
      const ct = Ae.scopes.find(ht => ht === "8" || ht === "10");
      if (!ct) return m("Deze inspectiesoort kan nog niet als SCIOS-inspectie worden ingepland.");
      f(!0), m("");
      try {
        const ht = await k1(Ge.address || "", Ge.postal_code || "", Ge.city || ""),
          Tt = Nk({
            clientName: tt.name,
            clientAddress: tt.address || "",
            clientPostalCode: tt.postal_code || "",
            clientCity: tt.city || "",
            clientContactPerson: Ae.contact_name || "",
            clientPhone: Ae.contact_phone || tt.phone || "",
            clientEmail: Ae.contact_email || tt.email || "",
            projectLocation: Ge.name,
            projectAddress: Ge.address || "",
            projectPostalCode: Ge.postal_code || "",
            projectCity: Ge.city || "",
            projectContactPerson: Ge.contact_name || Ae.contact_name || "",
            projectPhone: Ge.contact_phone || Ae.contact_phone || "",
            projectEmail: Ge.contact_email || Ae.contact_email || "",
            assignedInspectorId: et.id,
            inspectorName: et.full_name || et.email,
            sciosRegistrationNumber: et.scios_nr || "",
            date: N.date,
            scheduledTimeStart: N.time,
            estimatedDurationHours: Ue,
            scopeType: ct,
            sciosScope: ct,
            ...(ht || {})
          }),
          {
            data: Vt,
            error: Ft
          } = await hr.rpc("schedule_crm_case", {
            p_case_id: Ae.id,
            p_expected_updated_at: Ae.updated_at,
            p_inspector_id: et.id,
            p_scheduled_date: N.date,
            p_scheduled_time: N.time,
            p_duration_hours: Ue,
            p_report_data: Tt
          });
        if (Ft) throw Ft;
        await ac("admin", "commercial_case_scheduled", "crm_case", Ae.id, Ae.case_number, {
          inspectionId: Vt,
          inspectorId: et.id,
          date: N.date,
          time: N.time
        }), await S();
      } catch (ht) {
        m(TI(ht));
      } finally {
        f(!1);
      }
    },
    _e = Ae => {
      const Ue = j.get(String(Ae.client_id)),
        tt = W.get(Ae.project_id),
        Ge = Ae.assigned_inspector_id ? V.get(Ae.assigned_inspector_id) : null;
      return g.jsx("article", {
        className: "ig-pipeline-card",
        children: g.jsxs("button", {
          type: "button",
          className: "w-full text-left",
          onClick: () => G(Ae.id),
          children: [g.jsxs("div", {
            className: "flex items-start justify-between gap-3",
            children: [g.jsxs("div", {
              className: "min-w-0",
              children: [g.jsx("p", {
                className: "ig-pipeline-number",
                children: Ae.case_number
              }), g.jsx("h3", {
                children: Ae.title
              })]
            }), g.jsx(y5, {
              size: 18,
              className: "mt-1 shrink-0 text-zinc-400"
            })]
          }), g.jsxs("p", {
            className: "mt-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-700",
            children: [g.jsx(oC, {
              size: 14
            }), " ", Ue?.name || "Onbekende klant"]
          }), g.jsxs("p", {
            className: "mt-1 flex items-center gap-1.5 text-xs text-zinc-500",
            children: [g.jsx(u0, {
              size: 13
            }), " ", tt?.name || "Onbekend project", tt?.city ? `, ${tt.city}` : ""]
          }), Ae.status === "scheduled" && g.jsxs("p", {
            className: "mt-3 rounded-md bg-zinc-100 px-2.5 py-2 text-xs font-semibold text-zinc-700",
            children: [formatScheduledDate(Ae.scheduled_date), " · ", Ae.scheduled_time?.slice(0, 5), " · ", Ge?.full_name || Ge?.email]
          }), ["quote_draft", "quote_sent"].includes(Ae.status) && g.jsx("p", {
            className: "mt-3 text-xs font-semibold text-zinc-600",
            children: formatCents(Ae.quote_amount_cents)
          })]
        })
      }, Ae.id);
    };
  return l ? g.jsxs("div", {
    className: "ig-pipeline-empty",
    children: [g.jsx(Ns, {
      className: "animate-spin",
      size: 20
    }), " Pipeline laden…"]
  }) : g.jsxs("section", {
    className: "ig-pipeline-shell",
    children: [h && g.jsxs("div", {
      className: "ig-pipeline-error",
      role: "alert",
      children: [g.jsx(cC, {
        size: 18
      }), g.jsx("span", {
        children: h
      }), g.jsx("button", {
        onClick: () => m(""),
        "aria-label": "Melding sluiten",
        children: g.jsx(Kc, {
          size: 16
        })
      })]
    }), g.jsxs("div", {
      className: "ig-pipeline-toolbar",
      children: [g.jsxs("div", {
        className: "relative min-w-0 flex-1",
        children: [g.jsx($c, {
          className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400",
          size: 17
        }), g.jsx("input", {
          value: v,
          onChange: Ae => A(Ae.target.value),
          placeholder: "Zoek dossier, klant of locatie",
          className: "ig-pipeline-search"
        })]
      }), g.jsxs("div", {
        className: "ig-pipeline-create-actions",
        children: [g.jsxs("button", {
          className: "ig-secondary-button",
          onClick: () => ue("request"),
          children: [g.jsx(mh, {
            size: 17
          }), " Nieuwe aanvraag"]
        }), g.jsxs("button", {
          className: "ig-pipeline-primary",
          onClick: () => ue("quote"),
          children: [g.jsx(Mu, {
            size: 17
          }), " Nieuwe offerte"]
        })]
      })]
    }), g.jsxs("div", {
      className: "ig-pipeline-stages",
      "aria-label": "Filter op fase",
      children: [g.jsxs("button", {
        className: y === "active" ? "is-active" : "",
        onClick: () => b("active"),
        children: [g.jsx($Ce, {
          size: 15
        }), g.jsx("span", {
          children: "Actief"
        }), g.jsx("strong", {
          children: a.filter(Ae => !["completed", "lost"].includes(Ae.status)).length
        })]
      }), Qx.map(Ae => g.jsxs("button", {
        className: y === Ae.status ? "is-active" : "",
        onClick: () => b(Ae.status),
        children: [g.jsx("span", {
          children: Ae.shortLabel
        }), g.jsx("strong", {
          children: a.filter(Ue => Ue.status === Ae.status).length
        })]
      }, Ae.status)), g.jsxs("button", {
        className: y === "lost" ? "is-active" : "",
        onClick: () => b("lost"),
        children: [g.jsx("span", {
          children: "Niet doorgegaan"
        }), g.jsx("strong", {
          children: a.filter(Ae => Ae.status === "lost").length
        })]
      }), g.jsxs("button", {
        className: y === "all" ? "is-active" : "",
        onClick: () => b("all"),
        children: [g.jsx("span", {
          children: "Alles"
        }), g.jsx("strong", {
          children: a.length
        })]
      })]
    }), y === "active" && !v ? g.jsx("div", {
      className: "ig-pipeline-board",
      children: Qx.filter(Ae => !["completed"].includes(Ae.status)).map(Ae => {
        const Ue = a.filter(tt => tt.status === Ae.status);
        return g.jsxs("div", {
          className: "ig-pipeline-lane",
          children: [g.jsxs("header", {
            children: [g.jsx("span", {
              children: Ae.label
            }), g.jsx("strong", {
              children: Ue.length
            })]
          }), g.jsx("div", {
            children: Ue.length ? Ue.map(_e) : g.jsx("p", {
              className: "ig-pipeline-lane-empty",
              children: "Geen dossiers"
            })
          })]
        }, Ae.status);
      })
    }) : g.jsx("div", {
      className: "ig-pipeline-list",
      children: oe.length ? oe.map(_e) : g.jsx("div", {
        className: "ig-pipeline-empty",
        children: "Geen dossiers gevonden."
      })
    }), w && g.jsx("div", {
      className: "ig-modal-backdrop",
      role: "presentation",
      onMouseDown: Ae => {
        Ae.target === Ae.currentTarget && E(!1);
      },
      children: g.jsxs("div", {
        className: "ig-pipeline-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "new-request-title",
        children: [g.jsxs("header", {
          children: [g.jsxs("div", {
            children: [g.jsx("p", {
              className: "ig-eyebrow",
              children: B === "quote" ? "Direct opstellen" : "Nieuwe instroom"
            }), g.jsx("h2", {
              id: "new-request-title",
              children: B === "quote" ? "Nieuwe offerte" : "Aanvraag vastleggen"
            })]
          }), g.jsx("button", {
            className: "ig-icon-button",
            onClick: () => E(!1),
            "aria-label": "Sluiten",
            children: g.jsx(Kc, {
              size: 19
            })
          })]
        }), h && g.jsxs("div", {
          className: "ig-pipeline-error ig-modal-error",
          role: "alert",
          children: [g.jsx(cC, {
            size: 18
          }), g.jsx("span", {
            children: h
          })]
        }), g.jsxs("div", {
          className: "ig-pipeline-form",
          children: [g.jsxs("div", {
            className: "ig-form-section",
            children: [g.jsxs("h3", {
              children: [g.jsx(Mu, {
                size: 17
              }), " ", B === "quote" ? "Offertebasis" : "Aanvraag"]
            }), g.jsxs("label", {
              className: "ig-field ig-field-wide",
              children: [g.jsx("span", {
                children: "Titel *"
              }), g.jsx("input", {
                autoFocus: !0,
                value: Q.title,
                onChange: Ae => xe("title", Ae.target.value),
                placeholder: "Bijv. SCIOS Scope 10 distributiecentrum"
              })]
            }), g.jsxs("label", {
              className: "ig-field",
              children: [g.jsx("span", {
                children: "Bron"
              }), g.jsxs("select", {
                value: Q.source,
                onChange: Ae => xe("source", Ae.target.value),
                children: [g.jsx("option", {
                  value: "",
                  children: "Niet bekend"
                }), g.jsx("option", {
                  children: "Website"
                }), g.jsx("option", {
                  children: "E-mail"
                }), g.jsx("option", {
                  children: "Telefoon"
                }), g.jsx("option", {
                  children: "Vaste klant"
                }), g.jsx("option", {
                  children: "Partner"
                })]
              })]
            }), g.jsxs("fieldset", {
              className: "ig-field",
              children: [g.jsx("legend", {
                children: "Scopes *"
              }), g.jsx("div", {
                className: "ig-scope-options",
                children: ["8", "10"].map(Ae => g.jsxs("label", {
                  children: [g.jsx("input", {
                    type: "checkbox",
                    checked: Q.scopes.includes(Ae),
                    onChange: Ue => xe("scopes", Ue.target.checked ? [...Q.scopes, Ae] : Q.scopes.filter(tt => tt !== Ae))
                  }), " Scope ", Ae]
                }, Ae))
              })]
            }), g.jsxs("label", {
              className: "ig-field ig-field-wide",
              children: [g.jsx("span", {
                children: "Toelichting"
              }), g.jsx("textarea", {
                value: Q.description,
                onChange: Ae => xe("description", Ae.target.value),
                placeholder: "Omvang, gewenste termijn en bijzonderheden"
              })]
            })]
          }), g.jsxs("div", {
            className: "ig-form-section",
            children: [g.jsxs("h3", {
              children: [g.jsx(oC, {
                size: 17
              }), " Klant"]
            }), g.jsxs("label", {
              className: "ig-field ig-field-wide",
              children: [g.jsx("span", {
                children: "Klant *"
              }), g.jsxs("select", {
                value: Q.clientId,
                onChange: Ae => {
                  xe("clientId", Ae.target.value), xe("projectId", "");
                },
                children: [g.jsx("option", {
                  value: "",
                  children: "Kies klant"
                }), e.map(Ae => g.jsx("option", {
                  value: Ae.id,
                  children: Ae.name
                }, Ae.id)), g.jsx("option", {
                  value: "__new",
                  children: "+ Nieuwe klant"
                })]
              })]
            }), Q.clientId === "__new" && g.jsxs(g.Fragment, {
              children: [g.jsxs("label", {
                className: "ig-field ig-field-wide",
                children: [g.jsx("span", {
                  children: "Klantnaam *"
                }), g.jsx("input", {
                  value: Q.clientName,
                  onChange: Ae => xe("clientName", Ae.target.value)
                })]
              }), g.jsxs("label", {
                className: "ig-field ig-field-wide",
                children: [g.jsx("span", {
                  children: "Adres"
                }), g.jsx("input", {
                  value: Q.clientAddress,
                  onChange: Ae => xe("clientAddress", Ae.target.value)
                })]
              }), g.jsxs("label", {
                className: "ig-field",
                children: [g.jsx("span", {
                  children: "Postcode"
                }), g.jsx("input", {
                  value: Q.clientPostalCode,
                  onChange: Ae => xe("clientPostalCode", Ae.target.value)
                })]
              }), g.jsxs("label", {
                className: "ig-field",
                children: [g.jsx("span", {
                  children: "Plaats"
                }), g.jsx("input", {
                  value: Q.clientCity,
                  onChange: Ae => xe("clientCity", Ae.target.value)
                })]
              }), g.jsxs("label", {
                className: "ig-field",
                children: [g.jsx("span", {
                  children: "Telefoon"
                }), g.jsx("input", {
                  type: "tel",
                  value: Q.clientPhone,
                  onChange: Ae => xe("clientPhone", Ae.target.value)
                })]
              }), g.jsxs("label", {
                className: "ig-field",
                children: [g.jsx("span", {
                  children: "E-mail"
                }), g.jsx("input", {
                  type: "email",
                  value: Q.clientEmail,
                  onChange: Ae => xe("clientEmail", Ae.target.value)
                })]
              })]
            }), g.jsxs("label", {
              className: "ig-field",
              children: [g.jsx("span", {
                children: "Contactpersoon"
              }), g.jsx("input", {
                value: Q.contactName,
                onChange: Ae => xe("contactName", Ae.target.value)
              })]
            }), g.jsxs("label", {
              className: "ig-field",
              children: [g.jsx("span", {
                children: "Contact e-mail"
              }), g.jsx("input", {
                type: "email",
                value: Q.contactEmail,
                onChange: Ae => xe("contactEmail", Ae.target.value)
              })]
            }), g.jsxs("label", {
              className: "ig-field",
              children: [g.jsx("span", {
                children: "Contact telefoon"
              }), g.jsx("input", {
                type: "tel",
                value: Q.contactPhone,
                onChange: Ae => xe("contactPhone", Ae.target.value)
              })]
            })]
          }), g.jsxs("div", {
            className: "ig-form-section",
            children: [g.jsxs("h3", {
              children: [g.jsx(u0, {
                size: 17
              }), " Projectlocatie"]
            }), g.jsxs("label", {
              className: "ig-field ig-field-wide",
              children: [g.jsx("span", {
                children: "Project *"
              }), g.jsxs("select", {
                disabled: !Q.clientId,
                value: Q.projectId,
                onChange: Ae => xe("projectId", Ae.target.value),
                children: [g.jsx("option", {
                  value: "",
                  children: "Kies project"
                }), n.filter(Ae => String(Ae.client_id) === String(Q.clientId)).map(Ae => g.jsxs("option", {
                  value: Ae.id,
                  children: [Ae.name, Ae.city ? ` · ${Ae.city}` : ""]
                }, Ae.id)), g.jsx("option", {
                  value: "__new",
                  children: "+ Nieuwe projectlocatie"
                })]
              })]
            }), Q.projectId === "__new" && g.jsxs(g.Fragment, {
              children: [g.jsxs("label", {
                className: "ig-field ig-field-wide",
                children: [g.jsx("span", {
                  children: "Projectnaam / locatie *"
                }), g.jsx("input", {
                  value: Q.projectName,
                  onChange: Ae => xe("projectName", Ae.target.value)
                })]
              }), g.jsxs("label", {
                className: "ig-field ig-field-wide",
                children: [g.jsx("span", {
                  children: "Inspectieadres"
                }), g.jsx("input", {
                  value: Q.projectAddress,
                  onChange: Ae => xe("projectAddress", Ae.target.value)
                })]
              }), g.jsxs("label", {
                className: "ig-field",
                children: [g.jsx("span", {
                  children: "Postcode"
                }), g.jsx("input", {
                  value: Q.projectPostalCode,
                  onChange: Ae => xe("projectPostalCode", Ae.target.value)
                })]
              }), g.jsxs("label", {
                className: "ig-field",
                children: [g.jsx("span", {
                  children: "Plaats"
                }), g.jsx("input", {
                  value: Q.projectCity,
                  onChange: Ae => xe("projectCity", Ae.target.value)
                })]
              })]
            })]
          })]
        }), g.jsxs("footer", {
          children: [g.jsx("button", {
            className: "ig-secondary-button",
            onClick: () => E(!1),
            children: "Annuleren"
          }), g.jsxs("button", {
            className: "ig-pipeline-primary",
            disabled: d,
            onClick: () => {
              re();
            },
            children: [d ? g.jsx(Ns, {
              className: "animate-spin",
              size: 17
            }) : B === "quote" ? g.jsx(Mu, {
              size: 17
            }) : g.jsx(mh, {
              size: 17
            }), " ", B === "quote" ? "Offerte opstellen" : "Aanvraag maken"]
          })]
        })]
      })
    }), k && (() => {
      const Ae = j.get(String(k.client_id)),
        Ue = W.get(k.project_id),
        tt = pipelineStageIndex(k.status);
      return g.jsx("div", {
        className: "ig-modal-backdrop",
        role: "presentation",
        onMouseDown: Ge => {
          Ge.target === Ge.currentTarget && G(null);
        },
        children: g.jsxs("aside", {
          className: `ig-pipeline-drawer ${["quote_draft", "quote_sent"].includes(k.status) ? "ig-quote-drawer" : ""}`,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "case-title",
          children: [g.jsxs("header", {
            children: [g.jsxs("div", {
              children: [g.jsx("p", {
                className: "ig-pipeline-number",
                children: k.case_number
              }), g.jsx("h2", {
                id: "case-title",
                children: k.title
              })]
            }), g.jsx("button", {
              className: "ig-icon-button",
              onClick: () => G(null),
              "aria-label": "Sluiten",
              children: g.jsx(Kc, {
                size: 19
              })
            })]
          }), h && g.jsxs("div", {
            className: "ig-pipeline-error ig-modal-error",
            role: "alert",
            children: [g.jsx(cC, {
              size: 18
            }), g.jsx("span", {
              children: h
            })]
          }), g.jsx("div", {
            className: "ig-case-progress",
            "aria-label": `Huidige fase: ${dU[k.status]}`,
            children: Qx.map((Ge, et) => g.jsx("span", {
              className: et <= tt ? "is-done" : "",
              title: Ge.shortLabel,
              children: et < tt ? g.jsx(p1, {
                size: 12
              }) : et + 1
            }, Ge.status))
          }), g.jsxs("div", {
            className: "ig-case-body",
            children: [g.jsx("span", {
              className: `ig-status-badge status-${k.status}`,
              children: dU[k.status]
            }), g.jsxs("section", {
              className: "ig-case-summary",
              children: [g.jsxs("div", {
                children: [g.jsx(oC, {
                  size: 16
                }), g.jsxs("span", {
                  children: [g.jsx("small", {
                    children: "Klant"
                  }), g.jsx("strong", {
                    children: Ae?.name || "-"
                  })]
                })]
              }), g.jsxs("div", {
                children: [g.jsx(u0, {
                  size: 16
                }), g.jsxs("span", {
                  children: [g.jsx("small", {
                    children: "Project"
                  }), g.jsx("strong", {
                    children: Ue?.name || "-"
                  }), g.jsx("em", {
                    children: [Ue?.address, Ue?.postal_code, Ue?.city].filter(Boolean).join(", ")
                  })]
                })]
              }), g.jsxs("div", {
                children: [g.jsx(hC, {
                  size: 16
                }), g.jsxs("span", {
                  children: [g.jsx("small", {
                    children: "Inspecties"
                  }), g.jsx("strong", {
                    children: k.scopes.map(mje).join(" + ")
                  })]
                })]
              }), k.contact_name && g.jsxs("div", {
                children: [g.jsx(i3e, {
                  size: 16
                }), g.jsxs("span", {
                  children: [g.jsx("small", {
                    children: "Contact"
                  }), g.jsx("strong", {
                    children: k.contact_name
                  }), g.jsx("em", {
                    children: k.contact_email || k.contact_phone
                  })]
                })]
              })]
            }), k.description && g.jsxs("section", {
              className: "ig-case-note",
              children: [g.jsx("small", {
                children: "Aanvraag"
              }), g.jsx("p", {
                children: k.description
              })]
            }), k.status === "request" && g.jsxs("section", {
              className: "ig-case-action",
              children: [g.jsx("h3", {
                children: "Volgende stap"
              }), g.jsx("p", {
                children: "Maak offerte vanuit aanvraag. Klant- en projectgegevens blijven gekoppeld."
              }), g.jsxs("button", {
                className: "ig-pipeline-primary",
                disabled: d,
                onClick: () => {
                  Z(k);
                },
                children: [g.jsx(Mu, {
                  size: 17
                }), " Offerte maken"]
              })]
            }), k.status === "quote_draft" && g.jsxs("section", {
              className: "ig-case-action ig-quote-action",
              children: [g.jsxs("h3", {
                children: [g.jsx(lEe, {
                  size: 17
                }), " Offerte opstellen"]
              }), g.jsx("p", {
                children: "Klant, project en aanvraag zijn gekoppeld. Vul ontbrekende omvang in; prijs wordt automatisch berekend."
              }), !k.quote_data && k.quote_amount_cents != null && g.jsxs("div", {
                className: "ig-quote-legacy-note",
                role: "note",
                children: ["Oud handmatig bedrag: ", formatCents(k.quote_amount_cents), ". Dit wordt pas vervangen wanneer nieuw concept wordt opgeslagen."]
              }), g.jsxs("div", {
                className: "ig-action-grid ig-quote-meta",
                children: [g.jsxs("label", {
                  className: "ig-field",
                  htmlFor: "quote-number",
                  children: [g.jsx("span", {
                    children: "Offertenummer *"
                  }), g.jsx("input", {
                    id: "quote-number",
                    name: "quote-number",
                    value: X.number,
                    onChange: Ge => q(et => ({
                      ...et,
                      number: Ge.currentTarget.value
                    }))
                  })]
                }), g.jsxs("label", {
                  className: "ig-field",
                  htmlFor: "quote-valid-until",
                  children: [g.jsx("span", {
                    children: "Geldig tot *"
                  }), g.jsx("input", {
                    id: "quote-valid-until",
                    name: "quote-valid-until",
                    type: "date",
                    value: X.validUntil,
                    onChange: Ge => q(et => ({
                      ...et,
                      validUntil: Ge.currentTarget.value
                    }))
                  })]
                })]
              }), g.jsx(QuoteCalculator, {
                value: D,
                calculation: K,
                requestedScopes: k.scopes,
                disabled: d,
                onChange: $
              }), g.jsxs("div", {
                className: "ig-action-buttons ig-quote-buttons",
                children: [g.jsx("button", {
                  className: "ig-secondary-button",
                  disabled: d,
                  onClick: () => {
                    be(k, !1);
                  },
                  children: "Concept opslaan"
                }), g.jsxs("button", {
                  className: "ig-secondary-button",
                  disabled: d,
                  onClick: () => {
                    De(k);
                  },
                  children: [g.jsx(Ng, {
                    size: 17
                  }), " Opslaan en PDF downloaden"]
                }), g.jsxs("button", {
                  className: "ig-pipeline-primary",
                  disabled: d,
                  onClick: () => {
                    be(k, !0);
                  },
                  children: [g.jsx(hC, {
                    size: 17
                  }), " Markeer verzonden"]
                })]
              })]
            }), k.status === "quote_sent" && g.jsxs("section", {
              className: "ig-case-action ig-quote-action",
              children: [g.jsxs("h3", {
                children: [g.jsx(hC, {
                  size: 17
                }), " Verzonden offerte"]
              }), g.jsxs("div", {
                className: "ig-quote-sent-summary",
                children: [g.jsxs("div", {
                  children: [g.jsx("span", {
                    children: "Offertenummer"
                  }), g.jsx("strong", {
                    children: X.number
                  })]
                }), g.jsxs("div", {
                  children: [g.jsx("span", {
                    children: "Bedrag excl. btw"
                  }), g.jsx("strong", {
                    children: formatCurrency((k.quote_amount_cents || 0) / 100)
                  })]
                }), g.jsxs("div", {
                  children: [g.jsx("span", {
                    children: "Geldig tot"
                  }), g.jsx("strong", {
                    children: formatScheduledDate(X.validUntil)
                  })]
                })]
              }), k.quote_data ? g.jsxs("details", {
                className: "ig-quote-details",
                children: [g.jsx("summary", {
                  children: "Berekening bekijken"
                }), g.jsx(QuoteCalculator, {
                  value: D,
                  calculation: K,
                  requestedScopes: k.scopes,
                  disabled: !0,
                  onChange: $
                })]
              }) : g.jsx("div", {
                className: "ig-quote-legacy-note",
                role: "note",
                children: "Deze oudere offerte bevat geen calculatorgegevens. Zet offerte terug naar concept om nieuwe PDF op te stellen."
              }), g.jsxs("div", {
                className: "ig-action-buttons ig-quote-buttons",
                children: [g.jsxs("button", {
                  className: "ig-secondary-button",
                  disabled: d,
                  onClick: () => {
                    Ne(k);
                  },
                  children: [g.jsx(gf, {
                    size: 17
                  }), " Offerte aanpassen"]
                }), k.quote_data && g.jsxs("button", {
                  className: "ig-secondary-button",
                  disabled: d,
                  onClick: () => {
                    De(k);
                  },
                  children: [g.jsx(Ng, {
                    size: 17
                  }), " PDF downloaden"]
                }), g.jsxs("button", {
                  className: "ig-pipeline-primary",
                  disabled: d,
                  onClick: () => {
                    ze(k);
                  },
                  children: [g.jsx(p1, {
                    size: 17
                  }), " Offerte geaccepteerd"]
                })]
              })]
            }), ["order", "scheduled"].includes(k.status) && g.jsxs("section", {
              className: "ig-case-action",
              children: [g.jsxs("h3", {
                children: [g.jsx(DM, {
                  size: 17
                }), " ", k.status === "scheduled" ? "Planning wijzigen" : "Opdracht inplannen"]
              }), g.jsxs("div", {
                className: "ig-action-grid",
                children: [g.jsxs("label", {
                  className: "ig-field ig-field-wide",
                  children: [g.jsx("span", {
                    children: "Inspecteur *"
                  }), g.jsxs("select", {
                    value: N.inspectorId,
                    onChange: Ge => C(et => ({
                      ...et,
                      inspectorId: Ge.target.value
                    })),
                    children: [g.jsx("option", {
                      value: "",
                      children: "Kies inspecteur"
                    }), o.map(Ge => g.jsx("option", {
                      value: Ge.id,
                      children: Ge.full_name || Ge.email
                    }, Ge.id))]
                  })]
                }), g.jsxs("label", {
                  className: "ig-field",
                  children: [g.jsx("span", {
                    children: "Datum *"
                  }), g.jsx("input", {
                    type: "date",
                    value: N.date,
                    onChange: Ge => C(et => ({
                      ...et,
                      date: Ge.target.value
                    }))
                  })]
                }), g.jsxs("label", {
                  className: "ig-field",
                  children: [g.jsx("span", {
                    children: "Start *"
                  }), g.jsx("input", {
                    type: "time",
                    value: N.time,
                    onChange: Ge => C(et => ({
                      ...et,
                      time: Ge.target.value
                    }))
                  })]
                }), g.jsxs("label", {
                  className: "ig-field",
                  children: [g.jsx("span", {
                    children: "Duur (uur) *"
                  }), g.jsx("input", {
                    type: "number",
                    min: "0.5",
                    max: "24",
                    step: "0.5",
                    value: N.duration,
                    onChange: Ge => C(et => ({
                      ...et,
                      duration: Ge.target.value
                    }))
                  })]
                })]
              }), g.jsxs("div", {
                className: "ig-action-buttons",
                children: [k.inspection_id && r && g.jsxs("button", {
                  className: "ig-secondary-button",
                  onClick: () => {
                    r(k.inspection_id);
                  },
                  children: [g.jsx(yCe, {
                    size: 17
                  }), " Open inspectie"]
                }), g.jsxs("button", {
                  className: "ig-pipeline-primary",
                  disabled: d,
                  onClick: () => {
                    Me(k);
                  },
                  children: [d ? g.jsx(Ns, {
                    className: "animate-spin",
                    size: 17
                  }) : g.jsx(DM, {
                    size: 17
                  }), " ", k.status === "scheduled" ? "Planning opslaan" : "Plan opdracht"]
                })]
              }), g.jsx("p", {
                className: "ig-action-help",
                children: "Planning controleert automatisch op dubbele afspraken. Opdracht verschijnt direct in Agenda, Inspecties en Werkvoorraad."
              })]
            }), k.status === "completed" && g.jsxs("section", {
              className: "ig-case-success",
              children: [g.jsx(p1, {
                size: 20
              }), g.jsxs("div", {
                children: [g.jsx("strong", {
                  children: "Inspectie uitgevoerd"
                }), g.jsx("p", {
                  children: "Dossier is automatisch bijgewerkt vanuit inspectiestatus."
                })]
              })]
            }), k.status === "lost" && g.jsxs("section", {
              className: "ig-case-action",
              children: [g.jsx("h3", {
                children: "Niet doorgegaan"
              }), g.jsx("p", {
                children: k.lost_reason
              }), g.jsx("button", {
                className: "ig-secondary-button",
                disabled: d,
                onClick: () => {
                  ve(k, {
                    status: "request",
                    lost_reason: null
                  }, "commercial_case_reopened");
                },
                children: "Heropen als aanvraag"
              })]
            })]
          }), !["scheduled", "completed", "lost"].includes(k.status) && g.jsx("footer", {
            children: g.jsx("button", {
              className: "ig-danger-link",
              disabled: d,
              onClick: () => {
                Je(k);
              },
              children: "Markeer als niet doorgegaan"
            })
          })]
        })
      });
    })()]
  });
}
const up = 20,
  Du = r => {
    if (!r) return "";
    const e = r.toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
    const t = e.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (t) {
      const n = t[1].padStart(2, "0"),
        i = t[2].padStart(2, "0");
      return `${t[3]}-${i}-${n}`;
    }
    try {
      const n = new Date(e);
      if (!isNaN(n.getTime())) return n.toISOString().split("T")[0];
    } catch {}
    return e;
  },
  AU = r => {
    if (!r) return "-";
    const e = new Date(r instanceof Date ? r : String(r));
    return isNaN(e.getTime()) ? "-" : e.toLocaleString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  },
  zm = r => r instanceof Error ? r.message : String(r),
  P1 = r => typeof r == "object" && r !== null && !Array.isArray(r),
  vU = r => P1(r) && typeof r.id == "number" && P1(r.report_data),
  vje = r => P1(r) && typeof r.id == "string" && typeof r.shortName == "string",
  bje = r => P1(r) && typeof r.id == "number" && typeof r.label == "string",
  yje = r => P1(r) && typeof r.id == "string" && typeof r.email == "string" && typeof r.role == "string",
  qA = (r, e, t) => {
    if (!Array.isArray(r) || !r.every(e)) throw new Error(`Ongeldige ${t} in backup.`);
    return r;
  },
  w2 = {
    inspectorName: "",
    assignedInspectorId: "",
    sciosRegistrationNumber: "",
    inspectionCompany: "",
    inspectionCompanyAddress: "",
    inspectionCompanyPostalCode: "",
    inspectionCompanyCity: "",
    inspectionCompanyPhone: "",
    inspectionCompanyEmail: "",
    date: new Date().toISOString().split("T")[0],
    scheduledTimeStart: "",
    estimatedDurationHours: void 0,
    clientName: "",
    clientAddress: "",
    clientPostalCode: "",
    clientCity: "",
    clientContactPerson: "",
    clientPhone: "",
    clientEmail: "",
    projectLocation: "",
    projectAddress: "",
    projectPostalCode: "",
    projectCity: "",
    projectContactPerson: "",
    projectPhone: "",
    projectEmail: "",
    installationResponsible: ""
  };
function AdminDashboard() {
  const [r, e] = Ze.useState("pipeline"),
    [t, n] = Ze.useState([]),
    [i, a] = Ze.useState(!1),
    [s, o] = Ze.useState({
      app: "",
      user: "",
      action: ""
    }),
    [c, l] = Ze.useState([]),
    [u, d] = Ze.useState(!1),
    [f, h] = Ze.useState(null),
    [m, v] = Ze.useState({
      category: "",
      subcategory: "",
      shortName: "",
      description: "",
      classification: "Yellow"
    }),
    A = Ze.useRef(null),
    [y, b] = Ze.useState([]),
    [w, E] = Ze.useState(!0),
    [B, P] = Ze.useState(!1),
    [Q, M] = Ze.useState("basis"),
    [H, G] = Ze.useState(w2),
    [X, q] = Ze.useState(null),
    [D, $] = Ze.useState(null),
    [N, C] = Ze.useState([]),
    [S, k] = Ze.useState(null),
    [j, W] = Ze.useState(null),
    [V, K] = Ze.useState(!1),
    [oe, ue] = Ze.useState(1),
    [xe, re] = Ze.useState(0),
    [ve, Z] = Ze.useState(""),
    [Y, ce] = Ze.useState({
      key: "created_at",
      direction: "desc"
    }),
    [be, De] = Ze.useState([]),
    [Ne, ze] = Ze.useState(!1),
    [Je, Me] = Ze.useState(null),
    [_e, Ae] = Ze.useState(""),
    [Ue, tt] = Ze.useState([]),
    [Ge, et] = Ze.useState(null),
    [ct, ht] = Ze.useState(null),
    [Tt, Vt] = Ze.useState({}),
    [Ft, Ut] = Ze.useState(""),
    [mr, wr] = Ze.useState(null),
    [He, It] = Ze.useState(""),
    [Ct, mt] = Ze.useState([]),
    [Ye, bt] = Ze.useState([]),
    [ke, Qt] = Ze.useState({
      name: "",
      serial: "",
      calibration: ""
    }),
    [ir, ge] = Ze.useState({
      name: "",
      address: "",
      postalCode: "",
      city: "",
      phone: "",
      email: "",
      website: ""
    }),
    [xt, Nt] = Ze.useState(null),
    [Pe, dt] = Ze.useState(null),
    [_t, lr] = Ze.useState(!1),
    [dr, yr] = Ze.useState([]),
    [We, Wt] = Ze.useState({}),
    [Ot, St] = Ze.useState([]),
    [$e, at] = Ze.useState(null),
    [vt, _r] = Ze.useState(""),
    [Ur, pr] = Ze.useState("gegevens"),
    [Wr, Nr] = Ze.useState([]),
    [Yr, en] = Ze.useState(!1),
    [Zr, dn] = Ze.useState({}),
    [Ln, pn] = Ze.useState(!1),
    [Rn, Sn] = Ze.useState({
      name: "",
      contacts: []
    }),
    [kn, rt] = Ze.useState(""),
    [pt, Kt] = Ze.useState([]),
    [cr, nn] = Ze.useState(!1),
    [Lr, Or] = Ze.useState({}),
    [Tn, _n] = Ze.useState(new Set()),
    [gn, fn] = Ze.useState([]),
    [tn, Fe] = Ze.useState(1),
    [qe, ut] = Ze.useState(0),
    [yt, zt] = Ze.useState(""),
    [Bt, Ar] = Ze.useState({
      key: "next_inspection_date",
      direction: "asc"
    }),
    [Mt, Rr] = Ze.useState({
      email: "",
      password: "",
      role: "inspector",
      full_name: "",
      scios_nr: "",
      phone: "",
      contact_email: "",
      company_name: "",
      company_address: "",
      company_postal_code: "",
      company_city: "",
      company_phone: "",
      company_email: ""
    }),
    gr = Ze.useRef(null),
    jr = Ze.useRef(null),
    Dr = async () => {
      E(!0);
      const ie = (oe - 1) * up,
        Se = ie + up - 1;
      let Re = hr.from("inspections").select("*", {
        count: "exact"
      });
      if (Re = Re.or("report_data->meta->>isContributionMode.is.null,report_data->meta->>isContributionMode.eq.false"), ve) {
        const er = dr.filter(Sr => Sr.full_name?.toLowerCase().includes(ve.toLowerCase())).map(Sr => Sr.id);
        let xr = `client_name.ilike.%${ve}%,inspection_number.ilike.%${ve}%,report_data->meta->>projectCity.ilike.%${ve}%,report_data->meta->>projectLocation.ilike.%${ve}%,report_data->meta->>inspectorName.ilike.%${ve}%`;
        er.length > 0 && (xr += `,installer_id.in.(${er.join(",")})`), Re = Re.or(xr);
      }
      Y.key === "created_at" ? Re = Re.order("created_at", {
        ascending: Y.direction === "asc"
      }) : Y.key === "updated_at" ? Re = Re.order("updated_at", {
        ascending: Y.direction === "asc"
      }) : Y.key === "date_start" ? Re = Re.order("report_data->meta->>date", {
        ascending: Y.direction === "asc"
      }) : Y.key === "date_finalized" ? Re = Re.order("report_data->meta->>finalizedDate", {
        ascending: Y.direction === "asc"
      }) : Y.key === "client_name" || Y.key === "status" ? Re = Re.order(Y.key, {
        ascending: Y.direction === "asc"
      }) : Y.key === "project_location" ? Re = Re.order("report_data->meta->>projectLocation", {
        ascending: Y.direction === "asc"
      }) : Y.key === "project_city" ? Re = Re.order("report_data->meta->>projectCity", {
        ascending: Y.direction === "asc"
      }) : Y.key !== "inspection_number" && Y.key !== "inspector" && Y.key !== "installer_name" && (Re = Re.order("created_at", {
        ascending: !1
      })), Re = Re.range(ie, Se);
      const {
        data: lt,
        count: wt,
        error: rr
      } = await Re;
      if (rr) console.error(rr);else {
        const er = lt || [];
        Y.key === "inspector" && er.sort((un, Zn) => {
          const Xr = un.report_data?.meta?.inspectorName || "",
            Nn = Zn.report_data?.meta?.inspectorName || "";
          return Y.direction === "asc" ? Xr.localeCompare(Nn) : Nn.localeCompare(Xr);
        }), Y.key === "installer_name" && er.sort((un, Zn) => {
          const Xr = dr.find(gi => gi.id === un.installer_id)?.full_name || "",
            Nn = dr.find(gi => gi.id === Zn.installer_id)?.full_name || "";
          return Y.direction === "asc" ? Xr.localeCompare(Nn) : Nn.localeCompare(Xr);
        }), Y.key === "inspection_number" && er.sort((un, Zn) => {
          const Xr = un.inspection_number || "",
            Nn = Zn.inspection_number || "";
          return Y.direction === "asc" ? Xr.localeCompare(Nn, void 0, {
            numeric: !0,
            sensitivity: "base"
          }) : Nn.localeCompare(Xr, void 0, {
            numeric: !0,
            sensitivity: "base"
          });
        });
        const xr = er.map(un => un.id),
          Sr = er.map(un => un.inspection_number).filter(Boolean);
        let an = [...er];
        if (xr.length > 0) {
          const {
            data: un
          } = await hr.from("inspections").select("*").filter("report_data->meta->>isContributionMode", "eq", "true");
          if (un && un.length > 0) {
            const Zn = un.filter(Xr => {
              const Nn = Xr.report_data?.meta?.parentInspectionId,
                gi = Xr.report_data?.meta?.parentInspectionNumber;
              return xr.includes(Number(Nn)) || xr.includes(Nn) || gi && Sr.includes(gi);
            });
            an = [];
            for (const Xr of er) {
              an.push(Xr);
              const Nn = Zn.filter(gi => {
                const Un = gi.report_data?.meta?.parentInspectionId,
                  Ds = gi.report_data?.meta?.parentInspectionNumber;
                return Number(Un) === Xr.id || Un === Xr.id || Ds && Ds === Xr.inspection_number;
              });
              an.push(...Nn);
            }
          }
        }
        b(an), re(wt || 0);
      }
      E(!1);
    },
    En = ie => {
      ce(Se => ({
        key: ie,
        direction: Se.key === ie && Se.direction === "desc" ? "asc" : "desc"
      })), ue(1);
    },
    bn = async () => {
      if (be.length !== 0 && window.confirm(`Weet je zeker dat je ${be.length} inspecties wilt verwijderen?`)) {
        const {
          error: ie
        } = await hr.from("inspections").delete().in("id", be);
        ie ? alert("Fout bij bulkverwijdering: " + ie.message) : (alert(`${be.length} inspecties verwijderd.`), De([]), Dr());
      }
    },
    Mn = async () => {
      if (be.length === 0) return;
      const ie = y.filter(Se => be.includes(Se.id));
      for (const Se of ie) try {
        const {
            meta: Re,
            defects: lt,
            measurements: wt
          } = Se.report_data,
          rr = `${Re.date || "Datum"}_${Re.clientName || "Klant"}_${Re.projectLocation || "Project"}_${Re.projectCity || "Plaats"}.pdf`,
          xr = await h1(g.jsx(mv, {
            meta: Re,
            measurements: wt,
            defects: lt || []
          })).toBlob(),
          Sr = URL.createObjectURL(xr),
          an = document.createElement("a");
        an.href = Sr, an.download = rr, an.click(), URL.revokeObjectURL(Sr), await new Promise(un => setTimeout(un, 600));
      } catch (Re) {
        console.error(`Fout bij genereren PDF voor ID ${Se.id}:`, Re);
      }
    },
    Fn = () => {
      be.length === y.length ? De([]) : De(y.map(ie => ie.id));
    },
    zn = ie => {
      De(Se => Se.includes(ie) ? Se.filter(Re => Re !== ie) : [...Se, ie]);
    },
    ei = ({
      label: ie,
      sortKey: Se,
      width: Re
    }) => g.jsx("th", {
      className: `px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none ${Re}`,
      onClick: () => En(Se),
      children: g.jsxs("div", {
        className: "flex items-center gap-1",
        children: [ie, " ", Y.key === Se ? Y.direction === "asc" ? g.jsx(t1, {
          size: 14
        }) : g.jsx(e1, {
          size: 14
        }) : g.jsx(NM, {
          size: 14,
          className: "text-gray-300"
        })]
      })
    }),
    di = ({
      label: ie,
      sortKey: Se,
      width: Re
    }) => g.jsx("th", {
      className: `px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none ${Re}`,
      onClick: () => Ri(Se),
      children: g.jsxs("div", {
        className: "flex items-center gap-1",
        children: [ie, Bt.key === Se ? Bt.direction === "asc" ? g.jsx(t1, {
          size: 14
        }) : g.jsx(e1, {
          size: 14
        }) : g.jsx(NM, {
          size: 14,
          className: "text-gray-300"
        })]
      })
    }),
    Vi = async () => {
      const {
        data: ie
      } = await hr.from("profiles").select("id, email, full_name, scios_nr, phone, contact_email, role, linked_instruments, company_name, company_address, company_postal_code, company_city, company_phone, company_email, home_address, home_postal_code, home_city").order("email");
      tt(ie || []);
    },
    Ui = async (ie, Se, Re) => {
      const wt = Re.includes(Se) ? Re.filter(er => er !== Se) : [...Re, Se],
        {
          error: rr
        } = await hr.from("profiles").update({
          linked_instruments: wt
        }).eq("id", ie);
      if (rr) {
        alert("Fout bij opslaan: " + rr.message);
        return;
      }
      tt(er => er.map(xr => xr.id === ie ? {
        ...xr,
        linked_instruments: wt
      } : xr));
    },
    Ti = async () => {
      const {
        data: ie
      } = await hr.from("form_options").select("*").order("label");
      ie && (mt(ie.filter(Se => Se.category === "iv_company")), bt(ie.filter(Se => Se.category === "instrument")));
    },
    is = async () => {
      const {
        data: ie
      } = await hr.from("profiles").select("id, full_name").eq("role", "installer").order("full_name");
      yr(ie || []);
    },
    la = async ie => {
      window.confirm(`⚠️ WAARSCHUWING ⚠️

Gebruiker verwijderen?`) && (await hr.rpc("delete_user", {
        user_id: ie
      }), Vi());
    },
    Li = ie => {
      Me({
        id: ie.id,
        email: ie.email
      }), Ae(""), ze(!0);
    },
    za = async () => {
      if (!Je || !_e) return;
      const {
          data: ie
        } = await hr.auth.getSession(),
        {
          error: Se
        } = await hr.functions.invoke("admin-reset-password", {
          body: {
            userId: Je.id,
            newPassword: _e
          },
          headers: {
            Authorization: `Bearer ${ie.session?.access_token}`
          }
        });
      Se ? alert("Fout: " + Se.message) : (alert("✅ Gewijzigd!"), ze(!1));
    },
    vi = async () => {
      const {
        data: ie
      } = await hr.from("defect_library").select("*").order("category").order("subcategory");
      l(ie || []);
    },
    Yn = async () => {
      const {
        data: ie
      } = await hr.from("clients").select("*").order("name");
      St(ie || []);
    },
    Bn = async () => {
      const {
        data: ie
      } = await hr.from("inspections").select("client_name");
      if (ie) {
        const Se = {};
        ie.forEach(Re => {
          Re.client_name && (Se[Re.client_name] = (Se[Re.client_name] || 0) + 1);
        }), Or(Se);
      }
    },
    ki = async ie => {
      const {
        data: Se
      } = await hr.from("inspections").select("id, client_name, inspection_number, created_at, updated_at, status, scope_type, report_data").eq("client_name", ie).order("created_at", {
        ascending: !1
      });
      Nr(Se || []);
    },
    ii = ie => {
      at(ie), pr("gegevens"), en(!1), _n(new Set()), ki(ie.name);
    },
    Yi = async ie => {
      nn(!0), Kt(await Av(ie)), nn(!1);
    },
    ma = ie => {
      Vt(Se => ({
        ...Se,
        company_name: ie.name,
        company_address: ie.address,
        company_postal_code: ie.postalCode,
        company_city: ie.city,
        company_phone: ie.phone
      }));
    },
    ka = async ie => {
      const Se = Tt,
        {
          error: Re
        } = await hr.from("profiles").update(Se).eq("id", ie.id);
      if (Re) {
        alert("Fout bij opslaan: " + Re.message);
        return;
      }
      const lt = Se.company_name?.trim();
      if (lt) {
        const wt = {
            ...ie,
            ...Se
          },
          rr = wt.full_name?.trim() || "";
        if (ie.role === "installer") {
          const {
            data: er
          } = await hr.from("clients").select("id, contacts").ilike("name", lt);
          if (er && er.length > 0) {
            const xr = er[0],
              Sr = xr.contacts || [];
            rr && !Sr.find(an => an.name.toLowerCase() === rr.toLowerCase()) && Sr.push({
              id: crypto.randomUUID(),
              name: rr,
              role: "Medewerker",
              phone: "",
              email: wt.contact_email || ""
            }), await hr.from("clients").update({
              name: lt,
              address: Se.company_address || "",
              postal_code: Se.company_postal_code || "",
              city: Se.company_city || "",
              phone: Se.company_phone || "",
              email: Se.company_email || "",
              contacts: Sr
            }).eq("id", xr.id);
          } else {
            const xr = rr ? [{
              id: crypto.randomUUID(),
              name: rr,
              role: "Medewerker",
              phone: "",
              email: wt.contact_email || ""
            }] : [];
            await hr.from("clients").insert({
              name: lt,
              address: Se.company_address || "",
              postal_code: Se.company_postal_code || "",
              city: Se.company_city || "",
              phone: Se.company_phone || "",
              email: Se.company_email || "",
              contacts: xr
            });
          }
          Yn();
        } else {
          const er = {
              address: Se.company_address || "",
              postalCode: Se.company_postal_code || "",
              city: Se.company_city || "",
              phone: Se.company_phone || "",
              email: Se.company_email || ""
            },
            {
              data: xr
            } = await hr.from("form_options").select("id").eq("category", "iv_company").ilike("label", lt);
          xr && xr.length > 0 ? await hr.from("form_options").update({
            label: lt,
            data: er
          }).eq("id", xr[0].id) : await hr.from("form_options").insert({
            category: "iv_company",
            label: lt,
            data: er
          }), Ti();
        }
      }
      ac("admin", "user_company_updated", "profile", ie.id, ie.full_name || ie.email, {
        company_name: Se.company_name
      }), Vi(), ht(null), Vt({});
    },
    Ki = async () => {
      if (!Rn.name?.trim()) return alert("Naam is verplicht.");
      const {
        data: ie,
        error: Se
      } = await hr.from("clients").insert({
        ...Rn,
        contacts: []
      }).select().single();
      Se ? alert("Fout: " + Se.message) : (ac("admin", "client_created", "client", ie.id, Rn.name), pn(!1), Sn({
        name: "",
        contacts: []
      }), Yn(), ii(ie));
    },
    ra = async ie => {
      if (!$e) return;
      const {
        error: Se
      } = await hr.from("clients").update({
        ...ie,
        updated_at: new Date().toISOString()
      }).eq("id", $e.id);
      if (Se) alert("Fout: " + Se.message);else {
        ac("admin", "client_updated", "client", $e.id, $e.name, Object.keys(ie).length < 5 ? Object.fromEntries(Object.entries(ie)) : void 0);
        const Re = {
          ...$e,
          ...ie
        };
        at(Re), en(!1), Yn();
      }
    },
    _s = async () => {
      $e && window.confirm(`Klant "${$e.name}" verwijderen?`) && (await hr.from("clients").delete().eq("id", $e.id), at(null), Yn());
    },
    ci = async ie => {
      $e && (await hr.from("clients").update({
        contacts: ie,
        updated_at: new Date().toISOString()
      }).eq("id", $e.id), at({
        ...$e,
        contacts: ie
      }), Yn());
    },
    xi = async () => {
      const [{
          data: ie
        }, {
          data: Se
        }, {
          data: Re
        }] = await Promise.all([hr.from("inspections").select("client_name, report_data"), hr.from("profiles").select("full_name, contact_email, company_name, company_address, company_postal_code, company_city, company_phone, company_email").eq("role", "installer").not("company_name", "is", null).neq("company_name", ""), hr.from("clients").select("name")]),
        lt = new Set((Re || []).map(er => er.name.trim().toLowerCase())),
        wt = new Set(),
        rr = [];
      for (const er of ie || []) {
        const xr = er.client_name?.trim();
        if (!xr || wt.has(xr.toLowerCase()) || lt.has(xr.toLowerCase()) || er.report_data?.meta?.isContributionMode) continue;
        wt.add(xr.toLowerCase());
        const Sr = er.report_data?.meta || {},
          an = [];
        Sr.clientContactPerson?.trim() && an.push({
          id: crypto.randomUUID(),
          name: Sr.clientContactPerson.trim(),
          role: "Contactpersoon",
          phone: Sr.clientPhone || "",
          email: Sr.clientEmail || ""
        }), rr.push({
          name: xr,
          address: Sr.clientAddress || "",
          postal_code: Sr.clientPostalCode || "",
          city: Sr.clientCity || "",
          phone: Sr.clientPhone || "",
          email: Sr.clientEmail || "",
          contacts: an
        });
      }
      for (const er of Se || []) {
        const xr = er.company_name?.trim();
        if (!xr || wt.has(xr.toLowerCase()) || lt.has(xr.toLowerCase())) continue;
        wt.add(xr.toLowerCase());
        const Sr = er.full_name?.trim() ? [{
          id: crypto.randomUUID(),
          name: er.full_name.trim(),
          role: "Medewerker",
          phone: "",
          email: er.contact_email || ""
        }] : [];
        rr.push({
          name: xr,
          address: er.company_address || "",
          postal_code: er.company_postal_code || "",
          city: er.company_city || "",
          phone: er.company_phone || "",
          email: er.company_email || "",
          contacts: Sr
        });
      }
      rr.length > 0 && (await hr.from("clients").insert(rr), Yn());
    };
  Ze.useEffect(() => {
    xi();
  }, []);
  const hs = Ze.useMemo(() => {
    const ie = Object.entries(Lr).sort((wt, rr) => rr[1] - wt[1]),
      Se = new Set(ie.map(([wt]) => wt.toLowerCase())),
      Re = ie.map(([wt]) => ({
        name: wt
      })),
      lt = Ot.filter(wt => !Se.has(wt.name.toLowerCase())).map(wt => ({
        name: wt.name
      }));
    return [...Re, ...lt];
  }, [Lr, Ot]);
  Ze.useEffect(() => {
    r === "inspections" && (Dr(), is()), r === "users" && Vi(), (r === "settings" || B) && (Ti(), Vi()), B && (Yn(), Bn()), r === "library" && vi(), r === "clients" && Yn(), r === "log" && Qs();
  }, [oe, ve, r, B, Y]);
  const Qs = async () => {
      a(!0);
      let ie = hr.from("audit_log").select("*").order("created_at", {
        ascending: !1
      }).limit(200);
      s.app && (ie = ie.eq("app", s.app)), s.action && (ie = ie.eq("action", s.action)), s.user && (ie = ie.ilike("user_name", `%${s.user}%`));
      const {
        data: Se
      } = await ie;
      n(Se || []), a(!1);
    },
    Ri = ie => {
      Ar(Se => ({
        key: ie,
        direction: Se.key === ie && Se.direction === "asc" ? "desc" : "asc"
      })), Fe(1);
    },
    Cs = async () => {
      const ie = (tn - 1) * up,
        Se = ie + up - 1;
      let Re = hr.from("inspections").select("*", {
        count: "exact"
      });
      Re = Re.or("report_data->meta->>isContributionMode.is.null,report_data->meta->>isContributionMode.neq.true"), yt && (Re = Re.or(`client_name.ilike.%${yt}%,inspection_number.ilike.%${yt}%,report_data->meta->>projectLocation.ilike.%${yt}%,report_data->meta->>projectCity.ilike.%${yt}%,report_data->meta->>inspectorName.ilike.%${yt}%`)), Bt.key === "client_name" || Bt.key === "status" ? Re = Re.order(Bt.key, {
        ascending: Bt.direction === "asc"
      }) : Bt.key === "proj_location" ? Re = Re.order("report_data->meta->>projectLocation", {
        ascending: Bt.direction === "asc"
      }) : Bt.key === "proj_city" ? Re = Re.order("report_data->meta->>projectCity", {
        ascending: Bt.direction === "asc"
      }) : Bt.key === "proj_date_start" ? Re = Re.order("report_data->meta->>date", {
        ascending: Bt.direction === "asc"
      }) : Bt.key === "proj_date_finalized" ? Re = Re.order("report_data->meta->>finalizedDate", {
        ascending: Bt.direction === "asc"
      }) : Bt.key === "next_inspection_date" ? Re = Re.order("report_data->meta->>nextInspectionDate", {
        ascending: Bt.direction === "asc"
      }) : Re = Re.order("report_data->meta->>nextInspectionDate", {
        ascending: !0
      }), Re = Re.range(ie, Se);
      const {
        data: lt,
        count: wt,
        error: rr
      } = await Re;
      if (rr) {
        console.error(rr);
        return;
      }
      const er = lt || [];
      Bt.key === "proj_inspector" && er.sort((xr, Sr) => {
        const an = xr.report_data?.meta?.inspectorName || "",
          un = Sr.report_data?.meta?.inspectorName || "";
        return Bt.direction === "asc" ? an.localeCompare(un) : un.localeCompare(an);
      }), Bt.key === "proj_number" && er.sort((xr, Sr) => {
        const an = xr.inspection_number || "",
          un = Sr.inspection_number || "";
        return Bt.direction === "asc" ? an.localeCompare(un, void 0, {
          numeric: !0,
          sensitivity: "base"
        }) : un.localeCompare(an, void 0, {
          numeric: !0,
          sensitivity: "base"
        });
      }), fn(er), ut(wt || 0);
    };
  Ze.useEffect(() => {
    r === "projecten" && Cs();
  }, [tn, yt, Bt, r]);
  const _i = ie => {
      if (!ie) return "";
      const Re = (new Date(Du(ie)).getTime() - Date.now()) / 864e5;
      return Re < 0 ? "text-red-700 font-bold" : Re <= 60 ? "text-amber-700 font-bold" : "text-green-700";
    },
    Hi = ie => {
      h(ie.id), v({
        category: ie.category,
        subcategory: ie.subcategory,
        shortName: ie.shortName || ie.shortName,
        description: ie.description,
        classification: ie.classification
      }), d(!0);
    },
    as = async () => {
      if (!m.category || !m.shortName) return alert("Categorie en Korte Naam verplicht.");
      const ie = {
        category: m.category,
        subcategory: m.subcategory,
        shortName: m.shortName,
        description: m.description,
        classification: m.classification
      };
      f ? await hr.from("defect_library").update(ie).eq("id", f) : await hr.from("defect_library").insert(ie), d(!1), h(null), v({
        category: "",
        subcategory: "",
        shortName: "",
        description: "",
        classification: "Yellow"
      }), vi();
    },
    Aa = async ie => {
      window.confirm("Gebrek definitief verwijderen? Oude rapporten blijven intact.") && (await hr.from("defect_library").delete().eq("id", ie), vi());
    },
    xn = async ie => {
      const Se = ie.target.files?.[0];
      if (!Se || !window.confirm("Wil je deze CSV toevoegen aan de database? Bestaande items worden niet overschreven.")) return;
      E(!0);
      const Re = new FileReader();
      Re.onload = async lt => {
        try {
          const wt = lt.target?.result,
            rr = [];
          let er = [],
            xr = "",
            Sr = !1;
          for (let Xr = 0; Xr < wt.length; Xr++) {
            const Nn = wt[Xr],
              gi = wt[Xr + 1];
            Nn === '"' ? Sr && gi === '"' ? (xr += '"', Xr++) : Sr = !Sr : Nn === ";" && !Sr ? (er.push(xr.trim()), xr = "") : (Nn === `
` || Nn === "\r" && gi === `
`) && !Sr ? (er.push(xr.trim()), (er.length > 1 || er.length === 1 && er[0] !== "") && rr.push(er), er = [], xr = "", Nn === "\r" && Xr++) : Nn !== "\r" && (xr += Nn);
          }
          (xr || er.length > 0) && (er.push(xr.trim()), rr.push(er));
          const {
              data: an
            } = await hr.from("defect_library").select("shortName"),
            un = an?.map(Xr => Xr.shortName || Xr.shortName) || [],
            Zn = [];
          for (let Xr = 0; Xr < rr.length; Xr++) {
            const Nn = rr[Xr];
            if (Nn.length < 5 || Xr === 0 && Nn[0].toLowerCase().includes("categor")) continue;
            const gi = Nn[2] || "Naamloos";
            un.includes(gi) || Zn.push({
              category: Nn[0] || "Overig",
              subcategory: Nn[1] || "Algemeen",
              shortName: gi,
              description: Nn[3] || "",
              classification: Nn[4] || "Yellow"
            });
          }
          if (Zn.length > 0) {
            const {
              error: Xr
            } = await hr.from("defect_library").insert(Zn);
            if (Xr) throw Xr;
            alert(`${Zn.length} gebreken succesvol toegevoegd aan de cloud!`), vi();
          } else alert("Geen geldige data gevonden.");
        } catch (wt) {
          alert("Fout bij importeren: " + zm(wt));
        } finally {
          E(!1), A.current && (A.current.value = "");
        }
      }, Re.readAsText(Se);
    },
    fo = async () => {
      if (window.confirm("Wil je de standaard ingebouwde NTA8220 bibliotheek naar de cloud kopiëren?")) {
        E(!0);
        try {
          const {
              data: ie
            } = await hr.from("defect_library").select("shortName"),
            Se = ie?.map(rr => rr.shortName || rr.shortName) || [],
            Re = UI.filter(rr => !Se.includes(rr.shortName));
          if (Re.length === 0) {
            alert("Alle standaard gebreken staan al in je cloud-bibliotheek! Geen duplicaten toegevoegd."), E(!1);
            return;
          }
          const lt = Re.map(rr => ({
              category: rr.category,
              subcategory: rr.subcategory,
              shortName: rr.shortName,
              description: rr.description,
              classification: rr.classification
            })),
            {
              error: wt
            } = await hr.from("defect_library").insert(lt);
          if (wt) throw wt;
          alert(`Succes! ${lt.length} nieuwe standaard gebreken toegevoegd. (${UI.length - lt.length} overgeslagen i.v.m. duplicaten)`), vi();
        } catch (ie) {
          alert("Fout bij laden van standaard bibliotheek: " + zm(ie));
        } finally {
          E(!1);
        }
      }
    },
    Zi = ie => {
      Nt(ie.id), dt("iv_company"), ge({
        name: ie.label,
        address: ie.data?.address || "",
        postalCode: ie.data?.postalCode || "",
        city: ie.data?.city || "",
        phone: ie.data?.phone || "",
        email: ie.data?.email || "",
        website: ie.data?.website || ""
      });
    },
    Pi = async () => {
      if (!ir.name) return alert("Naam verplicht");
      const ie = {
        label: ir.name,
        data: {
          address: ir.address,
          postalCode: ir.postalCode,
          city: ir.city,
          phone: ir.phone,
          email: ir.email,
          website: ir.website
        }
      };
      if (xt) {
        const Re = Ct.find(lt => lt.id === xt)?.label;
        await hr.from("form_options").update(ie).eq("id", xt), Re && (await hr.from("profiles").update({
          company_name: ir.name,
          company_address: ir.address,
          company_postal_code: ir.postalCode,
          company_city: ir.city,
          company_phone: ir.phone,
          company_email: ir.email
        }).ilike("company_name", Re).in("role", ["inspector", "admin"])), Vi();
      } else await hr.from("form_options").insert({
        category: "iv_company",
        ...ie
      });
      Ha(), Ti();
    },
    Ci = ie => {
      Nt(ie.id), dt("instrument"), Qt({
        name: ie.label,
        serial: ie.data?.serialNumber || "",
        calibration: ie.data?.calibrationDate || ""
      });
    },
    ho = async () => {
      if (!ke.name) return alert("Naam verplicht");
      const ie = {
        label: ke.name,
        data: {
          serialNumber: ke.serial,
          calibrationDate: ke.calibration
        }
      };
      xt ? await hr.from("form_options").update(ie).eq("id", xt) : await hr.from("form_options").insert({
        category: "instrument",
        ...ie
      }), Ha(), Ti();
    },
    Ua = async ie => {
      window.confirm("Verwijderen?") && (await hr.from("form_options").delete().eq("id", ie), Ha(), Ti());
    },
    Ha = () => {
      Nt(null), dt(null), ge({
        name: "",
        address: "",
        postalCode: "",
        city: "",
        phone: "",
        email: "",
        website: ""
      }), Qt({
        name: "",
        serial: "",
        calibration: ""
      });
    },
    va = ie => {
      const Se = ie.report_data?.meta || {};
      G({
        inspectorName: Se.inspectorName || "",
        assignedInspectorId: Se.assignedInspectorId || "",
        sciosRegistrationNumber: Se.sciosRegistrationNumber || "",
        inspectionCompany: Se.inspectionCompany || "",
        inspectionCompanyAddress: Se.inspectionCompanyAddress || "",
        inspectionCompanyPostalCode: Se.inspectionCompanyPostalCode || "",
        inspectionCompanyCity: Se.inspectionCompanyCity || "",
        inspectionCompanyPhone: Se.inspectionCompanyPhone || "",
        inspectionCompanyEmail: Se.inspectionCompanyEmail || "",
        date: Du(Se.date) || new Date().toISOString().split("T")[0],
        scheduledTimeStart: Se.scheduledTimeStart || "",
        estimatedDurationHours: Se.estimatedDurationHours,
        clientName: Se.clientName || ie.client_name || "",
        clientAddress: Se.clientAddress || "",
        clientPostalCode: Se.clientPostalCode || "",
        clientCity: Se.clientCity || "",
        clientContactPerson: Se.clientContactPerson || "",
        clientPhone: Se.clientPhone || "",
        clientEmail: Se.clientEmail || "",
        projectLocation: Se.projectLocation || "",
        projectAddress: Se.projectAddress || "",
        projectPostalCode: Se.projectPostalCode || "",
        projectCity: Se.projectCity || "",
        projectContactPerson: Se.projectContactPerson || "",
        projectPhone: Se.projectPhone || "",
        projectEmail: Se.projectEmail || "",
        installationResponsible: Se.installationResponsible || ""
      }), q(ie.id), $(ie), C(ie.report_data?.defects || []), M("basis"), P(!0);
    },
    eo = async ie => {
      const {
        data: Se,
        error: Re
      } = await hr.from("inspections").select("*").eq("id", ie).single();
      if (Re || !Se) return alert("Inspectie openen mislukt: " + (Re?.message || "niet gevonden"));
      e("inspections"), va(Se);
    },
    pi = async () => {
      const ie = H.clientName.trim();
      if (!ie) return;
      const {
        data: Se
      } = await hr.from("clients").select("id, contacts").ilike("name", ie);
      if (Se && Se.length > 0) {
        const Re = Se[0],
          lt = Re.contacts || [],
          wt = H.clientContactPerson?.trim();
        wt && !lt.find(rr => rr.name.toLowerCase() === wt.toLowerCase()) && lt.push({
          id: crypto.randomUUID(),
          name: wt,
          role: "Contactpersoon",
          phone: H.clientPhone || "",
          email: H.clientEmail || ""
        }), await hr.from("clients").update({
          address: H.clientAddress || "",
          postal_code: H.clientPostalCode || "",
          city: H.clientCity || "",
          phone: H.clientPhone || "",
          email: H.clientEmail || "",
          contacts: lt
        }).eq("id", Re.id);
      } else {
        const Re = H.clientContactPerson?.trim() ? [{
          id: crypto.randomUUID(),
          name: H.clientContactPerson.trim(),
          role: "Contactpersoon",
          phone: H.clientPhone || "",
          email: H.clientEmail || ""
        }] : [];
        await hr.from("clients").insert({
          name: ie,
          address: H.clientAddress || "",
          postal_code: H.clientPostalCode || "",
          city: H.clientCity || "",
          phone: H.clientPhone || "",
          email: H.clientEmail || "",
          contacts: Re
        });
      }
    },
    qa = async () => {
      if (!H.clientName) return alert("Klantnaam verplicht.");
      const ie = await k1(H.projectAddress, H.projectPostalCode, H.projectCity),
        Se = {
          ...H,
          ...(ie ?? {}),
          totalComponents: 0,
          inspectionInterval: 5,
          usageFunctions: {
            kantoorfunctie: !1
          },
          inspectionBasis: {
            nta8220: !0,
            verzekering: !1
          }
        };
      if (X) {
        const Re = D || y.find(rr => rr.id === X);
        if (!Re) return;
        const lt = {
            ...Re.report_data,
            meta: {
              ...Re.report_data.meta,
              ...Se
            },
            defects: N
          },
          {
            error: wt
          } = await hr.from("inspections").update({
            client_name: H.clientName,
            report_data: lt
          }).eq("id", X);
        wt ? alert("Fout: " + wt.message) : (await pi(), ac("admin", "inspection_updated", "inspection", X, H.clientName, {
          projectLocation: H.projectLocation,
          date: H.date
        }), alert("Opgeslagen!"), na(), Dr());
      } else {
        const Re = Nk(Se),
          {
            data: lt,
            error: wt
          } = await hr.from("inspections").insert({
            client_name: H.clientName,
            status: "new",
            scope_type: "10",
            report_data: Re
          }).select("id").single();
        wt ? alert("Fout: " + wt.message) : (await pi(), ac("admin", "inspection_created", "inspection", lt?.id ?? null, H.clientName, {
          projectLocation: H.projectLocation,
          date: H.date
        }), alert("Aangemaakt!"), na(), Dr());
      }
    },
    na = () => {
      P(!1), G(w2), q(null), $(null), C([]), k(null), W(null);
    },
    Xi = async ie => {
      const Se = y.find(Re => Re.id === ie);
      window.confirm("Verwijderen?") && (await hr.from("inspections").delete().eq("id", ie), ac("admin", "inspection_deleted", "inspection", ie, Se?.client_name || String(ie)), Dr());
    },
    po = async ie => {
      if (!ie.report_data) return alert("Geen data");
      K(!0);
      try {
        const {
            meta: Se,
            defects: Re,
            measurements: lt
          } = ie.report_data,
          wt = await h1(g.jsx(mv, {
            meta: Se,
            defects: Re || [],
            measurements: lt
          })).toBlob(),
          rr = URL.createObjectURL(wt),
          er = document.createElement("a");
        er.href = rr, er.download = `${Se.date || "Datum"}_${Se.clientName || "Klant"}_${Se.projectLocation || "Project"}_${Se.projectCity || "Plaats"}.pdf`, document.body.appendChild(er), er.click(), document.body.removeChild(er), URL.revokeObjectURL(rr);
      } catch (Se) {
        console.error(Se), alert("Fout bij genereren");
      } finally {
        K(!1);
      }
    },
    zl = ie => {
      const Se = JSON.stringify(ie.report_data, null, 2),
        Re = new Blob([Se], {
          type: "application/json"
        }),
        lt = URL.createObjectURL(Re),
        wt = document.createElement("a");
      wt.href = lt, wt.download = `Backup_${ie.client_name}.json`, document.body.appendChild(wt), wt.click(), document.body.removeChild(wt);
    },
    Fs = async (ie, Se) => {
      if (!Se || !window.confirm('Inspectie toewijzen aan installateur en status wijzigen naar "Wacht op Herstel"?')) return;
      const {
        error: Re
      } = await hr.from("inspections").update({
        installer_id: Se,
        status: "herstel_wacht"
      }).eq("id", ie);
      if (Re) alert("Fout: " + Re.message);else {
        const lt = y.find(wt => wt.id === ie);
        ac("admin", "installer_assigned", "inspection", ie, lt?.client_name || String(ie), {
          installerId: Se
        }), Wt(wt => {
          const rr = {
            ...wt
          };
          return delete rr[ie], rr;
        }), Dr();
      }
    },
    Al = async ie => {
      if (!window.confirm('Herstel goedkeuren? Status wordt "Herstel Afgerond".')) return;
      const {
        error: Se
      } = await hr.from("inspections").update({
        status: "herstel_afgerond"
      }).eq("id", ie);
      if (Se) alert("Fout: " + Se.message);else {
        const Re = y.find(lt => lt.id === ie);
        ac("admin", "repair_approved", "inspection", ie, Re?.client_name || String(ie)), Dr();
      }
    },
    Zo = async ie => {
      if (!window.confirm("Herstel afkeuren? Installateur moet opnieuw indienen.")) return;
      const {
        error: Se
      } = await hr.from("inspections").update({
        status: "herstel_wacht"
      }).eq("id", ie);
      if (Se) alert("Fout: " + Se.message);else {
        const Re = y.find(lt => lt.id === ie);
        ac("admin", "repair_rejected", "inspection", ie, Re?.client_name || String(ie)), Dr();
      }
    },
    vl = async ie => {
      if (!window.confirm('Herstel opnieuw openzetten? Status wordt teruggezet naar "Klaar" zodat wijzigingen mogelijk zijn.')) return;
      const {
        error: Se
      } = await hr.from("inspections").update({
        status: "completed"
      }).eq("id", ie);
      Se ? alert("Fout: " + Se.message) : Dr();
    },
    go = async ie => {
      if (!ie.report_data) return alert("Geen data");
      K(!0);
      try {
        const {
            meta: Se,
            defects: Re,
            measurements: lt
          } = ie.report_data,
          wt = await h1(g.jsx(mv, {
            meta: Se,
            defects: Re || [],
            measurements: lt,
            reportType: "herstel"
          })).toBlob(),
          rr = URL.createObjectURL(wt),
          er = document.createElement("a");
        er.href = rr, er.download = `HERSTEL_${Se.repairDate || Se.date || "Datum"}_${Se.clientName || "Klant"}.pdf`, document.body.appendChild(er), er.click(), document.body.removeChild(er), URL.revokeObjectURL(rr);
      } catch (Se) {
        console.error(Se), alert("Fout bij genereren");
      } finally {
        K(!1);
      }
    },
    ps = async ie => {
      let Se = "";
      if (ie.status === "completed" ? Se = "in_progress" : (ie.status, Se = "completed"), !window.confirm("Status wijzigen?")) return;
      const Re = {
        ...ie.report_data?.meta
      };
      Se === "completed" ? Re.finalizedDate = new Date().toISOString().split("T")[0] : Se === "in_progress" && (Re.finalizedDate = null);
      const {
        error: lt
      } = await hr.from("inspections").update({
        status: Se,
        report_data: {
          ...ie.report_data,
          meta: Re
        }
      }).eq("id", ie.id);
      lt ? alert("Fout: " + lt.message) : Dr();
    },
    zo = async () => {
      if (window.confirm("Volledige backup maken van het HELE systeem (Inspecties, Bibliotheek, Instellingen, Gebruikers)?")) {
        E(!0);
        try {
          const [{
              data: ie
            }, {
              data: Se
            }, {
              data: Re
            }, {
              data: lt
            }] = await Promise.all([hr.from("inspections").select("*"), hr.from("defect_library").select("*"), hr.from("form_options").select("*"), hr.from("profiles").select("*")]),
            wt = {
              version: 1,
              timestamp: new Date().toISOString(),
              inspections: ie || [],
              library: Se || [],
              settings: Re || [],
              users: lt || []
            },
            rr = new Blob([JSON.stringify(wt, null, 2)], {
              type: "application/json"
            }),
            er = URL.createObjectURL(rr),
            xr = document.createElement("a");
          xr.href = er, xr.download = `Systeem_Backup_${new Date().toISOString().split("T")[0]}.json`, document.body.appendChild(xr), xr.click(), document.body.removeChild(xr);
        } catch (ie) {
          alert("Fout bij maken backup: " + zm(ie));
        } finally {
          E(!1);
        }
      }
    },
    iu = async ie => {
      const Se = ie.target.files?.[0];
      if (!Se) return;
      if (!window.confirm(`⚠️ WAARSCHUWING: SYSTEEM HERSTEL ⚠️

Je staat op het punt een systeem-backup terug te zetten.
- Bestaande data met hetzelfde ID wordt overschreven.
- Ontbrekende data wordt veilig toegevoegd.

Weet je zeker dat je wilt doorgaan?`)) {
        jr.current && (jr.current.value = "");
        return;
      }
      E(!0);
      const Re = new FileReader();
      Re.onload = async lt => {
        try {
          const wt = JSON.parse(lt.target?.result);
          let rr = [],
            er = [],
            xr = [],
            Sr = [];
          if (Array.isArray(wt)) rr = qA(wt, vU, "inspecties");else if (P1(wt) && wt.inspections) rr = qA(wt.inspections, vU, "inspecties"), er = qA(wt.library ?? [], vje, "bibliotheek"), xr = qA(wt.settings ?? [], bje, "instellingen"), Sr = qA(wt.users ?? [], yje, "gebruikers");else throw new Error("Ongeldig backup bestand. Kan de data niet lezen.");
          const an = {
            insp: 0,
            lib: 0,
            set: 0,
            usr: 0
          };
          let un = 0;
          if (er.length > 0) {
            const {
                data: Zn
              } = await hr.from("defect_library").select("id, shortName"),
              Xr = Zn?.map(Un => Un.shortName || Un.shortName) || [],
              Nn = Zn?.map(Un => Un.id) || [],
              gi = er.filter(Un => Nn.includes(Un.id) ? !0 : !Xr.includes(Un.shortName || Un.shortName));
            if (gi.length > 0) {
              const {
                error: Un
              } = await hr.from("defect_library").upsert(gi);
              Un ? (console.error("Fout library", Un), un++) : an.lib = gi.length;
            }
          }
          if (xr.length > 0) {
            const {
              error: Zn
            } = await hr.from("form_options").upsert(xr);
            Zn ? (console.error("Fout instellingen", Zn), un++) : an.set = xr.length;
          }
          if (rr.length > 0) {
            const Zn = rr.sort((Xr, Nn) => (Xr.id || 0) - (Nn.id || 0));
            for (const Xr of Zn) {
              const {
                error: Nn
              } = await hr.from("inspections").upsert(Xr);
              Nn ? (console.error("Fout inspectie " + Xr.id, Nn), un++) : an.insp++;
            }
          }
          if (Sr.length > 0) for (const Zn of Sr) {
            const {
              error: Xr
            } = await hr.from("profiles").update({
              role: Zn.role
            }).eq("id", Zn.id);
            Xr ? (console.error("Fout profiel " + Zn.id, Xr), un++) : an.usr++;
          }
          alert(`✅ Herstel voltooid!

Verwerkt:
- ${an.insp} Inspecties
- ${an.lib} Gebreken (Bibliotheek)
- ${an.set} Instellingen
- ${an.usr} Gebruikersrollen

❌ ${un} fouten (zie log).`), Dr(), typeof vi == "function" && vi(), Ti(), Vi();
        } catch (wt) {
          console.error(wt), alert("Fout bij lezen bestand: " + zm(wt));
        } finally {
          E(!1), jr.current && (jr.current.value = "");
        }
      }, Re.readAsText(Se);
    },
    Tc = async () => {
      const {
        data: ie,
        error: Se
      } = await hr.from("inspections").select("*");
      if (Se || !ie) return alert("Fout bij ophalen data.");
      const Re = new qM.Workbook(),
        lt = Re.addWorksheet("Werkvoorraad");
      lt.columns = [{
        header: "Inspectie ID",
        key: "id",
        width: 20
      }, {
        header: "Status",
        key: "status",
        width: 15
      }, {
        header: "Aangemaakt op",
        key: "createdAt",
        width: 15
      }, {
        header: "Geupdate op",
        key: "updatedAt",
        width: 20
      }, {
        header: "Datum Uitvoering",
        key: "date",
        width: 15
      }, {
        header: "Datum Afgerond",
        key: "finalizedDate",
        width: 15
      }, {
        header: "Inspecteur",
        key: "inspectorName",
        width: 20
      }, {
        header: "SCIOS Nr",
        key: "sciosNr",
        width: 15
      }, {
        header: "Inspectiebedrijf",
        key: "inspectionCompany",
        width: 25
      }, {
        header: "Klant Naam",
        key: "clientName",
        width: 30
      }, {
        header: "Klant Adres",
        key: "clientAddress",
        width: 25
      }, {
        header: "Klant Postcode",
        key: "clientPostalCode",
        width: 15
      }, {
        header: "Klant Plaats",
        key: "clientCity",
        width: 20
      }, {
        header: "Klant Contact",
        key: "clientContact",
        width: 20
      }, {
        header: "Klant Tel",
        key: "clientPhone",
        width: 15
      }, {
        header: "Klant Email",
        key: "clientEmail",
        width: 25
      }, {
        header: "Project Locatie",
        key: "projectLocation",
        width: 25
      }, {
        header: "Project Adres",
        key: "projectAddress",
        width: 25
      }, {
        header: "Project Postcode",
        key: "projectPostalCode",
        width: 15
      }, {
        header: "Project Plaats",
        key: "projectCity",
        width: 20
      }, {
        header: "Project Contact",
        key: "projectContact",
        width: 20
      }, {
        header: "Project Tel",
        key: "projectPhone",
        width: 15
      }, {
        header: "Project Email",
        key: "projectEmail",
        width: 25
      }, {
        header: "IV Verantwoordelijke",
        key: "iv",
        width: 20
      }], ie.forEach(Sr => {
        const an = Sr.report_data?.meta || {};
        lt.addRow({
          id: Sr.inspection_number || "CONCEPT",
          status: Sr.status,
          createdAt: Du(Sr.created_at),
          updatedAt: AU(Sr.updated_at),
          date: Du(an.date),
          finalizedDate: Du(an.finalizedDate) || "",
          inspectorName: an.inspectorName,
          sciosNr: an.sciosRegistrationNumber,
          inspectionCompany: an.inspectionCompany,
          clientName: an.clientName || Sr.client_name,
          clientAddress: an.clientAddress,
          clientPostalCode: an.clientPostalCode,
          clientCity: an.clientCity,
          clientContact: an.clientContactPerson,
          clientPhone: an.clientPhone,
          clientEmail: an.clientEmail,
          projectLocation: an.projectLocation,
          projectAddress: an.projectAddress,
          projectPostalCode: an.projectPostalCode,
          projectCity: an.projectCity,
          projectContact: an.projectContactPerson,
          projectPhone: an.projectPhone,
          projectEmail: an.projectEmail,
          iv: an.installationResponsible
        });
      });
      const wt = await Re.xlsx.writeBuffer(),
        rr = new Blob([wt], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }),
        er = URL.createObjectURL(rr),
        xr = document.createElement("a");
      xr.href = er, xr.download = `Werkvoorraad_Compleet_${new Date().toISOString().split("T")[0]}.xlsx`, document.body.appendChild(xr), xr.click(), document.body.removeChild(xr);
    },
    Xo = async ie => {
      const Se = ie.target.files?.[0];
      if (Se) {
        E(!0);
        try {
          const Re = await Se.arrayBuffer(),
            lt = new qM.Workbook();
          await lt.xlsx.load(Re);
          const wt = lt.getWorksheet(1);
          if (!wt) throw new Error("Excel bestand is leeg.");
          const rr = {};
          wt.getRow(1).eachCell((un, Zn) => {
            rr[Zn] = un.value?.toString().toLowerCase() || "";
          });
          const er = (un, ...Zn) => {
              const Xr = Object.keys(rr).find(gi => Zn.some(Un => rr[parseInt(gi)].includes(Un.toLowerCase())));
              if (!Xr) return "";
              const Nn = un.getCell(parseInt(Xr));
              return Nn.value ? Nn.value instanceof Date ? Nn.value.toISOString().split("T")[0] : typeof Nn.value == "object" && Nn.value !== null && "text" in Nn.value ? String(Nn.value.text) : Nn.value.toString() : "";
            },
            xr = [];
          let Sr = 0,
            an = 0;
          wt.eachRow((un, Zn) => {
            if (Zn === 1) return;
            const Xr = er(un, "id", "inspectie id"),
              Nn = Xr === "CONCEPT" || !Xr ? null : Xr,
              gi = er(un, "klant naam", "client name");
            if (!gi) return;
            const Un = {
              clientName: gi,
              status: er(un, "status") || "new",
              date: Du(er(un, "datum uitvoering", "datum start", "date")),
              finalizedDate: Du(er(un, "datum afgerond", "finalized")),
              inspectorName: er(un, "inspecteur", "inspector"),
              sciosRegistrationNumber: er(un, "scios"),
              inspectionCompany: er(un, "inspectiebedrijf", "company"),
              clientAddress: er(un, "klant adres"),
              clientPostalCode: er(un, "klant postcode"),
              clientCity: er(un, "klant plaats", "klant stad"),
              clientContactPerson: er(un, "klant contact"),
              clientPhone: er(un, "klant tel"),
              clientEmail: er(un, "klant email"),
              projectLocation: er(un, "project locatie", "locatie naam"),
              projectAddress: er(un, "project adres"),
              projectPostalCode: er(un, "project postcode"),
              projectCity: er(un, "project plaats", "project stad"),
              projectContactPerson: er(un, "project contact"),
              projectPhone: er(un, "project tel"),
              projectEmail: er(un, "project email"),
              installationResponsible: er(un, "iv verantwoordelijke", "iv")
            };
            if (Nn) {
              const Ds = async () => {
                const {
                  data: Ga
                } = await hr.from("inspections").select("report_data").eq("inspection_number", Nn).maybeSingle();
                if (Ga) {
                  const Es = Object.fromEntries(Object.entries(Un).filter(([, _a]) => _a !== "" && _a != null)),
                    So = {
                      ...Ga.report_data,
                      meta: {
                        ...Ga.report_data.meta,
                        ...Es
                      }
                    };
                  await hr.from("inspections").update({
                    client_name: gi,
                    status: Un.status === "new" ? void 0 : Un.status,
                    report_data: So
                  }).eq("inspection_number", Nn), an++;
                }
              };
              xr.push(Ds());
            } else {
              const Ds = {
                  meta: {
                    ...w2,
                    ...Un,
                    inspectionInterval: 5,
                    usageFunctions: {
                      kantoorfunctie: !1
                    },
                    inspectionBasis: {
                      nta8220: !0,
                      verzekering: !1
                    }
                  },
                  measurements: {
                    installationType: "TN-S",
                    mainFuse: "3x63A",
                    mainsVoltage: "400 V",
                    selectedInstruments: []
                  },
                  defects: []
                },
                Ga = async () => {
                  await hr.from("inspections").insert({
                    client_name: gi,
                    status: "new",
                    scope_type: "10",
                    report_data: Ds
                  }), Sr++;
                };
              xr.push(Ga());
            }
          }), await Promise.all(xr), alert(`Import voltooid!
${Sr} Nieuwe projecten
${an} Projecten bijgewerkt`), Dr();
        } catch (Re) {
          console.error(Re), alert("Fout bij importeren: " + zm(Re));
        } finally {
          E(!1), gr.current && (gr.current.value = "");
        }
      }
    },
    bl = async (ie, Se) => {
      if (!window.confirm("Rol wijzigen?")) return;
      const {
        error: Re
      } = await hr.from("profiles").update({
        role: Se
      }).eq("id", ie);
      Re ? alert("Fout: " + Re.message) : (alert("Aangepast!"), Vi());
    },
    Jo = async (ie, Se, Re) => {
      const {
        error: lt
      } = await hr.from("profiles").update({
        [Se]: Re
      }).eq("id", ie);
      lt ? alert("Fout bij opslaan: " + lt.message) : Vi();
    },
    Io = async () => {
      if (!Mt.email || !Mt.password) return alert("Vul email en wachtwoord in.");
      try {
        const {
            data: ie
          } = await hr.auth.getSession(),
          {
            data: Se,
            error: Re
          } = await hr.functions.invoke("create-user", {
            body: {
              email: Mt.email.trim(),
              password: Mt.password,
              role: Mt.role
            },
            headers: {
              Authorization: `Bearer ${ie.session?.access_token}`
            }
          });
        if (Re || Se?.error) throw new Error(Re?.message || Se?.error);
        const lt = Se?.userId || Se?.user?.id || Se?.id,
          wt = {
            full_name: Mt.full_name,
            scios_nr: Mt.scios_nr,
            phone: Mt.phone,
            contact_email: Mt.contact_email,
            role: Mt.role,
            company_name: Mt.company_name,
            company_address: Mt.company_address,
            company_postal_code: Mt.company_postal_code,
            company_city: Mt.company_city,
            company_phone: Mt.company_phone,
            company_email: Mt.company_email
          };
        if (lt) await hr.from("profiles").update(wt).eq("id", lt);else {
          const {
            data: rr
          } = await hr.from("profiles").select("id").eq("email", Mt.email.trim()).single();
          rr && (await hr.from("profiles").update(wt).eq("id", rr.id));
        }
        if (Mt.company_name?.trim()) {
          const rr = Mt.company_name.trim();
          if (Mt.role === "installer") {
            const {
              data: er
            } = await hr.from("clients").select("id, contacts").ilike("name", rr);
            if (er && er.length > 0) {
              const xr = er[0],
                Sr = xr.contacts || [];
              Mt.full_name?.trim() && !Sr.find(an => an.name.toLowerCase() === Mt.full_name.trim().toLowerCase()) && (Sr.push({
                id: crypto.randomUUID(),
                name: Mt.full_name.trim(),
                role: "Medewerker",
                phone: "",
                email: Mt.contact_email || ""
              }), await hr.from("clients").update({
                contacts: Sr
              }).eq("id", xr.id));
            } else {
              const xr = Mt.full_name?.trim() ? [{
                id: crypto.randomUUID(),
                name: Mt.full_name.trim(),
                role: "Medewerker",
                phone: "",
                email: Mt.contact_email || ""
              }] : [];
              await hr.from("clients").insert({
                name: rr,
                address: Mt.company_address || "",
                postal_code: Mt.company_postal_code || "",
                city: Mt.company_city || "",
                phone: Mt.company_phone || "",
                email: Mt.company_email || "",
                contacts: xr
              });
            }
          } else {
            const {
              data: er
            } = await hr.from("form_options").select("id").eq("category", "iv_company").ilike("label", rr);
            (!er || er.length === 0) && (await hr.from("form_options").insert({
              category: "iv_company",
              label: rr,
              data: {
                address: Mt.company_address || "",
                postalCode: Mt.company_postal_code || "",
                city: Mt.company_city || "",
                phone: Mt.company_phone || "",
                email: Mt.company_email || ""
              }
            }));
          }
        }
        alert(`✅ ${Mt.email} aangemaakt!`), lr(!1), Rr({
          email: "",
          password: "",
          role: "inspector",
          full_name: "",
          scios_nr: "",
          phone: "",
          contact_email: "",
          company_name: "",
          company_address: "",
          company_postal_code: "",
          company_city: "",
          company_phone: "",
          company_email: ""
        }), Vi();
      } catch (ie) {
        alert("Fout: " + zm(ie));
      }
    },
    Oi = Math.ceil(xe / up),
    gs = {
      pipeline: {
        title: "Commerciële pipeline",
        subtitle: "Van aanvraag en offerte naar opdracht en planning"
      },
      inspections: {
        title: "Inspecties",
        subtitle: `${xe} inspecties in beheer`
      },
      agenda: {
        title: "Planning",
        subtitle: "Plan inspecteurs, tijden en routes"
      },
      projecten: {
        title: "Werkvoorraad",
        subtitle: "Inspecties per projectlocatie"
      },
      clients: {
        title: "Klanten",
        subtitle: "Relaties, locaties en contactpersonen"
      },
      users: {
        title: "Gebruikers",
        subtitle: "Accounts, rollen en bevoegdheden"
      },
      library: {
        title: "Gebrekenbibliotheek",
        subtitle: "Centrale SCIOS-bevindingen"
      },
      log: {
        title: "Activiteiten",
        subtitle: "Recente wijzigingen en handelingen"
      },
      settings: {
        title: "Instellingen",
        subtitle: "Stamgegevens en systeemkeuzes"
      }
    }[r];
  return g.jsx("div", {
    "data-ui": "admin",
    className: "ig-admin-shell px-3 pb-24 pt-4 sm:px-5 lg:p-6 xl:p-8",
    children: g.jsxs("div", {
      className: "ig-admin-workspace",
      children: [g.jsxs("header", {
        className: "ig-admin-header",
        children: [g.jsxs("div", {
          children: [g.jsx("p", {
            className: "ig-eyebrow",
            children: "Kantooromgeving"
          }), g.jsx("h1", {
            className: "mt-1 text-2xl md:text-3xl font-headline font-extrabold tracking-tight text-primary",
            children: gs.title
          }), g.jsx("p", {
            className: "text-slate-500 text-sm",
            children: gs.subtitle
          })]
        }), g.jsx("div", {
          className: "ig-admin-actions grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap md:w-auto",
          children: r === "inspections" && g.jsxs(g.Fragment, {
            children: [g.jsxs("button", {
              onClick: () => {
                G(w2), P(!0);
              },
              className: "flex items-center gap-2 bg-emerald-600 px-4 py-2.5 rounded-lg shadow text-white hover:bg-emerald-700 font-bold text-sm",
              children: [g.jsx(mh, {
                size: 16
              }), " Nieuw"]
            }), g.jsxs("button", {
              onClick: () => gr.current?.click(),
              className: "flex items-center gap-2 bg-green-600 px-3 py-2.5 rounded-lg shadow text-white hover:bg-green-700 font-bold text-sm border border-green-700",
              children: [g.jsx(dEe, {
                size: 16
              }), " ", g.jsx("span", {
                className: "hidden sm:inline",
                children: "Import"
              }), " Excel"]
            }), g.jsx("input", {
              type: "file",
              ref: gr,
              onChange: Xo,
              accept: ".xlsx, .xls",
              className: "hidden"
            }), g.jsxs("button", {
              onClick: Tc,
              className: "flex items-center gap-2 bg-white px-3 py-2.5 rounded-lg shadow text-green-700 hover:bg-green-50 font-bold text-sm border border-green-200",
              children: [g.jsx(Ng, {
                size: 16
              }), " ", g.jsx("span", {
                className: "hidden sm:inline",
                children: "Export"
              }), " Excel"]
            }), g.jsxs("button", {
              onClick: zo,
              className: "flex items-center gap-2 bg-gray-700 px-3 py-2.5 rounded-lg shadow text-white hover:bg-gray-800 font-bold text-sm border border-gray-600",
              children: [g.jsx(MM, {
                size: 16
              }), " Backup"]
            }), g.jsxs("button", {
              onClick: () => jr.current?.click(),
              className: "flex items-center gap-2 bg-orange-600 px-3 py-2.5 rounded-lg shadow text-white hover:bg-orange-700 font-bold text-sm border border-orange-700",
              title: "Zet een FULL_BACKUP.json terug",
              children: [g.jsx(Ns, {
                size: 16
              }), " Herstel"]
            }), g.jsx("input", {
              type: "file",
              ref: jr,
              onChange: iu,
              accept: ".json,application/json",
              className: "hidden"
            }), be.length > 0 && g.jsxs(g.Fragment, {
              children: [g.jsxs("button", {
                onClick: Mn,
                className: "flex items-center gap-2 bg-blue-600 px-3 py-2.5 rounded-lg shadow text-white hover:bg-blue-700 font-bold text-sm border border-blue-700",
                children: [g.jsx(Mu, {
                  size: 16
                }), " PDF (", be.length, ")"]
              }), g.jsxs("button", {
                onClick: bn,
                className: "flex items-center gap-2 bg-red-600 px-3 py-2.5 rounded-lg shadow text-white hover:bg-red-700 font-bold text-sm animate-pulse border border-red-700",
                children: [g.jsx(mf, {
                  size: 16
                }), " Verwijder (", be.length, ")"]
              })]
            })]
          })
        })]
      }), g.jsxs("nav", {
        className: "ig-admin-nav",
        "aria-label": "Kantooronderdelen",
        children: [g.jsxs("button", {
          onClick: () => e("pipeline"),
          "aria-current": r === "pipeline" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "pipeline" ? "is-active" : ""}`,
          children: [g.jsx(QM, {
            size: 17
          }), " Pipeline"]
        }), g.jsxs("button", {
          onClick: () => e("inspections"),
          "aria-current": r === "inspections" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "inspections" ? "is-active" : ""}`,
          children: [g.jsx(Mu, {
            size: 17
          }), " Inspecties"]
        }), g.jsxs("button", {
          onClick: () => e("agenda"),
          "aria-current": r === "agenda" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "agenda" ? "is-active" : ""}`,
          children: [g.jsx(Eg, {
            size: 17
          }), " Agenda"]
        }), g.jsxs("button", {
          onClick: () => e("projecten"),
          "aria-current": r === "projecten" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "projecten" ? "is-active" : ""}`,
          children: [g.jsx(LM, {
            size: 17
          }), " Werkvoorraad"]
        }), g.jsxs("button", {
          onClick: () => e("clients"),
          "aria-current": r === "clients" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "clients" ? "is-active" : ""}`,
          children: [g.jsx(ip, {
            size: 17
          }), " Klanten"]
        }), g.jsxs("button", {
          onClick: () => e("users"),
          "aria-current": r === "users" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "users" ? "is-active" : ""}`,
          children: [g.jsx(NS, {
            size: 17
          }), " Gebruikers"]
        }), g.jsxs("button", {
          onClick: () => e("library"),
          "aria-current": r === "library" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "library" ? "is-active" : ""}`,
          children: [g.jsx(jM, {
            size: 17
          }), " Bibliotheek"]
        }), g.jsxs("button", {
          onClick: () => e("log"),
          "aria-current": r === "log" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "log" ? "is-active" : ""}`,
          children: [g.jsx(fC, {
            size: 17
          }), " Activiteiten"]
        }), g.jsxs("button", {
          onClick: () => e("settings"),
          "aria-current": r === "settings" ? "page" : void 0,
          className: `ig-admin-nav-item ${r === "settings" ? "is-active" : ""}`,
          children: [g.jsx(BS, {
            size: 17
          }), " Instellingen"]
        })]
      }), r === "pipeline" && g.jsx(CommercialPipeline, {
        onOpenInspection: eo
      }), r === "inspections" && g.jsxs(g.Fragment, {
        children: [g.jsxs("div", {
          className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4",
          children: [g.jsxs("div", {
            className: "relative w-full md:w-1/2",
            children: [g.jsx($c, {
              className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
              size: 20
            }), g.jsx("input", {
              type: "text",
              placeholder: "Zoek op klant, stad, id of inspecteur...",
              className: "w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500",
              value: ve,
              onChange: ie => {
                Z(ie.target.value), ue(1);
              }
            })]
          }), g.jsxs("div", {
            className: "flex items-center gap-4 text-sm text-gray-500",
            children: [g.jsxs("span", {
              children: ["Pagina ", oe, " van ", Oi || 1]
            }), g.jsxs("div", {
              className: "flex gap-1",
              children: [g.jsx("button", {
                onClick: () => ue(ie => Math.max(1, ie - 1)),
                disabled: oe === 1,
                className: "p-2 border rounded hover:bg-gray-100 disabled:opacity-50",
                children: g.jsx(b5, {
                  size: 20
                })
              }), g.jsx("button", {
                onClick: () => ue(ie => Math.min(Oi, ie + 1)),
                disabled: oe >= Oi,
                className: "p-2 border rounded hover:bg-gray-100 disabled:opacity-50",
                children: g.jsx(y5, {
                  size: 20
                })
              })]
            })]
          })]
        }), w ? g.jsxs("div", {
          className: "text-center py-20 text-gray-500",
          children: [g.jsx(Ns, {
            className: "animate-spin inline mr-2"
          }), "Laden..."]
        }) : g.jsx("div", {
          className: "ig-table-card bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto",
          children: g.jsxs("table", {
            className: "ig-inspections-table min-w-[1180px] w-full",
            children: [g.jsx("thead", {
              className: "bg-gray-50 border-b",
              children: g.jsxs("tr", {
                children: [g.jsx("th", {
                  className: "px-4 py-3 text-left w-10",
                  children: g.jsx("input", {
                    type: "checkbox",
                    className: "h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer",
                    checked: y.length > 0 && be.length === y.length,
                    onChange: Fn
                  })
                }), g.jsx(ei, {
                  label: "Aangemaakt",
                  sortKey: "created_at",
                  width: "w-28"
                }), g.jsx(ei, {
                  label: "Geüpdatet",
                  sortKey: "updated_at",
                  width: "w-40"
                }), g.jsx(ei, {
                  label: "Start",
                  sortKey: "date_start",
                  width: "w-28"
                }), g.jsx(ei, {
                  label: "Afgerond",
                  sortKey: "date_finalized",
                  width: "w-28"
                }), g.jsx(ei, {
                  label: "Inspectie ID",
                  sortKey: "inspection_number",
                  width: "min-w-[140px]"
                }), g.jsx(ei, {
                  label: "Klant",
                  sortKey: "client_name"
                }), g.jsx(ei, {
                  label: "Project",
                  sortKey: "project_location"
                }), g.jsx(ei, {
                  label: "Plaats",
                  sortKey: "project_city"
                }), g.jsx(ei, {
                  label: "Status",
                  sortKey: "status"
                }), g.jsx(ei, {
                  label: "Inspecteur",
                  sortKey: "inspector"
                }), g.jsx(ei, {
                  label: "Installateur",
                  sortKey: "installer_name"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase",
                  children: "Acties"
                })]
              })
            }), g.jsx("tbody", {
              className: "divide-y divide-gray-200",
              children: y.map(ie => {
                const Se = !!ie.report_data?.meta?.isContributionMode;
                return g.jsxs("tr", {
                  className: `hover:bg-gray-50 ${be.includes(ie.id) ? "bg-emerald-50/50" : Se ? "bg-violet-50/60" : ""}`,
                  children: [g.jsx("td", {
                    className: `py-3 ${Se ? "pl-8 pr-4" : "px-4"}`,
                    children: g.jsx("input", {
                      type: "checkbox",
                      className: "h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer",
                      checked: be.includes(ie.id),
                      onChange: () => zn(ie.id)
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-xs text-gray-500",
                    children: g.jsxs("div", {
                      className: "flex items-center gap-1",
                      children: [g.jsx(fC, {
                        size: 14,
                        className: "text-gray-400"
                      }), " ", Du(ie.created_at)]
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-xs text-blue-600 font-medium whitespace-nowrap",
                    children: AU(ie.updated_at)
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm font-bold text-gray-700",
                    children: g.jsxs("div", {
                      className: "flex items-center gap-1",
                      children: [g.jsx(Eg, {
                        size: 14,
                        className: "text-emerald-600"
                      }), Du(ie.report_data?.meta?.date) || "-"]
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm text-gray-600",
                    children: ie.report_data?.meta?.finalizedDate ? g.jsxs("div", {
                      className: "flex items-center gap-1 text-green-700 font-bold",
                      children: [g.jsx(RM, {
                        size: 14
                      }), Du(ie.report_data.meta.finalizedDate)]
                    }) : g.jsx("span", {
                      className: "text-gray-300 italic",
                      children: "-"
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3 whitespace-nowrap",
                    children: g.jsxs("div", {
                      className: "flex items-center gap-1.5",
                      children: [Se && g.jsx("span", {
                        className: "text-violet-400 text-lg leading-none select-none",
                        children: "↳"
                      }), g.jsxs("span", {
                        className: `font-mono text-xs font-bold px-2 py-1 rounded border flex items-center gap-1 w-fit ${Se ? "bg-violet-100 text-violet-700 border-violet-300" : "bg-gray-100 text-gray-700 border-gray-300"}`,
                        children: [g.jsx(PM, {
                          size: 12,
                          className: Se ? "text-violet-400" : "text-gray-400"
                        }), ie.inspection_number || "CONCEPT"]
                      }), Se && g.jsx("span", {
                        className: "text-xs bg-violet-600 text-white px-1.5 py-0.5 rounded font-bold",
                        children: "Bijdrage"
                      })]
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3",
                    children: g.jsx("div", {
                      className: "text-sm font-bold text-gray-900",
                      children: ie.client_name
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3",
                    children: g.jsx("div", {
                      className: "text-sm text-gray-700",
                      children: ie.report_data?.meta?.projectLocation || "-"
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3",
                    children: g.jsxs("div", {
                      className: "text-xs text-gray-500 flex items-center gap-1",
                      children: [g.jsx(u0, {
                        size: 12
                      }), " ", ie.report_data?.meta?.projectCity || ie.report_data?.meta?.clientCity || "-"]
                    })
                  }), g.jsxs("td", {
                    className: "px-4 py-3 cursor-pointer select-none",
                    onClick: () => ["herstel_wacht", "ter_controle", "herstel_afgerond"].includes(ie.status) ? void 0 : ps(ie),
                    children: [(!ie.status || ie.status === "new") && g.jsx("span", {
                      className: "ig-semantic-status bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold border border-blue-200",
                      children: "Nieuw"
                    }), ie.status === "in_progress" && g.jsxs("span", {
                      className: "ig-semantic-status bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold border border-orange-200 flex items-center gap-1 w-fit",
                      children: [g.jsx(Ns, {
                        size: 12,
                        className: "animate-spin"
                      }), " Bezig"]
                    }), ie.status === "review_ready" && g.jsxs("span", {
                      className: "ig-semantic-status bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold border border-purple-200 shadow-sm flex items-center gap-1 w-fit",
                      children: [g.jsx(Mu, {
                        size: 12
                      }), " Review"]
                    }), ie.status === "completed" && g.jsxs("span", {
                      className: "ig-semantic-status bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold border border-green-200 flex items-center gap-1 w-fit",
                      children: [g.jsx(CEe, {
                        size: 12
                      }), " Klaar"]
                    }), ie.status === "herstel_wacht" && g.jsxs("span", {
                      className: "ig-semantic-status bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold border border-amber-200 flex items-center gap-1 w-fit",
                      children: [g.jsx(Ns, {
                        size: 12
                      }), " Wacht op Herstel"]
                    }), ie.status === "ter_controle" && g.jsxs("span", {
                      className: "ig-semantic-status bg-violet-100 text-violet-800 text-xs px-2 py-1 rounded font-bold border border-violet-200 flex items-center gap-1 w-fit",
                      children: [g.jsx(Mu, {
                        size: 12
                      }), " Ter Controle"]
                    }), ie.status === "herstel_afgerond" && g.jsxs("span", {
                      className: "ig-semantic-status bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded font-bold border border-teal-200 flex items-center gap-1 w-fit",
                      children: [g.jsx(RM, {
                        size: 12
                      }), " Herstel Afgerond"]
                    })]
                  }), g.jsxs("td", {
                    className: "px-4 py-3 text-sm text-gray-500",
                    children: [g.jsx(Vm, {
                      size: 16,
                      className: "inline mr-1"
                    }), " ", ie.report_data?.meta?.inspectorName || "-"]
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm text-gray-500",
                    children: ie.installer_id ? dr.find(Re => Re.id === ie.installer_id)?.full_name || g.jsx("span", {
                      className: "text-gray-300 italic text-xs",
                      children: "Onbekend"
                    }) : g.jsx("span", {
                      className: "text-gray-300",
                      children: "—"
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-right text-sm font-medium",
                    children: g.jsxs("div", {
                      className: "flex justify-end gap-2 flex-wrap items-center",
                      children: [ie.status === "completed" && !ie.report_data?.meta?.isContributionMode && g.jsxs("div", {
                        className: "flex items-center gap-1",
                        children: [g.jsxs("select", {
                          value: We[ie.id] || "",
                          onChange: Re => Wt(lt => ({
                            ...lt,
                            [ie.id]: Re.target.value
                          })),
                          className: "text-xs border border-gray-300 rounded px-1 py-0.5",
                          title: "Wijs installateur toe",
                          children: [g.jsx("option", {
                            value: "",
                            children: "Installateur..."
                          }), dr.map(Re => g.jsx("option", {
                            value: Re.id,
                            children: Re.full_name
                          }, Re.id))]
                        }), g.jsx("button", {
                          onClick: () => Fs(ie.id, We[ie.id] || ""),
                          disabled: !We[ie.id],
                          className: "text-xs bg-amber-500 text-white px-2 py-0.5 rounded disabled:opacity-40",
                          title: "Stuur naar installateur",
                          children: "Sturen"
                        })]
                      }), ie.status === "ter_controle" && g.jsxs(g.Fragment, {
                        children: [g.jsx("button", {
                          onClick: () => Al(ie.id),
                          className: "text-xs bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700",
                          title: "Herstel goedkeuren",
                          children: "✓ Akkoord"
                        }), g.jsx("button", {
                          onClick: () => Zo(ie.id),
                          className: "text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600",
                          title: "Herstel afkeuren",
                          children: "✗ Afkeuren"
                        })]
                      }), g.jsx("button", {
                        onClick: () => va(ie),
                        className: "text-blue-500 hover:text-blue-700",
                        title: "Bewerken",
                        children: g.jsx(gf, {
                          size: 16
                        })
                      }), g.jsx("button", {
                        onClick: () => po(ie),
                        disabled: V,
                        className: "text-red-600 font-bold",
                        title: "PDF Origineel",
                        children: g.jsx(Mu, {
                          size: 16
                        })
                      }), ie.status === "herstel_afgerond" && g.jsx("button", {
                        onClick: () => vl(ie.id),
                        className: "text-xs bg-gray-500 text-white px-2 py-0.5 rounded hover:bg-gray-600",
                        title: "Herstel opnieuw openzetten",
                        children: "↩ Heropenen"
                      }), (ie.status === "ter_controle" || ie.status === "herstel_afgerond") && g.jsx("button", {
                        onClick: () => go(ie),
                        disabled: V,
                        className: "text-violet-600 font-bold",
                        title: "PDF Herstelrapport",
                        children: g.jsx(Mu, {
                          size: 16
                        })
                      }), g.jsx("button", {
                        onClick: () => zl(ie),
                        className: "text-indigo-600",
                        title: "JSON",
                        children: g.jsx(Ng, {
                          size: 16
                        })
                      }), g.jsx("button", {
                        onClick: () => Xi(ie.id),
                        className: "text-red-400 hover:text-red-600",
                        title: "Verwijderen",
                        children: g.jsx(mf, {
                          size: 16
                        })
                      })]
                    })
                  })]
                }, ie.id);
              })
            })]
          })
        })]
      }), r === "users" && g.jsxs("div", {
        className: "bg-white rounded-lg shadow overflow-hidden",
        children: [g.jsxs("div", {
          className: "p-4 bg-blue-50 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3",
          children: [g.jsxs("div", {
            className: "flex items-center gap-2 text-sm text-blue-800",
            children: [g.jsx(WEe, {
              size: 18
            }), g.jsx("span", {
              className: "hidden sm:inline",
              children: "Beheer accounts en profielgegevens."
            }), g.jsx("span", {
              className: "sm:hidden font-bold",
              children: "Gebruikersbeheer"
            })]
          }), g.jsxs("button", {
            onClick: () => lr(!0),
            className: "flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow text-sm font-bold hover:bg-blue-700 shrink-0",
            children: [g.jsx(r3e, {
              size: 16
            }), " Nieuwe Gebruiker"]
          })]
        }), g.jsx("div", {
          className: "overflow-x-auto",
          children: g.jsxs("table", {
            className: "ig-users-table min-w-[900px] w-full",
            children: [g.jsx("thead", {
              className: "bg-gray-50 border-b",
              children: g.jsxs("tr", {
                children: [g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Login Email"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Volledige Naam"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Telefoon"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Contact Email"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "SCIOS Nr"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Rol"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase",
                  children: "Acties"
                })]
              })
            }), g.jsx("tbody", {
              className: "divide-y divide-gray-200",
              children: Ue.map(ie => {
                const Se = Ge === ie.id,
                  Re = ie.linked_instruments ?? [];
                return g.jsxs(Gt.Fragment, {
                  children: [g.jsxs("tr", {
                    className: "hover:bg-gray-50",
                    children: [g.jsx("td", {
                      className: "px-4 py-3 text-sm font-bold text-gray-700",
                      children: ie.email
                    }), g.jsx("td", {
                      className: "px-4 py-3 text-sm",
                      children: g.jsx("input", {
                        className: "border rounded p-1 w-full text-sm bg-transparent hover:bg-white focus:bg-white transition-colors",
                        defaultValue: ie.full_name || "",
                        onBlur: lt => {
                          lt.target.value !== (ie.full_name || "") && Jo(ie.id, "full_name", lt.target.value);
                        },
                        placeholder: "Naam..."
                      })
                    }), g.jsx("td", {
                      className: "px-4 py-3 text-sm",
                      children: g.jsx("input", {
                        className: "border rounded p-1 w-28 text-sm bg-transparent hover:bg-white focus:bg-white transition-colors",
                        defaultValue: ie.phone || "",
                        onBlur: lt => {
                          lt.target.value !== (ie.phone || "") && Jo(ie.id, "phone", lt.target.value);
                        },
                        placeholder: "06-..."
                      })
                    }), g.jsx("td", {
                      className: "px-4 py-3 text-sm",
                      children: g.jsx("input", {
                        className: "border rounded p-1 w-full text-sm bg-transparent hover:bg-white focus:bg-white transition-colors",
                        defaultValue: ie.contact_email || "",
                        onBlur: lt => {
                          lt.target.value !== (ie.contact_email || "") && Jo(ie.id, "contact_email", lt.target.value);
                        },
                        placeholder: ie.email
                      })
                    }), g.jsx("td", {
                      className: "px-4 py-3 text-sm",
                      children: g.jsx("input", {
                        className: "border rounded p-1 w-24 text-sm bg-transparent hover:bg-white focus:bg-white transition-colors",
                        defaultValue: ie.scios_nr || "",
                        onBlur: lt => {
                          lt.target.value !== (ie.scios_nr || "") && Jo(ie.id, "scios_nr", lt.target.value);
                        },
                        placeholder: "Optioneel"
                      })
                    }), g.jsx("td", {
                      className: "px-4 py-3 text-sm",
                      children: g.jsxs("select", {
                        className: "border rounded p-1 text-sm bg-white cursor-pointer",
                        value: ie.role,
                        onChange: lt => bl(ie.id, lt.target.value),
                        children: [g.jsx("option", {
                          value: "inspector",
                          children: "Inspector"
                        }), g.jsx("option", {
                          value: "admin",
                          children: "Admin"
                        }), g.jsx("option", {
                          value: "installer",
                          children: "Installateur"
                        })]
                      })
                    }), g.jsx("td", {
                      className: "px-4 py-3 text-right text-sm",
                      children: g.jsxs("div", {
                        className: "flex justify-end gap-2",
                        children: [g.jsx("button", {
                          onClick: () => {
                            ct === ie.id ? (ht(null), Vt({})) : (ht(ie.id), Kt([]), rt(""), Vt({
                              company_name: ie.company_name || "",
                              company_address: ie.company_address || "",
                              company_postal_code: ie.company_postal_code || "",
                              company_city: ie.company_city || "",
                              company_phone: ie.company_phone || "",
                              company_email: ie.company_email || ""
                            }));
                          },
                          className: `p-2 rounded transition-colors ${ct === ie.id ? "text-blue-700 bg-blue-100" : "text-blue-400 hover:text-blue-700 bg-blue-50 hover:bg-blue-100"}`,
                          title: "Bedrijfsgegevens",
                          children: g.jsx(ip, {
                            size: 18
                          })
                        }), ie.role !== "installer" && g.jsx("button", {
                          onClick: () => {
                            et(Se ? null : ie.id), Ut("");
                          },
                          className: `p-2 rounded transition-colors ${Se ? "text-emerald-700 bg-emerald-100" : "text-emerald-400 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100"}`,
                          title: "Koffer beheren",
                          children: g.jsx(AC, {
                            size: 18
                          })
                        }), g.jsx("button", {
                          onClick: () => Li(ie),
                          className: "text-orange-400 hover:text-orange-600 bg-orange-50 p-2 rounded hover:bg-orange-100 transition-colors",
                          title: "Wachtwoord Resetten",
                          children: g.jsx(bEe, {
                            size: 18
                          })
                        }), g.jsx("button", {
                          onClick: () => la(ie.id),
                          className: "text-red-400 hover:text-red-600 bg-red-50 p-2 rounded hover:bg-red-100 transition-colors",
                          title: "Verwijder",
                          children: g.jsx(mf, {
                            size: 18
                          })
                        })]
                      })
                    })]
                  }), Se && g.jsx("tr", {
                    className: "bg-emerald-50",
                    children: g.jsx("td", {
                      colSpan: 7,
                      className: "px-4 py-4 border-b border-emerald-200",
                      children: g.jsxs("div", {
                        className: "max-w-2xl",
                        children: [g.jsxs("h3", {
                          className: "font-bold text-sm text-emerald-800 mb-3 flex items-center gap-2",
                          children: [g.jsx(AC, {
                            size: 16
                          }), " Koffer: ", ie.full_name || ie.email, " (", Re.length, " gekoppeld)"]
                        }), g.jsx("input", {
                          type: "text",
                          placeholder: "Zoek instrument...",
                          className: "w-full border rounded p-2 text-sm mb-3",
                          value: Ft,
                          onChange: lt => Ut(lt.target.value)
                        }), g.jsxs("div", {
                          className: "max-h-64 overflow-y-auto space-y-1",
                          children: [Ye.filter(lt => Ft === "" || lt.label.toLowerCase().includes(Ft.toLowerCase()) || (lt.data?.serialNumber || "").toLowerCase().includes(Ft.toLowerCase())).map(lt => {
                            const wt = Re.includes(lt.id);
                            return g.jsxs("label", {
                              className: `flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${wt ? "bg-emerald-100" : "hover:bg-gray-100 bg-white"}`,
                              children: [g.jsx("input", {
                                type: "checkbox",
                                checked: wt,
                                onChange: () => Ui(ie.id, lt.id, Re),
                                className: "h-4 w-4 text-emerald-600 rounded"
                              }), g.jsxs("div", {
                                children: [g.jsx("span", {
                                  className: "text-sm font-medium",
                                  children: lt.label
                                }), g.jsxs("span", {
                                  className: "text-xs text-gray-500 ml-2",
                                  children: ["SN: ", lt.data?.serialNumber || "Onbekend"]
                                })]
                              })]
                            }, lt.id);
                          }), Ye.length === 0 && g.jsx("p", {
                            className: "text-sm text-gray-400 italic p-2",
                            children: "Geen instrumenten in de database."
                          })]
                        })]
                      })
                    })
                  }), ct === ie.id && g.jsx("tr", {
                    className: ie.role === "installer" ? "bg-emerald-50" : "bg-blue-50",
                    children: g.jsxs("td", {
                      colSpan: 7,
                      className: `px-4 py-4 border-b ${ie.role === "installer" ? "border-emerald-200" : "border-blue-200"}`,
                      children: [g.jsxs("div", {
                        className: "relative mb-3",
                        children: [g.jsxs("div", {
                          className: "flex gap-1.5",
                          children: [g.jsx("input", {
                            type: "text",
                            placeholder: "Zoek bedrijf om velden in te vullen...",
                            className: "flex-1 border rounded p-1.5 text-xs bg-white",
                            value: ct === ie.id ? kn : "",
                            onChange: lt => rt(lt.target.value),
                            onKeyDown: lt => lt.key === "Enter" && Yi(kn)
                          }), g.jsx("button", {
                            onClick: () => Yi(kn),
                            disabled: cr,
                            className: "px-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 shrink-0",
                            children: cr ? g.jsx(Ns, {
                              size: 11,
                              className: "animate-spin"
                            }) : g.jsx($c, {
                              size: 11
                            })
                          })]
                        }), pt.length > 0 && ct === ie.id && g.jsxs("div", {
                          className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto",
                          children: [pt.map((lt, wt) => {
                            const rr = Fd(lt);
                            return g.jsxs("button", {
                              className: "w-full text-left px-2 py-1.5 hover:bg-blue-50 text-xs border-b last:border-0",
                              onClick: () => {
                                ma(rr), Kt([]), rt("");
                              },
                              children: [g.jsx("div", {
                                className: "font-bold text-gray-800",
                                children: rr.name
                              }), g.jsx("div", {
                                className: "text-gray-500",
                                children: lt.formattedAddress
                              })]
                            }, wt);
                          }), g.jsx("button", {
                            className: "w-full text-center text-xs text-gray-400 py-1 hover:bg-gray-50",
                            onClick: () => Kt([]),
                            children: "Sluiten"
                          })]
                        })]
                      }), g.jsxs("h3", {
                        className: `font-bold text-sm flex items-center gap-2 mb-3 ${ie.role === "installer" ? "text-emerald-800" : "text-blue-800"}`,
                        children: [g.jsx(ip, {
                          size: 16
                        }), ie.role === "installer" ? "Klantbedrijf" : "Inspectiebedrijf", ": ", ie.full_name || ie.email]
                      }), g.jsx("div", {
                        className: "grid grid-cols-2 md:grid-cols-3 gap-3",
                        children: [["company_name", "Bedrijfsnaam", "text"], ["company_address", "Adres", "text"], ["company_postal_code", "Postcode", "text"], ["company_city", "Plaats", "text"], ["company_phone", "Telefoon", "tel"], ["company_email", "E-mail", "email"]].map(([lt, wt, rr]) => g.jsxs("div", {
                          children: [g.jsx("label", {
                            className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                            children: wt
                          }), g.jsx("input", {
                            type: rr,
                            className: "w-full border rounded p-1.5 text-sm bg-white",
                            value: Tt[lt] ?? "",
                            onChange: er => Vt(xr => ({
                              ...xr,
                              [lt]: er.target.value
                            })),
                            placeholder: "—"
                          })]
                        }, lt))
                      }), g.jsx("div", {
                        className: "flex justify-end mt-3",
                        children: g.jsx("button", {
                          onClick: () => ka(ie),
                          className: `px-4 py-1.5 rounded-lg text-xs font-bold text-white ${ie.role === "installer" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`,
                          children: "Opslaan"
                        })
                      })]
                    })
                  })]
                }, ie.id);
              })
            })]
          })
        })]
      }), r === "agenda" && g.jsx(PlanningWorkspace, {
        embedded: !0,
        onEdit: va
      }), r === "log" && g.jsxs("div", {
        className: "bg-white rounded-lg shadow p-4",
        children: [g.jsxs("div", {
          className: "flex flex-wrap gap-3 mb-4 items-end",
          children: [g.jsxs("h2", {
            className: "text-lg font-bold text-gray-800 flex items-center gap-2 mr-4",
            children: [g.jsx(fC, {
              size: 18
            }), " Activiteitenlog"]
          }), g.jsxs("div", {
            children: [g.jsx("label", {
              className: "block text-xs font-bold text-gray-500 uppercase mb-1",
              children: "App"
            }), g.jsxs("select", {
              className: "border rounded p-1.5 text-sm",
              value: s.app,
              onChange: ie => o(Se => ({
                ...Se,
                app: ie.target.value
              })),
              children: [g.jsx("option", {
                value: "",
                children: "Alle"
              }), g.jsx("option", {
                value: "admin",
                children: "Beheer"
              }), g.jsx("option", {
                value: "inspector",
                children: "Inspecteur"
              }), g.jsx("option", {
                value: "installer",
                children: "Installateur"
              })]
            })]
          }), g.jsxs("div", {
            children: [g.jsx("label", {
              className: "block text-xs font-bold text-gray-500 uppercase mb-1",
              children: "Actie"
            }), g.jsxs("select", {
              className: "border rounded p-1.5 text-sm",
              value: s.action,
              onChange: ie => o(Se => ({
                ...Se,
                action: ie.target.value
              })),
              children: [g.jsx("option", {
                value: "",
                children: "Alle"
              }), g.jsx("option", {
                value: "inspection_created",
                children: "Aangemaakt"
              }), g.jsx("option", {
                value: "inspection_updated",
                children: "Bijgewerkt"
              }), g.jsx("option", {
                value: "inspection_deleted",
                children: "Verwijderd"
              }), g.jsx("option", {
                value: "inspection_rescheduled",
                children: "Verplaatst"
              }), g.jsx("option", {
                value: "repair_submitted",
                children: "Herstel ingediend"
              }), g.jsx("option", {
                value: "repair_approved",
                children: "Herstel goedgekeurd"
              }), g.jsx("option", {
                value: "repair_rejected",
                children: "Herstel afgekeurd"
              }), g.jsx("option", {
                value: "client_created",
                children: "Klant aangemaakt"
              }), g.jsx("option", {
                value: "client_updated",
                children: "Klant bijgewerkt"
              }), g.jsx("option", {
                value: "profile_updated",
                children: "Profiel bijgewerkt"
              }), g.jsx("option", {
                value: "user_company_updated",
                children: "Bedrijf bijgewerkt"
              })]
            })]
          }), g.jsxs("div", {
            children: [g.jsx("label", {
              className: "block text-xs font-bold text-gray-500 uppercase mb-1",
              children: "Gebruiker"
            }), g.jsx("input", {
              className: "border rounded p-1.5 text-sm",
              placeholder: "Filter op naam...",
              value: s.user,
              onChange: ie => o(Se => ({
                ...Se,
                user: ie.target.value
              }))
            })]
          }), g.jsxs("button", {
            onClick: Qs,
            className: "flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-emerald-700",
            children: [g.jsx(Ns, {
              size: 14
            }), " Toepassen"]
          })]
        }), i ? g.jsx("div", {
          className: "text-center py-12 text-gray-400",
          children: g.jsx(Ns, {
            size: 24,
            className: "animate-spin mx-auto mb-2"
          })
        }) : t.length === 0 ? g.jsx("p", {
          className: "text-center text-gray-400 py-12 text-sm",
          children: "Geen activiteiten gevonden."
        }) : g.jsx("div", {
          className: "overflow-x-auto",
          children: g.jsxs("table", {
            className: "ig-audit-table min-w-[760px] w-full text-sm border-collapse",
            children: [g.jsx("thead", {
              children: g.jsxs("tr", {
                className: "bg-gray-50 text-xs font-bold text-gray-500 uppercase",
                children: [g.jsx("th", {
                  className: "text-left p-2 border-b",
                  children: "Tijdstip"
                }), g.jsx("th", {
                  className: "text-left p-2 border-b",
                  children: "App"
                }), g.jsx("th", {
                  className: "text-left p-2 border-b",
                  children: "Gebruiker"
                }), g.jsx("th", {
                  className: "text-left p-2 border-b",
                  children: "Actie"
                }), g.jsx("th", {
                  className: "text-left p-2 border-b",
                  children: "Object"
                }), g.jsx("th", {
                  className: "text-left p-2 border-b",
                  children: "Details"
                })]
              })
            }), g.jsx("tbody", {
              children: t.map(ie => {
                const Se = {
                    admin: {
                      label: "Beheer",
                      color: "bg-blue-100 text-blue-800"
                    },
                    inspector: {
                      label: "Inspecteur",
                      color: "bg-emerald-100 text-emerald-800"
                    },
                    installer: {
                      label: "Installateur",
                      color: "bg-amber-100 text-amber-800"
                    }
                  },
                  Re = {
                    inspection_created: "Inspectie aangemaakt",
                    inspection_updated: "Inspectie bijgewerkt",
                    inspection_deleted: "Inspectie verwijderd",
                    inspection_finalized: "Inspectie afgerond",
                    inspection_rescheduled: "Inspectie verplaatst",
                    repair_submitted: "Herstel ingediend",
                    repair_approved: "Herstel goedgekeurd",
                    repair_rejected: "Herstel afgekeurd",
                    installer_assigned: "Installateur toegewezen",
                    client_created: "Klant aangemaakt",
                    client_updated: "Klant bijgewerkt",
                    client_deleted: "Klant verwijderd",
                    user_company_updated: "Bedrijf bijgewerkt",
                    profile_updated: "Profiel bijgewerkt",
                    settings_company_updated: "Inspectiebedrijf bijgewerkt"
                  },
                  lt = Se[ie.app] || {
                    label: ie.app,
                    color: "bg-gray-100 text-gray-700"
                  },
                  wt = new Date(ie.created_at),
                  rr = wt.toLocaleDateString("nl-NL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  }),
                  er = wt.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                return g.jsxs("tr", {
                  className: "border-b hover:bg-gray-50",
                  children: [g.jsxs("td", {
                    className: "p-2 whitespace-nowrap text-gray-500 text-xs",
                    children: [rr, g.jsx("br", {}), g.jsx("span", {
                      className: "text-gray-400",
                      children: er
                    })]
                  }), g.jsx("td", {
                    className: "p-2",
                    children: g.jsx("span", {
                      className: `px-2 py-0.5 rounded-full text-xs font-bold ${lt.color}`,
                      children: lt.label
                    })
                  }), g.jsx("td", {
                    className: "p-2 font-medium text-gray-800",
                    children: ie.user_name || "—"
                  }), g.jsx("td", {
                    className: "p-2 text-gray-700",
                    children: Re[ie.action] || ie.action
                  }), g.jsx("td", {
                    className: "p-2 text-gray-600 max-w-[200px] truncate",
                    title: ie.entity_label,
                    children: ie.entity_label || "—"
                  }), g.jsx("td", {
                    className: "p-2 text-gray-400 text-xs max-w-[180px] truncate",
                    title: ie.details ? JSON.stringify(ie.details) : "",
                    children: ie.details ? Object.entries(ie.details).map(([xr, Sr]) => `${xr}: ${Sr}`).join(", ") : "—"
                  })]
                }, ie.id);
              })
            })]
          })
        })]
      }), r === "settings" && g.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6",
        children: [g.jsxs("div", {
          className: "bg-white rounded-lg shadow p-6 h-fit",
          children: [g.jsxs("h2", {
            className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2",
            children: [g.jsx(ip, {
              size: 20
            }), " Inspectiebedrijf"]
          }), g.jsxs("div", {
            className: "bg-gray-50 p-4 rounded border mb-4 space-y-3",
            children: [(xt === null || Pe === "iv_company") && g.jsxs("div", {
              className: "relative",
              children: [g.jsxs("div", {
                className: "flex gap-1.5",
                children: [g.jsx("input", {
                  id: "settings-company-search",
                  name: "settingsCompanySearch",
                  type: "text",
                  "aria-label": "Zoek inspectiebedrijf",
                  placeholder: "Zoek bedrijf...",
                  className: "flex-1 border rounded p-2 text-sm bg-white",
                  value: kn,
                  onChange: ie => rt(ie.target.value),
                  onKeyDown: ie => ie.key === "Enter" && Yi(kn)
                }), g.jsx("button", {
                  "aria-label": "Zoek inspectiebedrijf",
                  onClick: () => Yi(kn),
                  disabled: cr,
                  className: "px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                  children: cr ? g.jsx(Ns, {
                    size: 14,
                    className: "animate-spin"
                  }) : g.jsx($c, {
                    size: 14
                  })
                })]
              }), pt.length > 0 && g.jsxs("div", {
                className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-56 overflow-y-auto",
                children: [pt.map((ie, Se) => {
                  const Re = Fd(ie);
                  return g.jsxs("button", {
                    className: "w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0",
                    onClick: () => {
                      ge({
                        name: Re.name,
                        address: Re.address,
                        postalCode: Re.postalCode,
                        city: Re.city,
                        phone: Re.phone,
                        email: ir.email,
                        website: Re.website
                      }), Kt([]), rt("");
                    },
                    children: [g.jsx("div", {
                      className: "font-bold text-gray-800",
                      children: Re.name
                    }), g.jsx("div", {
                      className: "text-xs text-gray-500",
                      children: ie.formattedAddress
                    })]
                  }, Se);
                }), g.jsx("button", {
                  className: "w-full text-center text-xs text-gray-400 py-1.5 hover:bg-gray-50",
                  onClick: () => Kt([]),
                  children: "Sluiten"
                })]
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                htmlFor: "settings-company-name",
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Bedrijfsnaam"
              }), g.jsx("input", {
                id: "settings-company-name",
                name: "settingsCompanyName",
                className: "w-full border rounded p-2 text-sm font-bold",
                value: ir.name,
                onChange: ie => ge({
                  ...ir,
                  name: ie.target.value
                }),
                disabled: xt !== null && Pe !== "iv_company"
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                htmlFor: "settings-company-address",
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Adres"
              }), g.jsx("input", {
                id: "settings-company-address",
                name: "settingsCompanyAddress",
                className: "w-full border rounded p-2 text-sm",
                value: ir.address,
                onChange: ie => ge({
                  ...ir,
                  address: ie.target.value
                }),
                disabled: xt !== null && Pe !== "iv_company",
                placeholder: "Straat + Nr"
              })]
            }), g.jsxs("div", {
              className: "flex gap-2",
              children: [g.jsxs("div", {
                className: "w-1/3",
                children: [g.jsx("label", {
                  htmlFor: "settings-company-postal-code",
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Postcode"
                }), g.jsx("input", {
                  id: "settings-company-postal-code",
                  name: "settingsCompanyPostalCode",
                  className: "w-full border rounded p-2 text-sm",
                  value: ir.postalCode,
                  onChange: ie => ge({
                    ...ir,
                    postalCode: ie.target.value
                  }),
                  disabled: xt !== null && Pe !== "iv_company"
                })]
              }), g.jsxs("div", {
                className: "w-2/3",
                children: [g.jsx("label", {
                  htmlFor: "settings-company-city",
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Plaats"
                }), g.jsxs("div", {
                  className: "relative",
                  children: [g.jsx("input", {
                    id: "settings-company-city",
                    name: "settingsCompanyCity",
                    className: "w-full border rounded p-2 text-sm pr-8",
                    value: ir.city,
                    onChange: ie => ge({
                      ...ir,
                      city: ie.target.value
                    }),
                    disabled: xt !== null && Pe !== "iv_company"
                  }), g.jsx("button", {
                    title: "Adres aanvullen via postcode (PDOK)",
                    className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 disabled:opacity-30",
                    disabled: xt !== null && Pe !== "iv_company",
                    onClick: async () => {
                      const ie = await Gv(ir.postalCode, ir.address);
                      ie ? ge(Se => ({
                        ...Se,
                        city: ie.city
                      })) : alert("Adres niet gevonden. Controleer postcode en huisnummer.");
                    },
                    children: g.jsx(u0, {
                      size: 14
                    })
                  })]
                })]
              })]
            }), g.jsxs("div", {
              className: "flex gap-2",
              children: [g.jsxs("div", {
                className: "w-1/2",
                children: [g.jsx("label", {
                  htmlFor: "settings-company-phone",
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Telefoon"
                }), g.jsx("input", {
                  id: "settings-company-phone",
                  name: "settingsCompanyPhone",
                  className: "w-full border rounded p-2 text-sm",
                  value: ir.phone,
                  onChange: ie => ge({
                    ...ir,
                    phone: ie.target.value
                  }),
                  disabled: xt !== null && Pe !== "iv_company"
                })]
              }), g.jsxs("div", {
                className: "w-1/2",
                children: [g.jsx("label", {
                  htmlFor: "settings-company-email",
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "E-mail"
                }), g.jsx("input", {
                  id: "settings-company-email",
                  name: "settingsCompanyEmail",
                  className: "w-full border rounded p-2 text-sm",
                  value: ir.email,
                  onChange: ie => ge({
                    ...ir,
                    email: ie.target.value
                  }),
                  disabled: xt !== null && Pe !== "iv_company"
                })]
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                htmlFor: "settings-company-website",
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Website"
              }), g.jsx("input", {
                id: "settings-company-website",
                name: "settingsCompanyWebsite",
                type: "url",
                className: "w-full border rounded p-2 text-sm",
                value: ir.website,
                onChange: ie => ge({
                  ...ir,
                  website: ie.target.value
                }),
                disabled: xt !== null && Pe !== "iv_company",
                placeholder: "https://"
              })]
            }), g.jsxs("div", {
              className: "flex gap-2 pt-2",
              children: [g.jsx("button", {
                onClick: Pi,
                disabled: xt !== null && Pe !== "iv_company",
                className: `w-full py-2 rounded font-bold text-sm text-white ${xt && Pe === "iv_company" ? "bg-blue-600" : "bg-emerald-600 disabled:opacity-50"}`,
                children: xt && Pe === "iv_company" ? "Opslaan" : "Toevoegen"
              }), xt && Pe === "iv_company" && g.jsx("button", {
                onClick: Ha,
                className: "w-auto px-4 bg-gray-300 rounded font-bold text-xs",
                children: "X"
              })]
            })]
          }), g.jsx("ul", {
            className: "divide-y max-h-[400px] overflow-y-auto",
            children: Ct.map(ie => g.jsxs("li", {
              className: "py-3 flex justify-between items-start text-gray-700",
              children: [g.jsxs("div", {
                children: [g.jsx("div", {
                  className: "font-bold text-sm",
                  children: ie.label
                }), g.jsxs("div", {
                  className: "text-xs text-gray-500",
                  children: [ie.data?.address ? `${ie.data.address}, ` : "", ie.data?.city]
                })]
              }), g.jsxs("div", {
                className: "flex gap-2",
                children: [g.jsx("button", {
                  onClick: () => Zi(ie),
                  className: "text-blue-400 hover:text-blue-600",
                  children: g.jsx(gf, {
                    size: 16
                  })
                }), g.jsx("button", {
                  onClick: () => Ua(ie.id),
                  className: "text-red-400 hover:text-red-600",
                  children: g.jsx(mf, {
                    size: 16
                  })
                })]
              })]
            }, ie.id))
          })]
        }), g.jsxs("div", {
          className: "bg-white rounded-lg shadow p-6 h-fit",
          children: [g.jsxs("h2", {
            className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2",
            children: [g.jsx(AC, {
              size: 20
            }), " Instrumenten"]
          }), g.jsxs("div", {
            className: "bg-gray-50 p-4 rounded border mb-4 space-y-3",
            children: [g.jsxs("div", {
              children: [g.jsx("label", {
                htmlFor: "settings-instrument-name",
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Naam"
              }), g.jsx("input", {
                id: "settings-instrument-name",
                name: "settingsInstrumentName",
                className: "w-full border rounded p-2 text-sm font-bold",
                value: ke.name,
                onChange: ie => Qt({
                  ...ke,
                  name: ie.target.value
                }),
                disabled: xt !== null && Pe !== "instrument",
                placeholder: "Bijv. Fluke 1664"
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                htmlFor: "settings-instrument-serial",
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Serienummer"
              }), g.jsx("input", {
                id: "settings-instrument-serial",
                name: "settingsInstrumentSerial",
                className: "w-full border rounded p-2 text-sm",
                value: ke.serial,
                onChange: ie => Qt({
                  ...ke,
                  serial: ie.target.value
                }),
                disabled: xt !== null && Pe !== "instrument"
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                htmlFor: "settings-instrument-calibration",
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Kalibratie-/ controledatum"
              }), g.jsxs("div", {
                className: "flex gap-1 w-full",
                children: [g.jsx("input", {
                  id: "settings-instrument-calibration",
                  name: "settingsInstrumentCalibration",
                  className: "border p-2 rounded text-sm bg-white flex-grow min-w-0",
                  type: ke.calibration === "Indicatief" || ke.calibration === "n.v.t." ? "text" : "date",
                  placeholder: "Kies datum",
                  value: ke.calibration,
                  max: "2100-12-31",
                  onChange: ie => {
                    const Se = ie.target.value;
                    Se.length <= 10 && Qt({
                      ...ke,
                      calibration: Se
                    });
                  },
                  onBlur: ie => {
                    ie.target.value.startsWith("000") && Qt({
                      ...ke,
                      calibration: ""
                    });
                  },
                  disabled: xt !== null && Pe !== "instrument" || ke.calibration === "Indicatief" || ke.calibration === "n.v.t."
                }), g.jsxs("select", {
                  id: "settings-instrument-calibration-type",
                  name: "settingsInstrumentCalibrationType",
                  "aria-label": "Type kalibratiedatum",
                  className: "border p-2 rounded text-sm bg-white cursor-pointer shrink-0",
                  onChange: ie => {
                    ie.target.value === "date" ? Qt({
                      ...ke,
                      calibration: ""
                    }) : Qt({
                      ...ke,
                      calibration: ie.target.value
                    });
                  },
                  value: ke.calibration === "Indicatief" || ke.calibration === "n.v.t." ? ke.calibration : "date",
                  disabled: xt !== null && Pe !== "instrument",
                  children: [g.jsx("option", {
                    value: "date",
                    children: "Datum"
                  }), g.jsx("option", {
                    value: "Indicatief",
                    children: "Indicatief"
                  }), g.jsx("option", {
                    value: "n.v.t.",
                    children: "n.v.t."
                  })]
                })]
              })]
            }), g.jsxs("div", {
              className: "flex gap-2 pt-2",
              children: [g.jsx("button", {
                onClick: ho,
                disabled: xt !== null && Pe !== "instrument",
                className: `flex-1 py-2 rounded font-bold text-sm text-white ${xt && Pe === "instrument" ? "bg-blue-600" : "bg-emerald-600 disabled:opacity-50"}`,
                children: xt && Pe === "instrument" ? "Opslaan" : "Toevoegen"
              }), xt && Pe === "instrument" && g.jsx("button", {
                onClick: Ha,
                className: "px-4 bg-gray-300 rounded font-bold text-sm",
                children: "X"
              })]
            })]
          }), g.jsx("ul", {
            className: "divide-y max-h-[600px] overflow-y-auto",
            children: Ye.map(ie => {
              const Se = !ie.data?.calibrationDate || ie.data.calibrationDate === "Indicatief" || ie.data.calibrationDate === "n.v.t." ? "ok" : (() => {
                  const wt = new Date(ie.data.calibrationDate);
                  if (isNaN(wt.getTime())) return "unknown";
                  const rr = Math.ceil((wt.getTime() - new Date().getTime()) / (1e3 * 3600 * 24));
                  return rr < 0 ? "expired" : rr <= 30 ? "warning" : "ok";
                })(),
                Re = mr === ie.id,
                lt = Ue.filter(wt => (wt.linked_instruments ?? []).includes(ie.id));
              return g.jsxs("li", {
                className: "text-gray-700",
                children: [g.jsxs("div", {
                  className: "py-3 flex justify-between items-start",
                  children: [g.jsxs("div", {
                    className: "flex-1 min-w-0 pr-2",
                    children: [g.jsx("div", {
                      className: "font-bold text-sm",
                      children: ie.label
                    }), g.jsxs("div", {
                      className: "text-xs text-gray-500",
                      children: ["SN: ", ie.data?.serialNumber || "Onbekend", " | Kalibratie: ", g.jsx("span", {
                        className: Se === "expired" ? "text-red-600 font-bold" : Se === "warning" ? "text-orange-600 font-bold" : "",
                        children: ie.data?.calibrationDate || "Onbekend"
                      })]
                    }), lt.length > 0 && g.jsxs("div", {
                      className: "text-xs text-emerald-600 mt-0.5",
                      children: ["⭐ ", lt.map(wt => wt.full_name || wt.email).join(", ")]
                    })]
                  }), g.jsxs("div", {
                    className: "flex gap-2 shrink-0",
                    children: [g.jsx("button", {
                      onClick: () => {
                        wr(Re ? null : ie.id), It("");
                      },
                      className: `p-1.5 rounded transition-colors ${Re ? "text-emerald-700 bg-emerald-100" : "text-emerald-400 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100"}`,
                      title: "Eigenaren beheren",
                      children: g.jsx(NS, {
                        size: 15
                      })
                    }), g.jsx("button", {
                      onClick: () => Ci(ie),
                      className: "text-blue-400 hover:text-blue-600 p-1.5",
                      children: g.jsx(gf, {
                        size: 15
                      })
                    }), g.jsx("button", {
                      onClick: () => Ua(ie.id),
                      className: "text-red-400 hover:text-red-600 p-1.5",
                      children: g.jsx(mf, {
                        size: 15
                      })
                    })]
                  })]
                }), Re && g.jsxs("div", {
                  className: "mb-3 p-3 bg-emerald-50 rounded border border-emerald-200 animate-fadeIn",
                  children: [g.jsx("p", {
                    className: "text-xs font-bold text-emerald-800 uppercase mb-2",
                    children: "Eigenaren — wie heeft dit instrument in de koffer?"
                  }), g.jsx("input", {
                    type: "text",
                    placeholder: "Zoek gebruiker...",
                    className: "w-full border rounded p-1.5 text-xs mb-2",
                    value: He,
                    onChange: wt => It(wt.target.value)
                  }), g.jsxs("div", {
                    className: "space-y-1 max-h-40 overflow-y-auto",
                    children: [Ue.filter(wt => He === "" || (wt.full_name || wt.email || "").toLowerCase().includes(He.toLowerCase())).map(wt => {
                      const rr = (wt.linked_instruments ?? []).includes(ie.id);
                      return g.jsxs("label", {
                        className: `flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${rr ? "bg-emerald-100" : "hover:bg-gray-100 bg-white"}`,
                        children: [g.jsx("input", {
                          type: "checkbox",
                          checked: rr,
                          onChange: () => Ui(wt.id, ie.id, wt.linked_instruments ?? []),
                          className: "h-4 w-4 text-emerald-600 rounded"
                        }), g.jsx("span", {
                          className: "text-sm font-medium",
                          children: wt.full_name || wt.email
                        }), wt.full_name && g.jsx("span", {
                          className: "text-xs text-gray-400",
                          children: wt.email
                        })]
                      }, wt.id);
                    }), Ue.length === 0 && g.jsx("p", {
                      className: "text-xs text-gray-400 italic",
                      children: "Geen gebruikers geladen."
                    })]
                  })]
                })]
              }, ie.id);
            })
          })]
        })]
      }), r === "library" && g.jsxs("div", {
        className: "bg-white rounded-lg shadow overflow-hidden",
        children: [g.jsxs("div", {
          className: "p-4 bg-blue-50 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap",
          children: [g.jsxs("div", {
            className: "flex items-center gap-2 text-sm text-blue-800 font-bold",
            children: [g.jsx(jM, {
              size: 18
            }), g.jsxs("span", {
              children: ["Centrale Gebreken Bibliotheek (", c.length, ")"]
            })]
          }), g.jsxs("div", {
            className: "flex flex-wrap gap-2",
            children: [g.jsxs("button", {
              onClick: fo,
              className: "flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-2.5 rounded-lg shadow-sm text-sm font-bold hover:bg-emerald-200 border border-emerald-300",
              children: [g.jsx(MM, {
                size: 16
              }), " ", g.jsx("span", {
                className: "hidden sm:inline",
                children: "Laad Standaard"
              }), " NTA8220"]
            }), g.jsxs("button", {
              onClick: () => A.current?.click(),
              className: "flex items-center gap-2 bg-white text-blue-700 px-3 py-2.5 rounded-lg shadow-sm text-sm font-bold hover:bg-blue-50 border border-blue-200",
              children: [g.jsx(eEe, {
                size: 16
              }), " CSV"]
            }), g.jsx("input", {
              type: "file",
              ref: A,
              onChange: xn,
              accept: ".csv",
              className: "hidden"
            }), g.jsxs("button", {
              onClick: () => {
                v({
                  category: "",
                  subcategory: "",
                  shortName: "",
                  description: "",
                  classification: "Yellow"
                }), h(null), d(!0);
              },
              className: "flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow text-sm font-bold hover:bg-blue-700",
              children: [g.jsx(mh, {
                size: 16
              }), " Nieuw Gebrek"]
            })]
          })]
        }), g.jsx("div", {
          className: "overflow-x-auto max-h-[70vh] overflow-y-auto",
          children: g.jsxs("table", {
            className: "ig-library-table min-w-[900px] w-full relative",
            children: [g.jsx("thead", {
              className: "bg-gray-50 sticky top-0 border-b shadow-sm z-10",
              children: g.jsxs("tr", {
                children: [g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Categorie"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Subcategorie"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Korte Naam"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase",
                  children: "Classificatie"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase",
                  children: "Acties"
                })]
              })
            }), g.jsxs("tbody", {
              className: "divide-y divide-gray-200",
              children: [c.length === 0 && g.jsx("tr", {
                children: g.jsx("td", {
                  colSpan: 5,
                  className: "p-8 text-center text-gray-500 italic",
                  children: "Geen gebreken gevonden in de database. Upload een CSV of voeg ze handmatig toe."
                })
              }), c.map(ie => g.jsxs("tr", {
                className: "hover:bg-gray-50",
                children: [g.jsx("td", {
                  className: "px-4 py-3 text-sm font-bold text-gray-700",
                  children: ie.category
                }), g.jsx("td", {
                  className: "px-4 py-3 text-sm text-gray-600",
                  children: ie.subcategory
                }), g.jsx("td", {
                  className: "px-4 py-3 text-sm text-gray-800",
                  children: ie.shortName || ie.shortName
                }), g.jsx("td", {
                  className: "px-4 py-3 text-sm",
                  children: g.jsx("span", {
                    className: `px-2 py-1 rounded text-xs font-bold ${ie.classification === "Red" ? "bg-red-100 text-red-800" : ie.classification === "Orange" ? "bg-orange-100 text-orange-800" : ie.classification === "Yellow" ? "bg-yellow-100 text-yellow-800" : ""}`,
                    style: ie.classification === "Blue" ? {
                      backgroundColor: "#dbeafe",
                      color: "#1e40af"
                    } : void 0,
                    children: ie.classification
                  })
                }), g.jsx("td", {
                  className: "px-4 py-3 text-right",
                  children: g.jsxs("div", {
                    className: "flex justify-end gap-2",
                    children: [g.jsx("button", {
                      onClick: () => Hi(ie),
                      className: "text-blue-500 hover:text-blue-700 p-1",
                      children: g.jsx(gf, {
                        size: 16
                      })
                    }), g.jsx("button", {
                      onClick: () => Aa(ie.id),
                      className: "text-red-400 hover:text-red-600 p-1",
                      children: g.jsx(mf, {
                        size: 16
                      })
                    })]
                  })
                })]
              }, ie.id))]
            })]
          })
        })]
      }), u && g.jsx("div", {
        className: "fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 z-50",
        children: g.jsxs("div", {
          className: "bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg p-0 overflow-hidden flex flex-col max-h-[94dvh]",
          children: [g.jsxs("div", {
            className: "p-4 border-b flex justify-between items-center bg-gray-50",
            children: [g.jsx("h2", {
              className: "text-lg font-bold text-gray-800",
              children: f ? "Gebrek Bewerken" : "Nieuw Gebrek"
            }), g.jsx("button", {
              onClick: () => d(!1),
              className: "text-gray-400 hover:text-gray-600",
              children: g.jsx(Kc, {
                size: 20
              })
            })]
          }), g.jsxs("div", {
            className: "p-4 md:p-6 overflow-y-auto max-h-[70vh] space-y-4",
            children: [g.jsxs("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
              children: [g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Hoofdcategorie"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2.5",
                  value: m.category,
                  onChange: ie => v({
                    ...m,
                    category: ie.target.value
                  }),
                  placeholder: "Bijv. Verdeelinrichting"
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Subcategorie"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2.5",
                  value: m.subcategory,
                  onChange: ie => v({
                    ...m,
                    subcategory: ie.target.value
                  }),
                  placeholder: "Bijv. Algemeen"
                })]
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Korte Naam (Dropdown tekst)"
              }), g.jsx("input", {
                className: "w-full border rounded p-2.5 font-bold text-emerald-700",
                value: m.shortName,
                onChange: ie => v({
                  ...m,
                  shortName: ie.target.value
                }),
                placeholder: "Bijv. Aanrakingsgevaar"
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Omschrijving Rapport"
              }), g.jsx("textarea", {
                className: "w-full border rounded p-2.5 h-24",
                value: m.description,
                onChange: ie => v({
                  ...m,
                  description: ie.target.value
                }),
                placeholder: "Volledige normatieve omschrijving..."
              })]
            }), g.jsx("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
              children: g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Classificatie"
                }), g.jsxs("select", {
                  className: "w-full border rounded p-2.5",
                  value: m.classification,
                  onChange: ie => v({
                    ...m,
                    classification: ie.target.value
                  }),
                  children: [g.jsx("option", {
                    value: "Red",
                    children: "Red (Ernstig / Direct)"
                  }), g.jsx("option", {
                    value: "Orange",
                    children: "Orange"
                  }), g.jsx("option", {
                    value: "Yellow",
                    children: "Yellow (Aandacht)"
                  }), g.jsx("option", {
                    value: "Blue",
                    children: "Blue (Herstel)"
                  })]
                })]
              })
            })]
          }), g.jsxs("div", {
            className: "p-4 border-t bg-gray-50 flex gap-2",
            children: [g.jsx("button", {
              onClick: () => d(!1),
              className: "flex-1 bg-gray-200 py-3 rounded-lg font-bold text-gray-700 hover:bg-gray-300",
              children: "Annuleren"
            }), g.jsx("button", {
              onClick: as,
              className: "flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow",
              children: f ? "Opslaan" : "Toevoegen"
            })]
          })]
        })
      }), B && g.jsx("div", {
        className: "fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 z-50",
        children: g.jsxs("div", {
          className: "bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-3xl p-0 overflow-hidden flex flex-col h-[96dvh] sm:h-auto sm:max-h-[90vh]",
          children: [g.jsxs("div", {
            className: "p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50",
            children: [g.jsx("h2", {
              className: "text-lg sm:text-xl font-bold text-gray-800",
              children: X ? "Opdracht Bewerken" : "Nieuwe Opdracht"
            }), g.jsx("button", {
              onClick: na,
              className: "min-h-11 min-w-11 flex items-center justify-center rounded-xl hover:bg-gray-200",
              children: g.jsx(Kc, {
                size: 24
              })
            })]
          }), g.jsxs("div", {
            className: "flex overflow-x-auto border-b bg-gray-100",
            children: [g.jsxs("button", {
              onClick: () => {
                M("basis"), Kt([]), rt("");
              },
              className: `flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 ${Q === "basis" ? "bg-white text-emerald-600 border-t-2 border-t-emerald-600" : "text-gray-500"}`,
              children: [g.jsx(Eg, {
                size: 14
              }), " 1. Basis"]
            }), g.jsxs("button", {
              onClick: () => {
                M("klant"), Kt([]), rt("");
              },
              className: `flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 ${Q === "klant" ? "bg-white text-emerald-600 border-t-2 border-t-emerald-600" : "text-gray-500"}`,
              children: [g.jsx(Vm, {
                size: 14
              }), " 2. Opdrachtgever"]
            }), g.jsxs("button", {
              onClick: () => {
                M("project"), Kt([]), rt("");
              },
              className: `flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 ${Q === "project" ? "bg-white text-emerald-600 border-t-2 border-t-emerald-600" : "text-gray-500"}`,
              children: [g.jsx(ip, {
                size: 14
              }), " 3. Project"]
            }), X && g.jsxs("button", {
              onClick: () => M("bevindingen"),
              className: `flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 ${Q === "bevindingen" ? "bg-white text-emerald-600 border-t-2 border-t-emerald-600" : "text-gray-500"}`,
              children: [g.jsx(QM, {
                size: 14
              }), " 4. Bevindingen ", N.length > 0 && g.jsx("span", {
                className: "bg-gray-200 text-gray-600 rounded-full px-1.5 text-xs",
                children: N.length
              })]
            })]
          }), g.jsxs("div", {
            className: "p-4 sm:p-6 overflow-y-auto bg-gray-50",
            children: [Q === "basis" && g.jsxs("div", {
              className: "space-y-6",
              children: [g.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
                children: [g.jsxs("div", {
                  className: "col-span-1",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Datum"
                  }), g.jsx("input", {
                    type: "date",
                    className: "w-full border rounded p-2",
                    value: H.date,
                    onChange: ie => G({
                      ...H,
                      date: ie.target.value
                    })
                  })]
                }), g.jsxs("div", {
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Starttijd"
                  }), g.jsx("input", {
                    type: "time",
                    className: "w-full border rounded p-2",
                    value: H.scheduledTimeStart || "",
                    onChange: ie => G({
                      ...H,
                      scheduledTimeStart: ie.target.value
                    })
                  })]
                }), g.jsxs("div", {
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Duur"
                  }), g.jsxs("select", {
                    className: "w-full border rounded p-2 text-sm",
                    value: H.estimatedDurationHours ?? "",
                    onChange: ie => G({
                      ...H,
                      estimatedDurationHours: ie.target.value ? parseFloat(ie.target.value) : void 0
                    }),
                    children: [g.jsx("option", {
                      value: "",
                      children: "Onbekend"
                    }), g.jsx("option", {
                      value: "0.5",
                      children: "½ uur"
                    }), g.jsx("option", {
                      value: "1",
                      children: "1 uur"
                    }), g.jsx("option", {
                      value: "1.5",
                      children: "1½ uur"
                    }), g.jsx("option", {
                      value: "2",
                      children: "2 uur"
                    }), g.jsx("option", {
                      value: "3",
                      children: "3 uur"
                    }), g.jsx("option", {
                      value: "4",
                      children: "4 uur"
                    }), g.jsx("option", {
                      value: "6",
                      children: "6 uur"
                    }), g.jsx("option", {
                      value: "8",
                      children: "1 dag"
                    }), g.jsx("option", {
                      value: "16",
                      children: "2 dagen"
                    }), g.jsx("option", {
                      value: "24",
                      children: "3 dagen"
                    }), g.jsx("option", {
                      value: "40",
                      children: "1 week"
                    })]
                  })]
                })]
              }), g.jsxs("div", {
                className: "bg-white p-4 rounded border",
                children: [g.jsxs("h3", {
                  className: "text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2",
                  children: [g.jsx(Vm, {
                    size: 16
                  }), " Inspecteur"]
                }), g.jsxs("div", {
                  className: "space-y-3",
                  children: [g.jsxs("div", {
                    children: [g.jsx("label", {
                      className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                      children: "Naam (Kies of Typ)"
                    }), g.jsx("input", {
                      list: "inspectors-list-modal",
                      className: "w-full border rounded p-2",
                      value: H.inspectorName,
                      onChange: ie => {
                        const Se = ie.target.value,
                          Re = Ue.find(lt => lt.full_name === Se);
                        G({
                          ...H,
                          inspectorName: Se,
                          assignedInspectorId: Re?.id || "",
                          sciosRegistrationNumber: Re ? Re.scios_nr || "" : H.sciosRegistrationNumber
                        });
                      },
                      placeholder: "Selecteer inspecteur uit cloud"
                    }), g.jsx("datalist", {
                      id: "inspectors-list-modal",
                      children: Ue.filter(ie => ie.full_name).map(ie => g.jsx("option", {
                        value: ie.full_name
                      }, ie.id))
                    })]
                  }), g.jsxs("div", {
                    children: [g.jsx("label", {
                      className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                      children: "SCIOS Registratienummer"
                    }), g.jsx("input", {
                      className: "w-full border rounded p-2",
                      value: H.sciosRegistrationNumber,
                      onChange: ie => G({
                        ...H,
                        sciosRegistrationNumber: ie.target.value
                      }),
                      placeholder: "Optioneel"
                    })]
                  })]
                })]
              }), g.jsxs("div", {
                className: "bg-white p-4 rounded border",
                children: [g.jsxs("h3", {
                  className: "text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2",
                  children: [g.jsx(wCe, {
                    size: 16
                  }), " Inspectiebedrijf"]
                }), g.jsxs("div", {
                  className: "space-y-3",
                  children: [g.jsxs("div", {
                    children: [g.jsx("label", {
                      className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                      children: "Bedrijfsnaam (Kies of Typ)"
                    }), g.jsx("input", {
                      list: "companies-list-modal",
                      className: "w-full border rounded p-2",
                      value: H.inspectionCompany,
                      onChange: ie => {
                        const Se = ie.target.value,
                          Re = Ct.find(lt => lt.label === Se);
                        G(Re ? {
                          ...H,
                          inspectionCompany: Se,
                          inspectionCompanyAddress: Re.data?.address || "",
                          inspectionCompanyPostalCode: Re.data?.postalCode || "",
                          inspectionCompanyCity: Re.data?.city || "",
                          inspectionCompanyPhone: Re.data?.phone || "",
                          inspectionCompanyEmail: Re.data?.email || ""
                        } : {
                          ...H,
                          inspectionCompany: Se
                        });
                      },
                      placeholder: "Selecteer bedrijf"
                    }), g.jsx("datalist", {
                      id: "companies-list-modal",
                      children: Ct.map(ie => g.jsx("option", {
                        value: ie.label
                      }, ie.id))
                    })]
                  }), g.jsxs("div", {
                    children: [g.jsx("label", {
                      className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                      children: "Adres"
                    }), g.jsx("input", {
                      className: "w-full border rounded p-2",
                      value: H.inspectionCompanyAddress,
                      onChange: ie => G({
                        ...H,
                        inspectionCompanyAddress: ie.target.value
                      }),
                      placeholder: "Straat + Nr"
                    })]
                  }), g.jsxs("div", {
                    className: "flex gap-2",
                    children: [g.jsxs("div", {
                      className: "w-1/3",
                      children: [g.jsx("label", {
                        className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                        children: "Postcode"
                      }), g.jsx("input", {
                        className: "w-full border rounded p-2",
                        value: H.inspectionCompanyPostalCode,
                        onChange: ie => G({
                          ...H,
                          inspectionCompanyPostalCode: ie.target.value
                        })
                      })]
                    }), g.jsxs("div", {
                      className: "w-2/3",
                      children: [g.jsx("label", {
                        className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                        children: "Plaats"
                      }), g.jsx("input", {
                        className: "w-full border rounded p-2",
                        value: H.inspectionCompanyCity,
                        onChange: ie => G({
                          ...H,
                          inspectionCompanyCity: ie.target.value
                        })
                      })]
                    })]
                  }), g.jsxs("div", {
                    className: "flex gap-2",
                    children: [g.jsxs("div", {
                      className: "w-1/2 relative",
                      children: [g.jsx("label", {
                        className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                        children: "Telefoon"
                      }), g.jsxs("div", {
                        className: "relative",
                        children: [g.jsx(gC, {
                          size: 16,
                          className: "absolute left-3 top-3 text-gray-400"
                        }), g.jsx("input", {
                          className: "w-full border rounded p-2 pl-10",
                          value: H.inspectionCompanyPhone,
                          onChange: ie => G({
                            ...H,
                            inspectionCompanyPhone: ie.target.value
                          })
                        })]
                      })]
                    }), g.jsxs("div", {
                      className: "w-1/2 relative",
                      children: [g.jsx("label", {
                        className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                        children: "E-mail"
                      }), g.jsxs("div", {
                        className: "relative",
                        children: [g.jsx(Ex, {
                          size: 16,
                          className: "absolute left-3 top-3 text-gray-400"
                        }), g.jsx("input", {
                          className: "w-full border rounded p-2 pl-10",
                          value: H.inspectionCompanyEmail,
                          onChange: ie => G({
                            ...H,
                            inspectionCompanyEmail: ie.target.value
                          })
                        })]
                      })]
                    })]
                  })]
                })]
              })]
            }), Q === "klant" && g.jsxs("div", {
              className: "space-y-4",
              children: [g.jsxs("div", {
                className: "relative",
                children: [g.jsxs("div", {
                  className: "flex gap-1.5",
                  children: [g.jsx("input", {
                    type: "text",
                    placeholder: "Zoek opdrachtgever via Google...",
                    className: "flex-1 border rounded p-2 text-sm",
                    value: kn,
                    onChange: ie => rt(ie.target.value),
                    onKeyDown: ie => ie.key === "Enter" && Yi(kn)
                  }), g.jsx("button", {
                    onClick: () => Yi(kn),
                    disabled: cr,
                    className: "px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                    children: cr ? g.jsx(Ns, {
                      size: 14,
                      className: "animate-spin"
                    }) : g.jsx($c, {
                      size: 14
                    })
                  })]
                }), pt.length > 0 && g.jsxs("div", {
                  className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-56 overflow-y-auto",
                  children: [pt.map((ie, Se) => {
                    const Re = Fd(ie);
                    return g.jsxs("button", {
                      className: "w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0",
                      onClick: () => {
                        G({
                          ...H,
                          clientName: Re.name,
                          clientAddress: Re.address,
                          clientPostalCode: Re.postalCode,
                          clientCity: Re.city,
                          clientPhone: Re.phone,
                          clientEmail: Re.website || Re.phone ? H.clientEmail : ""
                        }), Kt([]), rt("");
                      },
                      children: [g.jsx("div", {
                        className: "font-bold text-gray-800",
                        children: Re.name
                      }), g.jsx("div", {
                        className: "text-xs text-gray-500",
                        children: ie.formattedAddress
                      })]
                    }, Se);
                  }), g.jsx("button", {
                    className: "w-full text-center text-xs text-gray-400 py-1.5 hover:bg-gray-50",
                    onClick: () => Kt([]),
                    children: "Sluiten"
                  })]
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Naam Opdrachtgever"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2 font-bold",
                  list: "modal-client-suggestions",
                  value: H.clientName,
                  onChange: ie => {
                    const Se = ie.target.value,
                      Re = Ot.find(lt => lt.name === Se);
                    G(Re ? {
                      ...H,
                      clientName: Se,
                      clientAddress: Re.address || H.clientAddress,
                      clientPostalCode: Re.postal_code || H.clientPostalCode,
                      clientCity: Re.city || H.clientCity,
                      clientPhone: Re.phone || H.clientPhone,
                      clientEmail: Re.email || H.clientEmail
                    } : {
                      ...H,
                      clientName: Se
                    });
                  },
                  placeholder: "Bijv. Bakkerij Jansen B.V."
                }), g.jsx("datalist", {
                  id: "modal-client-suggestions",
                  children: hs.map((ie, Se) => g.jsx("option", {
                    value: ie.name
                  }, Se))
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Adres"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2",
                  value: H.clientAddress,
                  onChange: ie => G({
                    ...H,
                    clientAddress: ie.target.value
                  })
                })]
              }), g.jsxs("div", {
                className: "flex gap-2",
                children: [g.jsxs("div", {
                  className: "w-1/3",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Postcode"
                  }), g.jsx("input", {
                    className: "w-full border rounded p-2",
                    value: H.clientPostalCode,
                    onChange: ie => G({
                      ...H,
                      clientPostalCode: ie.target.value
                    })
                  })]
                }), g.jsxs("div", {
                  className: "w-2/3",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Plaats"
                  }), g.jsx("input", {
                    className: "w-full border rounded p-2",
                    value: H.clientCity,
                    onChange: ie => G({
                      ...H,
                      clientCity: ie.target.value
                    })
                  })]
                })]
              }), g.jsx("hr", {
                className: "border-gray-200"
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Contactpersoon"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2",
                  value: H.clientContactPerson,
                  onChange: ie => G({
                    ...H,
                    clientContactPerson: ie.target.value
                  })
                })]
              }), g.jsxs("div", {
                className: "flex gap-2",
                children: [g.jsxs("div", {
                  className: "w-1/2 relative",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Telefoon"
                  }), g.jsxs("div", {
                    className: "relative",
                    children: [g.jsx(gC, {
                      size: 16,
                      className: "absolute left-3 top-3 text-gray-400"
                    }), g.jsx("input", {
                      className: "w-full border rounded p-2 pl-10",
                      value: H.clientPhone,
                      onChange: ie => G({
                        ...H,
                        clientPhone: ie.target.value
                      })
                    })]
                  })]
                }), g.jsxs("div", {
                  className: "w-1/2 relative",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "E-mail"
                  }), g.jsxs("div", {
                    className: "relative",
                    children: [g.jsx(Ex, {
                      size: 16,
                      className: "absolute left-3 top-3 text-gray-400"
                    }), g.jsx("input", {
                      className: "w-full border rounded p-2 pl-10",
                      value: H.clientEmail,
                      onChange: ie => G({
                        ...H,
                        clientEmail: ie.target.value
                      })
                    })]
                  })]
                })]
              })]
            }), Q === "project" && g.jsxs("div", {
              className: "space-y-4",
              children: [g.jsxs("div", {
                className: "relative",
                children: [g.jsxs("div", {
                  className: "flex gap-1.5",
                  children: [g.jsx("input", {
                    type: "text",
                    placeholder: "Zoek locatie via Google...",
                    className: "flex-1 border rounded p-2 text-sm",
                    value: kn,
                    onChange: ie => rt(ie.target.value),
                    onKeyDown: ie => ie.key === "Enter" && Yi(kn)
                  }), g.jsx("button", {
                    onClick: () => Yi(kn),
                    disabled: cr,
                    className: "px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                    children: cr ? g.jsx(Ns, {
                      size: 14,
                      className: "animate-spin"
                    }) : g.jsx($c, {
                      size: 14
                    })
                  })]
                }), pt.length > 0 && g.jsxs("div", {
                  className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-56 overflow-y-auto",
                  children: [pt.map((ie, Se) => {
                    const Re = Fd(ie);
                    return g.jsxs("button", {
                      className: "w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0",
                      onClick: () => {
                        G({
                          ...H,
                          projectLocation: Re.name,
                          projectAddress: Re.address,
                          projectPostalCode: Re.postalCode,
                          projectCity: Re.city,
                          projectPhone: Re.phone
                        }), Kt([]), rt("");
                      },
                      children: [g.jsx("div", {
                        className: "font-bold text-gray-800",
                        children: Re.name
                      }), g.jsx("div", {
                        className: "text-xs text-gray-500",
                        children: ie.formattedAddress
                      })]
                    }, Se);
                  }), g.jsx("button", {
                    className: "w-full text-center text-xs text-gray-400 py-1.5 hover:bg-gray-50",
                    onClick: () => Kt([]),
                    children: "Sluiten"
                  })]
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Locatienaam (Indien afwijkend)"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2",
                  value: H.projectLocation,
                  onChange: ie => G({
                    ...H,
                    projectLocation: ie.target.value
                  }),
                  placeholder: "Bijv. Filiaal Centrum"
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Adres"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2",
                  value: H.projectAddress,
                  onChange: ie => G({
                    ...H,
                    projectAddress: ie.target.value
                  })
                })]
              }), g.jsxs("div", {
                className: "flex gap-2",
                children: [g.jsxs("div", {
                  className: "w-1/3",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Postcode"
                  }), g.jsx("input", {
                    className: "w-full border rounded p-2",
                    value: H.projectPostalCode,
                    onChange: ie => G({
                      ...H,
                      projectPostalCode: ie.target.value
                    })
                  })]
                }), g.jsxs("div", {
                  className: "w-2/3",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Plaats"
                  }), g.jsx("input", {
                    className: "w-full border rounded p-2",
                    value: H.projectCity,
                    onChange: ie => G({
                      ...H,
                      projectCity: ie.target.value
                    })
                  })]
                })]
              }), g.jsx("hr", {
                className: "border-gray-200"
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Contactpersoon op locatie"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2",
                  value: H.projectContactPerson,
                  onChange: ie => G({
                    ...H,
                    projectContactPerson: ie.target.value
                  })
                })]
              }), g.jsxs("div", {
                className: "flex gap-2",
                children: [g.jsxs("div", {
                  className: "w-1/2 relative",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Telefoon"
                  }), g.jsxs("div", {
                    className: "relative",
                    children: [g.jsx(gC, {
                      size: 16,
                      className: "absolute left-3 top-3 text-gray-400"
                    }), g.jsx("input", {
                      className: "w-full border rounded p-2 pl-10",
                      value: H.projectPhone,
                      onChange: ie => G({
                        ...H,
                        projectPhone: ie.target.value
                      })
                    })]
                  })]
                }), g.jsxs("div", {
                  className: "w-1/2 relative",
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "E-mail"
                  }), g.jsxs("div", {
                    className: "relative",
                    children: [g.jsx(Ex, {
                      size: 16,
                      className: "absolute left-3 top-3 text-gray-400"
                    }), g.jsx("input", {
                      className: "w-full border rounded p-2 pl-10",
                      value: H.projectEmail,
                      onChange: ie => G({
                        ...H,
                        projectEmail: ie.target.value
                      })
                    })]
                  })]
                })]
              }), g.jsxs("div", {
                className: "bg-blue-50 p-3 rounded border border-blue-100 mt-2",
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-blue-800 uppercase mb-1",
                  children: "Installatieverantwoordelijke (IV)"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2",
                  value: H.installationResponsible,
                  onChange: ie => G({
                    ...H,
                    installationResponsible: ie.target.value
                  }),
                  placeholder: "Naam IV'er"
                })]
              })]
            }), Q === "bevindingen" && g.jsx("div", {
              className: "space-y-2",
              children: N.length === 0 ? g.jsx("p", {
                className: "text-sm text-gray-400 italic text-center py-8",
                children: "Geen bevindingen voor deze inspectie."
              }) : g.jsxs(g.Fragment, {
                children: [g.jsx("p", {
                  className: "text-xs text-gray-500 mb-3",
                  children: "Sleep bevindingen om de volgorde aan te passen. Deze volgorde wordt ook in het PDF-rapport gebruikt."
                }), N.map((ie, Se) => {
                  const Re = ie.classification === "Red" ? "#ef4444" : ie.classification === "Orange" || ie.classification === "Amber" ? "#f97316" : ie.classification === "Blue" ? "#3b82f6" : "#eab308";
                  return g.jsxs("div", {
                    draggable: !0,
                    onDragStart: () => k(Se),
                    onDragOver: lt => {
                      lt.preventDefault(), W(Se);
                    },
                    onDragEnd: () => {
                      k(null), W(null);
                    },
                    onDrop: () => {
                      if (S === null || S === Se) return;
                      const lt = [...N],
                        [wt] = lt.splice(S, 1);
                      lt.splice(Se, 0, wt), C(lt), k(null), W(null);
                    },
                    className: `bg-white border-l-4 rounded p-3 flex items-start gap-2 select-none transition-all cursor-grab ${j === Se && S !== Se ? "ring-2 ring-emerald-400 ring-offset-1" : ""}`,
                    style: {
                      borderColor: Re,
                      opacity: S === Se ? .45 : 1
                    },
                    children: [g.jsx($V, {
                      size: 15,
                      className: "text-gray-300 mt-0.5 shrink-0"
                    }), g.jsxs("div", {
                      className: "flex-1 min-w-0",
                      children: [g.jsxs("div", {
                        className: "font-semibold text-sm text-gray-800",
                        children: [Se + 1, ". ", ie.location]
                      }), g.jsx("p", {
                        className: "text-xs text-gray-500 mt-0.5 line-clamp-2",
                        children: ie.description
                      })]
                    }), g.jsx("span", {
                      className: "shrink-0 text-xs font-bold px-2 py-0.5 rounded",
                      style: {
                        color: Re,
                        background: Re + "18"
                      },
                      children: ie.classification
                    })]
                  }, ie.id);
                })]
              })
            })]
          }), g.jsxs("div", {
            className: "safe-bottom p-4 sm:p-6 border-t bg-white flex gap-3",
            children: [g.jsx("button", {
              onClick: na,
              className: "flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded font-bold transition-colors",
              children: "Annuleren"
            }), g.jsx("button", {
              onClick: qa,
              className: "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded font-bold shadow transition-colors flex items-center justify-center gap-2",
              children: X ? g.jsxs(g.Fragment, {
                children: [g.jsx(gf, {
                  size: 18
                }), " Opslaan"]
              }) : g.jsxs(g.Fragment, {
                children: [g.jsx(mh, {
                  size: 18
                }), " Aanmaken"]
              })
            })]
          })]
        })
      }), r === "clients" && g.jsxs("div", {
        className: "flex flex-col lg:flex-row gap-3 lg:gap-0 lg:h-[calc(100vh-220px)] lg:min-h-[500px]",
        children: [g.jsxs("div", {
          className: "w-full lg:w-72 lg:shrink-0 flex flex-col border border-gray-200 bg-white rounded-xl lg:rounded-r-none shadow-sm overflow-hidden max-h-[55dvh] lg:max-h-none",
          children: [g.jsxs("div", {
            className: "p-3 border-b border-gray-100 space-y-2",
            children: [g.jsxs("div", {
              className: "relative",
              children: [g.jsx($c, {
                size: 14,
                className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              }), g.jsx("input", {
                type: "text",
                placeholder: "Zoek naam, plaats, contactpersoon...",
                className: "w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400",
                value: vt,
                onChange: ie => _r(ie.target.value)
              })]
            }), g.jsx("div", {
              className: "flex gap-1.5",
              children: g.jsxs("button", {
                onClick: () => pn(ie => !ie),
                className: "flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-emerald-700",
                children: [g.jsx(mh, {
                  size: 13
                }), " Nieuw"]
              })
            }), Ln && g.jsxs("div", {
              className: "space-y-1.5 pt-1 border-t border-gray-100",
              children: [g.jsxs("div", {
                className: "relative",
                children: [g.jsxs("div", {
                  className: "flex gap-1",
                  children: [g.jsx("input", {
                    type: "text",
                    placeholder: "Zoek bedrijf...",
                    className: "flex-1 border rounded p-1.5 text-sm",
                    value: kn,
                    onChange: ie => rt(ie.target.value),
                    onKeyDown: ie => ie.key === "Enter" && Yi(kn)
                  }), g.jsx("button", {
                    onClick: () => Yi(kn),
                    disabled: cr,
                    className: "px-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                    children: cr ? g.jsx(Ns, {
                      size: 12,
                      className: "animate-spin"
                    }) : g.jsx($c, {
                      size: 12
                    })
                  })]
                }), pt.length > 0 && g.jsxs("div", {
                  className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto",
                  children: [pt.map((ie, Se) => {
                    const Re = Fd(ie);
                    return g.jsxs("button", {
                      className: "w-full text-left px-2 py-1.5 hover:bg-blue-50 text-xs border-b last:border-0",
                      onClick: () => {
                        Sn(lt => ({
                          ...lt,
                          name: Re.name,
                          address: Re.address,
                          postal_code: Re.postalCode,
                          city: Re.city,
                          phone: Re.phone,
                          website: Re.website
                        })), Kt([]), rt("");
                      },
                      children: [g.jsx("div", {
                        className: "font-bold text-gray-800",
                        children: Re.name
                      }), g.jsx("div", {
                        className: "text-gray-500",
                        children: ie.formattedAddress
                      })]
                    }, Se);
                  }), g.jsx("button", {
                    className: "w-full text-center text-xs text-gray-400 py-1 hover:bg-gray-50",
                    onClick: () => Kt([]),
                    children: "Sluiten"
                  })]
                })]
              }), g.jsx("p", {
                className: "text-xs text-gray-400 text-center",
                children: "— of vul handmatig in —"
              }), g.jsx("input", {
                type: "text",
                placeholder: "Naam *",
                className: "w-full border rounded p-1.5 text-sm",
                value: Rn.name || "",
                onChange: ie => Sn(Se => ({
                  ...Se,
                  name: ie.target.value
                }))
              }), g.jsx("input", {
                type: "text",
                placeholder: "Adres (straat + nr)",
                className: "w-full border rounded p-1.5 text-sm",
                value: Rn.address || "",
                onChange: ie => Sn(Se => ({
                  ...Se,
                  address: ie.target.value
                }))
              }), g.jsxs("div", {
                className: "flex gap-1",
                children: [g.jsx("input", {
                  type: "text",
                  placeholder: "Postcode",
                  className: "w-1/3 border rounded p-1.5 text-sm",
                  value: Rn.postal_code || "",
                  onChange: ie => Sn(Se => ({
                    ...Se,
                    postal_code: ie.target.value
                  }))
                }), g.jsxs("div", {
                  className: "flex-1 relative",
                  children: [g.jsx("input", {
                    type: "text",
                    placeholder: "Plaats",
                    className: "w-full border rounded p-1.5 text-sm pr-7",
                    value: Rn.city || "",
                    onChange: ie => Sn(Se => ({
                      ...Se,
                      city: ie.target.value
                    }))
                  }), g.jsx("button", {
                    title: "Adres opzoeken via postcode (PDOK)",
                    className: "absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600",
                    onClick: async () => {
                      const ie = await Gv(Rn.postal_code || "", Rn.address || "");
                      ie ? Sn(Se => ({
                        ...Se,
                        city: ie.city
                      })) : alert("Adres niet gevonden. Controleer postcode en huisnummer.");
                    },
                    children: g.jsx(u0, {
                      size: 13
                    })
                  })]
                })]
              }), g.jsx("input", {
                type: "tel",
                placeholder: "Telefoon",
                className: "w-full border rounded p-1.5 text-sm",
                value: Rn.phone || "",
                onChange: ie => Sn(Se => ({
                  ...Se,
                  phone: ie.target.value
                }))
              }), g.jsx("input", {
                type: "email",
                placeholder: "E-mail",
                className: "w-full border rounded p-1.5 text-sm",
                value: Rn.email || "",
                onChange: ie => Sn(Se => ({
                  ...Se,
                  email: ie.target.value
                }))
              }), g.jsx("input", {
                type: "url",
                placeholder: "Website",
                className: "w-full border rounded p-1.5 text-sm",
                value: Rn.website || "",
                onChange: ie => Sn(Se => ({
                  ...Se,
                  website: ie.target.value
                }))
              }), g.jsxs("div", {
                className: "flex gap-1 pt-1",
                children: [g.jsx("button", {
                  onClick: Ki,
                  className: "flex-1 bg-emerald-600 text-white text-xs py-1.5 rounded font-bold hover:bg-emerald-700",
                  children: "Aanmaken"
                }), g.jsx("button", {
                  onClick: () => {
                    pn(!1), Sn({
                      name: "",
                      contacts: []
                    }), rt(""), Kt([]);
                  },
                  className: "flex-1 bg-gray-100 text-gray-600 text-xs py-1.5 rounded hover:bg-gray-200",
                  children: "Annuleren"
                })]
              })]
            })]
          }), g.jsxs("div", {
            className: "flex-1 overflow-y-auto",
            children: [Ot.filter(ie => {
              if (!vt) return !0;
              const Se = vt.toLowerCase();
              return ie.name.toLowerCase().includes(Se) || (ie.city || "").toLowerCase().includes(Se) || (ie.address || "").toLowerCase().includes(Se) || (ie.postal_code || "").toLowerCase().includes(Se) || (ie.email || "").toLowerCase().includes(Se) || (ie.phone || "").toLowerCase().includes(Se) || ie.contacts.some(Re => Re.name.toLowerCase().includes(Se) || (Re.role || "").toLowerCase().includes(Se) || (Re.email || "").toLowerCase().includes(Se));
            }).map(ie => g.jsxs("button", {
              onClick: () => ii(ie),
              className: `w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${$e?.id === ie.id ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""}`,
              children: [g.jsx("div", {
                className: "font-semibold text-sm text-gray-900 truncate",
                children: ie.name
              }), ie.city && g.jsxs("div", {
                className: "text-xs text-gray-400 flex items-center gap-1 mt-0.5",
                children: [g.jsx(u0, {
                  size: 10
                }), ie.city]
              })]
            }, ie.id)), Ot.length === 0 && g.jsxs("div", {
              className: "p-6 text-center text-gray-400 text-sm",
              children: [g.jsx(ip, {
                size: 32,
                className: "mx-auto mb-2 text-gray-300"
              }), 'Nog geen klanten. Klik "Nieuw" om er een toe te voegen.']
            })]
          })]
        }), g.jsx("div", {
          className: "min-h-[480px] flex-1 bg-white rounded-xl lg:rounded-l-none shadow-sm border border-gray-200 overflow-hidden flex flex-col",
          children: $e ? g.jsxs(g.Fragment, {
            children: [g.jsxs("div", {
              className: "px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3",
              children: [g.jsxs("div", {
                children: [g.jsx("h2", {
                  className: "text-xl font-bold text-gray-900",
                  children: $e.name
                }), ($e.city || $e.address) && g.jsxs("p", {
                  className: "text-sm text-gray-400 flex items-center gap-1 mt-0.5",
                  children: [g.jsx(u0, {
                    size: 12
                  }), [$e.address, $e.postal_code, $e.city].filter(Boolean).join(" ")]
                })]
              }), g.jsxs("div", {
                className: "flex gap-2 shrink-0",
                children: [g.jsxs("button", {
                  onClick: () => {
                    en(!0), dn({
                      ...$e
                    }), pr("gegevens");
                  },
                  className: "flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-medium",
                  children: [g.jsx(gf, {
                    size: 13
                  }), " Bewerken"]
                }), g.jsxs("button", {
                  onClick: _s,
                  className: "flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium",
                  children: [g.jsx(mf, {
                    size: 13
                  }), " Verwijderen"]
                })]
              })]
            }), g.jsx("div", {
              className: "flex overflow-x-auto border-b border-gray-100 px-2 sm:px-4",
              children: [["gegevens", g.jsx(ip, {
                size: 14
              }), "Gegevens"], ["contacten", g.jsx(qCe, {
                size: 14
              }), "Contacten"], ["projecten", g.jsx(LM, {
                size: 14
              }), "Projecten"], ["notities", g.jsx(ZEe, {
                size: 14
              }), "Notities"]].map(([ie, Se, Re]) => g.jsxs("button", {
                onClick: () => pr(ie),
                className: `flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${Ur === ie ? "text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`,
                children: [Se, Re]
              }, ie))
            }), g.jsxs("div", {
              className: "flex-1 overflow-y-auto p-4 sm:p-6",
              children: [Ur === "gegevens" && (Yr ? g.jsxs("div", {
                className: "max-w-lg space-y-3",
                children: [g.jsx("h3", {
                  className: "font-bold text-gray-700 mb-3",
                  children: "Gegevens bewerken"
                }), [["name", "Naam *", "text"], ["address", "Adres", "text"], ["postal_code", "Postcode", "text"], ["city", "Stad", "text"], ["phone", "Telefoon", "tel"], ["email", "E-mail", "email"], ["website", "Website", "url"]].map(([ie, Se, Re]) => g.jsxs("div", {
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: Se
                  }), g.jsx("input", {
                    type: Re,
                    className: "w-full border rounded p-2 text-sm",
                    value: Zr[ie] || "",
                    onChange: lt => dn(wt => ({
                      ...wt,
                      [ie]: lt.target.value
                    }))
                  })]
                }, ie)), g.jsxs("div", {
                  className: "flex gap-2 pt-2",
                  children: [g.jsx("button", {
                    onClick: () => ra(Zr),
                    className: "bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700",
                    children: "Opslaan"
                  }), g.jsx("button", {
                    onClick: () => en(!1),
                    className: "bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200",
                    children: "Annuleren"
                  })]
                })]
              }) : g.jsx("div", {
                className: "max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4",
                children: [["Naam", $e.name], ["Adres", $e.address], ["Postcode", $e.postal_code], ["Stad", $e.city], ["Telefoon", $e.phone], ["E-mail", $e.email], ["Website", $e.website]].map(([ie, Se]) => g.jsxs("div", {
                  children: [g.jsx("div", {
                    className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                    children: ie
                  }), g.jsx("div", {
                    className: "text-sm text-gray-800",
                    children: Se ? ie === "Website" ? g.jsxs("a", {
                      href: Se,
                      target: "_blank",
                      rel: "noreferrer",
                      className: "text-emerald-600 hover:underline flex items-center gap-1",
                      children: [g.jsx(gEe, {
                        size: 12
                      }), Se]
                    }) : ie === "E-mail" ? g.jsx("a", {
                      href: `mailto:${Se}`,
                      className: "text-emerald-600 hover:underline",
                      children: Se
                    }) : Se : g.jsx("span", {
                      className: "text-gray-300 italic",
                      children: "—"
                    })
                  })]
                }, ie))
              })), Ur === "contacten" && g.jsxs("div", {
                className: "max-w-2xl",
                children: [$e.contacts.length > 0 && g.jsxs("table", {
                  className: "w-full text-sm mb-4",
                  children: [g.jsx("thead", {
                    children: g.jsxs("tr", {
                      className: "text-xs font-bold text-gray-400 uppercase border-b",
                      children: [g.jsx("th", {
                        className: "py-2 pr-3 text-left",
                        children: "Naam"
                      }), g.jsx("th", {
                        className: "py-2 pr-3 text-left",
                        children: "Rol"
                      }), g.jsx("th", {
                        className: "py-2 pr-3 text-left",
                        children: "Telefoon"
                      }), g.jsx("th", {
                        className: "py-2 pr-3 text-left",
                        children: "E-mail"
                      }), g.jsx("th", {
                        className: "py-2 w-8"
                      })]
                    })
                  }), g.jsx("tbody", {
                    children: $e.contacts.map((ie, Se) => g.jsxs("tr", {
                      className: "border-b border-gray-50 hover:bg-gray-50",
                      children: [g.jsx("td", {
                        className: "py-1.5 pr-2",
                        children: g.jsx("input", {
                          className: "border rounded px-2 py-1 text-sm w-full",
                          value: ie.name,
                          onChange: Re => {
                            const lt = [...$e.contacts];
                            lt[Se] = {
                              ...lt[Se],
                              name: Re.target.value
                            }, at({
                              ...$e,
                              contacts: lt
                            });
                          },
                          onBlur: () => ci($e.contacts)
                        })
                      }), g.jsx("td", {
                        className: "py-1.5 pr-2",
                        children: g.jsx("input", {
                          className: "border rounded px-2 py-1 text-sm w-full",
                          value: ie.role,
                          placeholder: "Bijv. Directeur",
                          onChange: Re => {
                            const lt = [...$e.contacts];
                            lt[Se] = {
                              ...lt[Se],
                              role: Re.target.value
                            }, at({
                              ...$e,
                              contacts: lt
                            });
                          },
                          onBlur: () => ci($e.contacts)
                        })
                      }), g.jsx("td", {
                        className: "py-1.5 pr-2",
                        children: g.jsx("input", {
                          className: "border rounded px-2 py-1 text-sm w-full",
                          value: ie.phone || "",
                          onChange: Re => {
                            const lt = [...$e.contacts];
                            lt[Se] = {
                              ...lt[Se],
                              phone: Re.target.value
                            }, at({
                              ...$e,
                              contacts: lt
                            });
                          },
                          onBlur: () => ci($e.contacts)
                        })
                      }), g.jsx("td", {
                        className: "py-1.5 pr-2",
                        children: g.jsx("input", {
                          className: "border rounded px-2 py-1 text-sm w-full",
                          value: ie.email || "",
                          onChange: Re => {
                            const lt = [...$e.contacts];
                            lt[Se] = {
                              ...lt[Se],
                              email: Re.target.value
                            }, at({
                              ...$e,
                              contacts: lt
                            });
                          },
                          onBlur: () => ci($e.contacts)
                        })
                      }), g.jsx("td", {
                        className: "py-1.5",
                        children: g.jsx("button", {
                          onClick: () => ci($e.contacts.filter((Re, lt) => lt !== Se)),
                          className: "text-red-400 hover:text-red-600",
                          children: g.jsx(Kc, {
                            size: 15
                          })
                        })
                      })]
                    }, ie.id))
                  })]
                }), $e.contacts.length === 0 && g.jsx("p", {
                  className: "text-gray-400 text-sm mb-4 italic",
                  children: "Nog geen contactpersonen."
                }), g.jsxs("button", {
                  onClick: () => {
                    const ie = {
                      id: crypto.randomUUID(),
                      name: "",
                      role: "",
                      phone: "",
                      email: ""
                    };
                    ci([...$e.contacts, ie]);
                  },
                  className: "flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-50",
                  children: [g.jsx(mh, {
                    size: 14
                  }), " Contactpersoon toevoegen"]
                })]
              }), Ur === "projecten" && g.jsx("div", {
                className: "space-y-3",
                children: Wr.length === 0 ? g.jsx("p", {
                  className: "text-gray-400 text-sm italic",
                  children: "Geen inspecties gevonden voor deze klant."
                }) : Wr.map(ie => {
                  const Se = ie.report_data?.meta || {},
                    Re = ie.report_data?.defects || [],
                    lt = ie.status === "ter_controle" || ie.status === "herstel_afgerond",
                    wt = [Se.projectAddress, Se.projectPostalCode, Se.projectCity].filter(Boolean).join(" "),
                    rr = Tn.has(ie.id),
                    er = () => _n(xr => {
                      const Sr = new Set(xr);
                      return Sr.has(ie.id) ? Sr.delete(ie.id) : Sr.add(ie.id), Sr;
                    });
                  return g.jsxs("div", {
                    className: "border border-gray-200 rounded-lg overflow-hidden",
                    children: [g.jsxs("div", {
                      className: "flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer select-none",
                      onClick: er,
                      children: [g.jsxs("div", {
                        className: "flex items-center gap-2 flex-wrap",
                        children: [g.jsxs("span", {
                          className: "font-mono text-xs bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200 font-bold flex items-center gap-0.5",
                          children: [g.jsx(PM, {
                            size: 10
                          }), ie.inspection_number || "CONCEPT"]
                        }), (!ie.status || ie.status === "new") && g.jsx("span", {
                          className: "ig-semantic-status bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold",
                          children: "Nieuw"
                        }), ie.status === "in_progress" && g.jsx("span", {
                          className: "ig-semantic-status bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-bold",
                          children: "Bezig"
                        }), ie.status === "review_ready" && g.jsx("span", {
                          className: "ig-semantic-status bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-bold",
                          children: "Review"
                        }), ie.status === "completed" && g.jsx("span", {
                          className: "ig-semantic-status bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-bold",
                          children: "Klaar"
                        }), ie.status === "herstel_wacht" && g.jsx("span", {
                          className: "ig-semantic-status bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold",
                          children: "Wacht op Herstel"
                        }), ie.status === "ter_controle" && g.jsx("span", {
                          className: "ig-semantic-status bg-violet-100 text-violet-800 text-xs px-2 py-0.5 rounded font-bold",
                          children: "Ter Controle"
                        }), ie.status === "herstel_afgerond" && g.jsx("span", {
                          className: "ig-semantic-status bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded font-bold",
                          children: "Herstel Afgerond"
                        })]
                      }), g.jsxs("div", {
                        className: "flex items-center gap-1.5 shrink-0",
                        onClick: xr => xr.stopPropagation(),
                        children: [g.jsxs("button", {
                          onClick: () => {
                            y.find(xr => xr.id === ie.id) || b(xr => [...xr, ie]), va(ie);
                          },
                          className: "flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-100 font-medium border border-blue-200",
                          title: "Inspectie openen en bewerken",
                          children: [g.jsx(gf, {
                            size: 12
                          }), " Openen"]
                        }), g.jsxs("button", {
                          onClick: () => po(ie),
                          disabled: V,
                          className: "flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-100 font-medium border border-red-200 disabled:opacity-50",
                          title: "PDF Origineel",
                          children: [g.jsx(Mu, {
                            size: 12
                          }), " PDF"]
                        }), lt && g.jsxs("button", {
                          onClick: () => go(ie),
                          disabled: V,
                          className: "flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg hover:bg-violet-100 font-medium border border-violet-200 disabled:opacity-50",
                          title: "PDF Herstelrapport",
                          children: [g.jsx(Mu, {
                            size: 12
                          }), " PDF Herstel"]
                        }), rr ? g.jsx(LCe, {
                          size: 16,
                          className: "text-gray-400 ml-1"
                        }) : g.jsx(DCe, {
                          size: 16,
                          className: "text-gray-400 ml-1"
                        })]
                      })]
                    }), rr && g.jsxs("div", {
                      className: "px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm",
                      children: [Se.projectLocation && g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Projectlocatie"
                        }), g.jsx("div", {
                          className: "text-gray-800",
                          children: Se.projectLocation
                        })]
                      }), wt && g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Adres project"
                        }), g.jsx("div", {
                          className: "text-gray-800",
                          children: wt
                        })]
                      }), g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Startdatum"
                        }), g.jsx("div", {
                          className: "text-gray-800",
                          children: Du(Se.date) || "—"
                        })]
                      }), g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Afgerond"
                        }), g.jsx("div", {
                          className: "text-gray-800",
                          children: Se.finalizedDate ? Du(Se.finalizedDate) : g.jsx("span", {
                            className: "text-gray-300 italic",
                            children: "—"
                          })
                        })]
                      }), g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Inspecteur"
                        }), g.jsxs("div", {
                          className: "text-gray-800 flex items-center gap-1",
                          children: [g.jsx(Vm, {
                            size: 12,
                            className: "text-gray-400"
                          }), Se.inspectorName || "—"]
                        })]
                      }), g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Gebreken"
                        }), g.jsx("div", {
                          className: "text-gray-800",
                          children: Re.length > 0 ? `${Re.length} gebrek${Re.length !== 1 ? "en" : ""}` : g.jsx("span", {
                            className: "text-gray-300 italic",
                            children: "Geen"
                          })
                        })]
                      }), Se.projectContactPerson && g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Contactpersoon project"
                        }), g.jsxs("div", {
                          className: "text-gray-800",
                          children: [Se.projectContactPerson, Se.projectPhone ? g.jsxs("span", {
                            className: "text-gray-400 ml-1",
                            children: ["· ", Se.projectPhone]
                          }) : ""]
                        })]
                      }), Se.installationResponsible && g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Installatieverantwoordelijke"
                        }), g.jsx("div", {
                          className: "text-gray-800",
                          children: Se.installationResponsible
                        })]
                      }), Se.scopeType && g.jsxs("div", {
                        children: [g.jsx("div", {
                          className: "text-xs font-bold text-gray-400 uppercase mb-0.5",
                          children: "Scope"
                        }), g.jsxs("div", {
                          className: "text-gray-800",
                          children: ["NEN 3140 art. ", Se.scopeType]
                        })]
                      })]
                    })]
                  }, ie.id);
                })
              }), Ur === "notities" && g.jsxs("div", {
                className: "max-w-2xl",
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-400 uppercase mb-2",
                  children: "Aantekeningen"
                }), g.jsx("textarea", {
                  className: "w-full border rounded-lg p-3 text-sm min-h-48 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-y",
                  placeholder: "Voeg aantekeningen, afspraken of bijzonderheden toe...",
                  defaultValue: $e.notes || "",
                  onBlur: ie => {
                    ie.target.value !== ($e.notes || "") && ra({
                      notes: ie.target.value
                    });
                  }
                }, $e.id)]
              })]
            })]
          }) : g.jsxs("div", {
            className: "flex-1 flex flex-col items-center justify-center text-gray-400",
            children: [g.jsx(ip, {
              size: 48,
              className: "mb-3 text-gray-200"
            }), g.jsx("p", {
              className: "text-sm",
              children: "Selecteer een klant uit de lijst"
            })]
          })
        })]
      }), r === "projecten" && g.jsxs(g.Fragment, {
        children: [g.jsxs("div", {
          className: "bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-between items-center gap-4",
          children: [g.jsxs("div", {
            className: "relative w-full md:w-1/2",
            children: [g.jsx($c, {
              className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
              size: 20
            }), g.jsx("input", {
              type: "text",
              placeholder: "Zoek op klant, locatie, plaats, inspecteur...",
              className: "w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500",
              value: yt,
              onChange: ie => {
                zt(ie.target.value), Fe(1);
              }
            })]
          }), g.jsxs("div", {
            className: "flex items-center gap-4 text-sm text-gray-500",
            children: [g.jsxs("span", {
              children: ["Pagina ", tn, " van ", Math.ceil(qe / up) || 1, " (", qe, " projecten)"]
            }), g.jsxs("div", {
              className: "flex gap-1",
              children: [g.jsx("button", {
                onClick: () => Fe(ie => Math.max(1, ie - 1)),
                disabled: tn === 1,
                className: "p-2 border rounded hover:bg-gray-100 disabled:opacity-50",
                children: g.jsx(b5, {
                  size: 20
                })
              }), g.jsx("button", {
                onClick: () => Fe(ie => Math.min(Math.ceil(qe / up), ie + 1)),
                disabled: tn >= Math.ceil(qe / up),
                className: "p-2 border rounded hover:bg-gray-100 disabled:opacity-50",
                children: g.jsx(y5, {
                  size: 20
                })
              })]
            })]
          })]
        }), g.jsx("div", {
          className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto",
          children: g.jsxs("table", {
            className: "ig-projects-table min-w-[850px] w-full",
            children: [g.jsx("thead", {
              className: "bg-gray-50 border-b",
              children: g.jsxs("tr", {
                children: [g.jsx(di, {
                  label: "Inspectie ID",
                  sortKey: "proj_number",
                  width: "w-32"
                }), g.jsx(di, {
                  label: "Klant",
                  sortKey: "client_name"
                }), g.jsx(di, {
                  label: "Projectlocatie",
                  sortKey: "proj_location"
                }), g.jsx(di, {
                  label: "Plaats",
                  sortKey: "proj_city"
                }), g.jsx(di, {
                  label: "Status",
                  sortKey: "status",
                  width: "w-36"
                }), g.jsx(di, {
                  label: "Start",
                  sortKey: "proj_date_start",
                  width: "w-28"
                }), g.jsx(di, {
                  label: "Afgerond",
                  sortKey: "proj_date_finalized",
                  width: "w-28"
                }), g.jsx(di, {
                  label: "Herinspectie",
                  sortKey: "next_inspection_date",
                  width: "w-32"
                }), g.jsx(di, {
                  label: "Inspecteur",
                  sortKey: "proj_inspector",
                  width: "w-36"
                }), g.jsx("th", {
                  className: "px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-28",
                  children: "Acties"
                })]
              })
            }), g.jsx("tbody", {
              className: "divide-y divide-gray-100",
              children: gn.length === 0 ? g.jsx("tr", {
                children: g.jsx("td", {
                  colSpan: 10,
                  className: "text-center py-12 text-gray-400",
                  children: "Geen projecten gevonden"
                })
              }) : gn.map(ie => {
                const Se = ie.report_data?.meta || {},
                  Re = ie.status === "ter_controle" || ie.status === "herstel_afgerond";
                return g.jsxs("tr", {
                  className: "hover:bg-gray-50 transition-colors",
                  children: [g.jsx("td", {
                    className: "px-4 py-3",
                    children: g.jsx("span", {
                      className: "font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border",
                      children: ie.inspection_number || "—"
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3 font-semibold text-gray-800 text-sm",
                    children: ie.client_name || "—"
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm text-gray-600",
                    children: Se.projectLocation || "—"
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm text-gray-600",
                    children: g.jsxs("div", {
                      className: "flex items-center gap-1",
                      children: [g.jsx(u0, {
                        size: 12,
                        className: "text-gray-400"
                      }), Se.projectCity || "—"]
                    })
                  }), g.jsxs("td", {
                    className: "px-4 py-3",
                    children: [(!ie.status || ie.status === "new") && g.jsx("span", {
                      className: "ig-semantic-status bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold",
                      children: "Nieuw"
                    }), ie.status === "in_progress" && g.jsx("span", {
                      className: "ig-semantic-status bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded font-bold",
                      children: "Bezig"
                    }), ie.status === "review_ready" && g.jsx("span", {
                      className: "ig-semantic-status bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-bold",
                      children: "Review"
                    }), ie.status === "completed" && g.jsx("span", {
                      className: "ig-semantic-status bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-bold",
                      children: "Klaar"
                    }), ie.status === "herstel_wacht" && g.jsx("span", {
                      className: "ig-semantic-status bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold",
                      children: "Wacht op Herstel"
                    }), ie.status === "ter_controle" && g.jsx("span", {
                      className: "ig-semantic-status bg-violet-100 text-violet-800 text-xs px-2 py-0.5 rounded font-bold",
                      children: "Ter Controle"
                    }), ie.status === "herstel_afgerond" && g.jsx("span", {
                      className: "ig-semantic-status bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded font-bold",
                      children: "Herstel Afgerond"
                    })]
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm text-gray-600",
                    children: Du(Se.date) || "—"
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm text-gray-600",
                    children: Du(Se.finalizedDate) || "—"
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm",
                    children: Se.nextInspectionDate ? g.jsx("span", {
                      className: _i(Se.nextInspectionDate),
                      children: Du(Se.nextInspectionDate)
                    }) : g.jsx("span", {
                      className: "text-gray-400",
                      children: "—"
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3 text-sm text-gray-600",
                    children: g.jsxs("div", {
                      className: "flex items-center gap-1",
                      children: [g.jsx(Vm, {
                        size: 12,
                        className: "text-gray-400"
                      }), Se.inspectorName || "—"]
                    })
                  }), g.jsx("td", {
                    className: "px-4 py-3",
                    children: g.jsxs("div", {
                      className: "flex items-center gap-1",
                      children: [g.jsxs("button", {
                        onClick: () => po(ie),
                        disabled: V,
                        className: "flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100 font-medium border border-red-200 disabled:opacity-50",
                        title: "PDF Origineel",
                        children: [g.jsx(Mu, {
                          size: 12
                        }), " PDF"]
                      }), Re && g.jsxs("button", {
                        onClick: () => go(ie),
                        disabled: V,
                        className: "flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded hover:bg-violet-100 font-medium border border-violet-200 disabled:opacity-50",
                        title: "PDF Herstel",
                        children: [g.jsx(Mu, {
                          size: 12
                        }), " Herstel"]
                      })]
                    })
                  })]
                }, ie.id);
              })
            })]
          })
        })]
      }), _t && g.jsx("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50",
        children: g.jsxs("div", {
          className: "bg-white rounded-lg shadow-xl w-full max-w-sm p-6",
          children: [g.jsx("h2", {
            className: "text-lg font-bold mb-4",
            children: "Nieuwe Gebruiker"
          }), g.jsxs("div", {
            className: "space-y-2 mb-4 max-h-[60vh] overflow-y-auto pr-1",
            children: [g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "text",
              placeholder: "Volledige Naam",
              value: Mt.full_name,
              onChange: ie => Rr({
                ...Mt,
                full_name: ie.target.value
              })
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "text",
              placeholder: "Telefoonnummer",
              value: Mt.phone,
              onChange: ie => Rr({
                ...Mt,
                phone: ie.target.value
              })
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "email",
              placeholder: "Contact Email (optioneel)",
              value: Mt.contact_email,
              onChange: ie => Rr({
                ...Mt,
                contact_email: ie.target.value
              })
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "text",
              placeholder: "SCIOS Nummer (optioneel)",
              value: Mt.scios_nr,
              onChange: ie => Rr({
                ...Mt,
                scios_nr: ie.target.value
              })
            }), g.jsxs("select", {
              className: "w-full border rounded p-2 bg-white",
              value: Mt.role,
              onChange: ie => Rr({
                ...Mt,
                role: ie.target.value
              }),
              children: [g.jsx("option", {
                value: "inspector",
                children: "Inspecteur"
              }), g.jsx("option", {
                value: "admin",
                children: "Beheerder (Admin)"
              }), g.jsx("option", {
                value: "installer",
                children: "Installateur"
              })]
            }), g.jsx("hr", {
              className: "my-2 border-gray-200"
            }), g.jsx("p", {
              className: "text-xs font-bold text-gray-400 uppercase tracking-wide",
              children: "Bedrijfsgegevens (optioneel)"
            }), g.jsxs("div", {
              className: "relative",
              children: [g.jsxs("div", {
                className: "flex gap-1.5",
                children: [g.jsx("input", {
                  type: "text",
                  placeholder: "Zoek bedrijf...",
                  className: "flex-1 border rounded p-2 text-sm bg-white",
                  value: kn,
                  onChange: ie => rt(ie.target.value),
                  onKeyDown: ie => ie.key === "Enter" && Yi(kn)
                }), g.jsx("button", {
                  onClick: () => Yi(kn),
                  disabled: cr,
                  className: "px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                  children: cr ? g.jsx(Ns, {
                    size: 14,
                    className: "animate-spin"
                  }) : g.jsx($c, {
                    size: 14
                  })
                })]
              }), pt.length > 0 && g.jsxs("div", {
                className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto",
                children: [pt.map((ie, Se) => {
                  const Re = Fd(ie);
                  return g.jsxs("button", {
                    className: "w-full text-left px-2 py-1.5 hover:bg-blue-50 text-sm border-b last:border-0",
                    onClick: () => {
                      Rr(lt => ({
                        ...lt,
                        company_name: Re.name,
                        company_address: Re.address,
                        company_postal_code: Re.postalCode,
                        company_city: Re.city,
                        company_phone: Re.phone,
                        company_email: lt.company_email
                      })), Kt([]), rt("");
                    },
                    children: [g.jsx("div", {
                      className: "font-bold text-gray-800",
                      children: Re.name
                    }), g.jsx("div", {
                      className: "text-xs text-gray-500",
                      children: ie.formattedAddress
                    })]
                  }, Se);
                }), g.jsx("button", {
                  className: "w-full text-center text-xs text-gray-400 py-1 hover:bg-gray-50",
                  onClick: () => Kt([]),
                  children: "Sluiten"
                })]
              })]
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "text",
              placeholder: "Bedrijfsnaam",
              value: Mt.company_name,
              onChange: ie => Rr({
                ...Mt,
                company_name: ie.target.value
              })
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "text",
              placeholder: "Adres",
              value: Mt.company_address,
              onChange: ie => Rr({
                ...Mt,
                company_address: ie.target.value
              })
            }), g.jsxs("div", {
              className: "flex gap-2",
              children: [g.jsx("input", {
                className: "w-1/3 border rounded p-2",
                type: "text",
                placeholder: "Postcode",
                value: Mt.company_postal_code,
                onChange: ie => Rr({
                  ...Mt,
                  company_postal_code: ie.target.value
                })
              }), g.jsx("input", {
                className: "flex-1 border rounded p-2",
                type: "text",
                placeholder: "Plaats",
                value: Mt.company_city,
                onChange: ie => Rr({
                  ...Mt,
                  company_city: ie.target.value
                })
              })]
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "tel",
              placeholder: "Bedrijfstelefoon",
              value: Mt.company_phone,
              onChange: ie => Rr({
                ...Mt,
                company_phone: ie.target.value
              })
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "email",
              placeholder: "Bedrijfs-email",
              value: Mt.company_email,
              onChange: ie => Rr({
                ...Mt,
                company_email: ie.target.value
              })
            }), g.jsx("hr", {
              className: "my-2 border-gray-200"
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "email",
              placeholder: "Login Email (Verplicht)",
              value: Mt.email,
              onChange: ie => Rr({
                ...Mt,
                email: ie.target.value
              })
            }), g.jsx("input", {
              className: "w-full border rounded p-2",
              type: "password",
              placeholder: "Wachtwoord (Verplicht)",
              value: Mt.password,
              onChange: ie => Rr({
                ...Mt,
                password: ie.target.value
              })
            })]
          }), g.jsxs("div", {
            className: "flex gap-2",
            children: [g.jsx("button", {
              onClick: () => lr(!1),
              className: "flex-1 bg-gray-100 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-200",
              children: "Annuleren"
            }), g.jsx("button", {
              onClick: Io,
              className: "flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md",
              children: "Toevoegen"
            })]
          })]
        })
      }), Ne && g.jsx("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50",
        children: g.jsxs("div", {
          className: "bg-white rounded-lg shadow-xl w-full max-w-sm p-6",
          children: [g.jsx("h2", {
            className: "text-lg font-bold mb-4",
            children: "Wachtwoord Reset"
          }), g.jsx("input", {
            className: "w-full border rounded p-2 mb-4",
            type: "text",
            placeholder: "Nieuw Wachtwoord",
            value: _e,
            onChange: ie => Ae(ie.target.value)
          }), g.jsxs("div", {
            className: "flex gap-2",
            children: [g.jsx("button", {
              onClick: () => ze(!1),
              className: "flex-1 bg-gray-200 py-2 rounded",
              children: "Annuleren"
            }), g.jsx("button", {
              onClick: za,
              className: "flex-1 bg-orange-500 text-white py-2 rounded",
              children: "Resetten"
            })]
          })]
        })
      })]
    })
  });
}

export { AdminDashboard, PlanningWorkspace }

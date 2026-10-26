// @ts-nocheck
/* Recovered module: inspector-workspaces. Generated from the verified 2026-10-26 production runtime. */
import { $V, $c, Av, BS, Cx, DT, Eg, Fd, Fg, Gv, HEe, IS, Kc, LEe, Mu, NS, Ng, Ns, OM, QEe, Rm, SS, TEe, UI, Vm, YEe, Yee, ZCe, Ze, ac, b5, d2, e1, f2, g, g3e, gf, h1, hr, k1, kS, lC, m3e, mf, mv, rEe, sd, t1, u0, u2, uC, x5, y5 } from './vendor-core'

function InspectorWorkspace({
  userRole: r,
  onLogout: e,
  onOpenAdmin: t,
  onOpenPlanning: n
}) {
  const [i, a] = Ze.useState(!1),
    [s, o] = Ze.useState(!1),
    [c, l] = Ze.useState("persoonlijk"),
    [u, d] = Ze.useState({
      full_name: "",
      scios_nr: "",
      phone: "",
      contact_email: "",
      company_name: "",
      company_address: "",
      company_postal_code: "",
      company_city: "",
      company_phone: "",
      company_email: "",
      signature_url: "",
      home_address: "",
      home_postal_code: "",
      home_city: "",
      instruments: [],
      linked_instruments: [],
      instrument_usage: {}
    }),
    [f, h] = Ze.useState(""),
    m = Ze.useRef(null),
    [v, A] = Ze.useState({
      name: "",
      serialNumber: "",
      calibrationDate: ""
    }),
    y = ie => {
      if (!ie || ie === "Indicatief" || ie === "n.v.t.") return "ok";
      const Se = new Date(ie);
      if (isNaN(Se.getTime())) return "unknown";
      const Re = Math.ceil((Se.getTime() - new Date().getTime()) / (1e3 * 60 * 60 * 24));
      return Re < 0 ? "expired" : Re <= 30 ? "warning" : "ok";
    },
    {
      meta: b,
      defects: w,
      measurements: E,
      customLibrary: B,
      setMeta: P,
      setUsageFunction: Q,
      setMeasurements: M,
      addDefect: H,
      updateDefect: G,
      removeDefect: X,
      reorderDefects: q,
      addInstrument: D,
      removeInstrument: $,
      importState: N,
      mergeState: C,
      resetState: S,
      setCustomLibrary: k,
      addBoard: j,
      updateBoard: W,
      removeBoard: V
    } = sd(),
    [K, oe] = Ze.useState("setup"),
    [ue, xe] = Ze.useState(!1),
    [re, ve] = Ze.useState(""),
    [Z, Y] = Ze.useState([]),
    [ce, be] = Ze.useState(!1),
    De = async ie => {
      be(!0), Y(await Av(ie)), be(!1);
    },
    [Ne, ze] = Ze.useState(""),
    [Je, Me] = Ze.useState([]),
    [_e, Ae] = Ze.useState(!1),
    Ue = async ie => {
      Ae(!0), Me(await Av(ie)), Ae(!1);
    },
    [tt, Ge] = Ze.useState(""),
    [et, ct] = Ze.useState([]),
    [ht, Tt] = Ze.useState(!1),
    Vt = async ie => {
      Tt(!0), ct(await Av(ie)), Tt(!1);
    },
    [Ft, Ut] = Ze.useState([]),
    [mr, wr] = Ze.useState({}),
    [He, It] = Ze.useState([]),
    [Ct, mt] = Ze.useState([]),
    [Ye, bt] = Ze.useState([]),
    ke = Ze.useMemo(() => {
      const ie = B && B.length > 0 ? B : UI,
        Se = b.sciosScope || "10";
      return ie.filter(Re => !Re.scope || Re.scope.includes(Se));
    }, [B, b.sciosScope]),
    Qt = Ct.map(ie => ({
      id: String(ie.id),
      name: ie.label,
      serialNumber: ie.data?.serialNumber || "",
      calibrationDate: ie.data?.calibrationDate || ""
    })),
    ir = (ie, Se, Re) => {
      const lt = new Set(Se.map(String)),
        wt = Sr => Re[Sr.id] ?? 0,
        rr = ie.filter(Sr => lt.has(Sr.id)).sort((Sr, an) => wt(an) - wt(Sr) || Sr.name.localeCompare(an.name, "nl")),
        er = ie.filter(Sr => !lt.has(Sr.id) && wt(Sr) > 0).sort((Sr, an) => wt(an) - wt(Sr)),
        xr = ie.filter(Sr => !lt.has(Sr.id) && wt(Sr) === 0).sort((Sr, an) => Sr.name.localeCompare(an.name, "nl"));
      return {
        tier1: rr,
        tier2: er,
        tier3: xr
      };
    },
    {
      tier1: ge,
      tier2: xt,
      tier3: Nt
    } = ir(Qt, u.linked_instruments ?? [], u.instrument_usage ?? {}),
    Pe = Ze.useMemo(() => {
      const ie = Object.entries(mr).sort((wt, rr) => rr[1] - wt[1]),
        Se = new Set(ie.map(([wt]) => wt.toLowerCase())),
        Re = ie.map(([wt]) => ({
          name: wt
        })),
        lt = Ft.filter(wt => !Se.has(wt.name.toLowerCase())).map(wt => ({
          name: wt.name,
          address: wt.address,
          postalCode: wt.postal_code,
          city: wt.city,
          phone: wt.phone,
          email: wt.email
        }));
      return [...Re, ...lt];
    }, [mr, Ft]),
    [dt, _t] = Ze.useState(!1),
    [lr, dr] = Ze.useState([]),
    [yr, We] = Ze.useState(!1),
    [Wt, Ot] = Ze.useState(null),
    [St, $e] = Ze.useState(""),
    [at, vt] = Ze.useState({
      key: "date",
      dir: "asc"
    }),
    [_r, Ur] = Ze.useState(!1),
    [pr, Wr] = Ze.useState(null),
    [Nr, Yr] = Ze.useState(""),
    [en, Zr] = Ze.useState(null),
    [dn, Ln] = Ze.useState(null),
    [pn, Rn] = Ze.useState(""),
    [Sn, kn] = Ze.useState(""),
    [rt, pt] = Ze.useState(""),
    [Kt, cr] = Ze.useState(!1),
    [nn, Lr] = Ze.useState(""),
    [Or, Tn] = Ze.useState(!1),
    [_n, gn] = Ze.useState(""),
    [fn, tn] = Ze.useState(""),
    [Fe, qe] = Ze.useState("Yellow"),
    [ut, yt] = Ze.useState(null),
    [zt, Bt] = Ze.useState(null),
    [Ar, Mt] = Ze.useState(!1),
    [Rr, gr] = Ze.useState(""),
    [jr, Dr] = Ze.useState(!1),
    [En, bn] = Ze.useState(""),
    [Mn, Fn] = Ze.useState(""),
    [zn, ei] = Ze.useState(""),
    [di, Vi] = Ze.useState(""),
    [Ui, Ti] = Ze.useState(""),
    [is, la] = Ze.useState(!1),
    [Li, za] = Ze.useState(null),
    [vi, Yn] = Ze.useState({
      name: "",
      serialNumber: "",
      calibrationDate: ""
    }),
    [Bn, ki] = Ze.useState(!1),
    [ii, Yi] = Ze.useState(!1),
    ma = Ze.useRef(null),
    ka = Ze.useRef(null),
    Ki = Ze.useRef(null),
    ra = Rm.indexOf(K);
  Ze.useEffect(() => {
    (async () => {
      const {
          data: Se
        } = await hr.from("form_options").select("*"),
        Re = Se?.filter(Sr => Sr.category === "instrument") ?? [];
      Se && (It(Se.filter(Sr => Sr.category === "iv_company")), mt(Re));
      const {
        data: lt
      } = await hr.from("profiles").select("id, full_name, scios_nr, company_name").in("role", ["inspector", "admin"]).order("full_name");
      lt && bt(lt.filter(Sr => Sr.full_name));
      const {
        data: wt
      } = await hr.from("clients").select("*").order("name");
      Ut(wt || []);
      const {
        data: rr
      } = await hr.from("inspections").select("client_name");
      if (rr) {
        const Sr = {};
        rr.forEach(an => {
          an.client_name && (Sr[an.client_name] = (Sr[an.client_name] || 0) + 1);
        }), wr(Sr);
      }
      const {
        data: er
      } = await hr.from("defect_library").select("*");
      er && er.length > 0 && k(er);
      const {
        data: {
          session: xr
        }
      } = await hr.auth.getSession();
      if (xr?.user) {
        h(xr.user.email || "");
        const {
          data: Sr
        } = await hr.from("profiles").select("*").eq("id", xr.user.id).single();
        if (Sr) {
          let an = {
            ...Sr
          };
          const un = Sr.instruments ?? [],
            Zn = (Sr.linked_instruments ?? []).length > 0;
          if (un.length > 0 && !Zn) {
            const Xr = [];
            for (const Nn of un) {
              const gi = Re.find(Un => Un.label === Nn.name && (Un.data?.serialNumber ?? "") === (Nn.serialNumber ?? ""));
              if (gi) Xr.push(gi.id);else {
                const {
                  data: Un
                } = await hr.from("form_options").upsert({
                  category: "instrument",
                  label: Nn.name,
                  data: {
                    serialNumber: Nn.serialNumber || "",
                    calibrationDate: Nn.calibrationDate || ""
                  }
                }, {
                  onConflict: "label"
                }).select().single();
                Un && (Xr.push(Un.id), mt(Ds => Ds.some(Ga => Ga.id === Un.id) ? Ds : [...Ds, Un]));
              }
            }
            await hr.from("profiles").update({
              linked_instruments: Xr,
              instruments: []
            }).eq("id", xr.user.id), an = {
              ...an,
              linked_instruments: Xr,
              instruments: []
            };
          }
          d({
            ...u,
            ...an
          }), sd.getState().setMeta({
            inspectorName: sd.getState().meta.inspectorName || Sr.full_name || "",
            assignedInspectorId: sd.getState().meta.assignedInspectorId || xr.user.id,
            sciosRegistrationNumber: sd.getState().meta.sciosRegistrationNumber || Sr.scios_nr || "",
            inspectionCompany: sd.getState().meta.inspectionCompany || Sr.company_name || "",
            inspectionCompanyAddress: sd.getState().meta.inspectionCompanyAddress || Sr.company_address || "",
            inspectionCompanyPostalCode: sd.getState().meta.inspectionCompanyPostalCode || Sr.company_postal_code || "",
            inspectionCompanyCity: sd.getState().meta.inspectionCompanyCity || Sr.company_city || "",
            inspectionCompanyPhone: sd.getState().meta.inspectionCompanyPhone || Sr.company_phone || "",
            inspectionCompanyEmail: sd.getState().meta.inspectionCompanyEmail || Sr.company_email || "",
            signatureUrl: sd.getState().meta.signatureUrl || Sr.signature_url || ""
          });
        }
      }
    })();
  }, []), Ze.useEffect(() => {
    if (b.date && b.inspectionInterval) {
      const ie = m3e(b.date, b.inspectionInterval);
      P({
        nextInspectionDate: ie
      });
    } else P({
      nextInspectionDate: ""
    });
  }, [b.date, b.inspectionInterval, P]);
  const _s = () => {
      ra < Rm.length - 1 && (oe(Rm[ra + 1]), window.scrollTo(0, 0));
    },
    ci = () => {
      ra > 0 && (oe(Rm[ra - 1]), window.scrollTo(0, 0));
    },
    xi = async ie => {
      const Se = (await hr.auth.getSession()).data.session;
      if (!Se) return;
      const Re = u.instrument_usage ?? {},
        lt = {
          ...Re,
          [ie]: (Re[ie] ?? 0) + 1
        };
      d(wt => ({
        ...wt,
        instrument_usage: lt
      })), hr.from("profiles").update({
        instrument_usage: lt
      }).eq("id", Se.user.id).then(({
        error: wt
      }) => {
        wt && console.warn("Usage update failed:", wt.message);
      });
    },
    hs = async ie => {
      const Se = (await hr.auth.getSession()).data.session;
      if (!Se) return;
      const Re = u.linked_instruments ?? [];
      if (Re.includes(ie)) return;
      const lt = [...Re, ie];
      d(wt => ({
        ...wt,
        linked_instruments: lt
      })), await hr.from("profiles").update({
        linked_instruments: lt
      }).eq("id", Se.user.id);
    },
    Qs = async ie => {
      const Se = (await hr.auth.getSession()).data.session;
      if (!Se) return;
      const Re = (u.linked_instruments ?? []).filter(lt => lt !== ie);
      d(lt => ({
        ...lt,
        linked_instruments: Re
      })), await hr.from("profiles").update({
        linked_instruments: Re
      }).eq("id", Se.user.id);
    },
    Ri = async (ie, Se) => {
      const {
        error: Re
      } = await hr.from("form_options").update({
        label: Se.name,
        data: {
          serialNumber: Se.serialNumber,
          calibrationDate: Se.calibrationDate
        }
      }).eq("id", ie);
      if (Re) {
        alert("Fout bij opslaan: " + Re.message);
        return;
      }
      mt(lt => lt.map(wt => wt.id === ie ? {
        ...wt,
        label: Se.name,
        data: {
          serialNumber: Se.serialNumber,
          calibrationDate: Se.calibrationDate
        }
      } : wt));
    },
    Cs = async () => {
      if (!En.trim()) return;
      const ie = Qt.find(wt => wt.name.trim().toLowerCase() === En.trim().toLowerCase() && wt.serialNumber.trim().toLowerCase() === Mn.trim().toLowerCase());
      if (ie) {
        window.confirm(`Er bestaat al "${ie.name} (SN: ${ie.serialNumber})". Koppelen aan je profiel en toevoegen aan de meting?`) && (D(ie), await hs(Number(ie.id)), await xi(ie.id)), Mt(!1), gr(""), Dr(!1), bn(""), Fn(""), ei("");
        return;
      }
      const {
        data: Se,
        error: Re
      } = await hr.from("form_options").insert({
        category: "instrument",
        label: En.trim(),
        data: {
          serialNumber: Mn.trim() || "",
          calibrationDate: zn || "n.v.t."
        }
      }).select().single();
      if (Re) {
        alert("Fout bij aanmaken: " + Re.message);
        return;
      }
      const lt = {
        id: String(Se.id),
        name: Se.label,
        serialNumber: Se.data.serialNumber,
        calibrationDate: Se.data.calibrationDate
      };
      mt(wt => [...wt, Se]), await hs(Se.id), D(lt), await xi(String(Se.id)), Mt(!1), gr(""), Dr(!1), bn(""), Fn(""), ei("");
    },
    _i = Array.from(new Set(ke.map(ie => ie.category))).sort(),
    Hi = pn ? Array.from(new Set(ke.filter(ie => ie.category === pn).map(ie => ie.subcategory))).sort() : [],
    as = pn && Sn ? ke.filter(ie => ie.category === pn && ie.subcategory === Sn) : [],
    Aa = async () => {
      const {
        data: {
          session: ie
        }
      } = await hr.auth.getSession();
      if (!ie) {
        alert("Sessie verlopen. Log opnieuw in om opdrachten op te halen.");
        return;
      }
      We(!0), _t(!0);
      const {
        data: Se,
        error: Re
      } = await hr.from("inspections").select("*").in("status", ["new", "in_progress", "contribution_ready"]).order("created_at", {
        ascending: !1
      });
      if (Re) alert("Fout bij ophalen werkvoorraad: " + Re.message);else {
        const lt = (Se || []).flatMap(wt => {
          try {
            const rr = typeof wt.report_data == "string" ? JSON.parse(wt.report_data) : wt.report_data;
            return !rr || typeof rr != "object" ? [] : [{
              ...wt,
              report_data: rr
            }];
          } catch {
            return [];
          }
        });
        dr(lt);
      }
      We(!1);
    },
    xn = async (ie, Se) => {
      if (!ie) return;
      const Re = ie.report_data,
        lt = Re.meta || {},
        wt = {
          ...Re,
          meta: {
            ...lt,
            inspectorName: Se ? "" : lt.inspectorName || "",
            sciosRegistrationNumber: Se ? "" : lt.sciosRegistrationNumber || "",
            isContributionMode: Se,
            parentInspectionId: Se ? ie.id : void 0,
            parentInspectionNumber: Se ? ie.inspection_number : void 0,
            supabaseId: Se ? void 0 : ie.id,
            date: new Date().toISOString().split("T")[0]
          },
          defects: Se ? [] : Re.defects || [],
          measurements: {
            ...(Se ? {
              boards: []
            } : Re.measurements || {
              boards: []
            }),
            selectedInstruments: Se ? [] : Re.measurements?.selectedInstruments || []
          }
        };
      try {
        N(wt), Se || (await hr.from("inspections").update({
          status: "in_progress"
        }).eq("id", ie.id)), _t(!1), oe("setup");
      } catch (rr) {
        console.error("Fout bij laden:", rr), alert("Er ging iets mis bij het laden van de data.");
      }
    },
    fo = async () => {
      b.isContributionMode ? await Ci() : await Pi();
    },
    Zi = async () => {
      const ie = b.supabaseId;
      if (!ie) return alert("Sla eerst je eigen rapport op in de cloud voordat je kunt samenvoegen.");
      xe(!0);
      const {
        data: Se,
        error: Re
      } = await hr.from("inspections").select("id, report_data, status").eq("parent_id", ie).eq("status", "contribution_ready");
      if (xe(!1), Re) return alert("Fout bij zoeken: " + Re.message);
      if (!Se || Se.length === 0) return alert("Geen nieuwe bijdragen gevonden.");
      let lt = 0;
      for (const wt of Se) {
        const rr = typeof wt.report_data == "string" ? JSON.parse(wt.report_data) : wt.report_data,
          er = rr.meta?.inspectorName || "Onbekende collega",
          xr = rr.meta?.date || "onbekende datum",
          Sr = rr.defects?.length || 0,
          an = rr.measurements?.boards?.length || 0;
        if (window.confirm(`Bijdrage van ${er} (${xr}) toevoegen?
Bevat ${Sr} gebreken en ${an} verdelers.`)) {
          const un = b.additionalInspectors || [],
            Zn = b.inspectorName;
          er !== "Onbekende collega" && er !== Zn && !un.includes(er) && P({
            additionalInspectors: [...un, er]
          }), Array.isArray(rr.defects) && rr.defects.forEach(Xr => {
            H({
              ...Xr,
              id: d2(),
              description: `[BIJDRAGE ${er.toUpperCase()}]: ${Xr.description}`
            });
          }), Array.isArray(rr.measurements?.selectedInstruments) && rr.measurements.selectedInstruments.forEach(Xr => {
            E.selectedInstruments.some(gi => gi.serialNumber === Xr.serialNumber) || D(Xr);
          }), Array.isArray(rr.measurements?.boards) && rr.measurements.boards.forEach(Xr => {
            j({
              ...Xr,
              id: d2(),
              name: `${Xr.name} (v. ${er})`
            });
          }), await hr.from("inspections").update({
            status: "merged"
          }).eq("id", wt.id), lt++;
        }
      }
      lt > 0 && alert(`Succes! ${lt} bijdrage(n) samengevoegd.`);
    },
    Pi = async () => {
      const ie = b.supabaseId;
      if (!ie) return alert("❌ FOUT: ID kwijt.");
      if (!b.signatureUrl) return alert("Graag eerst tekenen.");
      if (!window.confirm("Inleveren bij kantoor?")) return;
      xe(!0);
      const Se = {
          meta: b,
          measurements: E,
          defects: w
        },
        {
          error: Re
        } = await hr.from("inspections").update({
          report_data: Se,
          status: "review_ready"
        }).eq("id", ie);
      xe(!1), Re ? alert("❌ Opslaan mislukt: " + Re.message) : (await hr.from("inspection_versions").insert({
        inspection_id: ie,
        report_data: Se,
        saved_by: b.inspectorName || "Inspecteur",
        saved_at: new Date().toISOString()
      }), alert("✅ Gelukt! De inspectie is ingeleverd."));
    },
    Ci = async () => {
      if (!b.clientName) return alert("Vul eerst een klantnaam in.");
      const {
        data: {
          session: ie
        }
      } = await hr.auth.getSession();
      if (!ie?.user) return alert("Sessie verlopen. Log opnieuw in.");
      const Se = Ye.find(Xr => Xr.full_name === b.inspectorName),
        Re = u.full_name.trim() || ie.user.email || "",
        lt = r === "inspector" ? Re : b.inspectorName.trim() || Re,
        wt = r === "inspector" ? ie.user.id : Se?.id || b.assignedInspectorId || ie.user.id;
      if (!lt) return alert("LET OP: Vul a.u.b. uw naam in bij 'Inspecteur' (Tabblad Basis) voordat u de bijdrage verstuurt.");
      P({
        inspectorName: lt,
        assignedInspectorId: wt
      });
      const rr = b.isContributionMode && b.parentInspectionId;
      if (!window.confirm(rr ? "Bijdrage uploaden naar Hoofdinspecteur?" : "Opslaan als nieuwe opdracht?")) return;
      xe(!0);
      const er = await k1(b.projectAddress, b.projectPostalCode, b.projectCity),
        xr = {
          meta: {
            ...b,
            inspectorName: lt,
            assignedInspectorId: wt,
            ...(er ?? {})
          },
          measurements: E,
          defects: w
        };
      let Sr = b.clientName;
      if (rr) {
        const Xr = b.parentInspectionNumber ? ` ${b.parentInspectionNumber}` : "";
        Sr += ` (Bijdrage aan${Xr})`;
      }
      const an = {
          client_name: Sr,
          status: rr ? "contribution_ready" : "review_ready",
          report_data: xr,
          parent_id: rr ? b.parentInspectionId : null,
          scope_type: b.sciosScope || "10"
        },
        {
          data: un,
          error: Zn
        } = await hr.from("inspections").insert(an).select().single();
      xe(!1), Zn ? alert("Fout bij opslaan: " + Zn.message) : (P({
        supabaseId: un.id,
        inspectionNumber: un.inspection_number
      }), ac("inspector", rr ? "inspection_updated" : "inspection_created", "inspection", un.id, b.clientName || "Onbekend", {
        inspectionNumber: un.inspection_number,
        projectLocation: b.projectLocation,
        date: b.date
      }), alert(rr ? `✅ Bijdrage verzonden!
Je unieke nummer is: ${un.inspection_number}` : `✅ Opgeslagen in de cloud.
Project nummer: ${un.inspection_number}`));
    },
    ho = () => {
      window.confirm("Bestand lokaal samenvoegen?") && Ki.current?.click();
    },
    Ua = ie => {
      const Se = ie.target.files?.[0];
      if (!Se) return;
      const Re = new FileReader();
      Re.onload = lt => {
        try {
          const wt = JSON.parse(lt.target?.result);
          C(wt), alert("Gelukt!");
        } catch {
          alert("Fout.");
        }
      }, Re.readAsText(Se);
    },
    Ha = ie => {
      ie === "NEW" ? (cr(!0), Rn("")) : (cr(!1), Rn(ie)), kn(""), pt(""), Tn(!1), gn("");
    },
    va = ie => {
      kn(ie), pt(""), Tn(!1), gn("");
    },
    eo = ie => {
      if (ie === "CUSTOM") Tn(!0), pt(""), gn(""), tn(""), qe("Yellow");else {
        Tn(!1), pt(ie);
        const Se = ke.find(Re => Re.id === ie);
        Se && (gn(Se.description), qe(Se.classification)), tn("");
      }
    },
    pi = ie => {
      Yr(ie.location), Zr(ie.photoUrl || null), Ln(ie.photoUrl2 || null);
      const Se = ke.find(Re => Re.id === ie.libraryId);
      Se ? (cr(!1), Tn(!1), Rn(Se.category), kn(Se.subcategory), pt(Se.id), gn(Se.description), qe(Se.classification), tn(ie.description.replace(Se.description, "").trim())) : (Tn(!0), Rn(""), kn(""), gn(""), tn(ie.description), qe(ie.classification)), Wr(ie.id), window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },
    qa = () => {
      if (!Nr) return;
      let ie = "",
        Se = "Yellow",
        Re;
      if (Or) ie = fn, Se = Fe;else {
        const wt = ke.find(rr => rr.id === rt);
        if (!wt) return;
        ie = fn ? `${wt.description}

${fn}` : wt.description, Se = wt.classification, Re = wt.id;
      }
      const lt = {
        id: pr || d2(),
        libraryId: Re,
        location: Nr,
        description: ie,
        classification: Se,
        photoUrl: en || void 0,
        photoUrl2: dn || void 0,
        category: pn || void 0,
        subcategory: Sn || void 0
      };
      pr ? (G(pr, lt), Wr(null)) : H(lt), Yr(""), tn(""), gn(""), Rn(""), kn(""), pt(""), Zr(null), Ln(null), Tn(!1), qe("Yellow"), window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },
    na = async () => {
      xe(!0);
      const {
        data: {
          session: ie
        }
      } = await hr.auth.getSession();
      if (ie?.user) {
        const {
          error: Se
        } = await hr.from("profiles").update({
          full_name: u.full_name,
          scios_nr: u.scios_nr,
          phone: u.phone,
          contact_email: u.contact_email,
          company_name: u.company_name,
          company_address: u.company_address,
          company_postal_code: u.company_postal_code,
          company_city: u.company_city,
          company_phone: u.company_phone,
          company_email: u.company_email,
          signature_url: u.signature_url,
          home_address: u.home_address,
          home_postal_code: u.home_postal_code,
          home_city: u.home_city
        }).eq("id", ie.user.id);
        if (Se) alert("Fout bij opslaan: " + Se.message);else {
          ac("inspector", "profile_updated", "profile", ie.user.id, u.full_name || ie.user.email || "Onbekend");
          const Re = u.company_name?.trim();
          if (Re) if (r === "installer") {
            const {
              data: lt
            } = await hr.from("clients").select("id, contacts").ilike("name", Re);
            if (lt && lt.length > 0) {
              const wt = lt[0],
                rr = wt.contacts || [],
                er = u.full_name?.trim();
              er && !rr.find(xr => xr.name.toLowerCase() === er.toLowerCase()) && rr.push({
                id: crypto.randomUUID(),
                name: er,
                role: "Medewerker",
                phone: "",
                email: u.contact_email || ""
              }), await hr.from("clients").update({
                address: u.company_address || "",
                postal_code: u.company_postal_code || "",
                city: u.company_city || "",
                phone: u.company_phone || "",
                email: u.company_email || "",
                contacts: rr
              }).eq("id", wt.id);
            } else {
              const wt = u.full_name?.trim() ? [{
                id: crypto.randomUUID(),
                name: u.full_name.trim(),
                role: "Medewerker",
                phone: "",
                email: u.contact_email || ""
              }] : [];
              await hr.from("clients").insert({
                name: Re,
                address: u.company_address || "",
                postal_code: u.company_postal_code || "",
                city: u.company_city || "",
                phone: u.company_phone || "",
                email: u.company_email || "",
                contacts: wt
              });
            }
          } else {
            const lt = {
                address: u.company_address || "",
                postalCode: u.company_postal_code || "",
                city: u.company_city || "",
                phone: u.company_phone || "",
                email: u.company_email || ""
              },
              wt = He.find(rr => rr.label.toLowerCase() === Re.toLowerCase());
            if (wt) await hr.from("form_options").update({
              label: Re,
              data: lt
            }).eq("id", wt.id), It(rr => rr.map(er => er.id === wt.id ? {
              ...er,
              label: Re,
              data: lt
            } : er));else {
              const {
                data: rr
              } = await hr.from("form_options").insert({
                category: "iv_company",
                label: Re,
                data: lt
              }).select().single();
              rr && It(er => [...er, rr]);
            }
          }
          alert("✅ Profiel succesvol opgeslagen!");
        }
      }
      xe(!1);
    },
    Xi = () => {
      m.current && d({
        ...u,
        signature_url: m.current.getCanvas().toDataURL("image/png")
      });
    },
    po = () => {
      m.current?.clear(), d({
        ...u,
        signature_url: ""
      });
    },
    zl = async () => {
      if (!b.projectPostalCode || !b.projectAddress) {
        alert("Vul adres in.");
        return;
      }
      ki(!0);
      try {
        const ie = `${b.projectPostalCode} ${(b.projectAddress.match(/\d+/) || [""])[0]}`.trim(),
          Re = await (await fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(ie)}&rows=1`)).json();
        Re.response.docs[0] && P({
          idBagviewer: Re.response.docs[0].adresseerbaarobject_id || Re.response.docs[0].id,
          projectCity: Re.response.docs[0].woonplaatsnaam || b.projectCity
        });
      } catch {
        alert("Fout.");
      } finally {
        ki(!1);
      }
    },
    Fs = async ie => {
      if (ie.target.files?.[0]) {
        Yi(!0);
        const Se = await IS(ie.target.files[0], "cover"),
          Re = await SS(Se);
        Yi(!1), Re && P({
          locationPhotoUrl: Re
        });
      }
    },
    Al = async (ie, Se) => {
      if (ie.target.files?.[0]) {
        Yi(!0);
        const Re = await IS(ie.target.files[0], "defect"),
          lt = await SS(Re);
        Yi(!1), lt && (Se === 1 ? Zr(lt) : Ln(lt));
      }
    },
    Zo = () => {
      const ie = JSON.stringify({
          meta: b,
          measurements: E,
          defects: w
        }, null, 2),
        Se = new Blob([ie], {
          type: "application/json"
        }),
        Re = URL.createObjectURL(Se),
        lt = document.createElement("a");
      lt.href = Re, lt.download = `${b.clientName || "Inspectie"}_Backup.json`, lt.click(), URL.revokeObjectURL(Re);
    },
    vl = async () => {
      const ie = JSON.stringify({
          meta: b,
          measurements: E,
          defects: w
        }, null, 2),
        Se = new Blob([ie], {
          type: "application/json"
        }),
        Re = new File([Se], "findings.json", {
          type: "application/json"
        });
      if (navigator.canShare && navigator.canShare({
        files: [Re]
      })) try {
        await navigator.share({
          files: [Re],
          title: "Inspectie",
          text: "Bevindingen."
        });
      } catch {
        Zo();
      } else Zo();
    },
    go = () => {
      window.confirm("Overschrijven?") && ka.current?.click();
    },
    ps = ie => {
      const Se = ie.target.files?.[0];
      if (!Se) return;
      const Re = new FileReader();
      Re.onload = lt => {
        try {
          N(JSON.parse(lt.target?.result));
        } catch {
          alert("Fout");
        }
      }, Re.readAsText(Se);
    },
    zo = () => {
      window.confirm("Alles wissen?") && (S(), ma.current && ma.current.clear(), window.scrollTo(0, 0));
    },
    iu = () => {
      ma.current && P({
        signatureUrl: ma.current.getCanvas().toDataURL("image/png")
      });
    },
    Tc = () => {
      ma.current?.clear(), P({
        signatureUrl: ""
      });
    },
    Xo = Yee(b.totalComponents),
    bl = [{
      key: "woonfunctie",
      label: "Woonfunctie"
    }, {
      key: "bijeenkomstfunctie",
      label: "Bijeenkomstfunctie"
    }, {
      key: "celfunctie",
      label: "Celfunctie"
    }, {
      key: "gezondheidszorgfunctie",
      label: "Gezondheidszorgfunctie"
    }, {
      key: "industriefunctie",
      label: "Industriefunctie"
    }, {
      key: "kantoorfunctie",
      label: "Kantoorfunctie"
    }],
    Jo = [{
      key: "logiesfunctie",
      label: "Logiesfunctie"
    }, {
      key: "onderwijsfunctie",
      label: "Onderwijsfunctie"
    }, {
      key: "sportfunctie",
      label: "Sportfunctie"
    }, {
      key: "winkelfunctie",
      label: "Winkelfunctie"
    }, {
      key: "overigeGebruiksfunctie",
      label: "Overige gebruiksfunctie"
    }, {
      key: "bouwwerkGeenGebouw",
      label: "Bouwwerk geen gebouw zijnde"
    }],
    Io = lr.filter(ie => {
      const Se = St.toLowerCase(),
        Re = (ie.client_name || "").toLowerCase(),
        lt = ie.report_data?.meta || {},
        wt = (lt.projectLocation || "").toLowerCase(),
        rr = (lt.projectCity || "").toLowerCase(),
        er = (lt.date || "").toLowerCase(),
        xr = (ie.inspection_number || "").toLowerCase(),
        Sr = Re.includes(Se) || wt.includes(Se) || rr.includes(Se) || er.includes(Se) || xr.includes(Se);
      if (_r) {
        const an = new Date().toISOString().split("T")[0];
        return Sr && er === an;
      }
      return Sr;
    }).sort((ie, Se) => {
      let Re = "",
        lt = "";
      return at.key === "client" ? (Re = ie.client_name || "", lt = Se.client_name || "") : at.key === "project" ? (Re = ie.report_data?.meta?.projectLocation || "", lt = Se.report_data?.meta?.projectLocation || "") : at.key === "city" ? (Re = ie.report_data?.meta?.projectCity || "", lt = Se.report_data?.meta?.projectCity || "") : (Re = ie.report_data?.meta?.date || "", lt = Se.report_data?.meta?.date || ""), at.dir === "asc" ? Re.localeCompare(lt) : lt.localeCompare(Re);
    }),
    Oi = ie => {
      vt(Se => ({
        key: ie,
        dir: Se.key === ie && Se.dir === "asc" ? "desc" : "asc"
      }));
    },
    gs = async () => {
      if (!b.signatureUrl) return alert("Teken eerst.");
      xe(!0);
      const ie = `${b.date || "Datum"}_${b.clientName || "Klant"}_${b.projectLocation || "Project"}_${b.projectCity || "Plaats"}`;
      try {
        const Se = JSON.stringify({
            meta: b,
            measurements: E,
            defects: w
          }, null, 2),
          Re = new Blob([Se], {
            type: "application/json"
          }),
          lt = URL.createObjectURL(Re),
          wt = document.createElement("a");
        wt.href = lt, wt.download = `${ie}.json`, document.body.appendChild(wt), wt.click(), document.body.removeChild(wt), URL.revokeObjectURL(lt), await new Promise(Sr => setTimeout(Sr, 500));
        const rr = await h1(g.jsx(mv, {
            meta: b,
            defects: w,
            measurements: E
          })).toBlob(),
          er = URL.createObjectURL(rr),
          xr = document.createElement("a");
        xr.href = er, xr.download = `${ie}.pdf`, document.body.appendChild(xr), xr.click(), document.body.removeChild(xr), URL.revokeObjectURL(er);
      } catch (Se) {
        console.error(Se), alert("Fout bij genereren.");
      } finally {
        xe(!1);
      }
    };
  return g.jsxs("div", {
    "data-ui": "inspector",
    className: "ig-inspector-shell min-h-screen font-body text-on-surface pb-24 md:pb-12 transition-colors duration-500",
    children: [g.jsxs("div", {
      className: "ig-inspector-canvas max-w-6xl mx-auto border-0 md:border min-h-screen md:min-h-0 md:rounded-[28px] md:my-6 overflow-hidden flex flex-col bg-white border-outline-variant/20 transition-colors duration-500",
      children: [g.jsxs("header", {
        className: "ig-inspector-header safe-top px-4 py-3 sm:px-5 sm:py-4 bg-surface-container-lowest/95 backdrop-blur-xl border-b flex justify-between items-center sticky top-0 z-50",
        children: [g.jsxs("div", {
          children: [g.jsx("p", {
            className: "ig-eyebrow hidden sm:block",
            children: "Inspector Gadget"
          }), g.jsxs("h1", {
            className: "font-headline font-extrabold text-xl md:text-2xl text-primary tracking-tight",
            children: ["Scope ", b.sciosScope || "10", " inspectie"]
          }), g.jsx("p", {
            className: "text-[12px] md:text-[13px] text-on-surface-variant font-medium mt-0.5",
            children: b.sciosScope === "8" ? "NEN 3140 · elektrische veiligheid" : "NTA 8220 · brandrisico"
          })]
        }), g.jsxs("div", {
          className: "flex items-center gap-2",
          children: [g.jsxs("div", {
            className: "items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full hidden md:flex animate-pulse bg-secondary-container/50 text-on-secondary-container font-bold",
            children: [g.jsx(Ns, {
              size: 14
            }), " Autosave"]
          }), g.jsx("div", {
            className: "text-[13px] font-mono px-3 py-1.5 rounded-full hidden md:block bg-surface-container-high text-on-surface-variant font-medium",
            children: b.date
          }), g.jsx("div", {
            className: "h-8 w-[1px] bg-outline-variant/20 hidden md:block mx-1"
          }), g.jsx("button", {
            type: "button",
            onClick: () => a(!0),
            className: "hidden md:flex items-center justify-center px-4 py-2 rounded-full text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all bg-surface-container-low",
            title: "Mijn Profiel",
            children: g.jsxs("span", {
              className: "flex items-center gap-2 text-sm font-bold text-primary",
              children: [g.jsx(u2, {
                size: 18
              }), " Profiel"]
            })
          }), n && g.jsx("button", {
            onClick: n,
            title: "Planning en agenda",
            className: "p-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all bg-surface-container-low hidden md:flex",
            children: g.jsx(Eg, {
              size: 21
            })
          }), r === "admin" && t && g.jsx("button", {
            onClick: t,
            title: "Beheerder",
            className: "p-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all bg-surface-container-low hidden md:flex",
            children: g.jsx(BS, {
              size: 22
            })
          }), e && g.jsx("button", {
            onClick: e,
            title: "Uitloggen",
            className: "p-2.5 rounded-full text-error hover:bg-error-container active:scale-95 transition-all bg-surface-container-low hidden md:flex",
            children: g.jsx(kS, {
              size: 22
            })
          }), g.jsx("button", {
            type: "button",
            onClick: () => o(ie => !ie),
            className: "ig-icon-button md:hidden",
            "aria-expanded": s,
            "aria-label": s ? "Menu sluiten" : "Menu openen",
            children: s ? g.jsx(Kc, {
              size: 23
            }) : g.jsx(TEe, {
              size: 23
            })
          })]
        }), s && g.jsxs("div", {
          className: "absolute left-3 right-3 top-[calc(100%+0.5rem)] rounded-2xl border border-outline-variant/20 bg-white p-2 shadow-xl md:hidden",
          children: [g.jsxs("div", {
            className: "px-3 py-2 text-xs font-semibold text-on-surface-variant",
            children: [b.date || "Geen inspectiedatum", " · Autosave actief"]
          }), g.jsxs("button", {
            type: "button",
            onClick: () => {
              a(!0), o(!1);
            },
            className: "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold text-primary hover:bg-surface-container-low",
            children: [g.jsx(u2, {
              size: 20
            }), " Mijn profiel"]
          }), n && g.jsxs("button", {
            type: "button",
            onClick: () => {
              n(), o(!1);
            },
            className: "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold text-primary hover:bg-surface-container-low",
            children: [g.jsx(Eg, {
              size: 20
            }), " Planning & agenda"]
          }), r === "admin" && t && g.jsxs("button", {
            type: "button",
            onClick: () => {
              t(), o(!1);
            },
            className: "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold text-primary hover:bg-surface-container-low",
            children: [g.jsx(BS, {
              size: 20
            }), " Kantoor Dashboard"]
          }), e && g.jsxs("button", {
            type: "button",
            onClick: e,
            className: "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold text-error hover:bg-error-container",
            children: [g.jsx(kS, {
              size: 20
            }), " Uitloggen"]
          })]
        })]
      }), g.jsx("nav", {
        className: "ig-step-nav bg-surface-container-lowest/95 backdrop-blur-xl border-b p-3 md:p-4 md:sticky md:top-[77px] z-40 overflow-x-auto no-scrollbar",
        "aria-label": "Inspectiestappen",
        children: g.jsx("div", {
          className: "ig-step-track flex bg-surface-container-low p-1.5 rounded-2xl w-max md:w-full min-w-full",
          children: Rm.map((ie, Se) => {
            const Re = K === ie;
            return g.jsxs("button", {
              onClick: () => oe(ie),
              "aria-current": Re ? "step" : void 0,
              className: `ig-step-item flex-1 min-w-[100px] py-2.5 px-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-300 ${Re ? "is-active bg-white text-primary shadow-sm transform scale-100" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest scale-95"}`,
              children: [Se + 1, ". ", ie === "setup" ? "Basis" : ie === "measure" ? "Metingen" : ie === "inspect" ? "Gebreken" : "Export"]
            }, ie);
          })
        })
      }), g.jsxs("main", {
        className: "p-4 sm:p-6 lg:p-8 flex-grow",
        children: [K === "setup" && g.jsxs("div", {
          className: "space-y-6",
          children: [g.jsxs("div", {
            className: "ig-quick-actions grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8",
            children: [g.jsxs("button", {
              type: "button",
              onClick: go,
              className: "ig-quick-action ig-quick-action--load flex flex-col items-center justify-center transition-all active:scale-[0.98]",
              children: [g.jsx("div", {
                className: "ig-quick-action-icon",
                children: g.jsx(x5, {
                  size: 24
                })
              }), g.jsx("span", {
                className: "ig-quick-action-label",
                children: "Laden"
              })]
            }), g.jsxs("button", {
              type: "button",
              onClick: Aa,
              className: "ig-quick-action ig-quick-action--workorders flex flex-col items-center justify-center transition-all active:scale-[0.98]",
              children: [g.jsx("div", {
                className: "ig-quick-action-icon",
                children: g.jsx(OM, {
                  size: 24
                })
              }), g.jsx("span", {
                className: "ig-quick-action-label",
                children: "Werkvoorraad"
              })]
            }), g.jsxs("button", {
              type: "button",
              onClick: zo,
              className: "ig-quick-action ig-quick-action--reset flex flex-col items-center justify-center transition-all active:scale-[0.98]",
              children: [g.jsx("div", {
                className: "ig-quick-action-icon",
                children: g.jsx(LEe, {
                  size: 24
                })
              }), g.jsx("span", {
                className: "ig-quick-action-label",
                children: "Leegmaken"
              })]
            }), g.jsx("input", {
              id: "inspection-import",
              name: "inspectionImport",
              "aria-label": "Inspectiebestand laden",
              type: "file",
              ref: ka,
              onChange: ps,
              accept: ".json,application/json",
              className: "hidden"
            })]
          }), !b.isContributionMode && g.jsxs("div", {
            className: "ig-scope-toggle flex p-1.5 mb-8",
            children: [g.jsxs("button", {
              type: "button",
              onClick: () => P({
                sciosScope: "8",
                inspectionBasis: {
                  nta8220: !1,
                  nen3140: !0,
                  verzekering: !1
                }
              }),
              className: `ig-scope-option flex-1 py-3.5 px-2 text-center transition-all duration-300 ${b.sciosScope === "8" ? "is-active" : ""}`,
              children: [g.jsx("div", {
                className: "font-headline font-extrabold text-base",
                children: "Scope 8"
              }), g.jsx("div", {
                className: "text-[11px] uppercase tracking-widest mt-0.5 opacity-80",
                children: "NEN 3140"
              })]
            }), g.jsxs("button", {
              type: "button",
              onClick: () => P({
                sciosScope: "10",
                inspectionBasis: {
                  nta8220: !0,
                  nen3140: !1,
                  verzekering: !1
                }
              }),
              className: `ig-scope-option flex-1 py-3.5 px-2 text-center transition-all duration-300 ${(b.sciosScope || "10") === "10" ? "is-active" : ""}`,
              children: [g.jsx("div", {
                className: "font-headline font-extrabold text-base",
                children: "Scope 10"
              }), g.jsx("div", {
                className: "text-[11px] uppercase tracking-widest mt-0.5 opacity-80",
                children: "NTA 8220"
              })]
            })]
          }), dt && g.jsx("div", {
            className: "fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4",
            children: g.jsxs("div", {
              className: "ig-work-modal bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col h-[92dvh] sm:h-auto sm:max-h-[85vh]",
              children: [g.jsxs("div", {
                className: "p-4 border-b flex justify-between items-center bg-gray-50",
                children: [g.jsxs("h3", {
                  className: "font-bold text-lg flex items-center gap-2 text-zinc-800",
                  children: [g.jsx(rEe, {
                    size: 20
                  }), " Beschikbare Opdrachten"]
                }), g.jsx("button", {
                  onClick: () => _t(!1),
                  children: g.jsx(Kc, {
                    className: "text-gray-400 hover:text-gray-600"
                  })
                })]
              }), g.jsxs("div", {
                className: "p-4 bg-gray-100 border-b space-y-3",
                children: [g.jsxs("div", {
                  className: "flex flex-col sm:flex-row gap-2 sm:items-center",
                  children: [g.jsxs("div", {
                    className: "relative flex-grow",
                    children: [g.jsx($c, {
                      className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                      size: 18
                    }), g.jsx("input", {
                      type: "text",
                      placeholder: "Zoek op naam, project, plaats...",
                      className: "w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500",
                      value: St,
                      onChange: ie => $e(ie.target.value)
                    })]
                  }), g.jsxs("label", {
                    className: "flex items-center gap-2 bg-white px-3 py-2 border rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors shrink-0",
                    children: [g.jsx("input", {
                      type: "checkbox",
                      className: "w-4 h-4 text-zinc-600 rounded",
                      checked: _r,
                      onChange: ie => Ur(ie.target.checked)
                    }), g.jsx("span", {
                      className: "text-xs font-bold text-gray-700",
                      children: "Vandaag"
                    })]
                  })]
                }), g.jsxs("div", {
                  className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs",
                  children: [g.jsxs("button", {
                    onClick: () => Oi("date"),
                    className: `py-1.5 rounded border flex items-center justify-center gap-1 font-bold ${at.key === "date" ? "bg-zinc-200 text-zinc-800 border-zinc-300" : "bg-white text-gray-600"}`,
                    children: ["Datum ", at.key === "date" && (at.dir === "asc" ? g.jsx(t1, {
                      size: 12
                    }) : g.jsx(e1, {
                      size: 12
                    }))]
                  }), g.jsxs("button", {
                    onClick: () => Oi("client"),
                    className: `py-1.5 rounded border flex items-center justify-center gap-1 font-bold ${at.key === "client" ? "bg-zinc-200 text-zinc-800 border-zinc-300" : "bg-white text-gray-600"}`,
                    children: ["Klant ", at.key === "client" && (at.dir === "asc" ? g.jsx(t1, {
                      size: 12
                    }) : g.jsx(e1, {
                      size: 12
                    }))]
                  }), g.jsxs("button", {
                    onClick: () => Oi("project"),
                    className: `py-1.5 rounded border flex items-center justify-center gap-1 font-bold ${at.key === "project" ? "bg-zinc-200 text-zinc-800 border-zinc-300" : "bg-white text-gray-600"}`,
                    children: ["Project ", at.key === "project" && (at.dir === "asc" ? g.jsx(t1, {
                      size: 12
                    }) : g.jsx(e1, {
                      size: 12
                    }))]
                  }), g.jsxs("button", {
                    onClick: () => Oi("city"),
                    className: `py-1.5 rounded border flex items-center justify-center gap-1 font-bold ${at.key === "city" ? "bg-zinc-200 text-zinc-800 border-zinc-300" : "bg-white text-gray-600"}`,
                    children: ["Plaats ", at.key === "city" && (at.dir === "asc" ? g.jsx(t1, {
                      size: 12
                    }) : g.jsx(e1, {
                      size: 12
                    }))]
                  })]
                })]
              }), g.jsx("div", {
                className: "p-0 overflow-y-auto flex-grow bg-gray-50",
                children: yr ? g.jsxs("div", {
                  className: "p-8 text-center text-gray-500 flex flex-col items-center gap-2",
                  children: [g.jsx(Ns, {
                    className: "animate-spin text-zinc-600",
                    size: 24
                  }), g.jsx("span", {
                    children: "Opdrachten ophalen..."
                  })]
                }) : Io.length === 0 ? g.jsx("div", {
                  className: "p-8 text-center text-gray-400 italic",
                  children: "Geen opdrachten gevonden."
                }) : g.jsx("div", {
                  className: "divide-y divide-gray-200 bg-white",
                  children: Io.map(ie => g.jsxs("button", {
                    onClick: () => Ot(ie),
                    className: "w-full text-left p-4 hover:bg-zinc-50 transition flex justify-between items-center group",
                    children: [g.jsxs("div", {
                      className: "flex-grow min-w-0 pr-4",
                      children: [g.jsxs("div", {
                        className: "flex justify-between items-start",
                        children: [g.jsxs("div", {
                          className: "font-bold text-gray-800 truncate",
                          children: [ie.client_name, g.jsx("span", {
                            className: "block text-xs font-normal text-zinc-600 italic truncate",
                            children: ie.report_data?.meta?.projectLocation || "Geen projectnaam"
                          })]
                        }), ie.inspection_number && g.jsx("span", {
                          className: "text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border text-gray-500 font-mono ml-2 shrink-0",
                          children: ie.inspection_number
                        })]
                      }), g.jsxs("div", {
                        className: "text-[11px] text-gray-500 flex items-center gap-3 mt-1",
                        children: [g.jsxs("span", {
                          className: "flex items-center gap-1",
                          children: [g.jsx(Eg, {
                            size: 12
                          }), " ", ie.report_data?.meta?.date || "N.t.b."]
                        }), g.jsxs("span", {
                          className: "flex items-center gap-1 truncate",
                          children: [g.jsx(u0, {
                            size: 12
                          }), " ", ie.report_data?.meta?.projectCity || "Onbekend"]
                        })]
                      })]
                    }), g.jsx("div", {
                      className: "text-zinc-700 opacity-0 group-hover:opacity-100 font-bold text-xs whitespace-nowrap bg-zinc-100 px-2 py-1 rounded",
                      children: "Starten →"
                    })]
                  }, ie.id))
                })
              }), g.jsxs("div", {
                className: "p-3 bg-gray-100 text-xs text-center text-gray-400 border-t",
                children: ["Totaal: ", Io.length, " opdracht(en)"]
              })]
            })
          }), Wt && g.jsx("div", {
            className: "fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4",
            children: g.jsxs("div", {
              className: "ig-role-modal bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden",
              children: [g.jsxs("div", {
                className: "p-5 bg-zinc-100 border-b",
                children: [g.jsx("h3", {
                  className: "font-bold text-zinc-900 text-lg",
                  children: "Kies je rol"
                }), g.jsx("p", {
                  className: "font-bold text-zinc-800 mt-1 truncate",
                  children: Wt.client_name
                }), Wt.report_data?.meta?.projectLocation && g.jsx("p", {
                  className: "text-xs text-zinc-600 truncate",
                  children: Wt.report_data.meta.projectLocation
                })]
              }), g.jsxs("div", {
                className: "p-4 space-y-3",
                children: [g.jsxs("button", {
                  onClick: () => {
                    xn(Wt, !1), Ot(null);
                  },
                  className: "ig-role-option is-primary w-full text-left p-4 rounded-lg border-2 transition",
                  children: [g.jsxs("div", {
                    className: "font-bold flex items-center gap-2",
                    children: [g.jsx(u2, {
                      size: 18
                    }), " Hoofdinspecteur"]
                  }), g.jsx("p", {
                    className: "text-xs mt-1",
                    children: "Volledig rapport beheren — defecten, metingen en afronding."
                  })]
                }), g.jsxs("button", {
                  onClick: () => {
                    xn(Wt, !0), Ot(null);
                  },
                  className: "ig-role-option w-full text-left p-4 rounded-lg border-2 transition",
                  children: [g.jsxs("div", {
                    className: "font-bold flex items-center gap-2",
                    children: [g.jsx(NS, {
                      size: 18
                    }), " Collega (Bijdrage)"]
                  }), g.jsx("p", {
                    className: "text-xs mt-1",
                    children: "Alleen eigen bevindingen toevoegen en uploaden."
                  })]
                })]
              }), g.jsx("div", {
                className: "px-4 pb-4",
                children: g.jsx("button", {
                  onClick: () => Ot(null),
                  className: "w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2",
                  children: "Annuleren"
                })
              })]
            })
          }), g.jsxs("div", {
            className: `bg-white p-5 md:p-8 rounded-[24px] border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 ${b.isContributionMode ? "opacity-70 pointer-events-none" : ""}`,
            children: [g.jsx("h2", {
              className: "text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4",
              children: "Opdrachtgever"
            }), !b.isContributionMode && g.jsxs("div", {
              className: "relative mb-3",
              children: [g.jsxs("div", {
                className: "flex gap-1.5",
                children: [g.jsx("input", {
                  id: "client-search",
                  name: "clientSearch",
                  "aria-label": "Zoek opdrachtgever via Google",
                  type: "text",
                  placeholder: "Zoek opdrachtgever via Google...",
                  className: "flex-1 border rounded p-2 text-sm bg-white",
                  value: Ne,
                  onChange: ie => ze(ie.target.value),
                  onKeyDown: ie => ie.key === "Enter" && Ue(Ne)
                }), g.jsx("button", {
                  "aria-label": "Opdrachtgever zoeken",
                  onClick: () => Ue(Ne),
                  disabled: _e,
                  className: "px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                  children: _e ? g.jsx(Ns, {
                    size: 14,
                    className: "animate-spin"
                  }) : g.jsx($c, {
                    size: 14
                  })
                })]
              }), Je.length > 0 && g.jsxs("div", {
                className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto",
                children: [Je.map((ie, Se) => {
                  const Re = Fd(ie);
                  return g.jsxs("button", {
                    className: "w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0",
                    onClick: () => {
                      P({
                        clientName: Re.name,
                        clientAddress: Re.address,
                        clientPostalCode: Re.postalCode,
                        clientCity: Re.city,
                        clientPhone: Re.phone
                      }), Me([]), ze("");
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
                  onClick: () => Me([]),
                  children: "Sluiten"
                })]
              })]
            }), g.jsxs("div", {
              className: "grid grid-cols-1 gap-3",
              children: [g.jsxs("div", {
                className: "relative",
                children: [g.jsx("input", {
                  id: "client-name",
                  name: "clientName",
                  "aria-label": "Naam opdrachtgever",
                  autoComplete: "organization",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                  list: "inspector-client-suggestions",
                  placeholder: "Naam (kies of typ)",
                  value: b.clientName,
                  onChange: ie => {
                    const Se = ie.target.value,
                      Re = Ft.find(lt => lt.name === Se);
                    P(Re ? {
                      clientName: Se,
                      clientAddress: Re.address || "",
                      clientPostalCode: Re.postal_code || "",
                      clientCity: Re.city || "",
                      clientPhone: Re.phone || "",
                      clientEmail: Re.email || ""
                    } : {
                      clientName: Se
                    });
                  }
                }), g.jsx("datalist", {
                  id: "inspector-client-suggestions",
                  children: Pe.map((ie, Se) => g.jsx("option", {
                    value: ie.name
                  }, Se))
                })]
              }), g.jsx("input", {
                id: "client-address",
                name: "clientAddress",
                "aria-label": "Adres opdrachtgever",
                autoComplete: "street-address",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Adres",
                value: b.clientAddress,
                onChange: ie => P({
                  clientAddress: ie.target.value
                })
              }), g.jsxs("div", {
                className: "flex gap-2",
                children: [g.jsx("input", {
                  id: "client-postal-code",
                  name: "clientPostalCode",
                  "aria-label": "Postcode opdrachtgever",
                  autoComplete: "postal-code",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 w-1/3",
                  placeholder: "Postcode",
                  value: b.clientPostalCode,
                  onChange: ie => P({
                    clientPostalCode: ie.target.value
                  })
                }), g.jsx("input", {
                  id: "client-city",
                  name: "clientCity",
                  "aria-label": "Plaats opdrachtgever",
                  autoComplete: "address-level2",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 w-2/3",
                  placeholder: "Plaats",
                  value: b.clientCity,
                  onChange: ie => P({
                    clientCity: ie.target.value
                  })
                })]
              }), g.jsx("input", {
                id: "client-contact-person",
                name: "clientContactPerson",
                "aria-label": "Contactpersoon opdrachtgever",
                autoComplete: "name",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Contactpersoon",
                value: b.clientContactPerson,
                onChange: ie => P({
                  clientContactPerson: ie.target.value
                })
              }), g.jsx("input", {
                id: "client-phone",
                name: "clientPhone",
                "aria-label": "Telefoon opdrachtgever",
                type: "tel",
                autoComplete: "tel",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Telefoon",
                value: b.clientPhone,
                onChange: ie => P({
                  clientPhone: ie.target.value
                })
              }), g.jsx("input", {
                id: "client-email",
                name: "clientEmail",
                "aria-label": "E-mail opdrachtgever",
                type: "email",
                autoComplete: "email",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Email",
                value: b.clientEmail,
                onChange: ie => P({
                  clientEmail: ie.target.value
                })
              })]
            })]
          }), g.jsxs("div", {
            className: `bg-white p-5 md:p-8 rounded-[24px] border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 mt-6 ${b.isContributionMode ? "opacity-70 pointer-events-none" : ""}`,
            children: [g.jsx("h2", {
              className: "text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4",
              children: "Projectgegevens"
            }), !b.isContributionMode && g.jsxs("div", {
              className: "relative mb-3",
              children: [g.jsxs("div", {
                className: "flex gap-1.5",
                children: [g.jsx("input", {
                  id: "project-search",
                  name: "projectSearch",
                  "aria-label": "Zoek projectlocatie via Google",
                  type: "text",
                  placeholder: "Zoek locatie via Google...",
                  className: "flex-1 border rounded p-2 text-sm bg-white",
                  value: tt,
                  onChange: ie => Ge(ie.target.value),
                  onKeyDown: ie => ie.key === "Enter" && Vt(tt)
                }), g.jsx("button", {
                  "aria-label": "Projectlocatie zoeken",
                  onClick: () => Vt(tt),
                  disabled: ht,
                  className: "px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                  children: ht ? g.jsx(Ns, {
                    size: 14,
                    className: "animate-spin"
                  }) : g.jsx($c, {
                    size: 14
                  })
                })]
              }), et.length > 0 && g.jsxs("div", {
                className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto",
                children: [et.map((ie, Se) => {
                  const Re = Fd(ie);
                  return g.jsxs("button", {
                    className: "w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0",
                    onClick: () => {
                      P({
                        projectLocation: Re.name,
                        projectAddress: Re.address,
                        projectPostalCode: Re.postalCode,
                        projectCity: Re.city,
                        projectPhone: Re.phone
                      }), ct([]), Ge("");
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
                  onClick: () => ct([]),
                  children: "Sluiten"
                })]
              })]
            }), g.jsxs("div", {
              className: "grid grid-cols-1 gap-3",
              children: [g.jsx("input", {
                id: "project-location",
                name: "projectLocation",
                "aria-label": "Projectlocatie",
                autoComplete: "organization",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Locatie",
                value: b.projectLocation,
                onChange: ie => P({
                  projectLocation: ie.target.value
                })
              }), g.jsx("input", {
                id: "project-address",
                name: "projectAddress",
                "aria-label": "Projectadres",
                autoComplete: "street-address",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Adres",
                value: b.projectAddress,
                onChange: ie => P({
                  projectAddress: ie.target.value
                })
              }), g.jsxs("div", {
                className: "flex gap-2",
                children: [g.jsx("input", {
                  id: "project-postal-code",
                  name: "projectPostalCode",
                  "aria-label": "Postcode project",
                  autoComplete: "postal-code",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 w-1/3",
                  placeholder: "Postcode",
                  value: b.projectPostalCode,
                  onChange: ie => P({
                    projectPostalCode: ie.target.value
                  })
                }), g.jsx("input", {
                  id: "project-city",
                  name: "projectCity",
                  "aria-label": "Plaats project",
                  autoComplete: "address-level2",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 w-2/3",
                  placeholder: "Plaats",
                  value: b.projectCity,
                  onChange: ie => P({
                    projectCity: ie.target.value
                  })
                })]
              }), g.jsx("input", {
                id: "project-contact-person",
                name: "projectContactPerson",
                "aria-label": "Contactpersoon project",
                autoComplete: "name",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Contactpersoon",
                value: b.projectContactPerson,
                onChange: ie => P({
                  projectContactPerson: ie.target.value
                })
              }), g.jsx("input", {
                id: "project-phone",
                name: "projectPhone",
                "aria-label": "Telefoon project",
                type: "tel",
                autoComplete: "tel",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Telefoon",
                value: b.projectPhone,
                onChange: ie => P({
                  projectPhone: ie.target.value
                })
              }), g.jsx("input", {
                id: "project-email",
                name: "projectEmail",
                "aria-label": "E-mail project",
                type: "email",
                autoComplete: "email",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Email",
                value: b.projectEmail,
                onChange: ie => P({
                  projectEmail: ie.target.value
                })
              }), g.jsx("input", {
                id: "installation-responsible",
                name: "installationResponsible",
                "aria-label": "Installatieverantwoordelijke",
                autoComplete: "name",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Installatieverantwoordelijke (IV'er)",
                value: b.installationResponsible,
                onChange: ie => P({
                  installationResponsible: ie.target.value
                })
              }), g.jsxs("div", {
                className: "flex gap-2 items-center",
                children: [g.jsx("input", {
                  id: "bagviewer-id",
                  name: "bagviewerId",
                  "aria-label": "ID Bagviewer",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 flex-grow",
                  placeholder: "ID Bagviewer",
                  value: b.idBagviewer,
                  onChange: ie => P({
                    idBagviewer: ie.target.value
                  })
                }), g.jsx("button", {
                  onClick: zl,
                  disabled: Bn,
                  className: "bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 text-sm font-bold whitespace-nowrap",
                  children: Bn ? "..." : g.jsxs(g.Fragment, {
                    children: [g.jsx($c, {
                      size: 16
                    }), " Zoek ID"]
                  })
                })]
              }), g.jsxs("div", {
                className: "mt-4 border-t border-emerald-200 pt-4",
                children: [g.jsx("label", {
                  htmlFor: "location-photo",
                  className: "block text-xs font-bold text-emerald-800 uppercase mb-2",
                  children: "Foto voorblad rapport"
                }), g.jsxs("div", {
                  className: "flex gap-4 items-center",
                  children: [g.jsxs("label", {
                    className: "bg-emerald-600 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2 text-sm font-bold hover:bg-emerald-700 transition shadow-sm",
                    children: [ii ? g.jsx(Ns, {
                      className: "animate-spin",
                      size: 18
                    }) : g.jsx(lC, {
                      size: 18
                    }), g.jsx("span", {
                      children: ii ? "Uploaden..." : "Foto maken/kiezen"
                    }), g.jsx("input", {
                      id: "location-photo",
                      name: "locationPhoto",
                      "aria-label": "Foto voorblad rapport",
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: Fs,
                      disabled: ii
                    })]
                  }), b.locationPhotoUrl && g.jsx("img", {
                    src: b.locationPhotoUrl,
                    className: "h-20 w-20 object-cover rounded-lg border-2 border-emerald-500",
                    alt: "Voorblad"
                  })]
                })]
              })]
            })]
          }), g.jsxs("div", {
            className: `bg-white p-5 md:p-8 rounded-[24px] border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 mt-6 ${b.isContributionMode ? "opacity-70 pointer-events-none" : ""}`,
            children: [g.jsx("h2", {
              className: "text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4",
              children: "Gebruiksfunctie"
            }), g.jsxs("div", {
              className: "grid grid-cols-1 md:grid-cols-2 gap-4",
              children: [g.jsx("div", {
                className: "space-y-2",
                children: bl.map(ie => g.jsxs("label", {
                  className: "flex items-center space-x-2 cursor-pointer p-1 hover:bg-emerald-50 rounded",
                  children: [g.jsx("input", {
                    id: `usage-${ie.key}`,
                    name: "usageFunctions",
                    type: "checkbox",
                    checked: b.usageFunctions[ie.key],
                    onChange: Se => Q(ie.key, Se.target.checked),
                    className: "h-4 w-4 text-emerald-600 rounded"
                  }), g.jsx("span", {
                    className: "text-sm text-gray-700",
                    children: ie.label
                  })]
                }, ie.key))
              }), g.jsx("div", {
                className: "space-y-2",
                children: Jo.map(ie => g.jsxs("label", {
                  className: "flex items-center space-x-2 cursor-pointer p-1 hover:bg-emerald-50 rounded",
                  children: [g.jsx("input", {
                    id: `usage-${ie.key}`,
                    name: "usageFunctions",
                    type: "checkbox",
                    checked: b.usageFunctions[ie.key],
                    onChange: Se => Q(ie.key, Se.target.checked),
                    className: "h-4 w-4 text-emerald-600 rounded"
                  }), g.jsx("span", {
                    className: "text-sm text-gray-700",
                    children: ie.label
                  })]
                }, ie.key))
              })]
            })]
          }), g.jsxs("div", {
            className: "bg-white p-5 md:p-8 rounded-[24px] border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 mt-6",
            children: [g.jsx("h2", {
              className: "text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4",
              children: "Inspectiebedrijf"
            }), !b.isContributionMode && g.jsxs("div", {
              className: "relative mb-3",
              children: [g.jsxs("div", {
                className: "flex gap-1.5",
                children: [g.jsx("input", {
                  id: "inspection-company-search",
                  name: "inspectionCompanySearch",
                  "aria-label": "Zoek inspectiebedrijf",
                  type: "text",
                  placeholder: "Zoek bedrijf...",
                  className: "flex-1 border rounded p-2 text-sm bg-white",
                  value: re,
                  onChange: ie => ve(ie.target.value),
                  onKeyDown: ie => ie.key === "Enter" && De(re)
                }), g.jsx("button", {
                  "aria-label": "Inspectiebedrijf zoeken",
                  onClick: () => De(re),
                  disabled: ce,
                  className: "px-3 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                  children: ce ? g.jsx(Ns, {
                    size: 14,
                    className: "animate-spin"
                  }) : g.jsx($c, {
                    size: 14
                  })
                })]
              }), Z.length > 0 && g.jsxs("div", {
                className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto",
                children: [Z.map((ie, Se) => {
                  const Re = Fd(ie);
                  return g.jsxs("button", {
                    className: "w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0",
                    onClick: () => {
                      P({
                        inspectionCompany: Re.name,
                        inspectionCompanyAddress: Re.address,
                        inspectionCompanyPostalCode: Re.postalCode,
                        inspectionCompanyCity: Re.city,
                        inspectionCompanyPhone: Re.phone,
                        inspectionCompanyEmail: ""
                      }), Y([]), ve("");
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
                  onClick: () => Y([]),
                  children: "Sluiten"
                })]
              })]
            }), g.jsxs("div", {
              className: "grid grid-cols-1 gap-3",
              children: [g.jsx(f2, {
                id: "inspection-company-name",
                name: "inspectionCompanyName",
                label: "Bedrijfsnaam inspectiebedrijf",
                list: "companies-list",
                className: `border rounded p-2 w-full ${b.isContributionMode ? "bg-gray-100" : ""}`,
                disabled: b.isContributionMode,
                placeholder: "Bedrijfsnaam (Kies of Typ)",
                value: b.inspectionCompany,
                onValueChange: ie => {
                  P({
                    inspectionCompany: ie
                  });
                  const Se = He.find(lt => lt.label === ie);
                  if (Se && Se.data) {
                    P({
                      inspectionCompany: ie,
                      inspectionCompanyAddress: Se.data.address || "",
                      inspectionCompanyPostalCode: Se.data.postalCode || "",
                      inspectionCompanyCity: Se.data.city || "",
                      inspectionCompanyPhone: Se.data.phone || "",
                      inspectionCompanyEmail: Se.data.email || ""
                    });
                    return;
                  }
                  const Re = DT.find(lt => lt.name === ie);
                  Re && P({
                    inspectionCompany: Re.name,
                    inspectionCompanyAddress: Re.address,
                    inspectionCompanyPostalCode: Re.postalCode,
                    inspectionCompanyCity: Re.city,
                    inspectionCompanyPhone: Re.phone,
                    inspectionCompanyEmail: Re.email
                  });
                }
              }), g.jsx("datalist", {
                id: "companies-list",
                children: [...He.map(ie => ie.label), ...DT.map(ie => ie.name)].map((ie, Se) => g.jsx("option", {
                  value: ie
                }, Se))
              }), g.jsx("input", {
                id: "inspection-company-address",
                name: "inspectionCompanyAddress",
                "aria-label": "Adres inspectiebedrijf",
                autoComplete: "street-address",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Adres",
                value: b.inspectionCompanyAddress,
                onChange: ie => P({
                  inspectionCompanyAddress: ie.target.value
                })
              }), g.jsxs("div", {
                className: "flex gap-2",
                children: [g.jsx("input", {
                  id: "inspection-company-postal-code",
                  name: "inspectionCompanyPostalCode",
                  "aria-label": "Postcode inspectiebedrijf",
                  autoComplete: "postal-code",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 w-1/3",
                  placeholder: "Postcode",
                  value: b.inspectionCompanyPostalCode,
                  onChange: ie => P({
                    inspectionCompanyPostalCode: ie.target.value
                  })
                }), g.jsx("input", {
                  id: "inspection-company-city",
                  name: "inspectionCompanyCity",
                  "aria-label": "Plaats inspectiebedrijf",
                  autoComplete: "address-level2",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 w-2/3",
                  placeholder: "Plaats",
                  value: b.inspectionCompanyCity,
                  onChange: ie => P({
                    inspectionCompanyCity: ie.target.value
                  })
                })]
              }), g.jsx("input", {
                id: "inspection-company-phone",
                name: "inspectionCompanyPhone",
                "aria-label": "Telefoon inspectiebedrijf",
                type: "tel",
                autoComplete: "tel",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Tel",
                value: b.inspectionCompanyPhone,
                onChange: ie => P({
                  inspectionCompanyPhone: ie.target.value
                })
              }), g.jsx("input", {
                id: "inspection-company-email",
                name: "inspectionCompanyEmail",
                "aria-label": "E-mail inspectiebedrijf",
                type: "email",
                autoComplete: "email",
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                placeholder: "Email",
                value: b.inspectionCompanyEmail,
                onChange: ie => P({
                  inspectionCompanyEmail: ie.target.value
                })
              })]
            }), g.jsxs("div", {
              className: "mt-4 pt-4 border-t border-emerald-200",
              children: [g.jsx("h2", {
                className: "text-sm font-bold text-emerald-700 uppercase mb-2",
                children: "Inspecteur"
              }), g.jsxs("div", {
                className: "grid grid-cols-1 gap-3",
                children: [g.jsx(f2, {
                  id: "inspector-name",
                  name: "inspectorName",
                  label: "Naam inspecteur",
                  list: "inspectors-list",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                  placeholder: "Naam Inspecteur",
                  value: b.inspectorName,
                  disabled: r === "inspector",
                  onValueChange: ie => {
                    const Se = Ye.find(Re => Re.full_name === ie);
                    P(Se ? {
                      inspectorName: ie,
                      assignedInspectorId: Se.id,
                      sciosRegistrationNumber: Se.scios_nr || ""
                    } : {
                      inspectorName: ie,
                      assignedInspectorId: void 0
                    });
                  }
                }), g.jsx("datalist", {
                  id: "inspectors-list",
                  children: Ye.map((ie, Se) => g.jsx("option", {
                    value: ie.full_name
                  }, Se))
                }), g.jsx("input", {
                  id: "scios-registration-number",
                  name: "sciosRegistrationNumber",
                  "aria-label": "SCIOS-registratienummer",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                  placeholder: "SCIOS Nr",
                  value: b.sciosRegistrationNumber,
                  onChange: ie => P({
                    sciosRegistrationNumber: ie.target.value
                  })
                }), g.jsx("input", {
                  id: "inspection-date",
                  name: "inspectionDate",
                  "aria-label": "Inspectiedatum",
                  className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50",
                  type: "date",
                  value: b.date,
                  onChange: ie => P({
                    date: ie.target.value
                  })
                })]
              })]
            })]
          }), g.jsxs("div", {
            className: "bg-blue-50 p-4 rounded border border-blue-100",
            children: [g.jsx("label", {
              htmlFor: "total-components",
              className: "text-xs font-bold text-blue-800 uppercase",
              children: "Totaal aantal componenten"
            }), g.jsx("input", {
              id: "total-components",
              name: "totalComponents",
              type: "number",
              className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 mt-1 bg-white",
              value: b.totalComponents || "",
              onChange: ie => P({
                totalComponents: parseInt(ie.target.value) || 0
              }),
              placeholder: "0"
            }), b.totalComponents > 0 && g.jsxs("p", {
              className: "text-xs text-blue-600 mt-2 font-bold",
              children: ["Steekproef: inspecteer ", Xo, " items."]
            })]
          })]
        }), K === "measure" && g.jsxs("div", {
          className: "space-y-4",
          children: [g.jsx("h2", {
            className: "text-lg font-bold text-gray-700 border-b pb-2",
            children: "Metingen & Beproevingen"
          }), g.jsxs("div", {
            className: "bg-white p-5 md:p-8 rounded-[24px] border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 mb-6",
            children: [g.jsx("label", {
              className: "block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4",
              children: "Gebruikte Meetinstrumenten"
            }), g.jsxs("div", {
              className: "flex gap-2 mb-3",
              children: [g.jsxs("select", {
                className: "w-full h-12 px-4 rounded-[14px] bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-[14px] outline-none placeholder-on-surface-variant/50 bg-white",
                value: di,
                onChange: ie => {
                  const Se = ie.target.value,
                    Re = [...ge, ...xt, ...Nt].find(lt => lt.id === Se);
                  Re && (D(Re), xi(Re.id), Vi(""));
                },
                children: [g.jsx("option", {
                  value: "",
                  disabled: !0,
                  children: "-- Selecteer Meetinstrument --"
                }), ge.length > 0 && g.jsx("optgroup", {
                  label: "⭐ Mijn Koffer",
                  children: ge.map(ie => g.jsxs("option", {
                    value: ie.id,
                    children: [ie.name, " (SN: ", ie.serialNumber || "Onbekend", ")"]
                  }, ie.id))
                }), xt.length > 0 && g.jsx("optgroup", {
                  label: "🕐 Eerder Gebruikt",
                  children: xt.map(ie => g.jsxs("option", {
                    value: ie.id,
                    children: [ie.name, " (SN: ", ie.serialNumber || "Onbekend", ")"]
                  }, ie.id))
                }), Nt.length > 0 && g.jsx("optgroup", {
                  label: "Alle Instrumenten",
                  children: Nt.map(ie => g.jsxs("option", {
                    value: ie.id,
                    children: [ie.name, " (SN: ", ie.serialNumber || "Onbekend", ")"]
                  }, ie.id))
                })]
              }), g.jsxs("button", {
                onClick: () => {
                  Mt(!0), gr(""), Dr(!1), bn(""), Fn(""), ei("");
                },
                className: "bg-blue-600 text-white p-2 rounded whitespace-nowrap flex items-center gap-1 text-sm font-bold",
                children: [g.jsx(uC, {
                  size: 16
                }), " Nieuw"]
              })]
            }), Ar && g.jsxs("div", {
              className: "bg-white p-3 rounded border border-blue-200 mb-3 animate-fadeIn",
              children: [g.jsx("h3", {
                className: "text-[10px] font-bold text-blue-800 uppercase mb-2",
                children: "Instrument toevoegen"
              }), g.jsx("input", {
                className: "border p-2 rounded text-sm w-full mb-2",
                placeholder: "Zoek bestaand instrument op naam of serienummer...",
                value: Rr,
                onChange: ie => {
                  gr(ie.target.value), Dr(!1);
                },
                autoFocus: !0
              }), Rr.trim().length > 0 && (() => {
                const ie = Rr.trim().toLowerCase(),
                  Se = Qt.filter(Re => Re.name.toLowerCase().includes(ie) || Re.serialNumber.toLowerCase().includes(ie));
                return g.jsxs("div", {
                  className: "mb-2",
                  children: [Se.length > 0 ? g.jsx("div", {
                    className: "border rounded divide-y max-h-40 overflow-y-auto mb-2",
                    children: Se.map(Re => g.jsxs("button", {
                      onClick: () => {
                        D(Re), hs(Number(Re.id)), xi(Re.id), Mt(!1), gr("");
                      },
                      className: "w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors",
                      children: [g.jsx("span", {
                        className: "font-medium text-sm",
                        children: Re.name
                      }), " ", g.jsxs("span", {
                        className: "text-xs text-gray-500",
                        children: ["(SN: ", Re.serialNumber || "Onbekend", ")"]
                      })]
                    }, Re.id))
                  }) : g.jsx("p", {
                    className: "text-xs text-gray-500 italic mb-2",
                    children: "Geen bestaand instrument gevonden."
                  }), !jr && g.jsx("button", {
                    onClick: () => {
                      Dr(!0), bn(Rr.trim());
                    },
                    className: "text-xs text-blue-600 underline hover:text-blue-800",
                    children: "Niets gevonden? Nieuw instrument aanmaken →"
                  })]
                });
              })(), jr && g.jsxs("div", {
                className: "border-t pt-3 mt-1 animate-fadeIn",
                children: [g.jsx("p", {
                  className: "text-[10px] font-bold text-blue-700 uppercase mb-2",
                  children: "Nieuw instrument aanmaken in database"
                }), g.jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-4 gap-2 mb-2",
                  children: [g.jsx("input", {
                    className: "border p-2 rounded text-sm w-full md:col-span-1",
                    placeholder: "Naam",
                    value: En,
                    onChange: ie => bn(ie.target.value)
                  }), g.jsx("input", {
                    className: "border p-2 rounded text-sm w-full md:col-span-1",
                    placeholder: "Serienummer",
                    value: Mn,
                    onChange: ie => Fn(ie.target.value)
                  }), g.jsxs("div", {
                    className: "flex gap-1 w-full md:col-span-2",
                    children: [g.jsx("input", {
                      className: "border p-2 rounded text-sm bg-white flex-grow min-w-0",
                      type: zn === "Indicatief" || zn === "n.v.t." ? "text" : "date",
                      placeholder: "Kalibratie-/ controledatum",
                      value: zn,
                      max: "2100-12-31",
                      onChange: ie => {
                        const Se = ie.target.value;
                        Se.length <= 10 && ei(Se);
                      },
                      onBlur: ie => {
                        ie.target.value.startsWith("000") && ei("");
                      },
                      disabled: zn === "Indicatief" || zn === "n.v.t.",
                      title: "Kalibratie-/ controledatum"
                    }), g.jsxs("select", {
                      className: "border p-2 rounded text-sm bg-white cursor-pointer shrink-0",
                      onChange: ie => {
                        ie.target.value === "date" ? ei("") : ei(ie.target.value);
                      },
                      value: zn === "Indicatief" || zn === "n.v.t." ? zn : "date",
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
                }), g.jsx("button", {
                  onClick: () => Cs(),
                  className: "w-full bg-green-600 text-white py-2 rounded text-xs font-bold hover:bg-green-700 shadow-sm transition-colors",
                  children: "Aanmaken in database & toevoegen aan meting"
                })]
              }), g.jsx("button", {
                onClick: () => {
                  Mt(!1), gr(""), Dr(!1), bn(""), Fn(""), ei("");
                },
                className: "mt-2 w-full bg-gray-100 text-gray-600 py-2 rounded text-xs font-bold hover:bg-gray-200 transition-colors",
                children: "Annuleren"
              })]
            }), g.jsx("div", {
              className: "space-y-2 mt-2",
              children: E.selectedInstruments.map(ie => {
                const Se = y(ie.calibrationDate);
                return g.jsxs("div", {
                  className: `flex justify-between items-center p-3 rounded border shadow-sm transition-colors ${Se === "expired" ? "bg-red-50 border-red-200" : Se === "warning" ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`,
                  children: [g.jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [g.jsx(YEe, {
                      size: 18,
                      className: Se === "expired" ? "text-red-600" : "text-emerald-600"
                    }), g.jsxs("div", {
                      children: [g.jsx("div", {
                        className: "font-bold text-sm text-gray-800",
                        children: ie.name
                      }), g.jsxs("div", {
                        className: "text-xs text-gray-500 italic",
                        children: ["SN: ", ie.serialNumber || "Onbekend", " | Kalibratie-/ controledatum: ", g.jsx("span", {
                          className: Se === "expired" ? "text-red-600 font-bold" : Se === "warning" ? "text-orange-600 font-bold" : "text-gray-700",
                          children: ie.calibrationDate || "Onbekend"
                        })]
                      })]
                    })]
                  }), g.jsx("button", {
                    onClick: () => $(ie.id),
                    className: "text-red-400 hover:text-red-600 p-2 transition-colors",
                    title: "Instrument verwijderen",
                    children: g.jsx(mf, {
                      size: 18
                    })
                  })]
                }, ie.id);
              })
            })]
          }), g.jsxs("div", {
            className: `grid grid-cols-2 gap-4 bg-white p-5 md:p-8 rounded-[24px] border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 mb-6 ${b.isContributionMode ? "opacity-70 pointer-events-none" : ""}`,
            children: [g.jsx("div", {
              className: "col-span-2",
              children: g.jsx("h3", {
                className: "text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2",
                children: "Algemene Installatiegegevens"
              })
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                className: "block text-xs text-gray-500 italic mb-1",
                children: "Stroomstelsel"
              }), g.jsx("div", {
                className: "relative w-full",
                children: g.jsxs("select", {
                  disabled: b.isContributionMode,
                  className: "border rounded px-3 w-full bg-white h-11 focus:outline-none focus:ring-2 focus:ring-emerald-500",
                  value: E.installationType,
                  onChange: ie => M({
                    installationType: ie.target.value
                  }),
                  children: [g.jsx("option", {
                    value: "TT",
                    children: "TT-Stelsel"
                  }), g.jsx("option", {
                    value: "TN-S",
                    children: "TN-S"
                  }), g.jsx("option", {
                    value: "TN-C-S",
                    children: "TN-C-S"
                  })]
                })
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                className: "block text-xs text-gray-500 italic mb-1",
                children: "Voorbeveiliging"
              }), g.jsx(f2, {
                id: "main-fuse",
                name: "mainFuse",
                label: "Voorbeveiliging",
                list: "fuses-list",
                className: "border rounded px-3 w-full bg-white h-11 focus:outline-none focus:ring-2 focus:ring-emerald-500",
                disabled: b.isContributionMode,
                value: E.mainFuse,
                onValueChange: ie => M({
                  mainFuse: ie
                }),
                placeholder: "Kies of typ..."
              }), g.jsx("datalist", {
                id: "fuses-list",
                children: g3e.map(ie => g.jsx("option", {
                  value: ie
                }, ie))
              })]
            })]
          }), g.jsxs("div", {
            className: "bg-white p-5 md:p-8 rounded-[24px] border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8",
            children: [g.jsxs("div", {
              className: "flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-5",
              children: [g.jsx("h3", {
                className: "text-[12px] font-bold text-on-surface-variant uppercase tracking-widest",
                children: "Metingen per Verdeelinrichting"
              }), g.jsxs("button", {
                onClick: () => j({
                  id: d2(),
                  name: "",
                  switchboardTemp: "20",
                  insulationResistance: "999",
                  impedance: "0.35"
                }),
                className: "bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm active:scale-95",
                children: [g.jsx(uC, {
                  size: 16
                }), " Verdeler Toevoegen"]
              })]
            }), g.jsx("div", {
              className: "space-y-4",
              children: E.boards.map((ie, Se) => g.jsxs("div", {
                className: "bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] shadow-sm overflow-hidden animate-fadeIn",
                children: [g.jsxs("div", {
                  className: "bg-surface-container-low px-5 py-3 border-b border-outline-variant/20 flex justify-between items-center",
                  children: [g.jsxs("span", {
                    className: "text-xs font-bold text-primary uppercase tracking-widest",
                    children: ["Verdeelinrichting #", Se + 1]
                  }), E.boards.length > 1 && g.jsx("button", {
                    onClick: () => {
                      window.confirm("Verwijder deze meting?") && V(ie.id);
                    },
                    className: "text-on-surface-variant/50 hover:text-error transition-colors p-1",
                    children: g.jsx(mf, {
                      size: 18
                    })
                  })]
                }), g.jsxs("div", {
                  className: "p-5 space-y-4",
                  children: [g.jsxs("div", {
                    children: [g.jsx("label", {
                      className: "text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1",
                      children: "Naam / Locatie Kast"
                    }), g.jsx("input", {
                      className: "w-full h-11 px-3 rounded-lg bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none font-bold",
                      placeholder: "Bijv. HVK Begane Grond",
                      value: ie.name,
                      onChange: Re => W(ie.id, {
                        ...ie,
                        name: Re.target.value
                      })
                    })]
                  }), g.jsxs("div", {
                    className: "grid grid-cols-3 gap-3",
                    children: [g.jsxs("div", {
                      children: [g.jsx("label", {
                        className: "text-[10px] font-bold text-on-surface-variant uppercase block mb-1",
                        children: "Temp (°C)"
                      }), g.jsx("input", {
                        type: "number",
                        className: "w-full h-11 px-3 rounded-lg bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none",
                        value: ie.switchboardTemp,
                        onChange: Re => W(ie.id, {
                          ...ie,
                          switchboardTemp: Re.target.value
                        }),
                        onWheel: Re => Re.target.blur()
                      })]
                    }), g.jsxs("div", {
                      children: [g.jsx("label", {
                        className: "text-[10px] font-bold text-on-surface-variant uppercase block mb-1",
                        children: "Riso (MΩ)"
                      }), g.jsx("input", {
                        type: "number",
                        className: "w-full h-11 px-3 rounded-lg bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none",
                        value: ie.insulationResistance,
                        onChange: Re => W(ie.id, {
                          ...ie,
                          insulationResistance: Re.target.value
                        }),
                        onWheel: Re => Re.target.blur()
                      })]
                    }), g.jsxs("div", {
                      children: [g.jsx("label", {
                        className: "text-[10px] font-bold text-on-surface-variant uppercase block mb-1",
                        children: "Zi (Ω)"
                      }), g.jsx("input", {
                        type: "number",
                        step: "0.01",
                        className: "w-full h-11 px-3 rounded-lg bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none",
                        value: ie.impedance,
                        onChange: Re => W(ie.id, {
                          ...ie,
                          impedance: Re.target.value
                        }),
                        onWheel: Re => Re.target.blur()
                      })]
                    })]
                  })]
                })]
              }, ie.id))
            })]
          })]
        }), K === "inspect" && g.jsxs("div", {
          className: "space-y-6",
          children: [g.jsxs("div", {
            className: "bg-surface-container-lowest border-2 border-dashed border-outline-variant/30 rounded-xl p-6 shadow-sm",
            children: [g.jsx("h3", {
              className: "font-headline font-extrabold text-primary mb-5 tracking-tight",
              children: pr ? "Gebrek Bewerken" : "Nieuw Gebrek Melden"
            }), g.jsxs("div", {
              className: "space-y-4",
              children: [g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Locatie"
                }), g.jsx("input", {
                  className: "w-full border rounded p-2",
                  placeholder: "Bijv. Meterkast",
                  value: Nr,
                  onChange: ie => Yr(ie.target.value)
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "1. Hoofdcategorie"
                }), Kt ? g.jsxs("div", {
                  className: "flex gap-2 animate-fadeIn",
                  children: [g.jsx("input", {
                    className: "w-full border rounded p-2 border-emerald-500 bg-emerald-50",
                    placeholder: "Nieuwe categorie...",
                    value: nn,
                    onChange: ie => Lr(ie.target.value),
                    autoFocus: !0
                  }), g.jsx("button", {
                    onClick: () => {
                      cr(!1), Rn("");
                    },
                    className: "p-2 text-gray-500 hover:text-red-500 border rounded hover:bg-gray-100",
                    children: g.jsx(Kc, {
                      size: 20
                    })
                  })]
                }) : g.jsxs("select", {
                  className: "w-full border rounded p-2 bg-gray-50",
                  value: pn,
                  onChange: ie => Ha(ie.target.value),
                  children: [g.jsx("option", {
                    value: "",
                    children: "-- Kies Hoofdcategorie --"
                  }), _i.map(ie => g.jsx("option", {
                    value: ie,
                    children: ie
                  }, ie)), g.jsx("option", {
                    value: "NEW",
                    className: "font-bold text-emerald-600",
                    children: "+ Nieuwe Categorie..."
                  })]
                })]
              }), !Kt && pn && g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "2. Subcategorie"
                }), g.jsxs("select", {
                  className: "w-full border rounded p-2",
                  value: Sn,
                  onChange: ie => va(ie.target.value),
                  children: [g.jsx("option", {
                    value: "",
                    children: "-- Kies Subcategorie --"
                  }), Hi.map(ie => g.jsx("option", {
                    value: ie,
                    children: ie
                  }, ie))]
                })]
              }), !Kt && Sn && g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "3. Soort Gebrek"
                }), g.jsxs("select", {
                  className: "w-full border rounded p-2",
                  value: Or ? "CUSTOM" : rt,
                  onChange: ie => eo(ie.target.value),
                  children: [g.jsx("option", {
                    value: "",
                    disabled: !0,
                    children: "-- Kies Gebrek --"
                  }), g.jsx("option", {
                    value: "CUSTOM",
                    className: "font-bold text-blue-600",
                    children: "--- Maatwerk ---"
                  }), as.map(ie => g.jsx("option", {
                    value: ie.id,
                    children: ie.shortName
                  }, ie.id))]
                })]
              }), (rt || Or) && g.jsxs("div", {
                className: "space-y-4 animate-fadeIn pt-2",
                children: [!Or && _n && g.jsx("div", {
                  className: "w-full border rounded p-3 bg-gray-100 text-gray-700 text-sm whitespace-pre-wrap",
                  children: _n
                }), g.jsxs("div", {
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: Or ? "Omschrijving Gebrek" : "Aanvullende Toelichting"
                  }), g.jsx("textarea", {
                    className: `w-full border rounded p-2 h-24 ${Or ? "border-blue-300 bg-blue-50" : ""}`,
                    placeholder: "Details...",
                    value: fn,
                    onChange: ie => tn(ie.target.value)
                  })]
                }), Or && g.jsx("div", {
                  className: "bg-blue-50 p-4 rounded border border-blue-100 space-y-4",
                  children: g.jsxs("div", {
                    children: [g.jsx("label", {
                      className: "block text-xs font-bold text-gray-500 uppercase mb-2",
                      children: "Classificatie"
                    }), g.jsx("div", {
                      className: "flex gap-2",
                      children: ["Red", "Orange", "Yellow", "Blue"].map(ie => g.jsx("button", {
                        onClick: () => qe(ie),
                        className: `flex-1 py-2 rounded text-xs font-bold border transition-all ${Fe === ie && ie === "Red" ? "bg-red-600 text-white" : "bg-white"}`,
                        children: ie
                      }, ie))
                    })]
                  })
                })]
              }), g.jsxs("div", {
                className: "flex gap-2 pt-2",
                children: [g.jsxs("label", {
                  className: "flex-1 bg-gray-100 p-3 rounded cursor-pointer flex justify-center border hover:bg-gray-200",
                  children: [g.jsx(lC, {
                    size: 20
                  }), g.jsx("input", {
                    type: "file",
                    accept: "image/*",
                    className: "hidden",
                    onChange: ie => Al(ie, 1)
                  })]
                }), en && g.jsx("img", {
                  src: en,
                  className: "w-12 h-12 object-cover rounded border"
                }), g.jsxs("label", {
                  className: "flex-1 bg-gray-100 p-3 rounded cursor-pointer flex justify-center border hover:bg-gray-200",
                  children: [g.jsx(lC, {
                    size: 20
                  }), g.jsx("input", {
                    type: "file",
                    accept: "image/*",
                    className: "hidden",
                    onChange: ie => Al(ie, 2)
                  })]
                }), dn && g.jsx("img", {
                  src: dn,
                  className: "w-12 h-12 object-cover rounded border"
                })]
              }), g.jsxs("div", {
                className: "flex gap-2 pt-2",
                children: [pr && g.jsx("button", {
                  onClick: () => Wr(null),
                  className: "flex-1 bg-gray-400 text-white py-3 rounded font-bold",
                  children: "Annuleren"
                }), g.jsx("button", {
                  onClick: qa,
                  disabled: !Nr || ii,
                  className: "flex-1 bg-emerald-600 text-white py-3 rounded font-bold",
                  children: ii ? "Wacht..." : "Opslaan"
                })]
              })]
            })]
          }), g.jsx("div", {
            className: "space-y-3",
            children: w.map((ie, Se) => {
              const Re = ie.classification === "Red" ? "#ba1a1a" : ie.classification === "Orange" || ie.classification === "Amber" ? "#f97316" : ie.classification === "Blue" ? "#3b82f6" : "#eab308",
                lt = `${Re}18`;
              return g.jsxs("div", {
                draggable: !0,
                onDragStart: () => yt(Se),
                onDragOver: wt => {
                  wt.preventDefault(), Bt(Se);
                },
                onDragEnd: () => {
                  yt(null), Bt(null);
                },
                onDrop: () => {
                  if (ut === null || ut === Se) return;
                  const wt = [...w],
                    [rr] = wt.splice(ut, 1);
                  wt.splice(Se, 0, rr), q(wt), yt(null), Bt(null);
                },
                className: `bg-surface-container-lowest border border-outline-variant/20 shadow-sm p-4 rounded-[20px] flex items-start gap-4 group select-none transition-all hover:shadow-md ${zt === Se && ut !== Se ? "ring-2 ring-primary ring-offset-2" : ""}`,
                style: {
                  opacity: ut === Se ? .5 : 1
                },
                children: [g.jsx("button", {
                  className: "text-on-surface-variant/40 mt-1 cursor-grab active:cursor-grabbing hover:text-primary transition-colors shrink-0",
                  children: g.jsx($V, {
                    size: 20
                  })
                }), g.jsx("div", {
                  className: "w-1.5 h-full rounded-full self-stretch",
                  style: {
                    backgroundColor: Re
                  }
                }), g.jsxs("div", {
                  className: "flex-1 min-w-0 py-0.5",
                  children: [g.jsxs("div", {
                    className: "flex items-center gap-2 mb-1",
                    children: [g.jsxs("span", {
                      className: "font-extrabold text-[#041632] text-sm md:text-base",
                      children: [Se + 1, ". ", ie.location]
                    }), g.jsx("span", {
                      className: "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      style: {
                        color: Re,
                        backgroundColor: lt
                      },
                      children: ie.classification
                    })]
                  }), g.jsx("p", {
                    className: "text-[13px] text-on-surface-variant/80 whitespace-pre-wrap leading-snug line-clamp-3 md:line-clamp-none",
                    children: ie.description
                  })]
                }), g.jsxs("div", {
                  className: "flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 shrink-0 self-start mt-1 bg-surface-container-low p-1 rounded-full",
                  children: [g.jsx("button", {
                    onClick: () => pi(ie),
                    className: "p-2 bg-white rounded-full text-on-surface-variant hover:text-primary shadow-sm active:scale-95 transition-all",
                    children: g.jsx(gf, {
                      size: 16
                    })
                  }), g.jsx("button", {
                    onClick: () => X(ie.id),
                    className: "p-2 bg-white rounded-full text-on-surface-variant hover:text-error shadow-sm active:scale-95 transition-all",
                    children: g.jsx(mf, {
                      size: 16
                    })
                  })]
                })]
              }, ie.id);
            })
          })]
        }), K === "report" && g.jsxs("div", {
          className: "text-center py-6 space-y-6",
          children: [!b.isContributionMode && g.jsxs("div", {
            className: "bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-[24px] shadow-sm text-left",
            children: [g.jsxs("h3", {
              className: "font-bold text-primary border-b border-outline-variant/20 pb-3 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest",
              children: [g.jsx(Eg, {
                size: 18
              }), " Advies Inspectiefrequentie"]
            }), g.jsxs("div", {
              className: "space-y-5",
              children: [g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2",
                  children: "Interval:"
                }), g.jsxs("div", {
                  className: "flex gap-4",
                  children: [g.jsxs("label", {
                    className: "flex items-center gap-2 cursor-pointer bg-surface-container-low px-4 py-3 rounded-xl border border-transparent focus-within:border-primary transition-all hover:bg-surface-container-high w-1/2",
                    children: [g.jsx("input", {
                      type: "radio",
                      name: "interval",
                      checked: b.inspectionInterval === 3,
                      onChange: () => P({
                        inspectionInterval: 3
                      }),
                      className: "w-4 h-4 text-primary"
                    }), g.jsx("span", {
                      className: "font-bold text-sm",
                      children: "3 Jaar"
                    })]
                  }), g.jsxs("label", {
                    className: "flex items-center gap-2 cursor-pointer bg-surface-container-low px-4 py-3 rounded-xl border border-transparent focus-within:border-primary transition-all hover:bg-surface-container-high w-1/2",
                    children: [g.jsx("input", {
                      type: "radio",
                      name: "interval",
                      checked: b.inspectionInterval === 5,
                      onChange: () => P({
                        inspectionInterval: 5
                      }),
                      className: "w-4 h-4 text-primary"
                    }), g.jsx("span", {
                      className: "font-bold text-sm",
                      children: "5 Jaar"
                    })]
                  })]
                })]
              }), g.jsxs("div", {
                className: "bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between",
                children: [g.jsx("span", {
                  className: "text-xs font-bold text-on-surface-variant uppercase tracking-widest",
                  children: "Volgende inspectie uiterlijk:"
                }), g.jsx("span", {
                  className: "font-extrabold text-primary text-lg",
                  children: b.nextInspectionDate
                })]
              })]
            })]
          }), g.jsxs("div", {
            className: "bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-[24px] shadow-sm text-left",
            children: [g.jsx("h3", {
              className: "font-bold text-primary pb-3 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest",
              children: "Handtekening Inspecteur"
            }), b.signatureUrl ? g.jsxs("div", {
              className: "flex flex-col items-center bg-surface-container-low p-4 rounded-[16px] border border-outline-variant/20",
              children: [g.jsx("img", {
                src: b.signatureUrl,
                className: "h-24 mix-blend-multiply mb-3"
              }), g.jsx("button", {
                onClick: () => P({
                  signatureUrl: ""
                }),
                className: "text-xs text-error font-bold px-4 py-2 bg-white rounded-full shadow-sm hover:bg-error-container hover:text-on-error-container transition-all",
                children: "Opnieuw tekenen"
              })]
            }) : g.jsxs("div", {
              className: "border border-outline-variant/30 rounded-[16px] bg-surface-container-low overflow-hidden",
              children: [g.jsx(Fg, {
                ref: ma,
                canvasProps: {
                  width: 300,
                  height: 150,
                  className: "w-full h-[150px] cursor-crosshair"
                }
              }), g.jsxs("div", {
                className: "border-t border-outline-variant/20 flex justify-end px-4 py-3 gap-3 bg-surface-container-lowest",
                children: [g.jsx("button", {
                  onClick: Tc,
                  className: "text-xs text-error font-bold hover:underline px-2",
                  children: "Wissen"
                }), g.jsx("button", {
                  onClick: iu,
                  className: "text-xs bg-primary text-white px-5 py-2 rounded-full font-bold hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm",
                  children: "Opslaan"
                })]
              })]
            })]
          }), b.supabaseId ? g.jsxs("div", {
            className: "bg-[#f0fdf4] p-6 rounded-[24px] border border-[#bbf7d0] mb-6 w-full text-left shadow-sm",
            children: [g.jsxs("h3", {
              className: "font-extrabold text-[#166534] mb-3 flex items-center gap-2 text-base",
              children: [g.jsx(ZCe, {
                size: 22
              }), " Klaar met inspecteren?"]
            }), g.jsx("button", {
              onClick: fo,
              disabled: ue,
              className: "w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-3 text-[15px] disabled:opacity-70 transition-all active:scale-[0.98]",
              children: ue ? g.jsx(Ns, {
                className: "animate-spin",
                size: 20
              }) : b.isContributionMode ? "Bijdrage Uploaden" : "Inleveren bij Kantoor"
            })]
          }) : g.jsxs("div", {
            className: "bg-primary/5 p-6 rounded-[24px] border border-primary/10 mb-6 w-full text-left shadow-sm",
            children: [g.jsxs("h3", {
              className: "font-extrabold text-primary mb-2 flex items-center gap-2 text-base",
              children: [g.jsx(x5, {
                size: 22
              }), " Cloud Koppeling"]
            }), g.jsx("p", {
              className: "text-[13px] text-on-surface-variant mb-4 font-medium",
              children: "Nog niet in het online dashboard."
            }), g.jsx("button", {
              onClick: Ci,
              disabled: ue,
              className: "w-full bg-primary hover:bg-primary-container hover:text-on-primary-container text-white py-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-3 text-[15px] disabled:opacity-70 transition-all active:scale-[0.98]",
              children: ue ? g.jsx(Ns, {
                className: "animate-spin",
                size: 20
              }) : b.isContributionMode ? "Bijdrage Uploaden" : "Uploaden als Nieuwe Opdracht"
            })]
          }), !b.isContributionMode && g.jsxs("button", {
            onClick: Zi,
            className: "bg-surface-container-highest hover:bg-outline-variant text-on-surface py-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 text-sm w-full transition-all active:scale-[0.98]",
            children: [g.jsx(OM, {
              size: 18
            }), " Zoek Cloud Bijdragen"]
          }), g.jsxs("div", {
            className: "bg-[#fff7ed] p-6 rounded-[24px] border border-[#ffedd5] mb-6 text-left shadow-sm",
            children: [g.jsxs("h3", {
              className: "font-extrabold text-[#9a3412] mb-4 flex items-center gap-2 uppercase tracking-widest text-[11px]",
              children: [g.jsx(Ng, {
                size: 16
              }), " Data & Backup"]
            }), g.jsxs("div", {
              className: "grid grid-cols-1 md:grid-cols-2 gap-4",
              children: [g.jsxs("button", {
                onClick: Zo,
                className: "bg-[#ea580c] hover:bg-[#c2410c] text-white py-3.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]",
                children: [g.jsx(Ng, {
                  size: 18
                }), " Backup Opslaan"]
              }), g.jsxs("button", {
                onClick: ho,
                className: "bg-surface-container-lowest hover:bg-surface-container-low text-[#ea580c] border border-[#ea580c]/20 py-3.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]",
                children: [g.jsx(uC, {
                  size: 18
                }), " Samenvoegen (Lokaal)"]
              })]
            }), g.jsx("input", {
              type: "file",
              ref: Ki,
              onChange: Ua,
              accept: ".json,application/json",
              className: "hidden"
            })]
          }), !b.isContributionMode && g.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-2 gap-4 w-full",
            children: [g.jsxs("button", {
              onClick: vl,
              className: "bg-surface-container-lowest text-primary border border-primary/20 hover:bg-primary/5 py-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
              children: [g.jsx(HEe, {
                size: 20
              }), g.jsx("span", {
                children: "Bevindingen Delen"
              })]
            }), g.jsxs("button", {
              onClick: gs,
              disabled: ue || !b.signatureUrl,
              className: "bg-primary text-white py-4 rounded-2xl font-bold shadow-md shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container flex items-center justify-center gap-3 disabled:opacity-60 transition-all active:scale-[0.98]",
              children: [ue ? g.jsx(Ns, {
                className: "animate-spin",
                size: 20
              }) : g.jsx(Ng, {
                size: 20
              }), g.jsx("span", {
                children: "Definitief Rapport (PDF)"
              })]
            })]
          })]
        })]
      }), g.jsxs("div", {
        className: "safe-bottom bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/10 p-3 md:p-5 flex justify-between items-center sticky bottom-0 z-40",
        children: [g.jsxs("button", {
          onClick: ci,
          disabled: ra === 0,
          className: "flex min-h-11 items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-30 transition-all active:scale-95 text-sm",
          children: [g.jsx(b5, {
            size: 18
          }), " Vorige"]
        }), ra < Rm.length - 1 ? g.jsxs("button", {
          onClick: _s,
          className: "flex min-h-11 items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-full font-bold text-white bg-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md shadow-primary/20 active:scale-95 text-sm",
          children: ["Volgende ", g.jsx(y5, {
            size: 18
          })]
        }) : g.jsx("span", {
          className: "text-[10px] sm:text-xs font-bold flex items-center gap-2 text-primary uppercase tracking-wide sm:tracking-widest bg-primary/10 px-3 sm:px-4 py-2 rounded-full",
          children: "Klaar voor afronding"
        })]
      })]
    }), i && g.jsx("div", {
      className: "fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] sm:p-4",
      children: g.jsxs("div", {
        className: "bg-surface-container-lowest rounded-t-[24px] sm:rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[94dvh] sm:h-[85vh] md:h-[650px]",
        children: [g.jsxs("div", {
          className: "p-5 border-b border-outline-variant/10 bg-primary/5 flex justify-between items-center",
          children: [g.jsxs("h2", {
            className: "text-lg font-bold text-primary flex items-center gap-2",
            children: [g.jsx(u2, {
              size: 22
            }), " Persoonlijke Instellingen"]
          }), g.jsx("button", {
            onClick: () => a(!1),
            className: "text-on-surface-variant hover:text-error bg-white p-1.5 rounded-full shadow-sm active:scale-95 transition-all",
            children: g.jsx(Kc, {
              size: 20
            })
          })]
        }), g.jsxs("div", {
          className: "flex border-b border-outline-variant/10 bg-surface-container-highest overflow-x-auto no-scrollbar",
          children: [g.jsx("button", {
            onClick: () => l("persoonlijk"),
            className: `flex-1 min-w-max px-4 whitespace-nowrap py-3.5 text-xs md:text-sm font-bold transition-colors ${c === "persoonlijk" ? "bg-white text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary hover:bg-white/50"}`,
            children: "Persoonlijk"
          }), g.jsx("button", {
            onClick: () => l("bedrijf"),
            className: `flex-1 min-w-max px-4 whitespace-nowrap py-3.5 text-xs md:text-sm font-bold transition-colors ${c === "bedrijf" ? "bg-white text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary hover:bg-white/50"}`,
            children: "Mijn Bedrijf"
          }), g.jsx("button", {
            onClick: () => l("handtekening"),
            className: `flex-1 min-w-max px-4 whitespace-nowrap py-3.5 text-xs md:text-sm font-bold transition-colors ${c === "handtekening" ? "bg-white text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary hover:bg-white/50"}`,
            children: "Handtekening"
          }), g.jsx("button", {
            onClick: () => l("instrumenten"),
            className: `flex-1 min-w-max px-4 whitespace-nowrap py-3.5 text-xs md:text-sm font-bold transition-colors ${c === "instrumenten" ? "bg-white text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary hover:bg-white/50"}`,
            children: "De Koffer"
          })]
        }), g.jsxs("div", {
          className: "p-4 md:p-6 overflow-y-auto flex-grow bg-white",
          children: [c === "persoonlijk" && g.jsxs("div", {
            className: "space-y-4",
            children: [g.jsx("div", {
              className: "bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm text-blue-800",
              children: "Vul hier je gegevens in. We kunnen deze straks automatisch invullen bij elke nieuwe inspectie!"
            }), g.jsxs("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
              children: [g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Volledige Naam"
                }), g.jsx("input", {
                  className: "w-full border rounded p-3",
                  value: u.full_name || "",
                  onChange: ie => d({
                    ...u,
                    full_name: ie.target.value
                  }),
                  placeholder: "Bijv. Jan de Vries"
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Inlog E-mailadres"
                }), g.jsx("input", {
                  className: "w-full border rounded p-3 bg-gray-100 text-gray-500 cursor-not-allowed",
                  value: f,
                  readOnly: !0,
                  title: "Het inlog e-mailadres kan niet zelfstandig gewijzigd worden."
                })]
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "SCIOS Registratienummer"
              }), g.jsx("input", {
                className: "w-full border rounded p-3",
                value: u.scios_nr || "",
                onChange: ie => d({
                  ...u,
                  scios_nr: ie.target.value
                }),
                placeholder: "Bijv. R 12345"
              })]
            }), g.jsxs("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
              children: [g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Telefoonnummer"
                }), g.jsx("input", {
                  className: "w-full border rounded p-3",
                  value: u.phone || "",
                  onChange: ie => d({
                    ...u,
                    phone: ie.target.value
                  }),
                  placeholder: "Bijv. 06 12345678"
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Contact E-mailadres"
                }), g.jsx("input", {
                  className: "w-full border rounded p-3",
                  value: u.contact_email || "",
                  onChange: ie => d({
                    ...u,
                    contact_email: ie.target.value
                  }),
                  placeholder: f || "Bijv. info@bedrijf.nl",
                  title: "Laat leeg om je inlog e-mailadres te gebruiken"
                })]
              })]
            }), g.jsxs("div", {
              className: "border-t pt-4 mt-2",
              children: [g.jsxs("p", {
                className: "text-xs font-bold text-gray-500 uppercase mb-3",
                children: ["Thuisadres ", g.jsx("span", {
                  className: "text-gray-400 font-normal normal-case",
                  children: "(startpunt rijroute)"
                })]
              }), g.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                children: [g.jsxs("div", {
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Straat + Huisnummer"
                  }), g.jsx("input", {
                    className: "w-full border rounded p-3",
                    value: u.home_address || "",
                    onChange: ie => d({
                      ...u,
                      home_address: ie.target.value
                    }),
                    placeholder: "Bijv. Dorpsstraat 12"
                  })]
                }), g.jsxs("div", {
                  children: [g.jsx("label", {
                    className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                    children: "Postcode"
                  }), g.jsx("input", {
                    className: "w-full border rounded p-3",
                    value: u.home_postal_code || "",
                    onChange: ie => d({
                      ...u,
                      home_postal_code: ie.target.value
                    }),
                    placeholder: "Bijv. 1234 AB"
                  })]
                })]
              }), g.jsxs("div", {
                className: "mt-3",
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Woonplaats"
                }), g.jsxs("div", {
                  className: "relative",
                  children: [g.jsx("input", {
                    className: "w-full border rounded p-3 pr-10",
                    value: u.home_city || "",
                    onChange: ie => d({
                      ...u,
                      home_city: ie.target.value
                    }),
                    placeholder: "Bijv. Amsterdam"
                  }), g.jsx("button", {
                    title: "Woonplaats opzoeken via postcode (PDOK)",
                    className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600",
                    onClick: async () => {
                      const ie = await Gv(u.home_postal_code || "", u.home_address || "");
                      ie ? d({
                        ...u,
                        home_city: ie.city
                      }) : alert("Adres niet gevonden. Controleer postcode en huisnummer.");
                    },
                    children: g.jsx(u0, {
                      size: 16
                    })
                  })]
                })]
              })]
            })]
          }), "                        ", c === "bedrijf" && g.jsxs("div", {
            className: "space-y-4",
            children: [g.jsxs("div", {
              className: "relative",
              children: [g.jsxs("div", {
                className: "flex gap-1.5",
                children: [g.jsx("input", {
                  type: "text",
                  placeholder: "Zoek bedrijf...",
                  className: "flex-1 border rounded p-2.5 text-sm",
                  value: re,
                  onChange: ie => ve(ie.target.value),
                  onKeyDown: ie => ie.key === "Enter" && De(re)
                }), g.jsx("button", {
                  onClick: () => De(re),
                  disabled: ce,
                  className: "px-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                  children: ce ? g.jsx(Ns, {
                    size: 16,
                    className: "animate-spin"
                  }) : g.jsx($c, {
                    size: 16
                  })
                })]
              }), Z.length > 0 && g.jsxs("div", {
                className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto",
                children: [Z.map((ie, Se) => {
                  const Re = Fd(ie);
                  return g.jsxs("button", {
                    className: "w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0",
                    onClick: () => {
                      d({
                        ...u,
                        company_name: Re.name,
                        company_address: Re.address,
                        company_postal_code: Re.postalCode,
                        company_city: Re.city,
                        company_phone: Re.phone
                      }), Y([]), ve("");
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
                  onClick: () => Y([]),
                  children: "Sluiten"
                })]
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Bedrijfsnaam"
              }), g.jsx(f2, {
                id: "profile-company-name",
                name: "profileCompanyName",
                label: "Bedrijfsnaam",
                list: "profile-companies-list",
                className: "w-full border rounded p-3 font-bold",
                value: u.company_name,
                placeholder: "Kies of typ een nieuw bedrijf...",
                onValueChange: ie => {
                  const Se = He.find(Re => Re.label === ie);
                  Se?.data ? d({
                    ...u,
                    company_name: ie,
                    company_address: Se.data.address || "",
                    company_postal_code: Se.data.postalCode || "",
                    company_city: Se.data.city || "",
                    company_phone: Se.data.phone || "",
                    company_email: Se.data.email || ""
                  }) : d({
                    ...u,
                    company_name: ie
                  });
                }
              }), g.jsx("datalist", {
                id: "profile-companies-list",
                children: He.map((ie, Se) => g.jsx("option", {
                  value: ie.label
                }, Se))
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                children: "Adres"
              }), g.jsx("input", {
                className: "w-full border rounded p-3",
                value: u.company_address,
                onChange: ie => d({
                  ...u,
                  company_address: ie.target.value
                })
              })]
            }), g.jsxs("div", {
              className: "flex gap-3",
              children: [g.jsxs("div", {
                className: "w-1/3",
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Postcode"
                }), g.jsx("input", {
                  className: "w-full border rounded p-3",
                  value: u.company_postal_code,
                  onChange: ie => d({
                    ...u,
                    company_postal_code: ie.target.value
                  })
                })]
              }), g.jsxs("div", {
                className: "w-2/3",
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Plaats"
                }), g.jsxs("div", {
                  className: "relative",
                  children: [g.jsx("input", {
                    className: "w-full border rounded p-3 pr-10",
                    value: u.company_city,
                    onChange: ie => d({
                      ...u,
                      company_city: ie.target.value
                    })
                  }), g.jsx("button", {
                    title: "Adres opzoeken via postcode (PDOK)",
                    className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600",
                    onClick: async () => {
                      const ie = await Gv(u.company_postal_code || "", u.company_address || "");
                      ie ? d({
                        ...u,
                        company_city: ie.city
                      }) : alert("Adres niet gevonden. Controleer postcode en huisnummer.");
                    },
                    children: g.jsx(u0, {
                      size: 16
                    })
                  })]
                })]
              })]
            }), g.jsxs("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
              children: [g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "Telefoon"
                }), g.jsx("input", {
                  className: "w-full border rounded p-3",
                  value: u.company_phone,
                  onChange: ie => d({
                    ...u,
                    company_phone: ie.target.value
                  })
                })]
              }), g.jsxs("div", {
                children: [g.jsx("label", {
                  className: "block text-xs font-bold text-gray-500 uppercase mb-1",
                  children: "E-mail"
                }), g.jsx("input", {
                  className: "w-full border rounded p-3",
                  value: u.company_email,
                  onChange: ie => d({
                    ...u,
                    company_email: ie.target.value
                  })
                })]
              })]
            })]
          }), c === "handtekening" && g.jsxs("div", {
            className: "space-y-4 text-center",
            children: [g.jsx("p", {
              className: "text-sm text-gray-600 mb-4",
              children: "Sla één keer je handtekening op, zodat je deze straks met één druk op de knop onder rapporten kunt plaatsen."
            }), u.signature_url ? g.jsxs("div", {
              className: "flex flex-col items-center gap-3",
              children: [g.jsx("img", {
                src: u.signature_url,
                className: "border-2 border-emerald-200 rounded-lg h-32 bg-white p-2 shadow-sm max-w-full",
                alt: "Opgeslagen handtekening"
              }), g.jsx("button", {
                onClick: () => d({
                  ...u,
                  signature_url: ""
                }),
                className: "text-sm text-red-500 font-bold px-4 py-2.5 border border-red-200 rounded-lg hover:bg-red-50",
                children: "Nieuwe handtekening tekenen"
              })]
            }) : g.jsxs("div", {
              className: "border-2 border-dashed border-gray-300 rounded bg-gray-50 p-2 w-full",
              children: [g.jsx(Fg, {
                ref: m,
                canvasProps: {
                  width: 340,
                  height: 180,
                  className: "cursor-crosshair bg-white rounded shadow-inner border border-gray-100 w-full"
                }
              }), g.jsxs("div", {
                className: "border-t flex justify-between p-2 gap-2 mt-2",
                children: [g.jsx("button", {
                  onClick: po,
                  className: "text-sm text-red-500 font-bold px-4 py-2.5 border border-red-200 rounded-lg hover:bg-red-50",
                  children: "Wissen"
                }), g.jsx("button", {
                  onClick: Xi,
                  className: "text-sm bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-sm",
                  children: "Bevestig Handtekening"
                })]
              })]
            })]
          }), c === "instrumenten" && (() => {
            const ie = new Set((u.linked_instruments ?? []).map(String)),
              Re = [...Qt.filter(lt => Ui === "" || lt.name.toLowerCase().includes(Ui.toLowerCase()) || lt.serialNumber.toLowerCase().includes(Ui.toLowerCase()))].sort((lt, wt) => {
                const rr = ie.has(lt.id),
                  er = ie.has(wt.id);
                return rr !== er ? rr ? -1 : 1 : lt.name.localeCompare(wt.name, "nl");
              });
            return g.jsxs("div", {
              className: "space-y-3",
              children: [g.jsx("div", {
                className: "bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800",
                children: "Vink instrumenten aan om ze aan je koffer toe te voegen. Gekoppelde instrumenten (⭐) staan bovenaan in je keuzelijst tijdens een inspectie."
              }), g.jsx("input", {
                type: "text",
                className: "w-full border rounded p-2.5 text-sm",
                placeholder: "Zoek op naam of serienummer...",
                value: Ui,
                onChange: lt => Ti(lt.target.value)
              }), g.jsxs("div", {
                children: [g.jsx("button", {
                  onClick: () => {
                    la(lt => !lt), A({
                      name: "",
                      serialNumber: "",
                      calibrationDate: ""
                    });
                  },
                  className: "text-sm text-blue-600 font-bold underline hover:text-blue-800",
                  children: is ? "▲ Annuleren" : "+ Nieuw instrument aanmaken in database"
                }), is && g.jsxs("div", {
                  className: "mt-2 p-3 border rounded bg-gray-50 animate-fadeIn",
                  children: [g.jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-4 gap-2 mb-2",
                    children: [g.jsx("input", {
                      className: "border p-2 rounded text-sm w-full md:col-span-1",
                      placeholder: "Naam",
                      value: v.name,
                      onChange: lt => A({
                        ...v,
                        name: lt.target.value
                      })
                    }), g.jsx("input", {
                      className: "border p-2 rounded text-sm w-full md:col-span-1",
                      placeholder: "Serienummer",
                      value: v.serialNumber,
                      onChange: lt => A({
                        ...v,
                        serialNumber: lt.target.value
                      })
                    }), g.jsxs("div", {
                      className: "flex gap-1 w-full md:col-span-2",
                      children: [g.jsx("input", {
                        className: "border p-2 rounded text-sm bg-white flex-grow min-w-0",
                        type: v.calibrationDate === "Indicatief" || v.calibrationDate === "n.v.t." ? "text" : "date",
                        placeholder: "Kalibratie-/ controledatum",
                        value: v.calibrationDate,
                        max: "2100-12-31",
                        onChange: lt => {
                          const wt = lt.target.value;
                          wt.length <= 10 && A({
                            ...v,
                            calibrationDate: wt
                          });
                        },
                        onBlur: lt => {
                          lt.target.value.startsWith("000") && A({
                            ...v,
                            calibrationDate: ""
                          });
                        },
                        disabled: v.calibrationDate === "Indicatief" || v.calibrationDate === "n.v.t."
                      }), g.jsxs("select", {
                        className: "border p-2 rounded text-sm bg-white cursor-pointer shrink-0",
                        onChange: lt => {
                          lt.target.value === "date" ? A({
                            ...v,
                            calibrationDate: ""
                          }) : A({
                            ...v,
                            calibrationDate: lt.target.value
                          });
                        },
                        value: v.calibrationDate === "Indicatief" || v.calibrationDate === "n.v.t." ? v.calibrationDate : "date",
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
                  }), g.jsx("button", {
                    onClick: async () => {
                      if (!v.name.trim()) return;
                      const lt = Qt.find(er => er.name.trim().toLowerCase() === v.name.trim().toLowerCase() && er.serialNumber.trim().toLowerCase() === v.serialNumber.trim().toLowerCase());
                      if (lt) {
                        alert(`"${lt.name} (SN: ${lt.serialNumber})" bestaat al. Vink het aan in de lijst.`);
                        return;
                      }
                      const {
                        data: wt,
                        error: rr
                      } = await hr.from("form_options").insert({
                        category: "instrument",
                        label: v.name.trim(),
                        data: {
                          serialNumber: v.serialNumber.trim(),
                          calibrationDate: v.calibrationDate || "n.v.t."
                        }
                      }).select().single();
                      if (rr) {
                        alert("Fout: " + rr.message);
                        return;
                      }
                      mt(er => [...er, wt]), await hs(wt.id), la(!1), A({
                        name: "",
                        serialNumber: "",
                        calibrationDate: ""
                      });
                    },
                    className: "w-full bg-emerald-600 text-white py-2 rounded text-sm font-bold hover:bg-emerald-700",
                    children: "Aanmaken & toevoegen aan koffer"
                  })]
                })]
              }), g.jsxs("div", {
                className: "space-y-1 max-h-[50vh] overflow-y-auto pr-1",
                children: [Re.length === 0 && g.jsx("p", {
                  className: "text-sm text-gray-400 italic text-center py-6",
                  children: "Geen instrumenten gevonden."
                }), Re.map(lt => {
                  const wt = ie.has(lt.id),
                    rr = y(lt.calibrationDate),
                    er = Li === lt.id;
                  return g.jsx("div", {
                    className: `rounded border p-3 transition-colors ${wt ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray-200"} ${rr === "expired" ? "border-red-300" : ""}`,
                    children: er ? g.jsxs("div", {
                      className: "space-y-2",
                      children: [g.jsxs("div", {
                        className: "grid grid-cols-1 md:grid-cols-4 gap-2",
                        children: [g.jsx("input", {
                          className: "border p-2 rounded text-sm w-full md:col-span-1",
                          value: vi.name,
                          onChange: xr => Yn(Sr => ({
                            ...Sr,
                            name: xr.target.value
                          })),
                          placeholder: "Naam"
                        }), g.jsx("input", {
                          className: "border p-2 rounded text-sm w-full md:col-span-1",
                          value: vi.serialNumber,
                          onChange: xr => Yn(Sr => ({
                            ...Sr,
                            serialNumber: xr.target.value
                          })),
                          placeholder: "Serienummer"
                        }), g.jsxs("div", {
                          className: "flex gap-1 w-full md:col-span-2",
                          children: [g.jsx("input", {
                            className: "border p-2 rounded text-sm bg-white flex-grow min-w-0",
                            type: vi.calibrationDate === "Indicatief" || vi.calibrationDate === "n.v.t." ? "text" : "date",
                            value: vi.calibrationDate,
                            max: "2100-12-31",
                            onChange: xr => {
                              const Sr = xr.target.value;
                              Sr.length <= 10 && Yn(an => ({
                                ...an,
                                calibrationDate: Sr
                              }));
                            },
                            onBlur: xr => {
                              xr.target.value.startsWith("000") && Yn(Sr => ({
                                ...Sr,
                                calibrationDate: ""
                              }));
                            },
                            disabled: vi.calibrationDate === "Indicatief" || vi.calibrationDate === "n.v.t."
                          }), g.jsxs("select", {
                            className: "border p-2 rounded text-sm bg-white cursor-pointer shrink-0",
                            onChange: xr => {
                              xr.target.value === "date" ? Yn(Sr => ({
                                ...Sr,
                                calibrationDate: ""
                              })) : Yn(Sr => ({
                                ...Sr,
                                calibrationDate: xr.target.value
                              }));
                            },
                            value: vi.calibrationDate === "Indicatief" || vi.calibrationDate === "n.v.t." ? vi.calibrationDate : "date",
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
                        className: "flex gap-2",
                        children: [g.jsx("button", {
                          onClick: () => za(null),
                          className: "flex-1 bg-gray-200 text-gray-700 py-1.5 rounded text-xs font-bold",
                          children: "Annuleren"
                        }), g.jsx("button", {
                          onClick: async () => {
                            await Ri(Number(lt.id), vi), za(null);
                          },
                          className: "flex-[2] bg-blue-600 text-white py-1.5 rounded text-xs font-bold hover:bg-blue-700",
                          children: "Wijziging opslaan (gedeeld)"
                        })]
                      })]
                    }) : g.jsxs("div", {
                      className: "flex items-center gap-3",
                      children: [g.jsx("input", {
                        type: "checkbox",
                        checked: wt,
                        onChange: () => wt ? Qs(Number(lt.id)) : hs(Number(lt.id)),
                        className: "h-5 w-5 text-emerald-600 rounded cursor-pointer shrink-0"
                      }), g.jsxs("div", {
                        className: "flex-1 min-w-0",
                        children: [g.jsxs("div", {
                          className: "font-bold text-sm text-gray-800 flex items-center gap-1",
                          children: [wt && g.jsx("span", {
                            className: "text-emerald-500",
                            children: "⭐"
                          }), lt.name]
                        }), g.jsxs("div", {
                          className: "text-xs text-gray-500",
                          children: ["SN: ", lt.serialNumber || "Onbekend", " | Kalibratie: ", g.jsx("span", {
                            className: rr === "expired" ? "text-red-600 font-bold" : rr === "warning" ? "text-orange-500 font-bold" : "",
                            children: lt.calibrationDate || "Onbekend"
                          })]
                        })]
                      }), wt && g.jsx("button", {
                        onClick: () => {
                          za(lt.id), Yn({
                            name: lt.name,
                            serialNumber: lt.serialNumber,
                            calibrationDate: lt.calibrationDate
                          });
                        },
                        className: "text-blue-400 hover:text-blue-600 p-1.5 shrink-0",
                        title: "Bewerken (wijziging is gedeeld)",
                        children: g.jsx(gf, {
                          size: 16
                        })
                      })]
                    })
                  }, lt.id);
                })]
              })]
            });
          })()]
        }), g.jsxs("div", {
          className: "p-4 border-t bg-gray-50 flex gap-3",
          children: [g.jsx("button", {
            onClick: () => a(!1),
            className: "flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded font-bold hover:bg-gray-100 transition-colors",
            children: "Sluiten"
          }), g.jsxs("button", {
            onClick: na,
            disabled: ue,
            className: "flex-1 bg-emerald-600 text-white py-3 rounded font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow",
            children: [g.jsx(QEe, {
              size: 18
            }), " ", ue ? "Opslaan..." : "Profiel Opslaan in Cloud"]
          })]
        })]
      })
    })]
  });
}
const UM = {
    Red: {
      border: "#ef4444",
      badge: "bg-red-500 text-white",
      label: "Rood"
    },
    Amber: {
      border: "#f59e0b",
      badge: "bg-amber-500 text-white",
      label: "Amber"
    },
    Orange: {
      border: "#f97316",
      badge: "bg-orange-500 text-white",
      label: "Oranje"
    },
    Yellow: {
      border: "#eab308",
      badge: "bg-yellow-400 text-white",
      label: "Geel"
    },
    Blue: {
      border: "#3b82f6",
      badge: "bg-blue-500 text-white",
      label: "Blauw"
    }
  },
  v3e = {
    woonfunctie: "Woonfunctie",
    bijeenkomstfunctie: "Bijeenkomstfunctie",
    celfunctie: "Celfunctie",
    gezondheidszorgfunctie: "Gezondheidszorgfunctie",
    industriefunctie: "Industriefunctie",
    kantoorfunctie: "Kantoorfunctie",
    logiesfunctie: "Logiesfunctie",
    onderwijsfunctie: "Onderwijsfunctie",
    sportfunctie: "Sportfunctie",
    winkelfunctie: "Winkelfunctie",
    overigeGebruiksfunctie: "Overige gebruiksfunctie",
    bouwwerkGeenGebouw: "Bouwwerk geen gebouw"
  },
  b3e = [{
    id: "persoonlijk",
    label: "Persoonlijk"
  }, {
    id: "bedrijf",
    label: "Mijn Bedrijf"
  }, {
    id: "handtekening",
    label: "Handtekening"
  }];
function InstallerWorkspace({
  supabase: r,
  userId: e,
  onLogout: t
}) {
  const [n, i] = Ze.useState("overview"),
    [a, s] = Ze.useState("basis"),
    [o, c] = Ze.useState("persoonlijk"),
    [l, u] = Ze.useState([]),
    [d, f] = Ze.useState(null),
    [h, m] = Ze.useState([]),
    [v, A] = Ze.useState({
      full_name: "",
      phone: "",
      contact_email: "",
      signature_url: "",
      installer_company: {
        name: "",
        address: "",
        postalCode: "",
        city: "",
        phone: "",
        email: ""
      }
    }),
    [y, b] = Ze.useState(!0),
    [w, E] = Ze.useState(!1),
    [B, P] = Ze.useState(!1),
    [Q, M] = Ze.useState(!1),
    [H, G] = Ze.useState(""),
    [X, q] = Ze.useState([]),
    [D, $] = Ze.useState(!1),
    N = async Me => {
      $(!0), q(await Av(Me)), $(!1);
    },
    [C, S] = Ze.useState({}),
    [k, j] = Ze.useState(null),
    W = Ze.useRef(null),
    V = Ze.useRef(null),
    K = Ze.useCallback(async () => {
      const {
        data: Me
      } = await r.from("profiles").select("full_name, phone, contact_email, signature_url, installer_company").eq("id", e).single();
      Me && A({
        full_name: Me.full_name || "",
        phone: Me.phone || "",
        contact_email: Me.contact_email || "",
        signature_url: Me.signature_url || "",
        installer_company: Me.installer_company || {
          name: "",
          address: "",
          postalCode: "",
          city: "",
          phone: "",
          email: ""
        }
      });
    }, [r, e]),
    oe = Ze.useCallback(async () => {
      b(!0);
      const {
        data: Me
      } = await r.from("inspections").select("*").eq("installer_id", e).in("status", ["herstel_wacht", "ter_controle"]).order("created_at", {
        ascending: !1
      });
      u(Me || []), b(!1);
    }, [r, e]);
  Ze.useEffect(() => {
    K(), oe();
  }, [oe, K]);
  const ue = Me => {
      f(Me), m([...Me.report_data.defects]), s("basis"), i("inspection");
    },
    xe = (Me, _e) => m(Ae => Ae.map(Ue => Ue.id === Me ? {
      ...Ue,
      ..._e
    } : Ue)),
    re = async (Me, _e, Ae) => {
      const Ue = `${Me}-${_e}`;
      S(tt => ({
        ...tt,
        [Ue]: !0
      }));
      try {
        const tt = await IS(Ae, "defect"),
          Ge = await SS(tt);
        Ge && xe(Me, _e === 1 ? {
          repairPhotoUrl1: Ge
        } : {
          repairPhotoUrl2: Ge
        });
      } catch {
        alert("Fout bij uploaden foto.");
      } finally {
        S(tt => ({
          ...tt,
          [Ue]: !1
        }));
      }
    },
    ve = async () => {
      if (d?.report_data) {
        M(!0);
        try {
          const {
              meta: Me,
              defects: _e,
              measurements: Ae
            } = d.report_data,
            Ue = await h1(g.jsx(mv, {
              meta: Me,
              defects: _e || [],
              measurements: Ae
            })).toBlob(),
            tt = URL.createObjectURL(Ue),
            Ge = document.createElement("a");
          Ge.href = tt, Ge.download = `Rapport_${Me.date || "Datum"}_${Me.clientName || "Klant"}.pdf`, document.body.appendChild(Ge), Ge.click(), document.body.removeChild(Ge), URL.revokeObjectURL(tt);
        } catch (Me) {
          console.error(Me), alert("Fout bij genereren PDF");
        } finally {
          M(!1);
        }
      }
    },
    Z = async () => {
      if (!d) return;
      if (W.current?.isEmpty()) {
        alert("Zet uw handtekening om in te dienen.");
        return;
      }
      E(!0);
      const Me = W.current?.getCanvas().toDataURL("image/png"),
        _e = {
          ...d.report_data,
          defects: h,
          meta: {
            ...d.report_data.meta,
            installerSignature: Me,
            installerName: v.full_name,
            repairDate: new Date().toISOString().split("T")[0]
          }
        },
        {
          error: Ae
        } = await r.from("inspections").update({
          report_data: _e,
          status: "ter_controle"
        }).eq("id", d.id);
      if (E(!1), Ae) {
        alert("Fout bij indienen: " + Ae.message);
        return;
      }
      ac("installer", "repair_submitted", "inspection", d.id, d.client_name || String(d.id), {
        repairedCount: h.filter(Ue => Ue.isRepaired).length
      }), i("overview"), oe();
    },
    Y = async () => {
      P(!0);
      const {
        error: Me
      } = await r.from("profiles").update({
        full_name: v.full_name,
        phone: v.phone,
        contact_email: v.contact_email
      }).eq("id", e);
      P(!1), Me ? alert("Fout: " + Me.message) : (ac("installer", "profile_updated", "profile", e, v.full_name || e), alert("Opgeslagen!"));
    },
    ce = async () => {
      P(!0);
      const {
        error: Me
      } = await r.from("profiles").update({
        installer_company: v.installer_company
      }).eq("id", e);
      P(!1), Me ? alert("Fout: " + Me.message) : (ac("installer", "profile_updated", "profile", e, v.installer_company?.name || v.full_name || e, {
        type: "company"
      }), alert("Bedrijfsgegevens opgeslagen!"));
    },
    be = async () => {
      if (!V.current || V.current.isEmpty()) return alert("Teken eerst een handtekening.");
      const Me = V.current.getCanvas().toDataURL("image/png");
      A(Ae => ({
        ...Ae,
        signature_url: Me
      })), P(!0);
      const {
        error: _e
      } = await r.from("profiles").update({
        signature_url: Me
      }).eq("id", e);
      P(!1), _e && alert("Fout: " + _e.message);
    },
    De = h.length > 0 && h.every(Me => Me.isRepaired === !0),
    Ne = h.filter(Me => Me.isRepaired).length,
    ze = d?.status === "ter_controle";
  if (k) return g.jsxs("div", {
    className: "fixed inset-0 z-50 bg-black/95 flex items-center justify-center",
    onClick: () => j(null),
    children: [g.jsx("button", {
      className: "absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 z-10",
      children: g.jsx(Kc, {
        size: 24
      })
    }), g.jsx("img", {
      src: k,
      className: "max-w-full max-h-full object-contain select-none",
      style: {
        touchAction: "pinch-zoom"
      },
      onClick: Me => Me.stopPropagation(),
      alt: "Vergrote foto"
    })]
  });
  if (n === "profile") return g.jsxs("div", {
    "data-ui": "installer",
    className: "ig-installer-shell min-h-screen bg-gray-50 flex flex-col",
    children: [g.jsxs("header", {
      className: "ig-installer-header safe-top sticky top-0 z-30 bg-white shadow-sm px-4 py-3 flex items-center justify-between",
      children: [g.jsxs("button", {
        onClick: () => i("overview"),
        className: "min-h-11 flex items-center gap-1 text-gray-600 hover:text-gray-900",
        children: [g.jsx(Cx, {
          size: 18
        }), " Terug"]
      }), g.jsx("span", {
        className: "font-bold text-gray-800",
        children: "Mijn Profiel"
      }), g.jsx("div", {})]
    }), g.jsx("div", {
      className: "bg-white border-b",
      children: g.jsx("div", {
        className: "flex max-w-lg mx-auto overflow-x-auto no-scrollbar",
        children: b3e.map(Me => g.jsx("button", {
          onClick: () => c(Me.id),
          className: `flex-1 min-w-max px-4 min-h-12 text-sm font-medium border-b-2 transition-colors ${o === Me.id ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`,
          children: Me.label
        }, Me.id))
      })
    }), g.jsxs("div", {
      className: "flex-1 p-4 max-w-lg mx-auto w-full space-y-4",
      children: [o === "persoonlijk" && g.jsxs(g.Fragment, {
        children: [g.jsxs("div", {
          className: "bg-white rounded-xl shadow p-4 space-y-3",
          children: [g.jsx("p", {
            className: "font-semibold text-gray-700 text-sm border-b pb-2",
            children: "Persoonlijke gegevens"
          }), [{
            key: "full_name",
            label: "Volledige naam",
            placeholder: "Je naam",
            type: "text"
          }, {
            key: "phone",
            label: "Telefoon",
            placeholder: "06-...",
            type: "tel"
          }, {
            key: "contact_email",
            label: "Contact e-mail",
            placeholder: "jouw@email.nl",
            type: "email"
          }].map(Me => g.jsxs("div", {
            children: [g.jsx("label", {
              className: "text-xs text-gray-500",
              children: Me.label
            }), g.jsx("input", {
              type: Me.type,
              className: "w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm",
              value: v[Me.key],
              onChange: _e => A(Ae => ({
                ...Ae,
                [Me.key]: _e.target.value
              })),
              placeholder: Me.placeholder
            })]
          }, Me.key))]
        }), g.jsx("button", {
          onClick: Y,
          disabled: B,
          className: "w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50",
          children: B ? "Opslaan..." : "Opslaan"
        })]
      }), o === "bedrijf" && g.jsxs(g.Fragment, {
        children: [g.jsxs("div", {
          className: "bg-white rounded-xl shadow p-4 space-y-3",
          children: [g.jsx("p", {
            className: "font-semibold text-gray-700 text-sm border-b pb-2",
            children: "Bedrijfsgegevens"
          }), g.jsxs("div", {
            className: "relative",
            children: [g.jsxs("div", {
              className: "flex gap-1.5",
              children: [g.jsx("input", {
                type: "text",
                placeholder: "Zoek bedrijf...",
                className: "flex-1 border border-gray-300 rounded-lg p-2 text-sm",
                value: H,
                onChange: Me => G(Me.target.value),
                onKeyDown: Me => Me.key === "Enter" && N(H)
              }), g.jsx("button", {
                onClick: () => N(H),
                disabled: D,
                className: "px-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 shrink-0",
                children: D ? g.jsx(Ns, {
                  size: 15,
                  className: "animate-spin"
                }) : g.jsx($c, {
                  size: 15
                })
              })]
            }), X.length > 0 && g.jsxs("div", {
              className: "absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto",
              children: [X.map((Me, _e) => {
                const Ae = Fd(Me);
                return g.jsxs("button", {
                  className: "w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0",
                  onClick: () => {
                    A(Ue => ({
                      ...Ue,
                      installer_company: {
                        ...Ue.installer_company,
                        name: Ae.name,
                        address: Ae.address,
                        postalCode: Ae.postalCode,
                        city: Ae.city,
                        phone: Ae.phone
                      }
                    })), q([]), G("");
                  },
                  children: [g.jsx("div", {
                    className: "font-bold text-gray-800",
                    children: Ae.name
                  }), g.jsx("div", {
                    className: "text-xs text-gray-500",
                    children: Me.formattedAddress
                  })]
                }, _e);
              }), g.jsx("button", {
                className: "w-full text-center text-xs text-gray-400 py-1.5 hover:bg-gray-50",
                onClick: () => q([]),
                children: "Sluiten"
              })]
            })]
          }), g.jsxs("div", {
            children: [g.jsx("label", {
              className: "text-xs text-gray-500",
              children: "Bedrijfsnaam"
            }), g.jsx("input", {
              className: "w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm",
              value: v.installer_company.name || "",
              onChange: Me => A(_e => ({
                ..._e,
                installer_company: {
                  ..._e.installer_company,
                  name: Me.target.value
                }
              })),
              placeholder: "Installatiebedrijf B.V."
            })]
          }), g.jsxs("div", {
            children: [g.jsx("label", {
              className: "text-xs text-gray-500",
              children: "Adres"
            }), g.jsx("input", {
              className: "w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm",
              value: v.installer_company.address || "",
              onChange: Me => A(_e => ({
                ..._e,
                installer_company: {
                  ..._e.installer_company,
                  address: Me.target.value
                }
              })),
              placeholder: "Straat 1"
            })]
          }), g.jsxs("div", {
            className: "flex gap-2",
            children: [g.jsxs("div", {
              className: "w-1/3",
              children: [g.jsx("label", {
                className: "text-xs text-gray-500",
                children: "Postcode"
              }), g.jsx("input", {
                className: "w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm",
                value: v.installer_company.postalCode || "",
                onChange: Me => A(_e => ({
                  ..._e,
                  installer_company: {
                    ..._e.installer_company,
                    postalCode: Me.target.value
                  }
                })),
                placeholder: "1234 AB"
              })]
            }), g.jsxs("div", {
              className: "flex-1",
              children: [g.jsx("label", {
                className: "text-xs text-gray-500",
                children: "Plaats"
              }), g.jsxs("div", {
                className: "relative mt-0.5",
                children: [g.jsx("input", {
                  className: "w-full border border-gray-300 rounded-lg p-2 pr-8 text-sm",
                  value: v.installer_company.city || "",
                  onChange: Me => A(_e => ({
                    ..._e,
                    installer_company: {
                      ..._e.installer_company,
                      city: Me.target.value
                    }
                  })),
                  placeholder: "Amsterdam"
                }), g.jsx("button", {
                  title: "Adres opzoeken via postcode (PDOK)",
                  className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600",
                  onClick: async () => {
                    const Me = await Gv(v.installer_company.postalCode || "", v.installer_company.address || "");
                    Me ? A(_e => ({
                      ..._e,
                      installer_company: {
                        ..._e.installer_company,
                        city: Me.city
                      }
                    })) : alert("Adres niet gevonden. Controleer postcode en huisnummer.");
                  },
                  children: g.jsx(u0, {
                    size: 14
                  })
                })]
              })]
            })]
          }), g.jsxs("div", {
            children: [g.jsx("label", {
              className: "text-xs text-gray-500",
              children: "Telefoon"
            }), g.jsx("input", {
              className: "w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm",
              value: v.installer_company.phone || "",
              onChange: Me => A(_e => ({
                ..._e,
                installer_company: {
                  ..._e.installer_company,
                  phone: Me.target.value
                }
              })),
              placeholder: "020-1234567"
            })]
          }), g.jsxs("div", {
            children: [g.jsx("label", {
              className: "text-xs text-gray-500",
              children: "E-mail"
            }), g.jsx("input", {
              type: "email",
              className: "w-full border border-gray-300 rounded-lg p-2 mt-0.5 text-sm",
              value: v.installer_company.email || "",
              onChange: Me => A(_e => ({
                ..._e,
                installer_company: {
                  ..._e.installer_company,
                  email: Me.target.value
                }
              })),
              placeholder: "info@bedrijf.nl"
            })]
          })]
        }), g.jsx("button", {
          onClick: ce,
          disabled: B,
          className: "w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50",
          children: B ? "Opslaan..." : "Opslaan"
        })]
      }), o === "handtekening" && g.jsxs("div", {
        className: "bg-white rounded-xl shadow p-4 space-y-4",
        children: [g.jsx("p", {
          className: "font-semibold text-gray-700 text-sm border-b pb-2",
          children: "Handtekening"
        }), v.signature_url ? g.jsxs("div", {
          className: "space-y-3",
          children: [g.jsx("img", {
            src: v.signature_url,
            className: "border rounded-lg h-32 w-full object-contain bg-gray-50 p-2",
            alt: "Opgeslagen handtekening"
          }), g.jsx("button", {
            onClick: () => A(Me => ({
              ...Me,
              signature_url: ""
            })),
            className: "text-sm text-red-500 underline",
            children: "Opnieuw tekenen"
          })]
        }) : g.jsxs(g.Fragment, {
          children: [g.jsx("div", {
            className: "border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white",
            children: g.jsx(Fg, {
              ref: V,
              canvasProps: {
                className: "w-full",
                height: 200
              },
              backgroundColor: "white",
              penColor: "black"
            })
          }), g.jsxs("div", {
            className: "flex gap-2",
            children: [g.jsx("button", {
              onClick: () => V.current?.clear(),
              className: "flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600",
              children: "Wissen"
            }), g.jsx("button", {
              onClick: be,
              disabled: B,
              className: "flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50",
              children: B ? "Opslaan..." : "Opslaan"
            })]
          })]
        })]
      })]
    })]
  });
  if (n === "signature" && d) return g.jsxs("div", {
    "data-ui": "installer",
    className: "ig-installer-shell min-h-screen bg-gray-50 flex flex-col",
    children: [g.jsxs("header", {
      className: "ig-installer-header safe-top sticky top-0 z-30 bg-white shadow-sm px-4 py-3 flex items-center justify-between",
      children: [g.jsxs("button", {
        onClick: () => i("inspection"),
        className: "min-h-11 flex items-center gap-1 text-gray-600 hover:text-gray-900",
        children: [g.jsx(Cx, {
          size: 18
        }), " Terug"]
      }), g.jsx("span", {
        className: "font-bold text-gray-800",
        children: "Handtekening plaatsen"
      }), g.jsx("div", {})]
    }), g.jsx("div", {
      className: "flex-1 p-4 max-w-lg mx-auto w-full",
      children: g.jsxs("div", {
        className: "bg-white rounded-xl shadow p-5 space-y-5",
        children: [g.jsxs("div", {
          className: "grid grid-cols-1 min-[380px]:grid-cols-2 gap-4 text-sm",
          children: [g.jsxs("div", {
            children: [g.jsx("p", {
              className: "text-gray-400",
              children: "Installateur"
            }), g.jsx("p", {
              className: "font-semibold",
              children: v.full_name || "-"
            })]
          }), g.jsxs("div", {
            children: [g.jsx("p", {
              className: "text-gray-400",
              children: "Datum herstel"
            }), g.jsx("p", {
              className: "font-semibold",
              children: new Date().toLocaleDateString("nl-NL")
            })]
          }), g.jsxs("div", {
            children: [g.jsx("p", {
              className: "text-gray-400",
              children: "Gebreken hersteld"
            }), g.jsxs("p", {
              className: "font-semibold",
              children: [Ne, " van ", h.length]
            })]
          })]
        }), g.jsxs("div", {
          children: [g.jsx("p", {
            className: "text-sm text-gray-500 mb-2 font-medium",
            children: "Handtekening"
          }), g.jsx("div", {
            className: "border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white",
            children: g.jsx(Fg, {
              ref: W,
              canvasProps: {
                className: "w-full",
                height: 200
              },
              backgroundColor: "white",
              penColor: "black"
            })
          }), g.jsx("button", {
            onClick: () => W.current?.clear(),
            className: "mt-1 text-xs text-red-500 underline",
            children: "Wissen"
          })]
        }), g.jsx("button", {
          onClick: Z,
          disabled: w,
          className: "w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 text-sm",
          children: w ? "Bezig met indienen..." : "Bevestigen & Indienen ✓"
        })]
      })
    })]
  });
  if (n === "inspection" && d) {
    const Me = d.report_data.meta,
      _e = Object.entries(Me.usageFunctions || {}).filter(([, Ae]) => Ae === !0).map(([Ae]) => v3e[Ae] || Ae);
    return g.jsxs("div", {
      "data-ui": "installer",
      className: "ig-installer-shell min-h-screen bg-gray-50 flex flex-col",
      children: [g.jsxs("header", {
        className: "ig-installer-header safe-top sticky top-0 z-30 bg-white shadow-sm px-4 py-3 flex items-center justify-between",
        children: [g.jsxs("button", {
          onClick: () => i("overview"),
          className: "min-h-11 flex items-center gap-1 text-gray-600 hover:text-gray-900",
          children: [g.jsx(Cx, {
            size: 18
          }), " Terug"]
        }), g.jsx("span", {
          className: "font-bold text-gray-800 truncate max-w-[55%]",
          children: Me.clientName
        }), ze ? g.jsx("span", {
          className: "ig-semantic-status text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full",
          children: "Ter Controle"
        }) : g.jsx("span", {
          className: "ig-semantic-status text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full",
          children: "Wacht op Herstel"
        })]
      }), g.jsx("div", {
        className: "bg-white border-b",
        children: g.jsx("div", {
          className: "flex",
          children: [{
            id: "basis",
            label: "Basisgegevens"
          }, {
            id: "gebreken",
            label: `Gebreken (${Ne}/${h.length})`
          }].map(Ae => g.jsx("button", {
            onClick: () => s(Ae.id),
            className: `flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${a === Ae.id ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`,
            children: Ae.label
          }, Ae.id))
        })
      }), a === "basis" && g.jsxs("div", {
        className: "flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4 pb-8",
        children: [g.jsxs("button", {
          onClick: ve,
          disabled: Q,
          className: "w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 shadow-sm",
          children: [g.jsx(Mu, {
            size: 16
          }), Q ? "PDF laden..." : "Download Origineel Inspectierapport (PDF)"]
        }), g.jsxs(Om, {
          title: "Inspectiegegevens",
          children: [g.jsx(_o, {
            label: "Inspectienummer",
            value: Me.inspectionNumber
          }), g.jsx(_o, {
            label: "Datum inspectie",
            value: Me.date
          }), g.jsx(_o, {
            label: "Scope",
            value: Me.sciosScope || Me.scopeType
          }), g.jsx(_o, {
            label: "Inspecteur",
            value: Me.inspectorName
          }), g.jsx(_o, {
            label: "SCIOS nr.",
            value: Me.sciosRegistrationNumber
          }), Me.additionalInspectors?.length > 0 && g.jsx(_o, {
            label: "Overige inspecteurs",
            value: Me.additionalInspectors.join(", ")
          })]
        }), g.jsxs(Om, {
          title: "Klantgegevens",
          children: [g.jsx(_o, {
            label: "Naam",
            value: Me.clientName
          }), g.jsx(_o, {
            label: "Adres",
            value: Me.clientAddress
          }), g.jsx(_o, {
            label: "Postcode/Plaats",
            value: `${Me.clientPostalCode || ""} ${Me.clientCity || ""}`.trim()
          }), g.jsx(_o, {
            label: "Contactpersoon",
            value: Me.clientContactPerson
          }), g.jsx(_o, {
            label: "Telefoon",
            value: Me.clientPhone
          }), g.jsx(_o, {
            label: "E-mail",
            value: Me.clientEmail
          })]
        }), g.jsxs(Om, {
          title: "Projectgegevens",
          children: [g.jsx(_o, {
            label: "Locatie",
            value: Me.projectLocation
          }), g.jsx(_o, {
            label: "Adres",
            value: Me.projectAddress
          }), g.jsx(_o, {
            label: "Postcode/Plaats",
            value: `${Me.projectPostalCode || ""} ${Me.projectCity || ""}`.trim()
          }), g.jsx(_o, {
            label: "Contactpersoon",
            value: Me.projectContactPerson
          }), g.jsx(_o, {
            label: "Telefoon",
            value: Me.projectPhone
          }), g.jsx(_o, {
            label: "Installatieverant.",
            value: Me.installationResponsible
          })]
        }), g.jsxs(Om, {
          title: "Inspectiepartij",
          children: [g.jsx(_o, {
            label: "Bedrijf",
            value: Me.inspectionCompany
          }), g.jsx(_o, {
            label: "Adres",
            value: `${Me.inspectionCompanyAddress || ""}, ${Me.inspectionCompanyPostalCode || ""} ${Me.inspectionCompanyCity || ""}`.trim().replace(/^,\s*/, "")
          }), g.jsx(_o, {
            label: "Telefoon",
            value: Me.inspectionCompanyPhone
          }), g.jsx(_o, {
            label: "E-mail",
            value: Me.inspectionCompanyEmail
          })]
        }), g.jsxs(Om, {
          title: "Inspectiegrondslag",
          children: [g.jsx(_o, {
            label: "Grondslag",
            value: [Me.inspectionBasis?.nta8220 && "NTA 8220", Me.inspectionBasis?.verzekering && "Verzekering"].filter(Boolean).join(", ") || "-"
          }), g.jsx(_o, {
            label: "Inspectie-interval",
            value: Me.inspectionInterval ? `${Me.inspectionInterval} jaar` : void 0
          }), g.jsx(_o, {
            label: "Volgende inspectie",
            value: Me.nextInspectionDate
          })]
        }), _e.length > 0 && g.jsx(Om, {
          title: "Gebruiksfuncties",
          children: g.jsx("div", {
            className: "flex flex-wrap gap-1.5 px-3 py-2",
            children: _e.map(Ae => g.jsx("span", {
              className: "text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium",
              children: Ae
            }, Ae))
          })
        })]
      }), a === "gebreken" && g.jsxs("div", {
        className: "flex-1 overflow-y-auto",
        children: [g.jsxs("div", {
          className: "p-4 max-w-lg mx-auto w-full space-y-4 pb-32",
          children: [h.length === 0 && g.jsx("p", {
            className: "text-center text-gray-400 mt-8 italic",
            children: "Geen gebreken geregistreerd."
          }), h.map((Ae, Ue) => {
            const tt = UM[Ae.classification] ?? UM.Blue;
            return g.jsxs("div", {
              className: "bg-white rounded-xl shadow border-l-4",
              style: {
                borderColor: tt.border
              },
              children: [g.jsxs("div", {
                className: "p-4",
                children: [g.jsxs("div", {
                  className: "flex items-center justify-between mb-2",
                  children: [g.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [g.jsxs("span", {
                      className: "text-xs text-gray-400",
                      children: ["#", Ue + 1]
                    }), g.jsx("span", {
                      className: `text-xs font-bold px-2 py-0.5 rounded ${tt.badge}`,
                      children: tt.label
                    })]
                  }), Ae.isRepaired && g.jsx("span", {
                    className: "text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded",
                    children: "✓ Hersteld"
                  })]
                }), g.jsx("p", {
                  className: "font-semibold text-gray-800",
                  children: Ae.location
                }), g.jsx("p", {
                  className: "text-sm text-gray-600 mt-1",
                  children: Ae.description
                }), Ae.category && g.jsxs("p", {
                  className: "text-xs text-gray-400 mt-1",
                  children: [Ae.category, Ae.subcategory ? ` › ${Ae.subcategory}` : ""]
                }), (Ae.photoUrl || Ae.photoUrl2) && g.jsxs("div", {
                  className: "mt-3",
                  children: [g.jsx("p", {
                    className: "text-xs text-gray-400 mb-1.5",
                    children: "Inspecteur foto('s) — klik om te vergroten"
                  }), g.jsxs("div", {
                    className: "flex gap-2 flex-wrap",
                    children: [Ae.photoUrl && g.jsx("button", {
                      onClick: () => j(Ae.photoUrl),
                      className: "focus:outline-none",
                      children: g.jsx("img", {
                        src: Ae.photoUrl,
                        className: "h-24 w-24 object-cover rounded-lg border cursor-zoom-in hover:opacity-90 transition",
                        alt: "Foto gebrek"
                      })
                    }), Ae.photoUrl2 && g.jsx("button", {
                      onClick: () => j(Ae.photoUrl2),
                      className: "focus:outline-none",
                      children: g.jsx("img", {
                        src: Ae.photoUrl2,
                        className: "h-24 w-24 object-cover rounded-lg border cursor-zoom-in hover:opacity-90 transition",
                        alt: "Foto gebrek 2"
                      })
                    })]
                  })]
                })]
              }), !ze && g.jsxs("div", {
                className: "border-t bg-gray-50 rounded-b-xl p-4 space-y-3",
                children: [g.jsx("input", {
                  id: `p1-${Ae.id}`,
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: Ge => {
                    Ge.target.files?.[0] && re(Ae.id, 1, Ge.target.files[0]), Ge.target.value = "";
                  }
                }), g.jsx("input", {
                  id: `p2-${Ae.id}`,
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: Ge => {
                    Ge.target.files?.[0] && re(Ae.id, 2, Ge.target.files[0]), Ge.target.value = "";
                  }
                }), g.jsxs("div", {
                  className: "flex gap-2 flex-wrap",
                  children: [Ae.repairPhotoUrl1 ? g.jsxs("div", {
                    className: "relative",
                    children: [g.jsx("button", {
                      onClick: () => j(Ae.repairPhotoUrl1),
                      className: "focus:outline-none",
                      children: g.jsx("img", {
                        src: Ae.repairPhotoUrl1,
                        className: "h-20 w-20 object-cover rounded-lg border cursor-zoom-in",
                        alt: "Herstel foto 1"
                      })
                    }), g.jsx("button", {
                      onClick: () => xe(Ae.id, {
                        repairPhotoUrl1: void 0
                      }),
                      className: "absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow",
                      children: "×"
                    })]
                  }) : g.jsxs("button", {
                    onClick: () => document.getElementById(`p1-${Ae.id}`)?.click(),
                    disabled: !!C[`${Ae.id}-1`],
                    className: "h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50 text-xs gap-1 transition",
                    children: [g.jsx(x5, {
                      size: 16
                    }), g.jsx("span", {
                      children: C[`${Ae.id}-1`] ? "..." : "Foto 1"
                    })]
                  }), Ae.repairPhotoUrl2 ? g.jsxs("div", {
                    className: "relative",
                    children: [g.jsx("button", {
                      onClick: () => j(Ae.repairPhotoUrl2),
                      className: "focus:outline-none",
                      children: g.jsx("img", {
                        src: Ae.repairPhotoUrl2,
                        className: "h-20 w-20 object-cover rounded-lg border cursor-zoom-in",
                        alt: "Herstel foto 2"
                      })
                    }), g.jsx("button", {
                      onClick: () => xe(Ae.id, {
                        repairPhotoUrl2: void 0
                      }),
                      className: "absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow",
                      children: "×"
                    })]
                  }) : g.jsxs("button", {
                    onClick: () => document.getElementById(`p2-${Ae.id}`)?.click(),
                    disabled: !!C[`${Ae.id}-2`],
                    className: "h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 disabled:opacity-50 text-xs gap-1 transition",
                    children: [g.jsx(x5, {
                      size: 16
                    }), g.jsx("span", {
                      children: C[`${Ae.id}-2`] ? "..." : "Foto 2"
                    })]
                  })]
                }), g.jsx("textarea", {
                  value: Ae.repairRemarks || "",
                  onChange: Ge => xe(Ae.id, {
                    repairRemarks: Ge.target.value
                  }),
                  rows: 2,
                  placeholder: "Herstelopmerking...",
                  className: "w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                }), g.jsxs("label", {
                  className: "flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition",
                  children: [g.jsx("input", {
                    type: "checkbox",
                    checked: Ae.isRepaired === !0,
                    onChange: Ge => xe(Ae.id, {
                      isRepaired: Ge.target.checked
                    }),
                    className: "w-5 h-5 accent-emerald-600"
                  }), g.jsx("span", {
                    className: "text-sm font-semibold text-gray-800",
                    children: "Markeer als hersteld ✓"
                  })]
                })]
              }), ze && (Ae.repairRemarks || Ae.repairPhotoUrl1 || Ae.repairPhotoUrl2) && g.jsxs("div", {
                className: "border-t bg-emerald-50 rounded-b-xl p-4 space-y-2",
                children: [g.jsx("p", {
                  className: "text-xs font-semibold text-emerald-700",
                  children: "Ingediende herstelnotities"
                }), Ae.repairRemarks && g.jsx("p", {
                  className: "text-sm text-gray-700",
                  children: Ae.repairRemarks
                }), (Ae.repairPhotoUrl1 || Ae.repairPhotoUrl2) && g.jsxs("div", {
                  className: "flex gap-2 flex-wrap",
                  children: [Ae.repairPhotoUrl1 && g.jsx("button", {
                    onClick: () => j(Ae.repairPhotoUrl1),
                    className: "focus:outline-none",
                    children: g.jsx("img", {
                      src: Ae.repairPhotoUrl1,
                      className: "h-16 w-16 object-cover rounded border cursor-zoom-in",
                      alt: "Herstel foto"
                    })
                  }), Ae.repairPhotoUrl2 && g.jsx("button", {
                    onClick: () => j(Ae.repairPhotoUrl2),
                    className: "focus:outline-none",
                    children: g.jsx("img", {
                      src: Ae.repairPhotoUrl2,
                      className: "h-16 w-16 object-cover rounded border cursor-zoom-in",
                      alt: "Herstel foto 2"
                    })
                  })]
                })]
              })]
            }, Ae.id);
          })]
        }), !ze && g.jsxs("div", {
          className: "safe-bottom fixed bottom-0 left-0 right-0 z-30 bg-white border-t p-4 max-w-lg mx-auto shadow-[0_-8px_24px_rgba(15,23,42,0.08)]",
          children: [g.jsxs("div", {
            className: "flex items-center justify-between mb-1.5 text-sm",
            children: [g.jsxs("span", {
              className: "text-gray-500",
              children: [Ne, " van ", h.length, " gebreken gemarkeerd"]
            }), De && g.jsx("span", {
              className: "text-emerald-600 font-bold text-xs",
              children: "✓ Gereed"
            })]
          }), g.jsx("button", {
            onClick: () => i("signature"),
            disabled: !De,
            className: "w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition",
            children: De ? "Afronden & Ondertekenen →" : `Nog ${h.length - Ne} gebrek${h.length - Ne !== 1 ? "en" : ""} te markeren`
          })]
        })]
      })]
    });
  }
  const Je = Me => Me === "herstel_wacht" ? g.jsx("span", {
    className: "ig-semantic-status text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap",
    children: "Wacht op Herstel"
  }) : Me === "ter_controle" ? g.jsx("span", {
    className: "ig-semantic-status text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap",
    children: "Ter Controle"
  }) : g.jsx("span", {
    className: "text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full",
    children: Me
  });
  return g.jsxs("div", {
    "data-ui": "installer",
    className: "ig-installer-shell min-h-screen bg-gray-50 flex flex-col",
    children: [g.jsxs("header", {
      className: "ig-installer-header safe-top sticky top-0 z-30 bg-white shadow-sm px-4 py-3 flex items-center justify-between",
      children: [g.jsxs("div", {
        children: [g.jsx("p", {
          className: "font-bold text-gray-800 text-lg",
          children: "Herstelwerkzaamheden"
        }), v.full_name && g.jsx("p", {
          className: "text-xs text-gray-400",
          children: v.full_name
        })]
      }), g.jsxs("div", {
        className: "flex items-center gap-2",
        children: [g.jsx("button", {
          onClick: () => i("profile"),
          className: "flex min-h-11 min-w-11 items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-2.5 py-2 rounded-xl",
          title: "Mijn Profiel",
          children: g.jsx(Vm, {
            size: 14
          })
        }), g.jsxs("button", {
          onClick: t,
          className: "flex min-h-11 items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-xl",
          children: [g.jsx(kS, {
            size: 16
          }), " ", g.jsx("span", {
            className: "hidden min-[380px]:inline",
            children: "Uitloggen"
          })]
        })]
      })]
    }), g.jsx("div", {
      className: "flex-1 p-4 max-w-lg mx-auto w-full",
      children: y ? g.jsx("p", {
        className: "text-center text-gray-400 mt-10 italic",
        children: "Laden..."
      }) : l.length === 0 ? g.jsxs("div", {
        className: "text-center mt-16",
        children: [g.jsx("p", {
          className: "text-gray-500 font-medium",
          children: "Geen toegewezen werkzaamheden"
        }), g.jsx("p", {
          className: "text-gray-400 text-sm mt-1",
          children: "Je hebt momenteel geen inspecties toegewezen gekregen."
        }), g.jsx("button", {
          onClick: oe,
          className: "mt-4 text-sm text-emerald-600 underline",
          children: "Vernieuwen"
        })]
      }) : g.jsx("div", {
        className: "space-y-3",
        children: l.map(Me => {
          const _e = Me.report_data.defects || [],
            Ae = _e.filter(Ue => Ue.isRepaired).length;
          return g.jsxs("div", {
            className: "bg-white rounded-xl shadow-sm border border-gray-100 p-4",
            children: [g.jsxs("div", {
              className: "flex items-start justify-between gap-2 mb-1",
              children: [g.jsx("p", {
                className: "font-semibold text-gray-800 truncate flex-1",
                children: Me.report_data.meta.clientName
              }), Je(Me.status)]
            }), g.jsxs("p", {
              className: "text-xs text-gray-500",
              children: [Me.report_data.meta.projectAddress, ", ", Me.report_data.meta.projectCity]
            }), g.jsxs("div", {
              className: "flex items-center justify-between mt-3",
              children: [g.jsxs("div", {
                children: [g.jsxs("p", {
                  className: "text-xs text-gray-400",
                  children: [Me.inspection_number || `#${Me.id}`, " · ", new Date(Me.created_at).toLocaleDateString("nl-NL")]
                }), g.jsxs("p", {
                  className: "text-xs text-gray-500 mt-0.5",
                  children: [_e.length, " gebreken · ", Ae, " hersteld"]
                })]
              }), g.jsx("button", {
                onClick: () => ue(Me),
                className: "min-h-11 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition",
                children: Me.status === "ter_controle" ? "Bekijken" : "Open →"
              })]
            })]
          }, Me.id);
        })
      })
    })]
  });
}
function Om({
  title: r,
  children: e
}) {
  return g.jsxs("div", {
    className: "bg-white rounded-xl shadow overflow-hidden",
    children: [g.jsx("div", {
      className: "bg-gray-100 px-3 py-1.5",
      children: g.jsx("p", {
        className: "text-xs font-bold text-gray-500 uppercase tracking-wide",
        children: r
      })
    }), g.jsx("div", {
      children: e
    })]
  });
}
function _o({
  label: r,
  value: e
}) {
  return g.jsxs("div", {
    className: "flex items-start gap-2 px-3 py-2 border-b border-gray-50 last:border-0",
    children: [g.jsx("span", {
      className: "text-xs text-gray-400 w-28 sm:w-36 shrink-0 pt-0.5",
      children: r
    }), g.jsx("span", {
      className: "text-sm text-gray-800 font-medium flex-1 break-words",
      children: e || "-"
    })]
  });
}

export { InspectorWorkspace, InstallerWorkspace }

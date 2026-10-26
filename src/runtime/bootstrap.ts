// @ts-nocheck
/* Recovered module: bootstrap. Generated from the verified 2026-10-26 production runtime. */
import { Ex, Ze, b5, dX, g, gCe, hr, mC, wEe, zCe } from './vendor-core'
import { InspectorWorkspace, InstallerWorkspace } from './inspector-workspaces'
import { AdminDashboard, PlanningWorkspace } from './admin-workspaces'

function LoginScreen() {
  const [r, e] = Ze.useState(""),
    [t, n] = Ze.useState(""),
    [i, a] = Ze.useState(!1),
    [s, o] = Ze.useState(""),
    c = async l => {
      l.preventDefault(), o(""), a(!0);
      const {
        error: u
      } = await hr.auth.signInWithPassword({
        email: r,
        password: t
      });
      u && o("Inloggen mislukt. Controleer e-mailadres en wachtwoord."), a(!1);
    };
  return g.jsx("main", {
    "data-ui": "login",
    className: "ig-login-shell safe-top safe-bottom flex min-h-[100dvh] items-center justify-center px-4 py-6 sm:px-6 lg:py-10",
    children: g.jsxs("div", {
      className: "ig-login-card grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-white lg:grid-cols-[1.04fr_.96fr]",
      children: [g.jsxs("section", {
        className: "ig-login-brand relative hidden min-h-[620px] flex-col justify-between overflow-hidden p-10 text-white lg:flex",
        children: [g.jsxs("div", {
          className: "relative z-10",
          children: [g.jsxs("div", {
            className: "flex items-center gap-3",
            children: [g.jsx("div", {
              className: "flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400 text-primary",
              children: g.jsx(mC, {
                size: 24,
                strokeWidth: 2.4,
                "aria-hidden": "true"
              })
            }), g.jsxs("div", {
              children: [g.jsx("p", {
                className: "font-headline text-lg font-extrabold tracking-tight",
                children: "B2Inspect"
              }), g.jsx("p", {
                className: "text-xs text-white/55",
                children: "Inspection workspace"
              })]
            })]
          }), g.jsxs("div", {
            className: "mt-24 max-w-md",
            children: [g.jsx("p", {
              className: "text-xs font-extrabold uppercase tracking-[.2em] text-teal-300",
              children: "Inspector Gadget"
            }), g.jsxs("h1", {
              className: "mt-4 font-headline text-4xl font-extrabold leading-[1.08] tracking-tight",
              children: ["Inspecties helder.", g.jsx("br", {}), "Werk buiten sneller."]
            }), g.jsx("p", {
              className: "mt-5 max-w-sm text-[15px] leading-7 text-white/65",
              children: "Eén rustige werkplek voor SCIOS-inspecties, metingen, bevindingen en herstel."
            })]
          })]
        }), g.jsx("div", {
          className: "relative z-10 grid grid-cols-3 gap-3",
          children: ["Veilig", "Mobiel", "Betrouwbaar"].map(l => g.jsxs("div", {
            className: "rounded-xl bg-white/[.07] px-3 py-3 text-sm font-semibold ring-1 ring-white/10",
            children: [g.jsx(zCe, {
              className: "mb-2 text-teal-300",
              size: 17,
              "aria-hidden": "true"
            }), l]
          }, l))
        })]
      }), g.jsxs("section", {
        className: "flex min-h-[620px] flex-col justify-center p-6 sm:p-10 lg:p-14",
        children: [g.jsxs("div", {
          className: "mb-9 flex items-center gap-3 lg:hidden",
          children: [g.jsx("div", {
            className: "flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white",
            children: g.jsx(mC, {
              size: 23,
              "aria-hidden": "true"
            })
          }), g.jsxs("div", {
            children: [g.jsx("p", {
              className: "font-headline text-lg font-extrabold text-primary",
              children: "Inspector Gadget"
            }), g.jsx("p", {
              className: "text-xs text-slate-500",
              children: "B2Inspect"
            })]
          })]
        }), g.jsxs("div", {
          className: "max-w-md",
          children: [g.jsx("p", {
            className: "ig-eyebrow",
            children: "Welkom terug"
          }), g.jsx("h2", {
            className: "mt-2 font-headline text-3xl font-extrabold tracking-tight text-primary",
            children: "Inloggen"
          }), g.jsx("p", {
            className: "mt-2 text-sm leading-6 text-slate-500",
            children: "Gebruik je zakelijke B2Inspect-account."
          }), g.jsxs("form", {
            onSubmit: c,
            className: "mt-8 space-y-5",
            children: [g.jsxs("div", {
              children: [g.jsx("label", {
                htmlFor: "login-email",
                className: "mb-2 block text-sm font-semibold text-slate-700",
                children: "E-mailadres"
              }), g.jsxs("div", {
                className: "relative",
                children: [g.jsx(Ex, {
                  className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400",
                  size: 19,
                  "aria-hidden": "true"
                }), g.jsx("input", {
                  id: "login-email",
                  type: "email",
                  required: !0,
                  autoComplete: "username",
                  inputMode: "email",
                  className: "min-h-12 w-full border bg-slate-50 py-3 pl-11 pr-4 text-slate-900",
                  placeholder: "naam@bedrijf.nl",
                  value: r,
                  onChange: l => e(l.target.value)
                })]
              })]
            }), g.jsxs("div", {
              children: [g.jsx("label", {
                htmlFor: "login-password",
                className: "mb-2 block text-sm font-semibold text-slate-700",
                children: "Wachtwoord"
              }), g.jsxs("div", {
                className: "relative",
                children: [g.jsx(wEe, {
                  className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400",
                  size: 19,
                  "aria-hidden": "true"
                }), g.jsx("input", {
                  id: "login-password",
                  type: "password",
                  required: !0,
                  autoComplete: "current-password",
                  className: "min-h-12 w-full border bg-slate-50 py-3 pl-11 pr-4 text-slate-900",
                  placeholder: "••••••••",
                  value: t,
                  onChange: l => n(l.target.value)
                })]
              })]
            }), s && g.jsx("p", {
              role: "alert",
              className: "rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100",
              children: s
            }), g.jsxs("button", {
              type: "submit",
              disabled: i,
              className: "group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blueprint-gradient px-4 py-3 font-bold text-white shadow-lg shadow-slate-900/15 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60",
              children: [i ? "Inloggen…" : "Veilig inloggen", !i && g.jsx(gCe, {
                className: "transition-transform group-hover:translate-x-0.5",
                size: 18,
                "aria-hidden": "true"
              })]
            })]
          }), g.jsxs("div", {
            className: "mt-8 flex items-center gap-2 text-xs text-slate-400",
            children: [g.jsx(mC, {
              size: 15,
              "aria-hidden": "true"
            }), " Beveiligde toegang · alleen voor medewerkers"]
          })]
        })]
      })]
    })
  });
}
const _je = 14400 * 1e3;
function Cje() {
  const r = Ze.useRef(null);
  Ze.useEffect(() => {
    const e = async () => {
      try {
        const {
          error: t
        } = await hr.from("profiles").select("id", {
          count: "exact",
          head: !0
        });
        t ? console.warn("[KeepAlive] Ping mislukt:", t.message) : console.debug("[KeepAlive] Supabase ping OK", new Date().toISOString());
      } catch (t) {
        console.warn("[KeepAlive] Netwerk-fout:", t);
      }
    };
    return e(), r.current = setInterval(e, _je), () => {
      r.current && clearInterval(r.current);
    };
  }, []);
}
function Eje(r) {
  return r === "admin" || r === "inspector" || r === "installer";
}
function InspectorApplication() {
  Cje();
  const [r, e] = Ze.useState(null),
    [t, n] = Ze.useState(null),
    [i, a] = Ze.useState(!0),
    [s, o] = Ze.useState(""),
    [c, l] = Ze.useState(!1),
    [u, d] = Ze.useState(!1);
  Ze.useEffect(() => {
    let h = !0,
      m = 0;
    const v = async y => {
      const b = ++m;
      if (e(y), n(null), o(""), l(!1), d(!1), !y) {
        a(!1);
        return;
      }
      a(!0);
      const {
        data: w,
        error: E
      } = await hr.from("profiles").select("role").eq("id", y.user.id).single();
      !h || b !== m || (E || !Eje(w?.role) ? (console.error("Fout bij ophalen rol:", E || `Ongeldige rol: ${String(w?.role)}`), o("Geen geldig gebruikersprofiel gevonden. Neem contact op met de beheerder.")) : n(w.role), a(!1));
    };
    hr.auth.getSession().then(({
      data: y
    }) => v(y.session));
    const {
      data: {
        subscription: A
      }
    } = hr.auth.onAuthStateChange((y, b) => {
      v(b);
    });
    return () => {
      h = !1, A.unsubscribe();
    };
  }, []);
  const f = async () => {
    await hr.auth.signOut();
  };
  return i ? g.jsxs("div", {
    className: "min-h-[100dvh] flex flex-col items-center justify-center gap-3 bg-surface",
    role: "status",
    "aria-live": "polite",
    children: [g.jsx("div", {
      className: "h-9 w-9 animate-spin rounded-full border-4 border-primary/15 border-t-primary"
    }), g.jsx("div", {
      className: "text-sm font-semibold text-on-surface-variant",
      children: "Systeem laden…"
    })]
  }) : r ? t ? c && t === "admin" ? g.jsxs("div", {
    className: "relative",
    children: [g.jsxs("button", {
      type: "button",
      onClick: () => l(!1),
      "aria-label": "Naar inspecteren",
      className: "fixed bottom-[calc(5.15rem+env(safe-area-inset-bottom))] right-3 z-[100] flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-slate-700 px-3 py-3 text-sm font-bold text-white shadow-2xl transition-all hover:bg-slate-800 active:scale-95 sm:px-4 lg:bottom-6 lg:left-6 lg:right-auto lg:px-5",
      children: [g.jsx(b5, {
        size: 18
      }), " ", g.jsx("span", {
        className: "hidden sm:inline",
        children: "Naar inspecteren"
      })]
    }), g.jsx(AdminDashboard, {})]
  }) : u && (t === "admin" || t === "inspector") ? g.jsx(PlanningWorkspace, {
    onBack: () => d(!1)
  }) : t === "installer" ? g.jsx(InstallerWorkspace, {
    supabase: hr,
    userId: r.user.id,
    onLogout: f
  }) : g.jsx("div", {
    className: "relative",
    children: g.jsx(InspectorWorkspace, {
      userRole: t,
      onLogout: f,
      onOpenAdmin: t === "admin" ? () => {
        d(!1), l(!0);
      } : void 0,
      onOpenPlanning: t === "admin" || t === "inspector" ? () => {
        l(!1), d(!0);
      } : void 0
    })
  }) : g.jsx("main", {
    className: "flex min-h-[100dvh] items-center justify-center bg-surface p-5",
    children: g.jsxs("section", {
      className: "w-full max-w-md rounded-2xl border border-outline-variant/30 bg-white p-6 text-center shadow-sm",
      children: [g.jsx("h1", {
        className: "text-xl font-bold text-on-surface",
        children: "Geen toegang"
      }), g.jsx("p", {
        className: "mt-2 text-sm text-on-surface-variant",
        children: s || "Gebruikersrol kon niet worden gecontroleerd."
      }), g.jsx("button", {
        type: "button",
        onClick: f,
        className: "mt-5 min-h-11 rounded-xl bg-primary px-5 font-bold text-white",
        children: "Uitloggen"
      })]
    })
  }) : g.jsx(LoginScreen, {});
}
dX.createRoot(document.getElementById("root")).render(g.jsx(Ze.StrictMode, {
  children: g.jsx(InspectorApplication, {})
}));

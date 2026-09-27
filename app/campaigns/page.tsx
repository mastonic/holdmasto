"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [msg, setMsg] = useState("");

  async function load() {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await s.from("campaigns").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }

  useEffect(() => { void load(); }, [router]);

  function edit(campaign: any) {
    setEditing(campaign.id);
    setForm({
      name: campaign.name,
      niche: campaign.niche,
      zone: campaign.zone,
      prospect_limit: campaign.prospect_limit,
      status: campaign.status,
    });
    setMsg("");
  }

  async function save(id: string) {
    const s = createClient();
    const { error } = await s.from("campaigns").update({
      name: form.name,
      niche: form.niche,
      zone: form.zone,
      prospect_limit: Number(form.prospect_limit),
      status: form.status,
    }).eq("id", id);
    if (error) { setMsg(error.message); return; }
    setEditing(null);
    setMsg("Campagne modifiée.");
    await load();
  }

  async function remove(campaign: any) {
    if (!window.confirm("Supprimer la campagne « " + campaign.name + " » ? Les prospects et activités liés seront également supprimés.")) return;
    const s = createClient();
    const { error } = await s.from("campaigns").delete().eq("id", campaign.id);
    if (error) { setMsg(error.message); return; }
    setMsg("Campagne supprimée.");
    await load();
  }

  return (
    <Shell>
      <header className="top">
        <div><h1>Campagnes</h1><p className="muted">Recherches par niche et zone.</p></div>
        <Link className="btn" href="/campaigns/new">+ Nouvelle campagne</Link>
      </header>
      {msg && <p className="success">{msg}</p>}
      <section className="panel">
        {items.length ? items.map((campaign) => (
          <div className="integration" key={campaign.id}>
            {editing === campaign.id ? (
              <div style={{ width: "100%" }}>
                <div className="grid">
                  <label>Nom<input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                  <label>Niche<input value={form.niche || ""} onChange={(e) => setForm({ ...form, niche: e.target.value })} /></label>
                  <label>Zone<input value={form.zone || ""} onChange={(e) => setForm({ ...form, zone: e.target.value })} /></label>
                  <label>Nombre max<input type="number" min={1} max={60} value={form.prospect_limit || 20} onChange={(e) => setForm({ ...form, prospect_limit: e.target.value })} /></label>
                </div>
                <div className="filters" style={{ marginTop: "12px" }}>
                  <button className="btn" onClick={() => save(campaign.id)}>Enregistrer</button>
                  <button className="chip" onClick={() => setEditing(null)}>Annuler</button>
                </div>
              </div>
            ) : (
              <>
                <div><b>{campaign.name}</b><p className="muted">{campaign.niche} · {campaign.zone} · max {campaign.prospect_limit}</p></div>
                <div className="filters">
                  <span className="status good">{campaign.status}</span>
                  <button className="chip" onClick={() => edit(campaign)}>Modifier</button>
                  <button className="chip danger" onClick={() => remove(campaign)}>Supprimer</button>
                </div>
              </>
            )}
          </div>
        )) : <p className="muted">Aucune campagne.</p>}
      </section>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding – Tracker UNDEF
// src/components/Onboarding.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { useTrackerStore } from "../store/useTrackerStore";
import type { CarreraId } from "../data/curriculum";

export const Onboarding: React.FC = () => {
  const setUser = useTrackerStore((s) => s.setUser);
  
  const [name, setName] = useState("");
  const [selectedCareers, setSelectedCareers] = useState<CarreraId[]>([]);
  const [error, setError] = useState("");

  const toggleCareer = (id: CarreraId) => {
    setSelectedCareers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor, ingresa tu nombre.");
      return;
    }
    if (selectedCareers.length === 0) {
      setError("Debes seleccionar al menos una carrera.");
      return;
    }
    setUser(name.trim(), selectedCareers);
  };

  return (
    <div className="min-h-screen bg-undef-bg flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-undef-muted text-sm">
            Configuremos tu perfil para comenzar el seguimiento académico.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ¿Cómo te llamas?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full bg-undef-surface border border-undef-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gp-primary focus:ring-1 focus:ring-gp-primary transition-all"
              placeholder="Ej. Juan Pérez"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              ¿Qué carrera(s) cursas en UNDEF?
            </label>
            <div className="space-y-3">
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCareers.includes("gestion-publica")
                    ? "border-gp-primary bg-gp-primary/10"
                    : "border-undef-border hover:border-gray-500 bg-undef-surface"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedCareers.includes("gestion-publica")}
                  onChange={() => toggleCareer("gestion-publica")}
                />
                <div className="flex-1">
                  <div className="font-medium text-white">Gestión Pública</div>
                  <div className="text-xs text-undef-muted">Licenciatura</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCareers.includes("gestion-publica") ? "border-gp-primary" : "border-undef-border"}`}>
                  {selectedCareers.includes("gestion-publica") && <div className="w-2.5 h-2.5 rounded-full bg-gp-primary" />}
                </div>
              </label>

              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCareers.includes("ciberdefensa")
                    ? "border-cd-primary bg-cd-primary/10"
                    : "border-undef-border hover:border-gray-500 bg-undef-surface"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedCareers.includes("ciberdefensa")}
                  onChange={() => toggleCareer("ciberdefensa")}
                />
                <div className="flex-1">
                  <div className="font-medium text-white">Ciberdefensa</div>
                  <div className="text-xs text-undef-muted">Licenciatura</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCareers.includes("ciberdefensa") ? "border-cd-primary" : "border-undef-border"}`}>
                  {selectedCareers.includes("ciberdefensa") && <div className="w-2.5 h-2.5 rounded-full bg-cd-primary" />}
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors mt-4"
          >
            Comenzar
          </button>
        </form>
      </div>
    </div>
  );
};

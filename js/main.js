/**
 * Controlador Principal de la Aplicación
 * UPTC - Redes de Datos 2026
 */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initGlossary();
  initComparisonTable();
  initModals();
});

function initTabs() {
  const tabButtons = document.querySelectorAll(".nav-tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;

      tabButtons.forEach(b => {
        b.classList.remove("border-cyan-400", "text-cyan-400", "bg-slate-800/80");
        b.classList.add("border-transparent", "text-slate-400", "hover:text-slate-200");
      });

      btn.classList.add("border-cyan-400", "text-cyan-400", "bg-slate-800/80");
      btn.classList.remove("border-transparent", "text-slate-400");

      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.remove("hidden");
          // Si el panel contiene canvas, forzar resize y redraw
          if (targetId === "tab-hub" && window.hubSim) {
            // El simulador ya tiene requestAnimationFrame activo
          }
          if (targetId === "tab-gateway" && window.gwSim) {
            window.gwSim.setupCanvas();
          }
        } else {
          pane.classList.add("hidden");
        }
      });

      // Scroll suave arriba del contenido
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function initGlossary() {
  const container = document.getElementById("glossaryGrid");
  const searchInput = document.getElementById("glossarySearch");
  const categoryContainer = document.getElementById("glossaryCategories");

  if (!container) return;

  // Extraer categorías únicas
  const categories = ["Todas", ...new Set(GLOSSARY_TERMS.map(t => t.category))];
  let activeCategory = "Todas";

  if (categoryContainer) {
    categoryContainer.innerHTML = categories.map(cat => `
      <button class="glossary-cat-btn px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition ${cat === 'Todas' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}" data-cat="${cat}">
        ${cat}
      </button>
    `).join("");

    categoryContainer.querySelectorAll(".glossary-cat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        categoryContainer.querySelectorAll(".glossary-cat-btn").forEach(b => {
          b.className = "glossary-cat-btn px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition " +
            (b.dataset.cat === activeCategory ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200');
        });
        filterAndRenderGlossary();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterAndRenderGlossary();
    });
  }

  function filterAndRenderGlossary() {
    const query = (searchInput ? searchInput.value : "").toLowerCase().trim();

    const filtered = GLOSSARY_TERMS.filter(item => {
      const matchCat = (activeCategory === "Todas" || item.category === activeCategory);
      const matchQuery = (item.term.toLowerCase().includes(query) || item.definition.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-10 text-slate-500 text-sm font-mono">
          No se encontraron términos que coincidan con la búsqueda.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-xl transition shadow-lg space-y-2 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1">
            <h4 class="font-bold text-white text-sm tracking-wide">${item.term}</h4>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 shrink-0">
              ${item.category}
            </span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${item.definition}</p>
        </div>
      </div>
    `).join("");
  }

  filterAndRenderGlossary();
}

function initComparisonTable() {
  const tbody = document.getElementById("comparisonTableBody");
  if (!tbody) return;

  tbody.innerHTML = COMPARISON_DATA.map((row, idx) => `
    <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 transition text-xs">
      <td class="py-3 px-4 font-bold text-cyan-300 align-top bg-slate-900/40">${row.criterio}</td>
      <td class="py-3 px-4 text-slate-300 align-top leading-relaxed border-l border-slate-800/60">${row.hub}</td>
      <td class="py-3 px-4 text-slate-300 align-top leading-relaxed border-l border-slate-800/60">${row.repetidor}</td>
      <td class="py-3 px-4 text-slate-200 align-top leading-relaxed border-l border-slate-800/60 bg-cyan-950/10 font-medium">${row.gateway}</td>
    </tr>
  `).join("");
}

function initModals() {
  // Manejo de cierres con Escape o clics fuera
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  });
}

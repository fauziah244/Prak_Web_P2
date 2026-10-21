// File: main.js
// Integrasi Logika Data, Form Validation, Live Search, dan Interactive Cards

// Data Master Proyek Awal
let projects = [
  {
    id: 1,
    title: "Sistem Inventaris Keuangan",
    category: "Web App",
    budget: 2500000,
    completed: true
  },
  {
    id: 2,
    title: "Sistem Kasir Digital POS",
    category: "Desktop App",
    budget: 5000000,
    completed: true
  },
  {
    id: 3,
    title: "Landing Page Profil Perusahaan",
    category: "Web App",
    budget: 1500000,
    completed: false
  },
  {
    id: 4,
    title: "Aplikasi Presensi GPS Mobile",
    category: "Mobile App",
    budget: 4500000,
    completed: false
  }
];

// Variable state untuk pencarian dan filter aktif
let activeCategory = "Semua";
let searchQuery = "";

// Helper Function: Format Rupiah
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

// Fungsi Memperbarui Kartu Statistik
const updateStats = (dataList) => {
  const totalProjects = dataList.length;
  const totalBudget = dataList.reduce((acc, curr) => acc + curr.budget, 0);
  const completedCount = dataList.filter(item => item.completed).length;

  document.getElementById("stat-total-projects").textContent = totalProjects;
  document.getElementById("stat-total-budget").textContent = formatRupiah(totalBudget);
  document.getElementById("stat-completed-projects").textContent = completedCount;
};

// Fungsi Render Kartu Proyek
const renderProjects = () => {
  const container = document.getElementById("project-list");
  if (!container) return;

  // Terapkan Filter Kategori dan Live Search simultan
  const filteredList = projects.filter(proj => {
    const matchCategory = activeCategory === "Semua" || proj.category === activeCategory;
    const matchSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filteredList.length === 0) {
    container.innerHTML = "<p style='text-align: center; color: #64748b; padding: 20px;'>Tidak ada proyek yang sesuai.</p>";
    updateStats(projects);
    return;
  }

  const htmlString = filteredList.map(proj => {
    const badgeClass = proj.completed ? "badge-success" : "badge-pending";
    const statusText = proj.completed ? "Selesai" : "Dalam Pengerjaan";
    
    return `
      <div class="project-card">
        <div class="project-info">
          <span class="project-category">${proj.category}</span>
          <h4>${proj.title}</h4>
          <p class="project-budget">${formatRupiah(proj.budget)}</p>
        </div>
        <div class="project-actions">
          <span class="badge ${badgeClass}">${statusText}</span>
          <!-- FITUR 3: Tombol Aksi -->
          <button class="btn-action btn-toggle" onclick="toggleProjectStatus(${proj.id})">Ubah Status</button>
          <button class="btn-action btn-delete" onclick="deleteProject(${proj.id})">Hapus</button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = htmlString;
  updateStats(projects); // Selalu perbarui statistik sesuai data master saat ini
};

// FITUR 3 (a): Fungsi Toggle Status Proyek (Selesai / Dalam Pengerjaan)
window.toggleProjectStatus = (id) => {
  projects = projects.map(proj => {
    if (proj.id === id) {
      return { ...proj, completed: !proj.completed };
    }
    return proj;
  });
  renderProjects();
};

// FITUR 3 (b): Fungsi Hapus Proyek Berdasarkan ID
window.deleteProject = (id) => {
  projects = projects.filter(proj => proj.id !== id);
  renderProjects();
};

// Inisialisasi Event Listener setelah DOM selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Render awal
  renderProjects();

  // FITUR 1: Penanganan Event Submit Form & Validasi Input
  const projectForm = document.getElementById("project-form");
  if (projectForm) {
    projectForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Cegah reload halaman

      const titleInput = document.getElementById("project-title").value.trim();
      const categoryInput = document.getElementById("project-category").value;
      const budgetInput = parseFloat(document.getElementById("project-budget").value);
      const completedInput = document.getElementById("project-completed").checked;

      // Validasi: Judul tidak boleh kosong & Anggaran > 0
      if (!titleInput) {
        alert("Judul proyek tidak boleh kosong!");
        return;
      }
      if (isNaN(budgetInput) || budgetInput <= 0) {
        alert("Anggaran harus berupa angka dan lebih besar dari 0!");
        return;
      }

      // Buat Objek Proyek Baru
      const newProject = {
        id: Date.now(), // Unik ID menggunakan timestamp
        title: titleInput,
        category: categoryInput,
        budget: budgetInput,
        completed: completedInput
      };

      // Tambahkan ke Array data proyek menggunakan spread operator
      projects = [...projects, newProject];

      // Reset Form Input
      projectForm.reset();

      // Render Ulang Tampilan & Kartu Statistik
      renderProjects();
    });
  }

  // FITUR 2: Pencarian Real-Time (Live Search)
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProjects();
    });
  }

  // Event Listener Filter Kategori
  const filterButtons = document.querySelectorAll(".btn-filter");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterButtons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      
      activeCategory = e.target.getAttribute("data-category");
      renderProjects();
    });
  });
});

// File: public/script.js

document.addEventListener("DOMContentLoaded", () => {

    // 1. Mengambil elemen HTML
    const mhsForm = document.querySelector("#mhsForm");
    const mhsIdInput = document.querySelector("#mhsId");
    const nimInput = document.querySelector("#nim");
    const namaInput = document.querySelector("#nama");
    const jurusanInput = document.querySelector("#jurusan");
    const emailInput = document.querySelector("#email");
    const btnSubmit = document.querySelector("#btnSubmit");
    const btnCancel = document.querySelector("#btnCancel");
    const formTitle = document.querySelector("#formTitle");
    const mhsTableBody = document.querySelector("#mhsTableBody");
    const alertMessage = document.querySelector("#alertMessage");

    let listMahasiswa = [];

    // 2. Fungsi menampilkan notifikasi
    const showAlert = (text, type = "success") => {
        if (!alertMessage) return;

        alertMessage.textContent = text;
        alertMessage.className = `alert alert-${type}`;
        alertMessage.style.display = "block";

        setTimeout(() => {
            alertMessage.style.display = "none";
        }, 3000);
    };

    // 3. READ: Mengambil data mahasiswa
    const loadMahasiswa = async () => {
        try {
            const res = await fetch("/api/mahasiswa");
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Gagal mengambil data");
            }

            listMahasiswa = result;
            renderTable(listMahasiswa);

        } catch (err) {
            showAlert("Gagal memuat data: " + err.message, "error");
        }
    };

    // 4. Menampilkan data ke tabel
    const renderTable = (data) => {
        mhsTableBody.innerHTML = "";

        if (data.length === 0) {
            mhsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Belum ada data mahasiswa tersimpan.
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach((mhs, idx) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${mhs.nim}</td>
                <td>${mhs.nama}</td>
                <td>${mhs.jurusan}</td>
                <td>${mhs.email}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${mhs.id}">
                        Edit
                    </button>

                    <button class="btn-action btn-delete" data-id="${mhs.id}">
                        Hapus
                    </button>
                </td>
            `;

            mhsTableBody.appendChild(tr);
        });
    };

    // 5. CREATE dan UPDATE: Menyimpan data mahasiswa
    mhsForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            nim: nimInput.value.trim(),
            nama: namaInput.value.trim(),
            jurusan: jurusanInput.value,
            email: emailInput.value.trim()
        };

        const id = mhsIdInput.value;
        const isEdit = Boolean(id);

        const url = isEdit
            ? `/api/mahasiswa/${id}`
            : "/api/mahasiswa";

        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Gagal menyimpan data");
            }

            showAlert(result.message, "success");

            resetForm();
            await loadMahasiswa();

        } catch (err) {
            showAlert("Terjadi kesalahan: " + err.message, "error");
        }
    });

    // 6. EDIT dan DELETE: Event klik tabel
    mhsTableBody.addEventListener("click", async (e) => {

        const id = Number(e.target.dataset.id);

        if (!id) return;

        // EDIT DATA
        if (e.target.classList.contains("btn-edit")) {

            const targetMhs = listMahasiswa.find(
                (mhs) => Number(mhs.id) === id
            );

            if (targetMhs) {
                mhsIdInput.value = targetMhs.id;
                nimInput.value = targetMhs.nim;
                namaInput.value = targetMhs.nama;
                jurusanInput.value = targetMhs.jurusan;
                emailInput.value = targetMhs.email;

                if (formTitle) {
                    formTitle.textContent = "Edit Data Mahasiswa";
                }

                btnSubmit.textContent = "Perbarui Mahasiswa";
                btnCancel.style.display = "inline-block";

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        }

        // DELETE DATA
        else if (e.target.classList.contains("btn-delete")) {

            if (confirm("Apakah Anda yakin ingin menghapus data mahasiswa ini?")) {

                try {
                    const res = await fetch(`/api/mahasiswa/${id}`, {
                        method: "DELETE"
                    });

                    const result = await res.json();

                    if (!res.ok || !result.success) {
                        throw new Error(result.message || "Gagal menghapus data");
                    }

                    showAlert(result.message, "success");

                    await loadMahasiswa();

                } catch (err) {
                    showAlert("Gagal menghapus data: " + err.message, "error");
                }
            }
        }
    });

    // 7. Reset form
    const resetForm = () => {
        mhsForm.reset();
        mhsIdInput.value = "";

        if (formTitle) {
            formTitle.textContent = "Tambah Mahasiswa Baru";
        }

        btnSubmit.textContent = "Simpan Mahasiswa";
        btnCancel.style.display = "none";
    };

    btnCancel.addEventListener("click", resetForm);

    // 8. Memuat data saat halaman dibuka
    loadMahasiswa();

});

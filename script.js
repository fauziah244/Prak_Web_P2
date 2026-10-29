// File: script.js
document.addEventListener("DOMContentLoaded", () => {

    // 1. Ambil elemen DOM
    const todoForm = document.querySelector("#todoForm");
    const taskInput = document.querySelector("#taskInput");
    const inputError = document.querySelector("#inputError");
    const todoList = document.querySelector("#todoList");

    // Elemen tambahan untuk fitur baru
    const taskCounter = document.querySelector("#taskCounter");
    const clearCompletedBtn = document.querySelector("#clearCompletedBtn");

    // 2. Fungsi membaca dan menyimpan ke LocalStorage
    const getTasks = () =>
        JSON.parse(localStorage.getItem("todo_tasks")) || [];

    const saveTasks = (tasks) =>
        localStorage.setItem("todo_tasks", JSON.stringify(tasks));

    // 3. Fitur 1: Penghitung Jumlah Tugas
    const updateTaskCounter = (tasks) => {
        const total = tasks.length;

        const completed = tasks.filter(
            (task) => task.completed === true
        ).length;

        const unfinished = total - completed;

        taskCounter.textContent =
            `Total: ${total} Tugas | Selesai: ${completed} | Belum Selesai: ${unfinished}`;
    };

    // 4. Fungsi menampilkan daftar tugas
    const renderTasks = () => {
        const tasks = getTasks();

        todoList.innerHTML = "";

        // Perbarui jumlah tugas setiap kali daftar ditampilkan
        updateTaskCounter(tasks);

        if (tasks.length === 0) {
            todoList.innerHTML = `
                <li style="text-align:center; color:#64748b;
                font-size:13px; padding:10px; list-style:none;">
                    Belum ada tugas tersimpan.
                </li>
            `;
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement("li");

            li.className = `todo-item ${task.completed ? "completed" : ""}`;

            li.innerHTML = `
                <span class="todo-text"></span>
                <div class="todo-actions">
                    <button
                        type="button"
                        class="action-btn complete-btn"
                        data-index="${index}">
                        ${task.completed ? "Batal" : "Selesai"}
                    </button>

                    <button
                        type="button"
                        class="action-btn delete-btn"
                        data-index="${index}">
                        Hapus
                    </button>
                </div>
            `;

            // Menampilkan teks tugas dengan aman
            li.querySelector(".todo-text").textContent = task.text;

            todoList.appendChild(li);
        });
    };

    // 5. Menambahkan tugas baru
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const taskText = taskInput.value.trim();

        // Validasi input
        if (taskText.length < 3) {
            taskInput.classList.add("error");
            inputError.style.display = "block";
            return;
        }

        // Hilangkan pesan kesalahan
        taskInput.classList.remove("error");
        inputError.style.display = "none";

        // Simpan tugas baru
        const tasks = getTasks();

        tasks.push({
            text: taskText,
            completed: false
        });

        saveTasks(tasks);

        taskInput.value = "";

        // Perbarui daftar dan penghitung
        renderTasks();
    });

    // 6. Menangani tombol Selesai, Batal, dan Hapus
    todoList.addEventListener("click", (e) => {
        const button = e.target.closest("button");

        if (!button || button.dataset.index === undefined) {
            return;
        }

        const index = Number(button.dataset.index);
        const tasks = getTasks();

        if (!tasks[index]) {
            return;
        }

        // Menandai tugas selesai atau belum selesai
        if (button.classList.contains("complete-btn")) {
            tasks[index].completed = !tasks[index].completed;

            saveTasks(tasks);
            renderTasks();
        }

        // Fitur 3: Konfirmasi sebelum menghapus tugas
        else if (button.classList.contains("delete-btn")) {

            const konfirmasi = confirm(
                "Apakah Anda yakin ingin menghapus tugas ini?"
            );

            // Jika Cancel, tugas tidak dihapus
            if (!konfirmasi) {
                return;
            }

            // Jika OK, tugas dihapus
            tasks.splice(index, 1);

            saveTasks(tasks);
            renderTasks();
        }
    });

    // 7. Fitur 2: Bersihkan Tugas Selesai
    clearCompletedBtn.addEventListener("click", () => {
        const tasks = getTasks();

        // Hanya menyisakan tugas yang belum selesai
        const remainingTasks = tasks.filter(
            (task) => task.completed !== true
        );

        // Simpan kembali tugas yang belum selesai
        saveTasks(remainingTasks);

        // Perbarui daftar dan penghitung
        renderTasks();
    });

    // 8. Tampilkan tugas saat halaman pertama kali dibuka
    renderTasks();

});
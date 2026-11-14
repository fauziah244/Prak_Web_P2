
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// 1. Koneksi Database MySQL Laragon
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_kampus'
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi Database Gagal:', err.message);
        return;
    }

    console.log('Terhubung ke Database MySQL Laragon');
});

// 2. READ: Menampilkan seluruh data mahasiswa
app.get('/api/mahasiswa', (req, res) => {
    const sql = 'SELECT * FROM mahasiswa ORDER BY id DESC';

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Gagal mengambil data:', err.message);
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json(result);
    });
});

// 3. CREATE: Menambahkan mahasiswa baru
app.post('/api/mahasiswa', (req, res) => {
    const { nim, nama, jurusan, email } = req.body;

    const sql = `
        INSERT INTO mahasiswa (nim, nama, jurusan, email)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [nim, nama, jurusan, email], (err, result) => {
        if (err) {
            console.error('Gagal menyimpan data:', err.message);
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: 'Data Mahasiswa Berhasil Disimpan!'
        });
    });
});

// 4. UPDATE: Memperbarui data mahasiswa
app.put('/api/mahasiswa/:id', (req, res) => {
    const { id } = req.params;
    const { nim, nama, jurusan, email } = req.body;

    const sql = `
        UPDATE mahasiswa
        SET nim = ?, nama = ?, jurusan = ?, email = ?
        WHERE id = ?
    `;

    db.query(sql, [nim, nama, jurusan, email, id], (err, result) => {
        if (err) {
            console.error('Gagal memperbarui data:', err.message);
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: 'Data Mahasiswa Berhasil Diperbarui!'
        });
    });
});

// 5. DELETE: Menghapus data mahasiswa
app.delete('/api/mahasiswa/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM mahasiswa WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Gagal menghapus data:', err.message);
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: 'Data Mahasiswa Berhasil Dihapus!'
        });
    });
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server CRUD aktif di http://localhost:${PORT}`);
});

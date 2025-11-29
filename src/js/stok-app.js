import { upbjjList, kategoriList, stok as initialStok } from "../data/data.js";

const { createApp } = Vue;

createApp({
  data() {
    return {
      // Import data dari data.js
      upbjjList: upbjjList,
      kategoriList: kategoriList,
      stok: initialStok,

      // State untuk filter
      filterUpbjj: "",
      filterKategori: "",
      showReorderOnly: false,
      sortBy: "",

      // State untuk form
      showAddForm: false,
      editingIndex: null,
      newStock: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      },
      editStock: {},
      validationErrors: {},
    };
  },
  computed: {
    // Computed untuk kategori yang tersedia berdasarkan UT Daerah yang dipilih (dependent options)
    availableKategori() {
      if (!this.filterUpbjj) {
        return [];
      }
      // Filter kategori berdasarkan stok yang ada di UT daerah tersebut
      const kategoriSet = new Set(
        this.stok
          .filter((item) => item.upbjj === this.filterUpbjj)
          .map((item) => item.kategori)
      );
      return this.kategoriList.filter((kat) => kategoriSet.has(kat));
    },

    // Computed untuk filter dan sort (tidak perlu recompute saat data tidak berubah)
    filteredStok() {
      let result = this.stok;

      // Filter berdasarkan UT Daerah
      if (this.filterUpbjj) {
        result = result.filter((item) => item.upbjj === this.filterUpbjj);
      }

      // Filter berdasarkan Kategori
      if (this.filterKategori) {
        result = result.filter((item) => item.kategori === this.filterKategori);
      }

      // Filter berdasarkan re-order (stok < safety atau stok = 0)
      if (this.showReorderOnly) {
        result = result.filter(
          (item) => item.qty < item.safety || item.qty === 0
        );
      }

      // Sort berdasarkan pilihan
      if (this.sortBy) {
        result = [...result].sort((a, b) => {
          if (this.sortBy === "judul") {
            return a.judul.localeCompare(b.judul);
          } else if (this.sortBy === "qty") {
            return a.qty - b.qty;
          } else if (this.sortBy === "harga") {
            return a.harga - b.harga;
          }
          return 0;
        });
      }

      return result;
    },
  },
  watch: {
    // Watcher 1: Pantau perubahan filterUpbjj untuk reset filterKategori
    filterUpbjj(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.filterKategori = "";
        console.log(`Filter UT Daerah berubah dari "${oldVal}" ke "${newVal}"`);
        if (newVal) {
          console.log(
            `Kategori yang tersedia: ${this.availableKategori.join(", ")}`
          );
        }
      }
    },

    // Watcher 2: Pantau perubahan showReorderOnly untuk logging
    showReorderOnly(newVal) {
      console.log(`Filter Re-order ${newVal ? "diaktifkan" : "dinonaktifkan"}`);
      if (newVal) {
        const reorderCount = this.stok.filter(
          (item) => item.qty < item.safety || item.qty === 0
        ).length;
        console.log(`Terdapat ${reorderCount} item yang perlu re-order`);
      }
    },
  },
  methods: {
    // Format harga dengan pemisah ribuan
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    // Reset semua filter
    resetFilters() {
      this.filterUpbjj = "";
      this.filterKategori = "";
      this.showReorderOnly = false;
      this.sortBy = "";
    },

    // Dapatkan index asli dari item di array stok
    getOriginalIndex(item) {
      return this.stok.findIndex((s) => s.kode === item.kode);
    },

    // Validasi data baru
    validateNewStock() {
      this.validationErrors = {};
      let isValid = true;

      if (this.newStock.kode.length < 4) {
        this.validationErrors.kode = "Kode minimal 4 karakter";
        isValid = false;
      }

      if (this.stok.some((item) => item.kode === this.newStock.kode)) {
        this.validationErrors.kode = "Kode sudah ada";
        isValid = false;
      }

      if (this.newStock.judul.length < 5) {
        this.validationErrors.judul = "Judul minimal 5 karakter";
        isValid = false;
      }

      return isValid;
    },

    // Tambah stok baru
    addNewStock() {
      if (this.validateNewStock()) {
        this.stok.push({ ...this.newStock });
        alert("Bahan ajar berhasil ditambahkan!");
        this.cancelAdd();
      }
    },

    // Batal tambah
    cancelAdd() {
      this.showAddForm = false;
      this.newStock = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      };
      this.validationErrors = {};
    },

    // Mulai edit
    startEdit(index) {
      this.editingIndex = index;
      this.editStock = { ...this.stok[index] };
      // Scroll ke form edit
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },

    // Simpan edit
    saveEdit() {
      this.stok[this.editingIndex] = { ...this.editStock };
      alert("Data berhasil diupdate!");
      this.cancelEdit();
    },

    // Batal edit
    cancelEdit() {
      this.editingIndex = null;
      this.editStock = {};
    },
  },
}).mount("#app");

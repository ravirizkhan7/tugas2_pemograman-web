import {
  pengirimanList,
  paket,
  tracking as initialTracking,
} from "../data/data.js";

const { createApp } = Vue;

createApp({
  data() {
    return {
      // Import data dari data.js
      pengirimanList: pengirimanList,
      paket: paket,
      tracking: initialTracking,

      // State untuk form
      showAddForm: false,
      newDO: {
        nim: "",
        nama: "",
        ekspedisi: "",
        paketKode: "",
        tanggalKirim: "",
      },
    };
  },
  computed: {
    // Generate nomor DO otomatis
    generateDONumber() {
      const year = new Date().getFullYear();
      const existingNumbers = Object.keys(this.tracking)
        .filter((key) => key.startsWith(`DO${year}-`))
        .map((key) => parseInt(key.split("-")[1]))
        .filter((num) => !isNaN(num));

      const nextNumber =
        existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      return `DO${year}-${String(nextNumber).padStart(4, "0")}`;
    },

    // Dapatkan paket yang dipilih
    selectedPaket() {
      if (!this.newDO.paketKode) return null;
      return this.paket.find((p) => p.kode === this.newDO.paketKode);
    },

    // Convert tracking object ke array untuk v-for
    trackingListArray() {
      return Object.entries(this.tracking)
        .map(([doNumber, trackData]) => ({
          doNumber,
          ...trackData,
        }))
        .sort((a, b) => b.doNumber.localeCompare(a.doNumber)); // Urutkan terbaru di atas
    },
  },
  watch: {
    // Watcher 1: Pantau perubahan paket untuk update total harga
    "newDO.paketKode"(newVal) {
      if (newVal) {
        const paket = this.paket.find((p) => p.kode === newVal);
        if (paket) {
          console.log(`Paket dipilih: ${paket.nama}`);
          console.log(`- Kode: ${paket.kode}`);
          console.log(`- Isi: ${paket.isi.join(", ")}`);
          console.log(`- Harga: Rp ${this.formatPrice(paket.harga)}`);
        }
      }
    },

    // Watcher 2: Pantau perubahan ekspedisi
    "newDO.ekspedisi"(newVal) {
      if (newVal) {
        const ekspedisi = this.pengirimanList.find((e) => e.kode === newVal);
        if (ekspedisi) {
          console.log(`Ekspedisi dipilih: ${ekspedisi.nama}`);
          console.log(`- Kode: ${ekspedisi.kode}`);
        }
      }
    },
  },
  methods: {
    // Format harga dengan pemisah ribuan
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    // Format tanggal
    formatDate(dateStr) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateStr).toLocaleDateString("id-ID", options);
    },

    // Dapatkan nama ekspedisi dari kode
    getEkspedisiName(kode) {
      const eks = this.pengirimanList.find((e) => e.kode === kode);
      return eks ? eks.nama : kode;
    },

    // Dapatkan nama paket dari kode
    getPaketName(kode) {
      const pkt = this.paket.find((p) => p.kode === kode);
      return pkt ? `${pkt.kode} - ${pkt.nama}` : kode;
    },

    // Format waktu untuk timestamp
    getCurrentDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // Tambah DO baru
    addNewDO() {
      if (!this.selectedPaket) {
        alert("❌ Silakan pilih paket terlebih dahulu");
        return;
      }

      if (
        !this.newDO.nim ||
        !this.newDO.nama ||
        !this.newDO.ekspedisi ||
        !this.newDO.tanggalKirim
      ) {
        alert("❌ Mohon lengkapi semua field yang wajib diisi");
        return;
      }

      const doNumber = this.generateDONumber;
      const currentDateTime = this.getCurrentDateTime();

      // Tambahkan DO baru ke tracking
      this.tracking[doNumber] = {
        nim: this.newDO.nim,
        nama: this.newDO.nama,
        status: "Sedang Diproses",
        ekspedisi: this.newDO.ekspedisi,
        tanggalKirim: this.newDO.tanggalKirim,
        paket: this.newDO.paketKode,
        total: this.selectedPaket.harga,
        perjalanan: [
          {
            waktu: currentDateTime,
            keterangan: `DO ${doNumber} telah dibuat dan sedang diproses`,
          },
        ],
      };

      console.log(`✅ DO baru berhasil dibuat: ${doNumber}`);
      alert(
        `✅ Delivery Order ${doNumber} berhasil dibuat!\n\nNama: ${
          this.newDO.nama
        }\nPaket: ${this.selectedPaket.nama}\nTotal: Rp ${this.formatPrice(
          this.selectedPaket.harga
        )}`
      );

      this.cancelAdd();
    },

    // Batal tambah
    cancelAdd() {
      this.showAddForm = false;
      this.newDO = {
        nim: "",
        nama: "",
        ekspedisi: "",
        paketKode: "",
        tanggalKirim: "",
      };
      // Set tanggal hari ini lagi
      this.setTodayDate();
    },

    // Set tanggal hari ini sebagai default
    setTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      this.newDO.tanggalKirim = `${year}-${month}-${day}`;
    },
  },
  mounted() {
    // Set tanggal hari ini saat komponen dimuat
    this.setTodayDate();
    console.log("📦 Halaman Tracking DO dimuat");
    console.log(`Total DO yang ada: ${Object.keys(this.tracking).length}`);
  },
}).mount("#app");

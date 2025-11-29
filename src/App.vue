<script setup>
import { stok } from "./data/data.js";
</script>

<template>
  <h2>Data Stok</h2>

  <ul>
    <li v-for="item in stok" :key="item.kode">
      {{ item.kode }} - {{ item.judul }} ({{ item.qty }} pcs)
    </li>
  </ul>
</template>

<style scoped></style>

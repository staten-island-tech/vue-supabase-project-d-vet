<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Thung Ho</h1>
      <h2>My GOAT Xi Jinping</h2>
    </header>
    <main class="grid">
      <div class="card">
        <div class="favorite-btn">♥</div>
        <div class="image-wrapper">
          <img src="" alt="Product" />
        </div>
        <div class="card-content">
          <div class="price">$0</div>
          <div class="title">Product Title</div>
          <div class="meta">Location • Time</div>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup>
</script>

<style scoped>
.page-container {
  width: 100%;
  display: block;
}

.page-header {
  width: 100%;
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
  display: block;
}

.page-header h1 {
  font-size: 2.6rem;
  font-weight: 800;
  margin: 0;
  color: #222;
}

.page-header h2 {
  font-size: 1.2rem;
  font-weight: 400;
  margin-top: 0.4rem;
  color: #666;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  padding: 6px 10px;
  border-radius: 50px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.favorite-btn:hover {
  background: rgba(255, 0, 80, 0.2);
}

.image-wrapper {
  width: 100%;
  height: 180px;
  background: #f3f3f3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
}

.price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2a2a2a;
  margin-bottom: 4px;
}

.title {
  font-size: 1rem;
  font-weight: 500;
  color: #444;
  margin-bottom: 6px;
}

.meta {
  font-size: 0.85rem;
  color: #777;
}

</style>
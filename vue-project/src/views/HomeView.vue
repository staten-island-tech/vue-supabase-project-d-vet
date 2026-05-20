<template>
  <div class="page">
    <h1>Thung Ho</h1>
    <h2>My GOAT Xi Jinping</h2>
    <main class="grid">
      <div class="card">
        <div class="favorite-btn">
          ♥
        </div>
        <div class="image-wrapper">
          <img
            src="https://picsum.photos/400"
            alt="Product"
          />
        </div>
        <div class="card-content">
          <div class="price">
            $0
          </div>
          <div class="title">
            Product Title
          </div>
          <div class="meta">
            Location • Time
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page {
  --text: white;
  --radius: 24px;
  --border: rgba(255,255,255,0.08);
  --primary: #3b82f6;
  background: linear-gradient(
    to bottom right,
    #020617,
    #0f172a
  );
  min-height: 100vh;
  padding: 40px;
  color: var(--text);
  font-family:
    Inter,
    system-ui,
    sans-serif;
}
.grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fill,minmax(270px,1fr));
  gap: 24px;
  margin-top: 30px;
}
.card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  background: linear-gradient(
    to bottom,
    rgba(30,41,59,0.95),
    rgba(15,23,42,0.95)
  );
  border: 1px solid var(--border);
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease;
  cursor: pointer;
}
.card:hover {
  transform:
    translateY(-8px)
    scale(1.01);
  border-color:
    rgba(59,130,246,0.35);
  box-shadow:
    0 25px 50px rgba(0,0,0,0.45),
    0 0 30px rgba(59,130,246,0.15);
}
.image-wrapper {
  height: 240px;
  overflow: hidden;
}
.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.45s ease;
}
.card:hover img {
  transform: scale(1.08);
}
.favorite-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background:
    rgba(15,23,42,0.75);
  border:
    1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}
.card-content {
  padding: 20px;
}
.price {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 8px;
}
.title {
  font-size: 1rem;
  margin-bottom: 10px;
}
.meta {
  opacity: 0.7;
}
</style>
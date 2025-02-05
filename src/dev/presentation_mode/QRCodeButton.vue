<script setup></script>
<template>
  <div class="dropdown is-hoverable is-right">
    <div class="dropdown-trigger">
      <button class="button devbar-button">
        <FAIcon icon=" fa-solid fa-qrcode" />
      </button>
    </div>
    <div class="dropdown-menu pt-0 mt-0" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <div class="qrcontent is-right">
          <h1 class="title is-6">QR Code</h1>
          <p>
            Use the QR code to quickly access the current page from a mobile device. Can be downloaded as a .svg to add
            to posters and talks.
          </p>
          <img src="/qr.svg" />
          <br />
          <div class="has-text-right">
            <a href="qr.svg" download="qr.svg" class="button is-small">
              <FAIcon icon="fa-solid fa-download" />&nbsp;
              <span>Download QR</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown-content {
  padding: 20;
  padding-top: 8px;
  margin: 10;
  width: 300px;
  text-align: left;
  padding-bottom: 20px;
}

.qr {
  width: 300px;
  height: auto;
}

.qrcontent {
  width: 100%;
  padding: 15px;
  text-align: left;
}
</style>

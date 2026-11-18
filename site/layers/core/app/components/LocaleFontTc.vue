<template>
  <span hidden />
</template>

<style>
/* 繁中頁才用 Noto Sans TC：@nuxt/fonts 會把字型宣告寫進這個元件的樣式，只有繁中頁會載入 */
:root:lang(zh-Hant) {
  --font-body: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  --font-code: 'JetBrains Mono', 'Noto Sans TC', 'PingFang TC', monospace;
}
</style>

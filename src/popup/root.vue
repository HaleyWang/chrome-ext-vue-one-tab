<template lang="pug">
    div
      el-button(type="primary" @click="tab") New tab 
</template>
<script>
  export default {
    data: () => ({
    }),
    computed: { },
    created () { },
    mounted () { },
    methods: {
      tab () {
        chrome.tabs.query({ currentWindow: true }, function (tabsArr) {
          chrome.runtime.sendMessage({ action: 'save', tabsArr: tabsArr }, function (res) {
            if (res === 'ok') {
              window.close()
            }
          })
        })
      }
    }
  }
</script>
<style lang="scss">
  div {
    color: blue
  }
</style>
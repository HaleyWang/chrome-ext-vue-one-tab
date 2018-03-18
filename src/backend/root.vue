<template >

  <div>
    
    <h1 id="tu-biao-fen-ge-fu">
        Vue one tab
    
    </h1>

    <el-input placeholder="输入关键字进行过滤" v-model="filterText">
    </el-input>

    <el-tree ref="tree2" :expand-on-click-node="false" default-expand-all :filter-node-method="filterNode" :data="tabGroups" :props="defaultProps" @node-click="handleNodeClick">

      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span v-show="data.group">{{ node.label }}</span>

        <span v-show="!data.group">
          <img height="16" width="16" v-bind:src="data.favIconUrl" />
          <el-button type="text" size="mini" @click="() => restoreTab(data)">
            {{ node.label }}
          </el-button>

        </span>

        <span>

          <el-button type="text" size="mini" v-show="data.group" @click="() => restoreTabGroup(data)">
            Restore group

          </el-button>

          <el-button type="text" size="mini" @click="() => remove(node, data)">
            Delete
          </el-button>
        </span>
      </span>

    </el-tree>

  </div>

</template>
<script>

function saveTabGroups(json) {
  chrome.storage.local.set({ tabGroups: json });
}

export default {
  data: () => ({
    aa: 11,
    filterText: '',

    defaultProps: {
      children: 'tabs',
      label: 'label'
    },
    tabGroups: []
  }),
  computed: {},
  created() {
    this.fetchData();

  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val);
    }
  },
  mounted() { },
  methods: {

    restoreTabGroup(group) {
      for (let i = 0; i < group.tabs.length; i += 1) {
        chrome.tabs.create({
          url: group.tabs[i].url,
          pinned: group.tabs[i].pinned
        });
      }
    },

    restoreTab(tab) {
      chrome.tabs.create({
        url: tab.url,
        pinned: tab.pinned
      });
    },

    remove(node, data) {
      const parent = node.parent;
      const children = parent.data.tabs || parent.data;
      const index = children.findIndex(d => d.id === data.id);
      children.splice(index, 1);

      saveTabGroups(this.tabGroups);

      this.fetchData();



    },
    handleNodeClick(data) {
      console.log(data);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    fetchData() {

      var me = this;
      chrome.storage.local.get(function (storage) {

        var tabGroups = storage.tabGroups || []; // tab groups

        for (let i = 0, n = tabGroups.length; i < n; i++) {
          let tabGroup = tabGroups[i];
          if (tabGroup && tabGroup.tabs) {


            tabGroup.label = tabGroup.tabs.length + ' Tabs ' + tabGroup.date;
            let tabs = tabGroup.tabs;
            tabGroup.group = true;
            for (let j = 0, k = tabs.length; j < k; j++) {
              let tab = tabs[j];
              tab.label = tab.title;
            }
          }
        }

        tabGroups.sort(function (tg1, tg2) {
          return tg2.id - tg1.id;

        });

        me.tabGroups = tabGroups;
        console.log('tabGroups 11!', me.tabGroups);


      });
      console.log('tabGroups 113!', me.tabGroups);


    }

  }
}
</script>
<style lang="scss">
div {
  color: blue;
}
</style>
<template>
  <div class="system-menu-manage">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button type="success" @click="handleBatchEnable" :disabled="selectedRows.length === 0">批量启用</el-button>
          <el-button type="warning" @click="handleBatchDisable" :disabled="selectedRows.length === 0">批量禁用</el-button>
        </el-button-group>
        <el-button @click="handleExport" icon="Download">导出菜单</el-button>
      </div>
      <div class="toolbar-right">
        <el-input v-model="searchKeyword" placeholder="搜索菜单名称" prefix-icon="Search" clearable style="width: 200px" />
        <el-button type="primary" @click="handleAdd" icon="Plus">新增菜单</el-button>
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 左侧菜单树 + 右侧菜单列表 -->
    <div class="content-wrapper">
      <!-- 左侧：菜单树 -->
      <div class="menu-tree-panel">
        <div class="panel-header">菜单结构树</div>
        <el-tree
            ref="treeRef"
            :data="menuTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            draggable
            @node-drop="handleNodeDrop"
            @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon class="node-icon">
                <component :is="getMenuIcon(data.type)" />
              </el-icon>
              <span class="node-name">{{ node.label }}</span>
              <el-tag v-if="data.status === 'disabled'" size="small" type="info" style="margin-left: 8px">禁用</el-tag>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 右侧：菜单列表 -->
      <div class="menu-list-panel">
        <div class="panel-header">
          <span>菜单详情列表</span>
          <el-tag v-if="selectedMenu" type="primary">当前：{{ selectedMenu.name }}</el-tag>
        </div>

        <el-table
            :data="menuListData"
            border
            @selection-change="handleSelectionChange"
            row-key="id"
            :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
            style="flex: 1"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="name" label="菜单名称" min-width="180" />
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small">{{ getTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路由地址" min-width="200" show-overflow-tooltip />
          <el-table-column prop="icon" label="图标" width="100" align="center" />
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="visible" label="可见" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.visible" @change="handleVisibleChange(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" size="small" @click="handleAddChild(row)">新增子级</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)" :disabled="row.system">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 菜单编辑抽屉 -->
    <MenuDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentMenu"
        :menu-tree="menuTree"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Menu, Document, Setting, Operation } from '@element-plus/icons-vue'
import MenuDrawer from './MenuDrawer.vue'

const searchKeyword = ref('')
const selectedRows = ref([])
const selectedMenu = ref(null)
const currentMenu = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)
const treeRef = ref(null)

const menuTree = ref([
  {
    id: 1,
    name: '工作台',
    type: 'module',
    path: '/dashboard',
    icon: 'HomeFilled',
    sort: 1,
    status: 'enabled',
    visible: true,
    system: true,
    children: [
      { id: 2, name: '我的待办', type: 'menu', path: '/dashboard/todo', icon: 'List', sort: 1, status: 'enabled', visible: true, system: true }
    ]
  },
  {
    id: 3,
    name: '流程中心',
    type: 'module',
    path: '/process',
    icon: 'Connection',
    sort: 2,
    status: 'enabled',
    visible: true,
    system: true,
    children: [
      {
        id: 4,
        name: '审批管理',
        type: 'menu',
        path: '/process/approval',
        icon: 'Stamp',
        sort: 1,
        status: 'enabled',
        visible: true,
        system: true,
        children: [
          { id: 5, name: '待办审批', type: 'page', path: '/process/approval/todo', icon: '', sort: 1, status: 'enabled', visible: true, system: true },
          { id: 6, name: '已办审批', type: 'page', path: '/process/approval/done', icon: '', sort: 2, status: 'enabled', visible: true, system: true }
        ]
      }
    ]
  },
  {
    id: 7,
    name: '系统管理',
    type: 'module',
    path: '/system',
    icon: 'Setting',
    sort: 3,
    status: 'enabled',
    visible: true,
    system: true,
    children: [
      {
        id: 8,
        name: '权限菜单管理',
        type: 'menu',
        path: '/system/permission-admin',
        icon: 'Key',
        sort: 1,
        status: 'enabled',
        visible: true,
        system: true,
        children: [
          { id: 9, name: '新增菜单', type: 'button', path: '', icon: '', sort: 1, status: 'enabled', visible: true, system: false },
          { id: 10, name: '编辑菜单', type: 'button', path: '', icon: '', sort: 2, status: 'enabled', visible: true, system: false },
          { id: 11, name: '删除菜单', type: 'button', path: '', icon: '', sort: 3, status: 'enabled', visible: true, system: false }
        ]
      }
    ]
  }
])

const menuListData = computed(() => {
  if (selectedMenu.value) {
    return selectedMenu.value.children || []
  }
  return flattenMenuTree(menuTree.value)
})

const flattenMenuTree = (tree) => {
  const result = []
  const flatten = (nodes) => {
    nodes.forEach(node => {
      result.push(node)
      if (node.children && node.children.length > 0) {
        flatten(node.children)
      }
    })
  }
  flatten(tree)
  return result
}

const getMenuIcon = (type) => {
  const icons = {
    module: Menu,
    menu: Document,
    page: Document,
    button: Setting
  }
  return icons[type] || Operation
}

const getTypeTag = (type) => {
  const types = {
    module: '',
    menu: 'primary',
    page: 'success',
    button: 'warning'
  }
  return types[type] || ''
}

const getTypeText = (type) => {
  const texts = {
    module: '模块',
    menu: '菜单',
    page: '页面',
    button: '按钮'
  }
  return texts[type] || type
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleNodeClick = (data) => {
  selectedMenu.value = data
}

const handleNodeDrop = (draggingNode, dropNode, dropType) => {
  ElMessage.success('菜单排序已更新')
}

const handleAdd = () => {
  drawerType.value = 'add'
  currentMenu.value = null
  showDrawer.value = true
}

const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentMenu.value = { ...row }
  showDrawer.value = true
}

const handleAddChild = (row) => {
  drawerType.value = 'add'
  currentMenu.value = { parentId: row.id }
  showDrawer.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除菜单「${row.name}」吗？`, '删除菜单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => { row.status = 'enabled' })
  ElMessage.success('批量启用成功')
  selectedRows.value = []
}

const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => { row.status = 'disabled' })
  ElMessage.success('批量禁用成功')
  selectedRows.value = []
}

const handleVisibleChange = (row) => {
  ElMessage.success(`菜单「${row.name}」可见性已${row.visible ? '开启' : '关闭'}`)
}

const handleExport = () => {
  ElMessage.success('菜单导出成功')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
}
</script>

<style lang="scss" scoped>
.system-menu-manage {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .content-wrapper {
    display: flex;
    gap: 16px;
    flex: 1;
    overflow: hidden;

    .menu-tree-panel,
    .menu-list-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #ebeef5;
      border-radius: 8px;

      .panel-header {
        padding: 12px 16px;
        background: #fafafa;
        border-bottom: 1px solid #ebeef5;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .menu-tree-panel {
      width: 300px;
      padding: 12px;
      overflow-y: auto;

      .tree-node {
        display: flex;
        align-items: center;
        gap: 8px;

        .node-icon {
          color: #409eff;
        }
      }
    }

    .menu-list-panel {
      flex: 1;
    }
  }
}
</style>

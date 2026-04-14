<template>
  <div class="portal-navigation">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="navType">
          <el-radio label="header">顶部主导航</el-radio>
          <el-radio label="workbench">工作台快捷导航</el-radio>
          <el-radio label="mobile">移动端导航</el-radio>
        </el-radio-group>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd" icon="Plus">新增导航项</el-button>
        <el-button @click="handleResetTemplate" icon="RefreshLeft">恢复默认模板</el-button>
      </div>
    </div>

    <!-- 导航配置列表 -->
    <div class="nav-list">
      <el-alert
          title="拖拽排序：按住鼠标左键拖动导航项调整顺序，实时生效"
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
      />

      <el-table
          :data="navItems"
          border
          row-key="id"
          :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
      >
        <el-table-column prop="sort" label="排序" width="80" align="center">
          <template #default="{ row }">
            <span>{{ row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="100" align="center">
          <template #default="{ row }">
            <el-icon :size="20"><component :is="row.icon || 'Menu'" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="导航名称" min-width="150" />
        <el-table-column prop="menuName" label="关联菜单" min-width="180" />
        <el-table-column prop="roles" label="显示角色" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role" size="small" style="margin-right: 4px">{{ role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="visible" label="显示" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.visible" @change="handleVisibleChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 导航编辑抽屉 -->
    <NavigationDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentNav"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import NavigationDrawer from './NavigationDrawer.vue'

const navType = ref('header')
const currentNav = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)

const navItems = ref([
  { id: 1, name: '工作台', menuName: '工作台首页', icon: 'HomeFilled', sort: 1, roles: ['全部角色'], visible: true },
  { id: 2, name: '审批管理', menuName: '流程中心/审批管理', icon: 'Stamp', sort: 2, roles: ['系统管理员', '部门管理员', '普通员工'], visible: true },
  { id: 3, name: '内容管理', menuName: '公文与内容管理', icon: 'Reading', sort: 3, roles: ['系统管理员', '部门管理员'], visible: true },
  { id: 4, name: 'AI助手', menuName: 'AI智能助手', icon: 'MagicStick', sort: 4, roles: ['系统管理员'], visible: true },
  { id: 5, name: '系统管理', menuName: '系统管理', icon: 'Setting', sort: 5, roles: ['超级管理员', '系统管理员'], visible: true }
])

const handleAdd = () => {
  drawerType.value = 'add'
  currentNav.value = null
  showDrawer.value = true
}

const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentNav.value = { ...row }
  showDrawer.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除导航项「${row.name}」吗？`, '删除导航', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    navItems.value = navItems.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleVisibleChange = (row) => {
  ElMessage.success(`导航「${row.name}」已${row.visible ? '显示' : '隐藏'}`)
}

const handleResetTemplate = () => {
  ElMessageBox.confirm('确定要恢复默认导航模板吗？当前配置将被覆盖。', '恢复默认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已恢复默认模板')
  }).catch(() => {})
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = navItems.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      navItems.value[index] = { ...navItems.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    navItems.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
}
</script>

<style lang="scss" scoped>
.portal-navigation {
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

  .nav-list {
    flex: 1;
    overflow-y: auto;
  }
}
</style>

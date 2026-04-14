<template>
  <div class="role-permission">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button type="success" @click="handleBatchEnable" :disabled="selectedRows.length === 0">批量启用</el-button>
          <el-button type="warning" @click="handleBatchDisable" :disabled="selectedRows.length === 0">批量禁用</el-button>
        </el-button-group>
        <el-button @click="handleCopyPermission" icon="CopyDocument">复制权限</el-button>
      </div>
      <div class="toolbar-right">
        <el-input v-model="searchKeyword" placeholder="搜索角色名称" prefix-icon="Search" clearable style="width: 200px" />
        <el-button type="primary" @click="handleAdd" icon="Plus">新增角色</el-button>
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 左侧角色列表 + 右侧权限树 -->
    <div class="content-wrapper">
      <!-- 左侧：角色列表 -->
      <div class="role-list-panel">
        <div class="panel-header">角色列表</div>
        <el-table
            :data="filteredRoles"
            border
            highlight-current-row
            @selection-change="handleSelectionChange"
            @current-change="handleCurrentChange"
            row-key="id"
            style="flex: 1"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="name" label="角色名称" min-width="150" />
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.type === 'system' ? 'danger' : 'primary'" size="small">
                {{ row.type === 'system' ? '系统' : '自定义' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="userCount" label="人数" width="80" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 右侧：权限配置 -->
      <div class="permission-panel">
        <div class="panel-header">
          <span>权限配置</span>
          <el-tag v-if="currentRole" type="primary">当前角色：{{ currentRole.name }}</el-tag>
        </div>

        <div class="permission-content" v-if="currentRole">
          <!-- 权限类型切换 -->
          <div class="permission-tabs">
            <el-radio-group v-model="permissionType">
              <el-radio label="menu">菜单权限</el-radio>
              <el-radio label="button">按钮权限</el-radio>
              <el-radio label="data">数据权限</el-radio>
            </el-radio-group>
          </div>

          <!-- 菜单权限树 -->
          <div v-if="permissionType === 'menu'" class="permission-tree">
            <div class="tree-actions">
              <el-checkbox v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>
              <el-button link type="primary" @click="handleExpandAll">展开/折叠</el-button>
            </div>
            <el-tree
                ref="permissionTreeRef"
                :data="menuTree"
                :props="{ label: 'name', children: 'children' }"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="currentRole.permissions"
                @check="handlePermissionCheck"
            />
          </div>

          <!-- 按钮权限 -->
          <div v-if="permissionType === 'button'" class="button-permission">
            <el-alert title="按钮权限基于菜单权限，请先勾选对应菜单" type="info" :closable="false" style="margin-bottom: 16px" />
            <el-table :data="buttonPermissions" border>
              <el-table-column prop="menuName" label="所属菜单" min-width="180" />
              <el-table-column prop="buttonName" label="按钮名称" min-width="150" />
              <el-table-column label="授权" width="100" align="center">
                <template #default="{ row }">
                  <el-checkbox v-model="row.granted" />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 数据权限 -->
          <div v-if="permissionType === 'data'" class="data-permission">
            <el-form label-width="120px">
              <el-form-item label="数据范围">
                <el-select v-model="currentRole.dataScope" style="width: 100%">
                  <el-option label="全部数据" value="all" />
                  <el-option label="本部门数据" value="department" />
                  <el-option label="本人数据" value="self" />
                  <el-option label="自定义" value="custom" />
                </el-select>
              </el-form-item>
              <el-form-item label="自定义部门" v-if="currentRole.dataScope === 'custom'">
                <el-tree-select
                    v-model="currentRole.customDepartments"
                    :data="departmentTree"
                    multiple
                    placeholder="选择部门"
                    style="width: 100%"
                />
              </el-form-item>
            </el-form>
          </div>

          <div class="permission-footer">
            <el-button @click="handleResetPermission">重置权限</el-button>
            <el-button type="primary" @click="handleSavePermission">保存权限</el-button>
          </div>
        </div>

        <el-empty v-else description="请选择角色进行权限配置" />
      </div>
    </div>

    <!-- 角色编辑抽屉 -->
    <RoleDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentRole"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RoleDrawer from './RoleDrawer.vue'

const searchKeyword = ref('')
const selectedRows = ref([])
const currentRole = ref(null)
const permissionType = ref('menu')
const checkAll = ref(false)
const showDrawer = ref(false)
const drawerType = ref('add')
const permissionTreeRef = ref(null)

const roles = ref([
  { id: 1, name: '超级管理员', type: 'system', userCount: 3, status: 'enabled', permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], dataScope: 'all' },
  { id: 2, name: '系统管理员', type: 'system', userCount: 5, status: 'enabled', permissions: [1, 2, 3, 4, 5, 6, 7, 8], dataScope: 'department' },
  { id: 3, name: '部门管理员', type: 'custom', userCount: 15, status: 'enabled', permissions: [1, 2, 3, 4], dataScope: 'department' },
  { id: 4, name: '普通员工', type: 'custom', userCount: 150, status: 'enabled', permissions: [1, 2], dataScope: 'self' }
])

const menuTree = ref([
  {
    id: 1,
    name: '工作台',
    children: [
      { id: 2, name: '我的待办' }
    ]
  },
  {
    id: 3,
    name: '流程中心',
    children: [
      {
        id: 4,
        name: '审批管理',
        children: [
          { id: 5, name: '待办审批' },
          { id: 6, name: '已办审批' }
        ]
      }
    ]
  },
  {
    id: 7,
    name: '系统管理',
    children: [
      {
        id: 8,
        name: '权限菜单管理',
        children: [
          { id: 9, name: '新增菜单', isButton: true },
          { id: 10, name: '编辑菜单', isButton: true }
        ]
      }
    ]
  }
])

const departmentTree = ref([
  { id: 1, name: '公司总部', children: [
      { id: 2, name: '技术部' },
      { id: 3, name: '产品部' }
    ]
  }
])

const buttonPermissions = computed(() => {
  return [
    { menuName: '权限菜单管理', buttonName: '新增菜单', granted: true },
    { menuName: '权限菜单管理', buttonName: '编辑菜单', granted: true },
    { menuName: '权限菜单管理', buttonName: '删除菜单', granted: false }
  ]
})

const filteredRoles = computed(() => {
  if (searchKeyword.value) {
    return roles.value.filter(role => role.name.includes(searchKeyword.value))
  }
  return roles.value
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleCurrentChange = (row) => {
  currentRole.value = row
}

const handleAdd = () => {
  drawerType.value = 'add'
  currentRole.value = null
  showDrawer.value = true
}

const handleCheckAll = (val) => {
  permissionTreeRef.value?.setCheckedKeys(val ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [])
}

const handleExpandAll = () => {
  permissionTreeRef.value?.store.nodesMap[n => n.expanded = !n.expanded]
}

const handlePermissionCheck = () => {
  checkAll.value = permissionTreeRef.value?.getCheckedKeys().length === 11
}

const handleSavePermission = () => {
  if (!currentRole.value) {
    ElMessage.warning('请先选择角色')
    return
  }
  ElMessage.success('权限保存成功')
}

const handleResetPermission = () => {
  if (!currentRole.value) {
    ElMessage.warning('请先选择角色')
    return
  }
  ElMessageBox.confirm('确定要重置该角色权限为默认值吗？', '重置权限', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('权限重置成功')
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

const handleCopyPermission = () => {
  ElMessage.info('复制权限功能')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = roles.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    roles.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
}
</script>

<style lang="scss" scoped>
.role-permission {
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

    .role-list-panel,
    .permission-panel {
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

    .role-list-panel {
      width: 300px;
    }

    .permission-panel {
      flex: 1;

      .permission-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;

        .permission-tabs {
          margin-bottom: 16px;
        }

        .permission-tree {
          flex: 1;
          overflow-y: auto;

          .tree-actions {
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 16px;
          }
        }

        .permission-footer {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #ebeef5;
        }
      }
    }
  }
}
</style>

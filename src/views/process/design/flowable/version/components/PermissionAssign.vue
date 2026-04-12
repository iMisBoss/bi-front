<template>
  <div class="permission-assign">
    <!-- 授权模式切换 -->
    <div class="perm-header">
      <el-radio-group v-model="permMode" size="large">
        <el-radio-button value="init">发起权限</el-radio-button>
        <el-radio-button value="admin">管理权限</el-radio-button>
      </el-radio-group>
      <div class="perm-actions">
        <el-button type="primary" size="small" @click="handleBatchAuth">批量授权</el-button>
        <el-button size="small" @click="handleClearPerm">清空权限</el-button>
        <el-button size="small" @click="handleExportPerm">导出权限清单</el-button>
      </div>
    </div>

    <!-- 发起权限 -->
    <el-table v-if="permMode === 'init'" :data="initPermList" border v-loading="loading">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="流程名称" min-width="200" prop="name" />
      <el-table-column label="已授权范围" min-width="250">
        <template #default="{ row }">
          <el-tag v-for="scope in row.authScope" :key="scope" size="small" style="margin-right: 4px">{{ scope }}</el-tag>
          <span v-if="!row.authScope || !row.authScope.length" class="no-auth">未授权</span>
        </template>
      </el-table-column>
      <el-table-column label="授权人" width="120" align="center" prop="authBy" />
      <el-table-column label="授权时间" width="180" align="center" prop="authTime" />
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEditAuth(row)">编辑授权</el-button>
          <el-button size="small" type="danger" link @click="handleClearRow(row)">清空</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 管理权限 -->
    <el-table v-else :data="adminPermList" border>
      <el-table-column label="权限项" width="180" align="center" prop="permItem" />
      <el-table-column label="已授权角色" min-width="250">
        <template #default="{ row }">
          <el-tag v-for="role in row.authRoles" :key="role" size="small" type="warning" style="margin-right: 4px">{{ role }}</el-tag>
          <span v-if="!row.authRoles || !row.authRoles.length" class="no-auth">未授权</span>
        </template>
      </el-table-column>
      <el-table-column label="授权说明" min-width="200" prop="desc" />
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEditAdminPerm(row)">编辑授权</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const permMode = ref('init')

const initPermList = ref([
  { id: 1, name: '请假审批流程', authScope: ['全体员工'], authBy: '系统管理员', authTime: '2024-03-01 10:00' },
  { id: 2, name: '加班审批流程', authScope: ['技术部', '产品部'], authBy: '系统管理员', authTime: '2024-02-15 14:30' },
  { id: 3, name: '费用报销流程', authScope: [], authBy: '-', authTime: '-' }
])

const adminPermList = ref([
  { permItem: '流程编辑', authRoles: ['系统管理员', '流程管理员'], desc: '可编辑流程设计与配置' },
  { permItem: '版本发布', authRoles: ['系统管理员'], desc: '可发布流程至运行版本' },
  { permItem: '模板管控', authRoles: ['系统管理员', '运维管理员'], desc: '可管理全局开关与配置' },
  { permItem: '数据查看', authRoles: ['系统管理员', '审计员'], desc: '可查看流程数据与日志' }
])

const handleBatchAuth = () => { ElMessage.info('批量授权功能开发中...') }
const handleClearPerm = () => { ElMessage.warning('清空权限功能开发中...') }
const handleExportPerm = () => { ElMessage.success('权限清单导出成功') }
const handleEditAuth = (row) => { ElMessage.info(`编辑「${row.name}」发起权限`) }
const handleClearRow = (row) => {
  ElMessageBox.confirm(`确定清空「${row.name}」的发起权限？`, '确认', { type: 'warning' }).then(() => {
    row.authScope = []
    ElMessage.success('已清空')
  }).catch(() => {})
}
const handleEditAdminPerm = (row) => { ElMessage.info(`编辑「${row.permItem}」管理权限`) }
</script>

<style scoped lang="scss">
.permission-assign {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  overflow-y: auto;

  .perm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .perm-actions { display: flex; gap: 10px; }
  }

  .no-auth { color: #c0c4cc; font-size: 13px; }

  :deep(.el-table) { border-radius: 6px; overflow: hidden; }
  :deep(.el-button--link) { font-size: 13px; }
}
</style>

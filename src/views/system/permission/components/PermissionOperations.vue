<template>
  <div class="permission-operations">
    <el-alert
        title="权限运维说明：所有运维操作实时生效，高危操作需要二次确认，全程留痕"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
    />

    <!-- 缓存管理 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">权限缓存管理</span>
          <el-button type="primary" size="small" @click="handleClearCache">一键清理缓存</el-button>
        </div>
      </template>
      <el-form label-width="150px">
        <el-form-item label="当前缓存状态">
          <span>正常</span>
          <el-tag type="success" style="margin-left: 12px">运行中</el-tag>
        </el-form-item>
        <el-form-item label="缓存大小">
          <span>128MB</span>
        </el-form-item>
        <el-form-item label="最后清理时间">
          <span>2026-04-15 09:00:00</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 权限一致性校验 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span class="card-title">权限一致性校验</span>
          <el-button type="primary" size="small" @click="handleCheckPermission" :loading="checking">一键校验</el-button>
        </div>
      </template>
      <el-form label-width="150px">
        <el-form-item label="校验结果">
          <el-tag type="success">权限数据一致，无异常</el-tag>
        </el-form-item>
        <el-form-item label="异常记录数">
          <span>0 条</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作审计日志 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">权限变更审计日志</span>
      </template>
      <div class="filter-bar" style="margin-bottom: 16px">
        <el-input placeholder="搜索操作人/内容" prefix-icon="Search" clearable style="width: 240px" />
        <el-select placeholder="操作类型" style="width: 150px" clearable>
          <el-option label="角色授权" value="role_auth" />
          <el-option label="菜单修改" value="menu_edit" />
          <el-option label="导航配置" value="nav_config" />
        </el-select>
        <el-date-picker type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
        <el-button @click="handleExportAudit" icon="Download">导出日志</el-button>
      </div>

      <el-table :data="auditLogs" border style="flex: 1">
        <el-table-column prop="time" label="操作时间" width="160" />
        <el-table-column prop="user" label="操作人" width="100" />
        <el-table-column prop="action" label="操作类型" width="120" />
        <el-table-column prop="content" label="操作内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
      </el-table>
    </el-card>

    <!-- 批量同步 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">批量同步</span>
      </template>
      <div class="sync-actions">
        <el-button type="warning" @click="handleSyncOrg">同步组织架构权限</el-button>
        <el-button type="warning" @click="handleSyncRole">同步角色成员权限</el-button>
        <el-button type="danger" @click="handleResetAllPermission">重置所有权限</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const checking = ref(false)

const auditLogs = ref([
  { time: '2026-04-15 10:30', user: '张三', action: '角色授权', content: '为角色「部门管理员」新增菜单权限「AI管理」', ip: '192.168.1.100' },
  { time: '2026-04-15 09:15', user: '李四', action: '菜单修改', content: '编辑菜单「权限菜单管理」的显示状态', ip: '192.168.1.101' }
])

const handleClearCache = () => {
  ElMessageBox.confirm('确定要清理所有权限缓存吗？清理后权限将立即生效。', '清理缓存', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('权限缓存清理成功')
  }).catch(() => {})
}

const handleCheckPermission = () => {
  checking.value = true
  setTimeout(() => {
    checking.value = false
    ElMessage.success('校验完成，权限数据一致')
  }, 1500)
}

const handleExportAudit = () => {
  ElMessage.success('审计日志导出成功')
}

const handleSyncOrg = () => {
  ElMessageBox.confirm('确定要同步组织架构权限吗？此操作将根据最新组织架构更新所有角色权限。', '同步组织架构', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('组织架构权限同步成功')
  }).catch(() => {})
}

const handleSyncRole = () => {
  ElMessageBox.confirm('确定要同步角色成员权限吗？此操作将刷新所有角色下的人员权限。', '同步角色权限', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('角色成员权限同步成功')
  }).catch(() => {})
}

const handleResetAllPermission = () => {
  ElMessageBox.confirm('确定要重置所有权限为默认值吗？此操作不可恢复！', '重置所有权限', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('所有权限已重置为默认值')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.permission-operations {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  .config-card {
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .sync-actions {
    display: flex;
    gap: 12px;
  }
}
</style>

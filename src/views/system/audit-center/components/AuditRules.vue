<template>
  <div class="audit-rules">
    <el-alert
        title="审计规则配置：所有配置实时生效，系统核心敏感规则不可禁用，全程记录配置变更日志"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
    />

    <!-- 全局开关 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">全局开关</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="审计总开关">
          <el-switch v-model="globalSwitch.auditEnabled" />
        </el-form-item>
        <el-form-item label="登录日志开关">
          <el-switch v-model="globalSwitch.loginLogEnabled" :disabled="!globalSwitch.auditEnabled" />
        </el-form-item>
        <el-form-item label="操作日志开关">
          <el-switch v-model="globalSwitch.operationLogEnabled" :disabled="!globalSwitch.auditEnabled" />
        </el-form-item>
        <el-form-item label="参数记录开关">
          <el-switch v-model="globalSwitch.paramLogEnabled" :disabled="!globalSwitch.auditEnabled" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志采集规则 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">日志采集规则</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="采集范围">
          <el-radio-group v-model="collectionRule.scope">
            <el-radio label="all" value="all">全模块采集</el-radio>
            <el-radio label="custom" value="custom">指定模块采集</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="指定模块" v-if="collectionRule.scope === 'custom'">
          <el-checkbox-group v-model="collectionRule.modules">
            <el-checkbox label="审批">审批</el-checkbox>
            <el-checkbox label="权限">权限</el-checkbox>
            <el-checkbox label="AI">AI</el-checkbox>
            <el-checkbox label="内容">内容</el-checkbox>
            <el-checkbox label="系统配置">系统配置</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="采集粒度">
          <el-radio-group v-model="collectionRule.granularity">
            <el-radio label="simple" value="simple">精简记录（仅行为）</el-radio>
            <el-radio label="full" value="full">完整记录（含参数）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="免审计白名单">
          <el-input
              v-model="collectionRule.whitelist"
              type="textarea"
              :rows="3"
              placeholder="每行一个操作，例：页面刷新、鼠标移动"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 敏感操作定义 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span class="card-title">敏感操作定义</span>
          <el-button type="primary" size="small" @click="handleAddSensitiveOp" icon="Plus">新增敏感操作</el-button>
        </div>
      </template>

      <el-table :data="sensitiveOperations" border>
        <el-table-column prop="name" label="操作名称" min-width="200" />
        <el-table-column prop="module" label="所属模块" width="120" />
        <el-table-column prop="riskLevel" label="风险等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRiskType(row.riskLevel)" size="small">{{ row.riskLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="system" label="系统内置" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.system" type="danger" size="small">是</el-tag>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEditSensitiveOp(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteSensitiveOp(row)" :disabled="row.system">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="save-actions">
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const globalSwitch = reactive({
  auditEnabled: true,
  loginLogEnabled: true,
  operationLogEnabled: true,
  paramLogEnabled: true
})

const collectionRule = reactive({
  scope: 'all',
  modules: [],
  granularity: 'full',
  whitelist: '页面刷新\n鼠标移动\n视图切换'
})

const sensitiveOperations = ref([
  { id: 1, name: '权限修改', module: '权限管理', riskLevel: '高', system: true, status: 'enabled' },
  { id: 2, name: '数据删除', module: '全模块', riskLevel: '高', system: true, status: 'enabled' },
  { id: 3, name: '密码重置', module: '系统管理', riskLevel: '高', system: true, status: 'enabled' },
  { id: 4, name: 'AI配置变更', module: 'AI管理', riskLevel: '中', system: true, status: 'enabled' },
  { id: 5, name: '日志导出', module: '审计管理', riskLevel: '中', system: true, status: 'enabled' },
  { id: 6, name: '批量授权', module: '权限管理', riskLevel: '中', system: false, status: 'enabled' }
])

const getRiskType = (level) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[level] || ''
}

const handleAddSensitiveOp = () => {
  ElMessage.info('新增敏感操作功能')
}

const handleEditSensitiveOp = (row) => {
  ElMessage.info('编辑敏感操作功能')
}

const handleDeleteSensitiveOp = (row) => {
  ElMessageBox.confirm(`确定要删除敏感操作「${row.name}」吗？`, '删除敏感操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    sensitiveOperations.value = sensitiveOperations.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSave = () => {
  ElMessage.success('审计规则配置保存成功')
}
</script>

<style lang="scss" scoped>
.audit-rules {
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

  .save-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    padding-bottom: 20px;
  }
}
</style>

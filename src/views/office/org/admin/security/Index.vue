<template>
  <div class="security-config-page">
    <el-card class="main-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleSave">保存配置</el-button>
          <el-button @click="handleResetDefault">重置默认</el-button>
          <el-button @click="handleRefresh">刷新</el-button>
        </div>
      </div>

      <div class="content-wrapper">
        <el-tabs v-model="activeTab" class="security-tabs">
          <!-- Tab1: 数据脱敏配置 -->
          <el-tab-pane label="数据脱敏配置" name="desensitization">
            <div class="tab-content">
              <div class="module-section">
                <div class="section-title">内部员工敏感字段脱敏</div>
                <div class="field-form">
                  <div v-for="field in internalFields" :key="field.id" class="field-row">
                    <div class="field-header">
                      <span class="field-name">{{ field.name }}</span>
                      <el-switch
                          v-model="field.status"
                          active-value="enabled"
                          inactive-value="disabled"
                      />
                    </div>
                    <div class="field-config">
                      <div class="config-item">
                        <span class="label">脱敏规则：</span>
                        <el-select v-model="field.rule" size="small" style="width: 180px">
                          <el-option v-for="rule in field.rules" :key="rule" :label="rule" :value="rule" />
                        </el-select>
                      </div>
                      <div class="config-item">
                        <span class="label">普通员工可见：</span>
                        <span class="value">{{ field.normalVisibility }}</span>
                      </div>
                      <div class="config-item">
                        <span class="label">管理层可见：</span>
                        <span class="value">{{ field.adminVisibility }}</span>
                      </div>
                      <div class="config-item">
                        <span class="label">超级管理员可见：</span>
                        <span class="value">{{ field.superVisibility }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="module-section">
                <div class="section-title">外部联系人敏感字段脱敏</div>
                <div class="field-form">
                  <div v-for="field in externalFields" :key="field.id" class="field-row">
                    <div class="field-header">
                      <span class="field-name">{{ field.name }}</span>
                      <el-switch
                          v-model="field.status"
                          active-value="enabled"
                          inactive-value="disabled"
                      />
                    </div>
                    <div class="field-config">
                      <div class="config-item">
                        <span class="label">脱敏规则：</span>
                        <el-select v-model="field.rule" size="small" style="width: 180px">
                          <el-option v-for="rule in field.rules" :key="rule" :label="rule" :value="rule" />
                        </el-select>
                      </div>
                      <div class="config-item">
                        <span class="label">普通员工可见：</span>
                        <span class="value">{{ field.normalVisibility }}</span>
                      </div>
                      <div class="config-item">
                        <span class="label">负责人可见：</span>
                        <span class="value">{{ field.ownerVisibility }}</span>
                      </div>
                      <div class="config-item">
                        <span class="label">超级管理员可见：</span>
                        <span class="value">{{ field.superVisibility }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- Tab2: 访问权限管控 -->
          <el-tab-pane label="访问权限管控" name="access">
            <div class="tab-content">
              <div class="module-section">
                <div class="section-title">角色数据访问权限</div>
                <el-table :data="rolePermissions" border>
                  <el-table-column prop="role" label="角色类型" width="150" />
                  <el-table-column prop="orgPermission" label="组织架构数据" width="180" />
                  <el-table-column prop="userPermission" label="人员信息数据" width="200" />
                  <el-table-column prop="contactPermission" label="通讯录数据" width="200" />
                  <el-table-column prop="securityPermission" label="安全配置数据" width="150" />
                  <el-table-column prop="actionPermission" label="操作权限" width="150" />
                  <el-table-column label="操作" width="120">
                    <template #default>
                      <el-button link type="primary" size="small" @click="showCustomPermissionDialog = true">自定义权限</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- Tab3: 操作审计设置 -->
          <el-tab-pane label="操作审计设置" name="audit">
            <div class="tab-content">
              <div class="module-section">
                <div class="section-title">日志留存配置</div>
                <el-form :model="auditForm" label-width="150px" class="audit-form">
                  <el-form-item label="日志留存时间">
                    <el-select v-model="auditForm.retentionDays" style="width: 200px">
                      <el-option label="30天" :value="30" />
                      <el-option label="90天" :value="90" />
                      <el-option label="180天" :value="180" />
                      <el-option label="365天" :value="365" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="日志清理规则">
                    <el-radio-group v-model="auditForm.cleanRule">
                      <el-radio label="auto">自动清理</el-radio>
                      <el-radio label="manual">手动清理</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="日志备份">
                    <el-switch v-model="auditForm.backup" />
                  </el-form-item>
                </el-form>
              </div>

              <div class="module-section">
                <div class="section-title">审计范围配置</div>
                <el-checkbox-group v-model="auditForm.auditScopes" class="scope-group">
                  <el-checkbox label="org">组织架构操作</el-checkbox>
                  <el-checkbox label="user">人员管理操作</el-checkbox>
                  <el-checkbox label="contact">通讯录操作</el-checkbox>
                  <el-checkbox label="security">安全配置操作</el-checkbox>
                  <el-checkbox label="system">系统操作</el-checkbox>
                </el-checkbox-group>
              </div>

              <div class="module-section">
                <div class="section-title">告警规则配置</div>
                <el-button type="primary" size="small" @click="showAlertDialog = true">新增告警规则</el-button>
                <el-table :data="alertRules" border style="margin-top: 16px">
                  <el-table-column prop="scenario" label="告警场景" width="200" />
                  <el-table-column prop="method" label="告警方式" width="200" />
                  <el-table-column prop="receiver" label="接收人" width="150" />
                  <el-table-column prop="frequency" label="告警频率" width="150" />
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button link type="danger" size="small" @click="handleDeleteAlert(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- Tab4: 密码安全策略 -->
          <el-tab-pane label="密码安全策略" name="password">
            <div class="tab-content">
              <div class="module-section">
                <div class="section-title">密码规则配置</div>
                <el-form :model="passwordForm" label-width="150px" class="audit-form">
                  <el-form-item label="密码复杂度">
                    <el-select v-model="passwordForm.complexity" style="width: 200px">
                      <el-option label="简单（6-12位，字母/数字）" value="simple" />
                      <el-option label="中等（8-16位，字母+数字）" value="medium" />
                      <el-option label="复杂（10-16位，字母+数字+特殊符号）" value="complex" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="密码有效期">
                    <el-select v-model="passwordForm.validityDays" style="width: 200px">
                      <el-option label="30天" :value="30" />
                      <el-option label="60天" :value="60" />
                      <el-option label="90天" :value="90" />
                      <el-option label="永久" :value="0" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="密码历史限制">
                    <el-select v-model="passwordForm.historyLimit" style="width: 200px">
                      <el-option label="禁止使用前3次密码" :value="3" />
                      <el-option label="禁止使用前5次密码" :value="5" />
                      <el-option label="禁止使用前10次密码" :value="10" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="初始密码规则">
                    <el-select v-model="passwordForm.initialPwdRule" style="width: 200px">
                      <el-option label="系统自动生成（8位字母+数字）" value="auto" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="密码重置权限">
                    <el-radio-group v-model="passwordForm.resetPermission">
                      <el-radio label="super">仅超级管理员可重置</el-radio>
                      <el-radio label="hr">人事管理员可重置本部门人员</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>
              </div>

              <div class="module-section">
                <div class="section-title">登录安全配置</div>
                <el-form :model="loginForm" label-width="150px" class="audit-form">
                  <el-form-item label="登录失败限制">
                    <el-input-number v-model="loginForm.maxFailCount" :min="3" :max="10" style="width: 100px" />
                    <span class="unit-text">次后锁定</span>
                  </el-form-item>
                  <el-form-item label="账号锁定时间">
                    <el-input-number v-model="loginForm.lockDuration" :min="5" :max="120" style="width: 100px" />
                    <span class="unit-text">分钟</span>
                  </el-form-item>
                  <el-form-item label="自动登出">
                    <el-input-number v-model="loginForm.autoLogout" :min="5" :max="480" style="width: 100px" />
                    <span class="unit-text">分钟无操作自动登出</span>
                  </el-form-item>
                  <el-form-item label="登录IP限制">
                    <el-switch v-model="loginForm.ipRestriction" />
                  </el-form-item>
                  <el-form-item v-if="loginForm.ipRestriction" label="允许IP段">
                    <el-input v-model="loginForm.allowedIps" type="textarea" :rows="2" placeholder="请输入IP段，多个用逗号分隔，如：192.168.1.0/24,10.0.0.0/8" />
                  </el-form-item>
                  <el-form-item label="登录日志">
                    <el-switch v-model="loginForm.loginLog" />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 自定义权限弹窗 -->
    <el-dialog v-model="showCustomPermissionDialog" title="自定义权限" width="600px">
      <el-form label-width="120px">
        <el-form-item label="选择角色">
          <el-select placeholder="选择角色" style="width: 100%">
            <el-option label="市场部主管" value="marketing_manager" />
            <el-option label="销售部主管" value="sales_manager" />
          </el-select>
        </el-form-item>
        <el-form-item label="授权范围">
          <el-checkbox-group>
            <el-checkbox label="查看销售部人员数据" />
            <el-checkbox label="查看市场部通讯录" />
            <el-checkbox label="编辑本部门组织架构" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCustomPermissionDialog = false">取消</el-button>
        <el-button type="primary" @click="showCustomPermissionDialog = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- 告警规则弹窗 -->
    <el-dialog v-model="showAlertDialog" title="新增告警规则" width="600px">
      <el-form :model="alertForm" label-width="120px">
        <el-form-item label="告警场景">
          <el-select v-model="alertForm.scenario" placeholder="选择告警场景" style="width: 100%">
            <el-option label="批量删除数据" value="batch_delete" />
            <el-option label="修改安全配置" value="security_change" />
            <el-option label="多次登录失败" value="login_fail" />
            <el-option label="越权访问" value="unauthorized_access" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警方式">
          <el-checkbox-group v-model="alertForm.methods">
            <el-checkbox label="system">系统消息</el-checkbox>
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="接收人">
          <el-select v-model="alertForm.receiver" placeholder="选择接收人" style="width: 100%">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="系统管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警频率">
          <el-select v-model="alertForm.frequency" placeholder="选择告警频率" style="width: 100%">
            <el-option label="实时告警" value="realtime" />
            <el-option label="每小时汇总" value="hourly" />
            <el-option label="每天汇总" value="daily" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAlertDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAlert">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('desensitization')
const showCustomPermissionDialog = ref(false)
const showAlertDialog = ref(false)

const internalFields = ref([
  { id: 1, name: '手机号', rule: '中间4位星号', rules: ['中间4位星号', '前3位显示', '完全隐藏'], normalVisibility: '脱敏', adminVisibility: '完整', superVisibility: '完整', status: 'enabled' },
  { id: 2, name: '身份证号', rule: '中间8位星号', rules: ['中间8位星号', '前6位显示', '完全隐藏'], normalVisibility: '隐藏', adminVisibility: '脱敏', superVisibility: '完整', status: 'enabled' },
  { id: 3, name: '邮箱', rule: '@前隐藏2位', rules: ['@前隐藏2位', '仅显示域名', '完全隐藏'], normalVisibility: '脱敏', adminVisibility: '完整', superVisibility: '完整', status: 'enabled' },
  { id: 4, name: '紧急联系人', rule: '手机号中间4位星号', rules: ['手机号中间4位星号', '完全隐藏'], normalVisibility: '脱敏', adminVisibility: '完整', superVisibility: '完整', status: 'enabled' },
  { id: 5, name: '家庭地址', rule: '仅显示城市', rules: ['仅显示城市', '完全隐藏'], normalVisibility: '隐藏', adminVisibility: '脱敏', superVisibility: '完整', status: 'enabled' }
])

const externalFields = ref([
  { id: 1, name: '手机号', rule: '中间4位星号', rules: ['中间4位星号', '完全隐藏'], normalVisibility: '脱敏', ownerVisibility: '完整', superVisibility: '完整', status: 'enabled' },
  { id: 2, name: '邮箱', rule: '@前隐藏2位', rules: ['@前隐藏2位', '完全隐藏'], normalVisibility: '脱敏', ownerVisibility: '完整', superVisibility: '完整', status: 'enabled' },
  { id: 3, name: '办公电话', rule: '中间4位星号', rules: ['中间4位星号', '完全隐藏'], normalVisibility: '脱敏', ownerVisibility: '完整', superVisibility: '完整', status: 'enabled' }
])

const rolePermissions = ref([
  { role: '超级管理员', orgPermission: '全量可见/操作', userPermission: '全量可见/操作', contactPermission: '全量可见/操作', securityPermission: '全量可见/操作', actionPermission: '所有操作' },
  { role: '人事管理员', orgPermission: '全量可见/操作', userPermission: '本部门可见/操作', contactPermission: '本部门关联可见/操作', securityPermission: '只读', actionPermission: '编辑本部门数据' },
  { role: '部门经理', orgPermission: '本部门及下级可见', userPermission: '本部门及下级可见', contactPermission: '本部门关联可见', securityPermission: '不可见', actionPermission: '查看本部门数据' },
  { role: '普通员工', orgPermission: '本部门可见', userPermission: '本人+本部门可见（脱敏）', contactPermission: '本部门关联可见（脱敏）', securityPermission: '不可见', actionPermission: '仅查看本人数据' },
  { role: '只读管理员', orgPermission: '全量可见', userPermission: '全量可见（脱敏）', contactPermission: '全量可见（脱敏）', securityPermission: '只读', actionPermission: '仅查看，无编辑' }
])

const auditForm = reactive({
  retentionDays: 90,
  cleanRule: 'auto',
  backup: false,
  auditScopes: ['org', 'user', 'contact', 'security', 'system']
})

const alertRules = ref([
  { id: 1, scenario: '批量删除数据', method: '系统消息、邮件通知', receiver: '超级管理员', frequency: '实时告警' },
  { id: 2, scenario: '修改安全配置', method: '系统消息', receiver: '超级管理员', frequency: '实时告警' },
  { id: 3, scenario: '多次登录失败', method: '系统消息、短信通知', receiver: '超级管理员', frequency: '每小时汇总' }
])

const alertForm = reactive({
  scenario: '',
  methods: [],
  receiver: '',
  frequency: ''
})

const passwordForm = reactive({
  complexity: 'medium',
  validityDays: 90,
  historyLimit: 3,
  initialPwdRule: 'auto',
  resetPermission: 'super'
})

const loginForm = reactive({
  maxFailCount: 5,
  lockDuration: 30,
  autoLogout: 30,
  ipRestriction: false,
  allowedIps: '',
  loginLog: true
})

onMounted(() => {})

const handleSave = () => {
  if (auditForm.retentionDays < 90) {
    ElMessage.warning('日志留存时间不可少于90天')
    return
  }
  ElMessage.success('配置保存成功')
}

const handleResetDefault = () => {
  ElMessageBox.confirm('确定要重置所有安全配置为默认值吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已重置为默认配置')
  })
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleDeleteAlert = (row) => {
  ElMessageBox.confirm(`确定要删除告警规则「${row.scenario}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    alertRules.value = alertRules.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  })
}

const handleConfirmAlert = () => {
  const methodMap = { system: '系统消息', email: '邮件通知', sms: '短信通知' }
  const frequencyMap = { realtime: '实时告警', hourly: '每小时汇总', daily: '每天汇总' }
  const scenarioMap = { batch_delete: '批量删除数据', security_change: '修改安全配置', login_fail: '多次登录失败', unauthorized_access: '越权访问' }

  alertRules.value.push({
    id: alertRules.value.length + 1,
    scenario: scenarioMap[alertForm.scenario] || alertForm.scenario,
    method: alertForm.methods.map(m => methodMap[m]).join('、'),
    receiver: alertForm.receiver === 'super_admin' ? '超级管理员' : '系统管理员',
    frequency: frequencyMap[alertForm.frequency] || alertForm.frequency
  })
  ElMessage.success('新增成功')
  showAlertDialog.value = false
  alertForm.scenario = ''
  alertForm.methods = []
  alertForm.receiver = ''
  alertForm.frequency = ''
}
</script>

<style lang="scss" scoped>
.security-config-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;

  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 16px;
    }
  }

  .toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;
  }

  .security-tabs {
    :deep(.el-tabs__content) {
      overflow: visible;
    }
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .module-section {
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #303133;
    }
  }

  .field-form {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .field-row {
      padding: 16px;
      background: #f5f7fa;
      border-radius: 4px;

      .field-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .field-name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }

      .field-config {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;

        .config-item {
          display: flex;
          align-items: center;
          gap: 8px;

          .label {
            font-size: 13px;
            color: #606266;
            white-space: nowrap;
          }

          .value {
            font-size: 13px;
            color: #303133;
          }
        }
      }
    }
  }

  .audit-form {
    max-width: 600px;
  }

  .unit-text {
    margin-left: 8px;
    font-size: 13px;
    color: #909399;
  }

  .scope-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>

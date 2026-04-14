<template>
  <div class="ip-black-white-list">
    <!-- 防护模式配置 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">防护模式配置</span>
      </template>
      <el-alert
          title="白名单模式开启后，非授权IP将直接拒绝访问系统登录页"
          type="warning"
          :closable="false"
          style="margin-bottom: 16px"
      />
      <el-form label-width="120px">
        <el-form-item label="防护模式">
          <el-radio-group v-model="protectionMode">
            <el-radio label="blacklist" value="blacklist">黑名单模式（仅拦截名单IP）</el-radio>
            <el-radio label="whitelist" value="whitelist">白名单模式（仅放行名单IP）</el-radio>
            <el-radio label="mixed" value="mixed">混合模式（白名单优先，黑名单补充）</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <div class="toolbar" style="margin-top: 20px">
      <div class="toolbar-left">
        <el-radio-group v-model="listType">
          <el-radio label="black">黑名单</el-radio>
          <el-radio label="white">白名单</el-radio>
        </el-radio-group>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleImport" icon="Upload">批量导入</el-button>
        <el-button @click="handleExport" icon="Download">批量导出</el-button>
        <el-button type="danger" @click="handleClearAll">一键清空</el-button>
        <el-button type="primary" @click="handleAdd" icon="Plus">新增IP规则</el-button>
      </div>
    </div>

    <!-- IP规则列表 -->
    <el-table
        :data="filteredIPList"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="ip" label="IP地址/段" min-width="200" />
      <el-table-column prop="type" label="规则类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.type === 'black' ? 'danger' : 'success'" size="small">
            {{ row.type === 'black' ? '黑名单' : '白名单' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="effectiveTime" label="生效时间" width="160" />
      <el-table-column prop="creator" label="创建人" width="100" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 拦截记录 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">拦截记录（最近10条）</span>
      </template>
      <el-table :data="blockRecords" border>
        <el-table-column prop="time" label="访问时间" width="160" />
        <el-table-column prop="ip" label="被拦截IP" width="160" />
        <el-table-column prop="account" label="尝试账号" width="120" />
        <el-table-column prop="location" label="IP归属地" width="150" />
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="handleAddToBlacklist(row)">加入黑名单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- IP编辑抽屉 -->
    <IPRuleDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentIP"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IPRuleDrawer from './IPRuleDrawer.vue'

const protectionMode = ref('blacklist')
const listType = ref('black')
const selectedRows = ref([])
const currentIP = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)

const ipRules = ref([
  { id: 1, ip: '10.0.0.50', type: 'black', remark: '恶意攻击IP', effectiveTime: '2026-04-01 10:00', creator: '管理员', status: 'enabled' },
  { id: 2, ip: '192.168.1.0/24', type: 'white', remark: '技术部内网段', effectiveTime: '2026-03-15 09:00', creator: '管理员', status: 'enabled' },
  { id: 3, ip: '172.16.0.100', type: 'black', remark: '异常登录IP', effectiveTime: '2026-04-10 14:00', creator: '管理员', status: 'enabled' },
  { id: 4, ip: '192.168.2.0/24', type: 'white', remark: '产品部内网段', effectiveTime: '2026-03-15 09:00', creator: '管理员', status: 'enabled' }
])

const blockRecords = ref([
  { time: '2026-04-15 10:30', ip: '10.0.0.50', account: 'admin', location: '外网' },
  { time: '2026-04-15 09:15', ip: '203.0.113.5', account: 'test', location: '外网' },
  { time: '2026-04-14 16:20', ip: '10.0.0.50', account: 'root', location: '外网' }
])

const filteredIPList = computed(() => {
  return ipRules.value.filter(rule => rule.type === listType.value)
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  drawerType.value = 'add'
  currentIP.value = null
  showDrawer.value = true
}

const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentIP.value = { ...row }
  showDrawer.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除IP规则「${row.ip}」吗？`, '删除IP规则', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ipRules.value = ipRules.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleImport = () => {
  ElMessage.info('批量导入功能')
}

const handleExport = () => {
  ElMessage.success('IP规则导出成功')
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有IP规则吗？此操作不可恢复！', '清空IP规则', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ipRules.value = ipRules.value.filter(rule => rule.type !== listType.value)
    ElMessage.success('清空成功')
  }).catch(() => {})
}

const handleAddToBlacklist = (row) => {
  ElMessageBox.confirm(`确定要将IP「${row.ip}」加入黑名单吗？`, '加入黑名单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ipRules.value.push({
      id: Date.now(),
      ip: row.ip,
      type: 'black',
      remark: '拦截记录自动加入',
      effectiveTime: new Date().toLocaleString(),
      creator: '管理员',
      status: 'enabled'
    })
    ElMessage.success('已加入黑名单')
  }).catch(() => {})
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = ipRules.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      ipRules.value[index] = { ...ipRules.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    formData.type = listType.value
    ipRules.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
}
</script>

<style lang="scss" scoped>
.ip-black-white-list {
  display: flex;
  flex-direction: column;
  height: 100%;

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

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
}
</style>

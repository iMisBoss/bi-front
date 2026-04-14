<template>
  <el-drawer
      v-model="visible"
      :title="drawerTitle"
      size="700px"
      @close="handleClose"
  >
    <template #header>
      <div class="drawer-header">
        <h3 class="drawer-title">{{ drawerTitle }}</h3>
        <div class="drawer-actions">
          <el-button size="small" @click="$emit('edit', data)">编辑</el-button>
          <el-button
              v-if="data?.status === 'enabled'"
              size="small"
              type="warning"
              @click="$emit('toggle-status', data)"
          >
            禁用
          </el-button>
          <el-button
              v-else
              size="small"
              type="success"
              @click="$emit('toggle-status', data)"
          >
            启用
          </el-button>
          <el-button
              size="small"
              type="danger"
              :disabled="data?.memberCount > 0"
              @click="$emit('delete', data)"
          >
            删除
          </el-button>
        </div>
      </div>
    </template>

    <el-tabs v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名称">{{ data?.name }}</el-descriptions-item>
          <el-descriptions-item label="编码">{{ data?.code }}</el-descriptions-item>

          <template v-if="type === 'level'">
            <el-descriptions-item label="职级层级">
              <el-tag :type="getLevelTagType(data?.level)" size="small">
                {{ data?.level }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="薪酬等级">{{ data?.salaryGrade || '-' }}</el-descriptions-item>
            <el-descriptions-item label="审批权限上限">
              ¥{{ formatMoney(data?.approvalLimit) }}
            </el-descriptions-item>
            <el-descriptions-item label="绑定人数">{{ data?.memberCount || 0 }} 人</el-descriptions-item>
          </template>

          <template v-else>
            <el-descriptions-item label="关联职级">
              <el-tag type="primary" size="small">{{ data?.levelName }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="所属序列">{{ data?.sequence }}</el-descriptions-item>
            <el-descriptions-item label="所属部门">{{ data?.department }}</el-descriptions-item>
            <el-descriptions-item label="绑定人数">{{ data?.memberCount || 0 }} 人</el-descriptions-item>
          </template>

          <el-descriptions-item label="排序号">{{ data?.sort }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="data?.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ data?.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="描述" :span="2">
            {{ data?.description || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- 关联人员 -->
      <el-tab-pane label="关联人员" name="members">
        <el-empty v-if="!data?.memberCount || data.memberCount === 0" description="暂无关联人员" />
        <el-table v-else :data="mockMembers" border>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="employeeNo" label="工号" width="120" />
          <el-table-column prop="department" label="部门" />
          <el-table-column prop="position" label="岗位" />
        </el-table>
      </el-tab-pane>

      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="logs">
        <div class="logs-toolbar">
          <el-button size="small" @click="handleExportLogs">导出日志</el-button>
        </div>
        <el-table :data="mockLogs" border max-height="400">
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="time" label="操作时间" width="180" />
          <el-table-column prop="type" label="操作类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getLogTypeTag(row.type)" size="small">
                {{ getLogTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="变更内容" min-width="200" />
          <el-table-column prop="ip" label="操作IP" width="130" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
  },
  type: {
    type: String,
    default: 'level'
  }
})

const emit = defineEmits(['update:modelValue', 'edit', 'toggle-status', 'delete'])

const visible = ref(props.modelValue)
const activeTab = ref('basic')

const drawerTitle = computed(() => {
  const typeName = props.type === 'level' ? '职级' : '职务'
  return `${props.data?.name || ''}（${typeName}）`
})

// 模拟关联人员数据
const mockMembers = computed(() => {
  if (!props.data?.memberCount || props.data.memberCount === 0) return []

  return [
    { name: '张三', employeeNo: 'E001', department: '技术部', position: '前端开发' },
    { name: '李四', employeeNo: 'E002', department: '技术部', position: '后端开发' },
    { name: '王五', employeeNo: 'E003', department: '产品部', position: '产品经理' }
  ]
})

// 模拟操作日志
const mockLogs = computed(() => {
  return [
    {
      operator: '系统管理员',
      time: '2024-01-01 10:00:00',
      type: 'create',
      content: `新增${props.type === 'level' ? '职级' : '职务'}`,
      ip: '192.168.1.100'
    },
    {
      operator: '张三',
      time: '2024-02-15 14:30:00',
      type: 'edit',
      content: '修改基本信息',
      ip: '192.168.1.101'
    }
  ]
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    activeTab.value = 'basic'
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getLevelTagType = (level) => {
  const typeMap = {
    '基层': '',
    '中层': 'primary',
    '高层': 'warning',
    '高管': 'danger'
  }
  return typeMap[level] || ''
}

const formatMoney = (value) => {
  if (!value) return '0'
  return value.toLocaleString()
}

const getLogTypeTag = (type) => {
  const tags = {
    create: 'success',
    edit: 'primary',
    delete: 'danger',
    disable: 'warning',
    enable: 'success'
  }
  return tags[type] || ''
}

const getLogTypeLabel = (type) => {
  const labels = {
    create: '新增',
    edit: '编辑',
    delete: '删除',
    disable: '禁用',
    enable: '启用'
  }
  return labels[type] || type
}

const handleExportLogs = () => {
  ElMessage.success('日志导出成功')
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .drawer-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .drawer-actions {
    display: flex;
    gap: 8px;
  }
}

.logs-toolbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
